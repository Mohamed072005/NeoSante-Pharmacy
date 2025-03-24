import { ProductDto } from "../DTOs/product.dto";
import { Product } from "../entities/product.schema";
import { Types } from "mongoose";

export interface ProductServiceInterface {
  handleCreateProduct(product: ProductDto): Promise<{ message: string }>;
  handleGetPharmacyProducts(user_id: string): Promise<{ products: Product[] }>;
  handleUpdateProduct(product: ProductDto, product_id: string): Promise<{ message: string, product: Product }>;
}