import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordQueryTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
