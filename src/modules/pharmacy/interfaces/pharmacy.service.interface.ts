import { PharmacyDto } from "../DTOs/pharmacy.dto";
import { Pharmacy, PharmacyDocument } from "../entities/pharmacy.schema";

export interface PharmacyServiceInterface {
  handleCreatePharmacy(createPharmacyDTO: PharmacyDto, user_id: string): Promise<{ message: string }>;
  handleGetPharmacyById(id: string): Promise<PharmacyDocument>;
  handleApprovePendingPharmacy(id: string): Promise<{ message: string, pharmacy: Pharmacy }>;
  handleUpdatePharmacy(user_id: string, pharmacy_id: string, updatePharmacyDTO: PharmacyDto): Promise<{ message: string, pharmacy: Pharmacy }>;
  handleDeletePharmacy(user_id: string, pharmacy_id: string): Promise<{ message: string, pharmacy: Pharmacy }>;
  handleFindPharmacies(search: string, openNow: boolean): Promise<Pharmacy[]>;
}