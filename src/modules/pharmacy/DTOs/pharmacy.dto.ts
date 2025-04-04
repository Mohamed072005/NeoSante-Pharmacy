import {
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    IsOptional,
    IsDateString,
    IsObject,
    IsNumber
} from "class-validator";
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

class WorkingHoursDto {
    @IsString()
    @IsNotEmpty()
    open: string;

    @IsString()
    @IsNotEmpty()
    close: string;
}

export class PharmacyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    lng: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    lat: number;

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

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => WorkingHoursDto)
    @Transform(({ value }) => {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    })
    workingHours?: {
        monday: WorkingHoursDto;
        tuesday: WorkingHoursDto;
        wednesday: WorkingHoursDto;
        thursday: WorkingHoursDto;
        friday: WorkingHoursDto;
        saturday: WorkingHoursDto;
        sunday: WorkingHoursDto;
    };
}