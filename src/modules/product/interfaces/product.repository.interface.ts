import { Types } from "mongoose";
import { ProductDto } from "../DTOs/product.dto";
import { Product } from "../entities/product.schema";

export interface ProductRepositoryInterface {
  findProductByPharmacyIdAndBarcodeAndName(pharmacyId: Types.ObjectId, barcode: string, name: string): Promise<boolean>;
  createProduct(productDto: ProductDto, pharmacyId: Types.ObjectId, categoryId: Types.ObjectId): Promise<void>;
  getProductsByPharmaciesIds(pharmacyIds: Types.ObjectId[]): Promise<Product[]>;
  getPharmacyProductById(product_id: Types.ObjectId): Promise<Product>;
}