import {IsNotEmpty, IsString} from "class-validator";
import {IsValidUserId} from "../../../common/decorators/validate-user-id.decorator";

export class CreatePharmacyDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    street: string;
}