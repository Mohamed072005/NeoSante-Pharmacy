import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetProductParamDto {
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;
}