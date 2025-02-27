import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User> & Document;

export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({type: Date, default: Date.now })
  added_At: Date;

  @Prop({ required: true, default: false })
  isCurrent: boolean;
}


@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, ref: "Role", type: Types.ObjectId })
  role_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, unique: true })
  cin_number: string;

  @Prop({ type: Date, default: null })
  verified_at: Date;

  @Prop({ type: [Agent], default: [] })
  agents: Agent[];
}

export const UserSchema = SchemaFactory.createForClass(User);