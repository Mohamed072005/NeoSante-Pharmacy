import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}