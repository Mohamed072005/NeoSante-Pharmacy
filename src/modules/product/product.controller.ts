import {
  Body,
  Controller, Get,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AuthGuard } from "../../core/guards/auth.guard";
import { PharmacistGuard } from "../../core/guards/pharmacist.guard";
import { ProductServiceInterface } from "./interfaces/product.service.interface";
import { CustomValidation } from "../../common/decorators/custom-validation.decorator";
import { ProductDto } from "./DTOs/product.dto";
import { CheckUserGuard } from "../../core/guards/check-user.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../core/config/multerConfig";
import { S3Service } from "../../core/services/s3.service";
import { GetRequestData } from "../../common/decorators/get-request-data.decorator";
import { ProductRequestDataType } from "../../common/types/product-request-data.type";
import { Product } from "./entities/product.schema";

@Controller('product')
export class ProductController {

  constructor(
    @Inject('ProductServiceInterface') private readonly productService: ProductServiceInterface,
    private readonly s3Service: S3Service
  ) {}

  @Post('/create/product')
  @UseGuards(AuthGuard, PharmacistGuard, CheckUserGuard)
  @CustomValidation()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 }
      ],
      multerConfig
    )
  )
  async createProduct(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[]
    },
    @Body() productDto: ProductDto,
  ): Promise<{ message: string, statusCode: number }> {
    const imageFile = files.image?.[0];
    if (imageFile) {
      const imageKey = `product/image/${Date.now()}-${imageFile.originalname}`;
      productDto.image = await this.s3Service.uploadFile(
        imageFile,
        imageKey,
      );
    }
    const response = await this.productService.handleCreateProduct(productDto);
    return {
      message: response.message,
      statusCode: HttpStatus.OK
    }
  }

  @Get('/pharmacy/products')
  @UseGuards(AuthGuard, PharmacistGuard, CheckUserGuard)
  async getPharmacyProducts(
    @GetRequestData() requestData: ProductRequestDataType
  ): Promise<{ products: Product[], statusCode: number }> {
    const response = await this.productService.handleGetPharmacyProducts(requestData.user_id);
    return {
      statusCode: HttpStatus.OK,
      products: response.products,
    }
  }
}
