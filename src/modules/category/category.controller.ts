import { Controller, Get, HttpStatus, Inject } from "@nestjs/common";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";

@Controller('category')
export class CategoryController {

  constructor(@Inject('CategoryRepositoryInterface') private readonly categoryRepository: CategoryRepositoryInterface) {}

  @Get('/get/categories')
  async getCategories() {
    const response = await this.categoryRepository.fetchCategories();
    return {
      categories: response,
      status: HttpStatus.OK,
    }
  }
}