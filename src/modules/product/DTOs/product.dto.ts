import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsMongoId,
  Matches
} from "class-validator";
import { Type } from 'class-transformer';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  pharmacyId: string;

  @IsOptional()
  image?: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  stock: number;

  @IsString()
  @Matches(/^[0-9]{12}$/)
  barcode: string;

  @IsString()
  @IsOptional()
  genericName?: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  alternatives?: string;

  @IsString()
  @IsNotEmpty()
  requiresPrescription: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastStockUpdate?: Date;
}