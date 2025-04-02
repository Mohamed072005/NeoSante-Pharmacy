import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { PharmacyServiceInterface } from "./interfaces/pharmacy.service.interface";
import { PharmacyDto } from "./DTOs/pharmacy.dto";
import { Pharmacy, PharmacyDocument } from "./entities/pharmacy.schema";
import { PharmacyRepositoryInterface } from "./interfaces/pharmacy.repository.interface";
import { toObjectId } from "../../common/transformers/object.id.transformer";
import { UserRepositoryInterface } from "../user/interfaces/user.repository.interface";
import { RoleRepositoryInterface } from "../role/interfaces/role.repository.interface";
import { EmailServiceInterface } from "../email/interfaces/email.service.interface";
import { UserServiceInterface } from "../user/interfaces/user.service.interface";
import { getChangedProperties } from "../../core/utils/object.util";
import { S3Service } from "../../core/services/s3.service";
import { PharmacyHelper } from "./helpers/pharmacy.helper";

@Injectable()
export class PharmacyService implements PharmacyServiceInterface {
  constructor(
    @Inject('PharmacyRepositoryInterface')
    private readonly pharmacyRepository: PharmacyRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private readonly roleRepository: RoleRepositoryInterface,
    @Inject('EmailServiceInterface')
    private readonly emailService: EmailServiceInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    private readonly s3Service: S3Service,
    private readonly pharmacyHelper: PharmacyHelper
  ) {}
  async handleCreatePharmacy(
    createPharmacyDTO: PharmacyDto,
    user_id: string,
  ): Promise<{ message: string }> {
    const userObjectId = toObjectId(user_id);
    const pharmacy = await this.pharmacyRepository.getPharmacyByTitleAndAddress(
      createPharmacyDTO.name,
      createPharmacyDTO.street,
      createPharmacyDTO.city,
      userObjectId,
    );
    if (pharmacy && pharmacy.verifiedAt)
      throw new BadRequestException(
        'There is already Pharmacy with this info.',
      );
    if (pharmacy && !pharmacy.verifiedAt)
      throw new BadRequestException(
        'A pending event with this name already exists. Please wait for approval.',
      );
    if (pharmacy && pharmacy.userId === userObjectId && !pharmacy.verifiedAt)
      throw new BadRequestException(
        "You're already registered a Pharmacy, wait for Admin approval.",
      );
    const pharmaciesCount = await this.pharmacyRepository.getUserPharmaciesCount(userObjectId);
    if (pharmaciesCount >= 5) throw new BadRequestException("You have reach the max of pharmacies");
    const user = await this.userRepository.getUserById(userObjectId);
    if (!user || user.verified_at === null) {
      throw new BadRequestException('You should verify your account first.');
    }
    const newPharmacy = await this.pharmacyRepository.createPharmacy(
      createPharmacyDTO,
      userObjectId,
    );
    if (!newPharmacy) throw new ConflictException('Failed to create Pharmacy.');
    const pharmacyOwner = await this.userRepository.getUserById(userObjectId);
    const adminRole = await this.roleRepository.findRoleByName('Admin');
    const admin = await this.userRepository.getUsersByRole(adminRole._id);
    await this.emailService.sendNewPharmacyHiringToAdmin(
      newPharmacy.name,
      pharmacyOwner.first_name,
      `${newPharmacy.address}`,
      pharmacyOwner.email,
      pharmacyOwner.phone_number,
      admin.email,
    );
    return { message: 'Pharmacy created successfully.' };
  }

  async handleGetPharmacyById(id: string): Promise<PharmacyDocument> {
    const pharmacyObjectId = toObjectId(id);
    return this.pharmacyRepository.getPharmacyById(pharmacyObjectId);
  }

  async handleApprovePendingPharmacy(
    id: string,
  ): Promise<{ message: string; pharmacy: Pharmacy }> {
    const pharmacyObjectId = toObjectId(id);
    const pharmacy =
      await this.pharmacyRepository.getPharmacyById(pharmacyObjectId);
    const userObjectId = pharmacy.userId;
    const user = await this.userRepository.getUserById(userObjectId);
    if (!user)
      throw new BadRequestException('This pharmacy users does not exist.');
    if (!pharmacy) throw new BadRequestException('Pharmacy not found.');
    if (pharmacy.verifiedAt !== null)
      throw new BadRequestException('Pharmacy already approved.');
    pharmacy.verifiedAt = new Date();
    await pharmacy.save();
    await this.userService.changeUserRoles(userObjectId, 'Pharmacy');
    await this.emailService.sendPharmacyApprovalEmail(
      user.email,
      user.first_name,
    );
    return {
      message: 'Pharmacy approved successfully.',
      pharmacy: pharmacy as Pharmacy,
    };
  }

