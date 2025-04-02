import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetPharmacyDto {
  @IsMongoId()
  @IsNotEmpty()
  pharmacy_id: string;
}