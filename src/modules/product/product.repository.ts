import { ProductRepositoryInterface } from "./interfaces/product.repository.interface";
import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./entities/product.schema";
import { ProductDto } from "./DTOs/product.dto";

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async findProductByPharmacyIdAndBarcodeAndName(
    pharmacyId: Types.ObjectId,
    barcode: string,
    name: string,
  ): Promise<boolean> {
    try {
      const product = await this.productModel.findOne({
        pharmacyId: pharmacyId,
        $or: [{ barcode: barcode }, { name: name }],
      });
      return product === null;
    } catch (e: unknown) {
      throw new HttpException(
        "Can't create product right now",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createProduct(
    productDto: ProductDto,
    pharmacyId: Types.ObjectId,
    categoryId: Types.ObjectId,
  ): Promise<void> {
    try {
      const newProduct = new this.productModel({
        ...productDto,
        category: categoryId,
        pharmacyId: pharmacyId,
      });
      await newProduct.save();
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

  async getProductsByPharmaciesIds(pharmacyIds: Types.ObjectId[]): Promise<Product[]> {
    try {
      return await this.productModel.find({
        pharmacyId: { $in: pharmacyIds },
      })
        .populate("pharmacyId", "name address")
        .populate("category", "category_name")
        .lean()
    }catch (err) {
      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}