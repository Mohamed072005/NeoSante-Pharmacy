import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./entities/category.schema";
import { CategorySeeder } from "./seeders/category.seeder";
import { CategoryRepository } from "./category.repository";
import { CategoryController } from "./category.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ])
  ],
  controllers: [CategoryController],
  providers: [
    {
      provide: 'CategoryRepositoryInterface',
      useClass: CategoryRepository,
    },
    CategorySeeder
  ]
})
export class CategoryModule {
}
