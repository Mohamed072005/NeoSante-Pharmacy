import { RegisterDTO } from "../DTOs/register/register.dto";
import { LoginDTO } from "../DTOs/login/login.dto";
import { VerifyDeviceRequestDataType } from "../../../common/types/verify-device-request-data.type";
import { VerifyDeviceDto } from "../DTOs/verify-device/verify-device.dto";
import { ResetPasswordDto } from "../DTOs/reset-password/reset-password.dto";
import { ResetPasswordPasswordDto } from "../DTOs/reset-password/reset-password-password.dto";
import { ResetPasswordTokenType } from "../../../common/types/reset-password-token.type";
import { ResendOtpCodeDto } from "../DTOs/verify-device/resend-otp-code.dto";

export interface AuthServiceInterface {
  handleRegistration(registerDTO: RegisterDTO) : Promise<{ message: string }>;
  verifyAccount(token: string): Promise<void>;
  handleLogin(loginDTO: LoginDTO, userAgent: string): Promise<{ message: string, token: string, withOTP: boolean, user_id: string }>;
  handleVerifyingDevice(requestData: VerifyDeviceRequestDataType, requestBody: VerifyDeviceDto, userAgent: string): Promise<{ message: string; token: string; withOTP: boolean }>;
  handleResendOTPCode(requestBody: ResendOtpCodeDto): Promise<{ message: string, token: string }>;
  handelVerifyResetPasswordRequest(requestData: ResetPasswordDto): Promise<{ message: string }>;
  handleResetPasswordToken(requestBody: ResetPasswordPasswordDto, requestData: ResetPasswordTokenType): Promise<{ message: string }>;
}