import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "../entities/category.schema";

@Injectable()
export class CategorySeeder implements OnModuleInit {

  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {
  }

  async onModuleInit() {
    await this.categorySeeder();
  }

  async categorySeeder() {
    const categories = [
      {
        category_name: "Pain Relief"
      },
      {
        category_name: "Cold & Flu"
      },
      {
        category_name: "Vitamins & Supplements"
      },
      {
        category_name: "Digestive Health"
      },
      {
        category_name: "Skin Care"
      },
      {
        category_name: "Allergy & Sinus"
      },
      {
        category_name: "First Aid"
      },
      {
        category_name: "Oral Care"
      },
      {
        category_name: "Baby Care"
      },
      {
        category_name: "Prescription Medications"
      }
    ];

    const existingCategories = await this.categoryModel.find().exec();
    if (existingCategories.length === 0) {
      await this.categoryModel.insertMany(categories);
      console.log('Categories seeded successfully!');
    }else {
      console.log('Categories already exist, skipping seeding.');
    }
  }
}