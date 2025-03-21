import { ProductDto } from "../DTOs/product.dto";
import { Product } from "../entities/product.schema";

export interface ProductServiceInterface {
  handleCreateProduct(product: ProductDto): Promise<{ message: string }>;
  handleGetPharmacyProducts(user_id: string): Promise<{ products: Product[] }>;
}