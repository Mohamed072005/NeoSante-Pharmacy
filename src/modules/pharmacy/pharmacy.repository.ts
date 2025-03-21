import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PharmacyRepositoryInterface } from "./interfaces/pharmacy.repository.interface";
import { Model, Types } from "mongoose";
import { Pharmacy, PharmacyDocument } from "./entities/pharmacy.schema";
import { InjectModel } from "@nestjs/mongoose";
import { PharmacyDto } from "./DTOs/pharmacy.dto";

@Injectable()
export class PharmacyRepository implements PharmacyRepositoryInterface {
  constructor(
    @InjectModel(Pharmacy.name)
    private readonly pharmacyModel: Model<PharmacyDocument>,
  ) {}

  async getPharmacyByTitleAndAddress(
    title: string,
    street: string,
    city: string,
    user_id: Types.ObjectId,
  ): Promise<PharmacyDocument> {
    try {
      return await this.pharmacyModel
        .findOne({
          $or: [
            { name: title },
            { city: city },
            { user_id: user_id },
            { street: street },
          ],
        })
        .exec();
    } catch (err) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPharmacy(
    createPharmacyDto: PharmacyDto,
    user_id: Types.ObjectId,
  ): Promise<PharmacyDocument> {
    try {
      const pharmacyData = {
        ...createPharmacyDto,
        address: {
          street: createPharmacyDto.street,
          city: createPharmacyDto.city,
        },
        userId: user_id,
        certifications: createPharmacyDto.certifications,
      };
      const newPharmacy = new this.pharmacyModel(pharmacyData);
      return await newPharmacy.save();
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        throw new BadRequestException(`Validation Error: ${err.message}`);
      }

      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPharmacies(
    page: number,
    limit: number,
  ): Promise<{ pharmacies: PharmacyDocument[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const pharmacies = await this.pharmacyModel
        .find()
        .populate('userId', 'first_name email phone_number cin_number')
        .skip(skip)
        .limit(limit)
        .exec();
      const total = await this.pharmacyModel.countDocuments();
      return { pharmacies: pharmacies, total: total };
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new BadRequestException(`Validation Error: ${err.message}`);
      }

      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPharmacyById(id: Types.ObjectId): Promise<PharmacyDocument> {
    try {
      return await this.pharmacyModel.findOne({ _id: id }).exec();
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new BadRequestException(`Validation Error: ${err.message}`);
      }

      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPharmacistPharmacies(
    page: number,
    limit: number,
    user_id: Types.ObjectId,
  ): Promise<{ pharmacies: PharmacyDocument[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const pharmacies = await this.pharmacyModel
        .find({ userId: user_id })
        .skip(skip)
        .limit(limit)
        .exec();
      const total = await this.pharmacyModel.countDocuments();
      return { pharmacies: pharmacies, total: total };
    } catch (e) {
      throw new HttpException(
        `Failed to create pharmacy: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePharmacy(
    pharmacy_id: Types.ObjectId,
    updatePharmacyDTO: Partial<Pharmacy>,
  ): Promise<PharmacyDocument> {
    try {
      return this.pharmacyModel
        .findByIdAndUpdate(
          pharmacy_id,
          { $set: updatePharmacyDTO },
          { new: true, runValidators: true },
        )
        .exec();
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new BadRequestException(`Validation Error: ${err.message}`);
      }
      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePharmacy(pharmacy_id: Types.ObjectId): Promise<PharmacyDocument> {
    try {
      return await this.pharmacyModel.findByIdAndDelete(pharmacy_id).exec();
    }catch (e) {
      throw new HttpException(
        `Failed to create pharmacy: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPharmacistPharmaciesWithoutPagination(user_id: Types.ObjectId): Promise<PharmacyDocument[]> {
    try {
      return await this.pharmacyModel.find({ userId: user_id }).exec();
    }catch (e) {
      throw new HttpException(
        `Failed to create pharmacy: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}