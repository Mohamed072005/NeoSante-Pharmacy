import { ProductRepositoryInterface } from "./interfaces/product.repository.interface";
import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./entities/product.schema";
import { ProductDto } from "./DTOs/product.dto";
import { toObjectId } from "../../common/transformers/object.id.transformer";

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
        requiresPrescription: productDto.requiresPrescription == 'true',
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

  async getProductsByPharmaciesIds(
    pharmacyIds: Types.ObjectId[],
  ): Promise<Product[]> {
    try {
      return await this.productModel
        .find({
          pharmacyId: { $in: pharmacyIds },
        })
        .populate('pharmacyId', 'name address')
        .populate('category', 'category_name')
        .lean();
    } catch (err) {
      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPharmacyProductById(product_id: Types.ObjectId): Promise<Product> {
    try {
      return await this.productModel
        .findOne({ _id: product_id })
        .populate('pharmacyId', 'name address')
        .populate('category', 'category_name')
        .exec();
    } catch (err) {
      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductsByIdAndPharmacyId(
    product_id: Types.ObjectId,
    pharmacy_id: Types.ObjectId,
  ): Promise<Product> {
    try {
      console.log(pharmacy_id, product_id);
      return await this.productModel
        .findOne({ _id: product_id, pharmacyId: pharmacy_id })
        .exec();
    } catch (e) {
      throw new HttpException(
        `Failed to create pharmacy: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProduct(
    productDto: Partial<Product>,
    product_id: Types.ObjectId,
  ): Promise<Product> {
    try {
      const result = await this.productModel
        .findOneAndUpdate(
          { _id: product_id },
          { $set: productDto },
          { new: true },
        )
        .exec();
      return result;
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

  async fetchProducts(page: number, limit: number, search?: string, category?: string, inStock?: boolean, prescriptionRequired?: boolean,): Promise<Product[]> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      // Search filter (name or description)
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = toObjectId(category);
      }

      // Stock filter
      if (inStock !== undefined) {
        if (inStock) {
          query.stock = { $gt: 0 }; // In stock
        } else {
          query.stock = { $lte: 0 }; // Out of stock
        }
      }

      // Prescription filter
      if (prescriptionRequired !== undefined) {
        query.requiresPrescription = prescriptionRequired;
      }
      console.log(query.prescriptionRequired);
      const products = await this.productModel
        .find(query)
        .populate("pharmacyId", "name address")
        .populate('category', 'category_name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      return products;
    }catch (err) {
      throw new HttpException(
        `Failed to create pharmacy: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}