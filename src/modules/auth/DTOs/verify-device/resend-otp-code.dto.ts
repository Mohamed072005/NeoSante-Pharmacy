import { IsNotEmpty, IsString } from "class-validator";

export class ResendOtpCodeDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}