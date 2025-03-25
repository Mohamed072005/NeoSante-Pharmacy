import { Module } from "@nestjs/common";
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./entities/product.schema";
import { JwtHelper } from "../../core/helpers/jwt.helper";
import { UserModule } from "../user/user.module";
import { S3Service } from "../../core/services/s3.service";
import { ProductRepository } from "./product.repository";
import { PharmacyModule } from "../pharmacy/pharmacy.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    UserModule,
    PharmacyModule
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: "ProductServiceInterface",
      useClass: ProductService
    },
    {
      provide: "ProductRepositoryInterface",
      useClass: ProductRepository
    },
    JwtHelper,
    S3Service
  ]
})
export class ProductModule {}
