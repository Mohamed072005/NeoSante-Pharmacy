import {
  BadGatewayException,
  Body,
  Controller, Delete,
  Get,
  HttpStatus,
  Inject, Param, Patch,
  Post, Query, UploadedFiles,
  UseGuards, UseInterceptors
} from "@nestjs/common";
import { PharmacyDto } from './DTOs/pharmacy.dto';
import { CustomValidation } from '../../common/decorators/custom-validation.decorator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PharmacyServiceInterface } from './interfaces/pharmacy.service.interface';
import { GetRequestData } from '../../common/decorators/get-request-data.decorator';
import { PharmacyRequestDataType } from "../../common/types/create-pharmacy-request-data.type";
import { CheckUserGuard } from "../../core/guards/check-user.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../core/config/multerConfig";
import { CreatePharmacyResponseDto } from "./DTOs/create.pharmacy.response.dto";
import { S3Service } from "../../core/services/s3.service";
import { PharmacyRepositoryInterface } from "./interfaces/pharmacy.repository.interface";
import { AdminGuard } from "../../core/guards/admin.guard";
import { PharmacyDocument } from "./entities/pharmacy.schema";
import { GetPharmacyDto } from "./DTOs/get.pharmacy.dto";
import { PharmacyResponseDto } from "./DTOs/pharmacy.response.dto";
import { GetPharmaciesAdminResponseDto } from "./DTOs/get.pharmacies.admin.response.dto";
import { PharmacistGuard } from "../../core/guards/pharmacist.guard";
import { toObjectId } from "../../common/transformers/object.id.transformer";

@Controller('pharmacy')
export class PharmacyController {
  constructor(
    @Inject('PharmacyServiceInterface')
    private readonly pharmacyService: PharmacyServiceInterface,
    @Inject('PharmacyRepositoryInterface')
    private readonly pharmacyRepository: PharmacyRepositoryInterface,
    private readonly s3Service: S3Service,
  ) {}

  @Post('/ask/create/pharmacy')
  @UseGuards(AuthGuard, CheckUserGuard)
  @CustomValidation()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'certificationImages', maxCount: 10 },
      ],
      multerConfig,
    ),
  )
  async createPharmacy(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificationImages?: Express.Multer.File[];
    },
    @GetRequestData() requestData: PharmacyRequestDataType,
    @Body() createPharmacyDTO: PharmacyDto,
  ): Promise<CreatePharmacyResponseDto> {
    try {
      const imageFile = files.image?.[0];
      const certificationFiles = files.certificationImages || [];

      if (imageFile) {
        const imageKey = `pharmacy/image/${Date.now()}-${imageFile.originalname}`;
        createPharmacyDTO.image = await this.s3Service.uploadFile(
          imageFile,
          imageKey,
        );
      }

      createPharmacyDTO.certifications = await Promise.all(
        createPharmacyDTO.certifications.map(async (cert, index) => {
          if (certificationFiles[index]) {
            const certKey = `certifications/${Date.now()}-${certificationFiles[index].originalname}`;
            cert.image = await this.s3Service.uploadFile(
              certificationFiles[index],
              certKey,
            );
          }
          return cert;
        }),
      );

      const response = await this.pharmacyService.handleCreatePharmacy(
        createPharmacyDTO,
        requestData.user_id,
      );
      return {
        message: response.message,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }
  }

  @Get('/get/admin/pharmacies')
  @UseGuards(AuthGuard, AdminGuard)
  async getPharmaciesForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<GetPharmaciesAdminResponseDto> {
    const pharmacies = await this.pharmacyRepository.getAllPharmacies(page, limit);
    return {
      pharmacies: pharmacies.pharmacies,
      total: pharmacies.total,
      statusCode: HttpStatus.OK,
      message: 'Pharmacies fetched successfully',
    };
  }

  @Get('/get/pharmacy/:pharmacy_id')
  @CustomValidation()
  async getPharmacy(
    @Param() param: GetPharmacyDto,
  ): Promise<{ pharmacy: PharmacyDocument, message: string, statusCode: number }> {
    const response = await this.pharmacyService.handleGetPharmacyById(param.pharmacy_id);
    return {
      pharmacy: response,
      message: 'Pharmacies fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('/approve/pharmacy/:pharmacy_id')
  @UseGuards(AuthGuard, AdminGuard)
  @CustomValidation()
  async approvePendingPharmacy(
    @Param() param: GetPharmacyDto,
  ): Promise<PharmacyResponseDto>
  {
    const response = await this.pharmacyService.handleApprovePendingPharmacy(param.pharmacy_id);
    return {
      message: response.message,
      statusCode: HttpStatus.OK,
      pharmacy: response.pharmacy
    };
  }

  @Get('/get/pharmacist/pharmacies')
  @UseGuards(AuthGuard, PharmacistGuard)
  async getPharmacistPharmacies (
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @GetRequestData() requestData: PharmacyRequestDataType,
  ) {
    const userObjectId = toObjectId(requestData.user_id);
    const pharmacies = await this.pharmacyRepository.getPharmacistPharmacies(page, limit, userObjectId);
    return {
      pharmacies: pharmacies.pharmacies,
      total: pharmacies.total,
      statusCode: HttpStatus.OK,
      message: 'Pharmacies fetched successfully',
    };
  }

  @Patch('/update/pharmacy/:pharmacy_id')
  @UseGuards(AuthGuard, PharmacistGuard)
  @CustomValidation()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'certificationImages', maxCount: 10 },
      ],
      multerConfig,
    ),
  )
  async updatePharmacy(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificationImages?: Express.Multer.File[];
    },
    @Param() param: GetPharmacyDto,
    @Body() updatePharmacyDto: PharmacyDto,
    @GetRequestData() requestData: PharmacyRequestDataType,
  )  {
    try {
      const imageFile = files.image?.[0];
      const certificationFiles = files.certificationImages || [];
      if (imageFile) {
        const imageKey = `pharmacy/image/${Date.now()}-${imageFile.originalname}`;
        updatePharmacyDto.image = await this.s3Service.uploadFile(
          imageFile,
          imageKey,
        );
      }

      updatePharmacyDto.certifications = await Promise.all(
        updatePharmacyDto.certifications.map(async (cert, index) => {
          if (certificationFiles[index]) {
            const certKey = `certifications/${Date.now()}-${certificationFiles[index].originalname}`;
            cert.image = await this.s3Service.uploadFile(
              certificationFiles[index],
              certKey,
            );
          }
          return cert;
        }),
      );
      const response  = await this.pharmacyService.handleUpdatePharmacy(requestData.user_id, param.pharmacy_id, updatePharmacyDto);
      return {
        message: response.message,
        pharmacy: response.pharmacy,
        statusCode: HttpStatus.OK,
      };
    }catch(error) {
      console.log(error);
      if (error instanceof BadGatewayException) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }

  }

  @Delete('/delete/pharmacy/:pharmacy_id')
  @UseGuards(AuthGuard, PharmacistGuard)
  async deletePharmacy (
    @Param() param: GetPharmacyDto,
    @GetRequestData() requestData: PharmacyRequestDataType,
  ): Promise<PharmacyResponseDto> {
    const response = await this.pharmacyService.handleDeletePharmacy(requestData.user_id, param.pharmacy_id);
    return {
      message: response.message,
      pharmacy: response.pharmacy,
      statusCode: HttpStatus.OK,
    }
  }

}
