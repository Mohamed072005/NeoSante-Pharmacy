import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import { Category } from "./entities/category.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository implements CategoryRepositoryInterface {

  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

  async fetchCategories(): Promise<Category[]> {
    try {
      return await this.categoryModel.find().exec();
    }catch (error) {
      throw new HttpException(
        `Failed to create pharmacy: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}