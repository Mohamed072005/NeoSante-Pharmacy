import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProductDocument = HydratedDocument<Product> & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, index: 'text' })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Pharmacy', index: true })
  pharmacyId: Types.ObjectId;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true, index: true, sparse: true })
  barcode: string;

  @Prop({ index: 'text', sparse: true })
  genericName?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Category', index: true })
  category: Types.ObjectId;

  @Prop()
  alternatives?: string[];

  @Prop({ index: true })
  requiresPrescription: boolean;

  @Prop({ index: true })
  lastStockUpdate: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ pharmacyId: 1, barcode: 1 }, { unique: true, sparse: true });
ProductSchema.index({ pharmacyId: 1, name: 1 }, { unique: true });

ProductSchema.index({ pharmacyId: 1, category: 1 });
ProductSchema.index({ pharmacyId: 1, stock: 1 });
ProductSchema.index({ name: 'text', genericName: 'text' });