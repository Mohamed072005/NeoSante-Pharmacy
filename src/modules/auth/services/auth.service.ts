import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuthServiceInterface } from '../interfaces/auth.service.interface';
import { RegisterDTO } from '../DTOs/register/register.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtHelper } from '../../../core/helpers/jwt.helper';
import { toObjectId } from '../../../common/transformers/object.id.transformer';
import { LoginDTO } from "../DTOs/login/login.dto";
import { comparePassword } from "../../../core/utils/password.util";
import { AgentService } from "./agent.service";
import { AgentStatusEnum } from "../enums/agent.status.enum";
import { OtpService } from "./otp.service";
import { PasswordServiceInterface } from "../interfaces/password.service.interface";
import { EmailServiceInterface } from "../../email/interfaces/email.service.interface";
import { RoleRepositoryInterface } from "../../role/interfaces/role.repository.interface";
import { UserRepositoryInterface } from "../../user/interfaces/user.repository.interface";
import { UserDocument } from "../../user/entities/user.entity";
import { VerifyDeviceRequestDataType } from "../../../common/types/verify-device-request-data.type";
import { VerifyDeviceDto } from "../DTOs/verify-device/verify-device.dto";
import { ResetPasswordDto } from "../DTOs/reset-password/reset-password.dto";
import { ResetPasswordTokenType } from "../../../common/types/reset-password-token.type";
import { ResetPasswordPasswordDto } from "../DTOs/reset-password/reset-password-password.dto";
import { agent } from "supertest";
import { ResendOtpCodeDto } from "../DTOs/verify-device/resend-otp-code.dto";

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private readonly roleRepository: RoleRepositoryInterface,
    @Inject('EmailServiceInterface')
    private readonly emailService: EmailServiceInterface,
    @Inject('PasswordServiceInterface')
    private readonly passwordService: PasswordServiceInterface,
    private readonly jwtHelper: JwtHelper,
    private readonly agentService: AgentService,
    private readonly otpService: OtpService,
  ) {}

  async handleRegistration(registerDTO: RegisterDTO,): Promise<{ message: string }> {
    const user = await this.userRepository.getUserByEmailOrPhoneNumberOrCINNumber(registerDTO.email,registerDTO.phone_number,registerDTO.cin_number,);
    if (user)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const hashedPassword = await this.passwordService.hashPassword(
      registerDTO.password,
    );
    const role = await this.roleRepository.findRoleByName('User');
    const newUserData: RegisterDTO = {
      ...registerDTO,
      password: hashedPassword,
      role_id: role._id,
    };
    const newUser = await this.userRepository.createUser(newUserData);
    if (!newUser)
      throw new HttpException("Can't register right now", HttpStatus.CONFLICT);
    const token = await this.jwtHelper.generateJWTToken(
      { user_id: newUser._id },
      '300s',
    );
    await this.emailService.sendAccountVerificationEmail(
      newUser.email,
      newUser.first_name,
      token.token,
    );
    return { message: 'Register Success and Verification sent' };
  }

  async verifyAccount(token: string): Promise<{ message: string }> {
    if (!token || token === '')
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    const decoded = this.jwtHelper.VerifyJWTToken(token);
    const userId = toObjectId(decoded.user_id);
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    user.verified_at = new Date();
    await user.save();
    return { message: 'Account Verified Successfully' };
  }

  async handleLogin(loginDTO: LoginDTO, userAgent: string,): Promise<{ message: string; token: string; withOTP: boolean, user_id: string }> {
    const user = await this.userRepository.findUserByEmail(loginDTO.email);
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    const isPasswordValid = await comparePassword(loginDTO.password,user.password,);
    if (!isPasswordValid)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    if (!user.verified_at) {
      const token = await this.jwtHelper.generateJWTToken({ user_id: user._id },'300s',);
      await this.emailService.sendAccountVerificationEmail(user.email,user.first_name,token.token,);
      return {
        message: 'Account not verified, we send an email to verify you email',
        token: token.token,
        withOTP: false,
        user_id: null,
      };
    }
    const agentStatus = this.agentService.checkUserAgent(user, userAgent);
    switch (agentStatus) {
      case AgentStatusEnum.NEW_AGENT:
        return this.sendOtpAndGenerateToken(user, userAgent, loginDTO.remember_me, 'OTP sent to your email. Please verify your new device.');
      case AgentStatusEnum.NOT_VERIFIED_AGENT:
        return this.sendOtpAndGenerateToken(user,null, null,'OTP sent to your email. Please verify your device.');
      case AgentStatusEnum.VERIFIED_AGENT:
        return this.generateLoginToken(user._id.toString());
      default:
        throw new HttpException(
          'Invalid agent status',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  private async sendOtpAndGenerateToken(user: UserDocument, userAgent: string, rememberMe: boolean, message: string): Promise<{ message: string; token: string; withOTP: boolean, user_id: string }> {
    if (userAgent) {
      user.agents.push({
        name: userAgent,
        isCurrent: rememberMe,
        added_At: new Date(),
      });
      await user.save();
    }

    const otp = this.otpService.generateOTPCode();
    const jwtToken = await this.jwtHelper.generateJWTToken({ otp_code: otp, user_id: user._id },'300s');
    await this.emailService.sendOTPCodeVerificationEmail(user.email,user.first_name,+otp,);
    return { message: message, token: jwtToken.token, withOTP: true, user_id: user._id.toString() };
  }

  private async generateLoginToken(user_id: string,): Promise<{ message: string; token: string; withOTP: boolean, user_id: string }> {
    const jwtToken = await this.jwtHelper.generateJWTToken({ user_id: user_id },'3d');
    return {
      message: 'Login successful',
      token: jwtToken.token,
      withOTP: false,
      user_id: null,
    };
  }

  async handleVerifyingDevice(requestData: VerifyDeviceRequestDataType, requestBody: VerifyDeviceDto, userAgent: string): Promise<{ message: string; token: string; withOTP: boolean }> {
    if (requestData.otp_code !== requestBody.otp_code)
      throw new HttpException('Invalid OTP code', HttpStatus.BAD_REQUEST);
    const user_id = toObjectId(requestData.user_id);
    const user = await this.userRepository.getUserById(user_id);
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    if (requestBody.rememberMe) {
      const agent = this.findUserAgent(user, userAgent);
      agent.isCurrent = true;
      user.markModified('agents');
      await user.save();
    }
    return await this.generateLoginToken(user_id.toString());
  }

  private findUserAgent(user: UserDocument, userAgent: string) {
    return user.agents.find((agent) => agent.name === userAgent);
  }

  async handleResendOTPCode(requestBody: ResendOtpCodeDto): Promise<{ message: string, token: string }> {
    const user_id = toObjectId(requestBody.user_id);
    const user = await this.userRepository.getUserById(user_id);
    if (!user) throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
    const otp = this.otpService.generateOTPCode();
    const jwtToken = await this.jwtHelper.generateJWTToken(
      { otp_code: otp, user_id: user._id },
      '300s',
    );
    await this.emailService.sendOTPCodeVerificationEmail(
      user.email,
      user.first_name,
      +otp,
    )
    return { message: 'OTP code sent', token: jwtToken.token };
  }

  async handelVerifyResetPasswordRequest(
    requestData: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findUserByEmail(requestData.email);
    if (!user) throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
    const token = await this.jwtHelper.generateJWTToken({ user_id: user._id, identifier: `password-reset-${user._id}` },'300s',);
    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.first_name,
      token.token,
    );
    return { message: 'Reset password email sent' };
  }

  async handleResetPasswordToken(requestBody: ResetPasswordPasswordDto, requestData: ResetPasswordTokenType): Promise<{ message: string }> {
    const user_id = toObjectId(requestData.user_id);
    const user = await this.userRepository.getUserById(user_id);
    if (!user) throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
    if (requestData.identifier !== `password-reset-${user_id}`) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    user.password = await this.passwordService.hashPassword(
      requestBody.password,
    );
    await user.save();
    return { message: 'Password reset successfully' };
  }
}