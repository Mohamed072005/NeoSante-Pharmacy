import { Document, HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type RoleDocument = HydratedDocument<Role> & Document;

class Permissions {
  @Prop({ required: true })
  permission: string;
}

@Schema()
export class Role {
  @Prop({ required: true })
  role_name: string;

  @Prop({ required: true })
  permissions: Permissions[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);