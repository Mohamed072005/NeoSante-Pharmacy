import { Pharmacy, PharmacyDocument } from "../entities/pharmacy.schema";
import { Types } from "mongoose";
import { PharmacyDto } from "../DTOs/pharmacy.dto";

export interface PharmacyRepositoryInterface {
  getPharmacyByTitleAndAddress(title: string, street: string, city: string,user_id: Types.ObjectId,): Promise<PharmacyDocument>;
  createPharmacy(createPharmacyDTO: PharmacyDto, user_id: Types.ObjectId,): Promise<PharmacyDocument>;
  getAllPharmacies(page: number, limit: number): Promise<{ pharmacies: PharmacyDocument[], total: number }>;
  getPharmacyById(id: Types.ObjectId): Promise<PharmacyDocument>;
  getPharmacistPharmacies(page: number, limit: number, user_id: Types.ObjectId): Promise<{ pharmacies: PharmacyDocument[], total: number }>;
  updatePharmacy(pharmacy_id: Types.ObjectId, updatePharmacyDTO: Partial<Pharmacy>): Promise<PharmacyDocument>;
  deletePharmacy(pharmacy_id: Types.ObjectId): Promise<PharmacyDocument>;
  getPharmacistPharmaciesWithoutPagination(user_id: Types.ObjectId): Promise<PharmacyDocument[]>;
  getPharmacistPharmacy(pharmacy_id: Types.ObjectId, user_id: Types.ObjectId): Promise<PharmacyDocument>;
  findPharmacies(searchQuery: string): Promise<PharmacyDocument[]>;
  getUserPharmaciesCount(user_id: Types.ObjectId): Promise<number>;
}