import { Pharmacy } from "../entities/pharmacy.schema";

export class PharmacyResponseDto {
  message: string;
  statusCode: number;
  pharmacy: Pharmacy;
}
