import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type pharmacyDocument = Pharmacy & Document;

class Address {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  street: string;
}

class Helpers {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

class Certifications {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  date: string;
}

@Schema({ timestamps: true })
export class Pharmacy {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  address: Address;

  @Prop({ required: true, type: [Certifications] })
  certifications: Certifications[];

  @Prop({ required: true })
  image: string;

  @Prop({
    required: true,
    type: [Helpers],
    validate: {
      validator: function (helpers: Helpers[]) {
        const userIds = helpers.map((helper) => helper.userId);
        return new Set(userIds).size === userIds.length;
      },
      message: 'Each helper must have a unique userId',
    },
  })
  helpers: Helpers[];

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);

PharmacySchema.index({ userId: 1 });
PharmacySchema.index({ name: 1 });
PharmacySchema.index({ 'address.city': 1, 'address.country': 1 });
PharmacySchema.index({ 'helpers.userId': 1 }, { unique: true, sparse: true });
