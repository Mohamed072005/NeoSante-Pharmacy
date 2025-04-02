import {
  Body,
  Controller, Get,
  HttpStatus,
  Inject, Param, Patch,
  Post, Put, Query,
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
import { GetProductParamDto } from "./DTOs/get-product-param.dto";
import { ProductRepositoryInterface } from "./interfaces/product.repository.interface";
import { toObjectId } from "../../common/transformers/object.id.transformer";

@Controller('product')
export class ProductController {

  constructor(
    @Inject('ProductServiceInterface')
    private readonly productService: ProductServiceInterface,
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
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

  @Get('/pharmacy/product/:product_id')
  @UseGuards(AuthGuard, PharmacistGuard, CheckUserGuard)
  async getPharmacyProductById(
    @Param() params: GetProductParamDto
  ): Promise< { product: Product, statusCode: number }> {
    const productObjectId = toObjectId(params.product_id);
    const product = await this.productRepository.getPharmacyProductById(productObjectId)
    return {
      statusCode: HttpStatus.OK,
      product: product,
    }
  }

  @Patch('/update/product/:product_id')
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
  async updatePharmacyProduct(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[]
    },
    @Body() productDto: ProductDto,
    @Param() param: GetProductParamDto
  ) {
    const imageFile = files.image?.[0];
    if (imageFile) {
      const imageKey = `product/image/${Date.now()}-${imageFile.originalname}`;
      productDto.image = await this.s3Service.uploadFile(
        imageFile,
        imageKey,
      );
    }
    const response = await this.productService.handleUpdateProduct(productDto, param.product_id);
    return {
      statusCode: HttpStatus.ACCEPTED,
      product: response.product,
      message: response.message,
    }
  }

  @Get('/get/products')
  async getProductsForClients (
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('inStock') inStock?: string,
    @Query('prescriptionRequired') prescriptionRequired?: string,
  ) {
    const inStockFilter = inStock ? inStock === 'true' : undefined;
    const prescriptionFilter = prescriptionRequired ? prescriptionRequired === 'true' : undefined;
    const response = await this.productRepository.fetchProducts(page, limit, search, category, inStockFilter, prescriptionFilter);
    return {
      statusCode: HttpStatus.OK,
      products: response,
    }
  }
}