  async handleUpdatePharmacy(
    user_id: string,
    pharmacy_id: string,
    updatePharmacyDTO: PharmacyDto,
  ): Promise<{ message: string; pharmacy: Pharmacy }> {
    const userObjectId = toObjectId(user_id);
    const pharmacyObjectId = toObjectId(pharmacy_id);
    const pharmacy =
      await this.pharmacyRepository.getPharmacyById(pharmacyObjectId);
    if (!pharmacy) throw new NotFoundException('Pharmacy does not exist.');
    if (!pharmacy.userId.equals(userObjectId))
      throw new UnauthorizedException(
        'You are not authorized to update this pharmacy.',
      );
    const updateData: Partial<Pharmacy> = {};
    if (updatePharmacyDTO.name) updateData.name = updatePharmacyDTO.name;
    if (updatePharmacyDTO.image) updateData.image = updatePharmacyDTO.image;
    if (updatePharmacyDTO.city || updatePharmacyDTO.street) {
      updateData.address = {
        ...(pharmacy.address || {}),
        ...(updatePharmacyDTO.city && { city: updatePharmacyDTO.city }),
        ...(updatePharmacyDTO.street && { street: updatePharmacyDTO.street }),
        ...(updatePharmacyDTO.lng && { lng: updatePharmacyDTO.lng }),
        ...(updatePharmacyDTO.lat && { lat: updatePharmacyDTO.lat }),
      };
    }
    // Handle certifications
    if (
      updatePharmacyDTO.certifications &&
      updatePharmacyDTO.certifications.length > 0
    ) {
      updateData.certifications = updatePharmacyDTO.certifications.map(
        (cert) => ({
          name: cert.name,
          date: cert.date,
          image: cert.image,
        }),
      );
    }

    if (updatePharmacyDTO.workingHours) {
      updateData.workingHours = {
        ...(pharmacy.workingHours || {}),
        ...updatePharmacyDTO.workingHours,
      };
    }
    console.log(updatePharmacyDTO.workingHours);
    const updatedPharmacy = await this.pharmacyRepository.updatePharmacy(
      pharmacyObjectId,
      updateData,
    );
    return {
      message: 'Pharmacy updated successfully.',
      pharmacy: updatedPharmacy as Pharmacy,
    };
  }

  async handleDeletePharmacy(user_id: string, pharmacy_id: string): Promise<{ message: string, pharmacy: Pharmacy }> {
    const userObjectId = toObjectId(user_id);
    const pharmacyObjectId = toObjectId(pharmacy_id);
    const pharmacy = await this.pharmacyRepository.getPharmacyById(pharmacyObjectId);
    if (!pharmacy) throw new NotFoundException('Pharmacy does not exists');
    if (!userObjectId.equals(pharmacy.userId)) throw new UnauthorizedException('You are not authorized to update this pharmacy.')
    const imagesToDelete = [pharmacy.image]
    if (pharmacy.certifications && pharmacy.certifications.length > 0) {
      pharmacy.certifications.forEach(cert => {
        if (cert.image) {
          imagesToDelete.push(cert.image);
        }
      });
    }
    await Promise.all(
      imagesToDelete
        .filter(Boolean)
        .map(async (imageUrl) => {
          try {
            const key = this.s3Service.getKeyFromUrl(imageUrl);
            if (key) {
              await this.s3Service.deleteFile(key);
            }
          }catch (e) {

          }
        })
    )

    const deletedPharmacy =
      await this.pharmacyRepository.deletePharmacy(pharmacyObjectId);

    return { message: 'Pharmacy deleted successfully.', pharmacy: deletedPharmacy as Pharmacy };
  }
  
  async handleFindPharmacies(search: string, openNow: boolean): Promise<Pharmacy[]> {
    let pharmacies =  await this.pharmacyRepository.findPharmacies(search);
    if (openNow){
      pharmacies = pharmacies.filter((pharmacy) => this.pharmacyHelper.isPharmacyOpen(pharmacy))
    }
    return pharmacies;
  }
}