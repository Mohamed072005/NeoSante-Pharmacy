import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from "mongoose";

export type PharmacyDocument = HydratedDocument<Pharmacy> & Document;

class Address {

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  lng: Number;

  @Prop({ required: true })
  lat: Number;
}

class Helpers {
  @Prop({ required: true, unique: true })
  email: string;

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

class DailyWorkingHours {
  @Prop({ required: true })
  open: string;

  @Prop({ required: true })
  close: string;
}

class WorkingHours {
  @Prop({ required: true, type: DailyWorkingHours })
  monday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  tuesday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  wednesday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  thursday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  friday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  saturday: DailyWorkingHours;

  @Prop({ required: true, type: DailyWorkingHours })
  sunday: DailyWorkingHours;
}

@Schema({ timestamps: true })
export class Pharmacy {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

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
        const userIds = helpers.map((helper) => helper.email);
        return new Set(userIds).size === userIds.length;
      },
      message: 'Each helper must have a unique userId',
    },
  })
  helpers: Helpers[];

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;

  @Prop({
    type: WorkingHours,
    default: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' },
    },
  })
  workingHours: WorkingHours;

  @Prop({ type: Boolean, default: false })
  weekendPermanence: boolean;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);

PharmacySchema.index({ userId: 1 });
PharmacySchema.index({ name: 1 });
PharmacySchema.index({ 'address.city': 1, 'address.street': 1 });
PharmacySchema.index({ 'helpers.email': 1 }, { unique: true, sparse: true });
PharmacySchema.index({
  'workingHours.monday.open': 1,
  'workingHours.monday.close': 1,
  'workingHours.tuesday.open': 1,
  'workingHours.tuesday.close': 1,
  'workingHours.wednesday.open': 1,
  'workingHours.wednesday.close': 1,
  'workingHours.thursday.open': 1,
  'workingHours.thursday.close': 1,
  'workingHours.friday.open': 1,
  'workingHours.friday.close': 1,
  'workingHours.saturday.open': 1,
  'workingHours.saturday.close': 1,
  'workingHours.sunday.open': 1,
  'workingHours.sunday.close': 1,
});
