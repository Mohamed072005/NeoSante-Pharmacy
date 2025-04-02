import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf, Matches } from "class-validator";
import { Types } from "mongoose";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @Matches(/^(?:\+212|0)([5-7]\d{8})$/, { message: 'Invalid phone number format' })
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{2,3}\d{5,6}$/, { message: 'Invalid CIN number format' })
  cin_number: string;

  role_id: Types.ObjectId;
}