import { Category } from "../entities/category.schema";

export interface CategoryRepositoryInterface {
  fetchCategories(): Promise<Category[]>;
}