import { Pharmacy } from "../entities/pharmacy.schema";

export class GetPharmaciesAdminResponseDto {
  statusCode: number;
  total: number;
  pharmacies: Pharmacy[];
  message: string;
}