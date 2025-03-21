import { Document, HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CategoryDocument = HydratedDocument<Category> & Document;

@Schema()
export class Category {
  @Prop({ required: true })
  category_name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);