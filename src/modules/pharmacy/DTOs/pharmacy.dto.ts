import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Transform, Type } from "class-transformer";

class CertificationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsOptional()
    image?: string; // This will be populated after file upload
}

export class PharmacyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsOptional()
    image?: string; // This will be populated after file upload

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertificationDto)
    @Transform(({ value }) => {
        try {
            return JSON.parse(value); // Parse the JSON string into an array
        } catch (error) {
            return value; // Return the original value if parsing fails
        }
    })
    certifications: CertificationDto[];
}