import { IsBoolean, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class VerifyDeviceDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 characters long' })
  @Matches(/^\d+$/, { message: 'OTP code must contain only numbers' })
  otp_code: string;

  @IsBoolean()
  rememberMe: boolean;
}