import { Types } from "mongoose";
import { ProductDto } from "../DTOs/product.dto";
import { Product } from "../entities/product.schema";

export interface ProductRepositoryInterface {
  findProductByPharmacyIdAndBarcodeAndName(pharmacyId: Types.ObjectId, barcode: string, name: string): Promise<boolean>;
  createProduct(productDto: ProductDto, pharmacyId: Types.ObjectId, categoryId: Types.ObjectId): Promise<void>;
  getProductsByPharmaciesIds(pharmacyIds: Types.ObjectId[]): Promise<Product[]>;
  getPharmacyProductById(product_id: Types.ObjectId): Promise<Product>;
  getProductsByIdAndPharmacyId(product_id: Types.ObjectId, pharmacy_id: Types.ObjectId): Promise<Product>;
  updateProduct(productDto: Partial<Product>, product_id: Types.ObjectId): Promise<Product>;
  fetchProducts(page: number, limit: number, search?: string, category?: string, inStock?: boolean, prescriptionRequired?: boolean,): Promise<Product[]>;
}