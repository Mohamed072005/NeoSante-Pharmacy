import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Headers, UseGuards, Redirect
} from "@nestjs/common";
import { RegisterDTO } from './DTOs/register/register.dto';
import { RegisterResponseDto } from './DTOs/register/register.response.dto';
import { LoginDTO } from './DTOs/login/login.dto';
import { AuthServiceInterface } from './interfaces/auth.service.interface';
import { LoginResponseDto } from './DTOs/login/login.response.dto';
import { AuthGuard } from "../../core/guards/auth.guard";
import { GetRequestData } from "../../common/decorators/get-request-data.decorator";
import { VerifyDeviceRequestDataType } from "../../common/types/verify-device-request-data.type";
import { VerifyDeviceDto } from "./DTOs/verify-device/verify-device.dto";
import { VerifyDeviceResponseDto } from "./DTOs/verify-device/verify-device.response.dto";
import { ResetPasswordDto } from "./DTOs/reset-password/reset-password.dto";
import { ResetPasswordResponseDto } from "./DTOs/reset-password/reset-password.response.dto";
import { ResetPasswordQueryTokenDto } from "./DTOs/reset-password/reset-password-query-token.dto";
import * as process from "node:process";
import { ResetPasswordPasswordDto } from "./DTOs/reset-password/reset-password-password.dto";
import { ResetPasswordTokenType } from "../../common/types/reset-password-token.type";
import { ResendOtpCodeDto } from "./DTOs/verify-device/resend-otp-code.dto";

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
  ) {}

  @Post('/register')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  )
  async register(
    @Body() requestBody: RegisterDTO,
  ): Promise<RegisterResponseDto> {
    const response = await this.authService.handleRegistration(requestBody);
    return {
      statusCode: HttpStatus.CREATED,
      message: response.message,
    };
  }

  @Get('/verify-account')
  async verifyUserAccount(
    @Query('token') token: string,
  ): Promise<{ statusCode: number; message: string }> {
    const response = await this.authService.verifyAccount(token);
    return {
      statusCode: HttpStatus.OK,
      message: response.message,
    };
  }

  @Post('/login')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  )
  async login(
    @Body() requestBody: LoginDTO,
    @Headers() headers: Record<string, string>,
  ): Promise<LoginResponseDto> {
    const userAgent = headers['user-agent'];
    const response = await this.authService.handleLogin(requestBody, userAgent);
    return {
      statusCode: response.withOTP === true ? HttpStatus.CREATED : HttpStatus.ACCEPTED,
      message: response.message,
      token: response.token,
      user_id: response.user_id
    };
  }

  @Post('/verify-device')
  @UseGuards(AuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  )
  async verifyDeviceByOTP(
    @GetRequestData() requestData: VerifyDeviceRequestDataType,
    @Body() requestBody: VerifyDeviceDto,
    @Headers() headers: Record<string, string>,
  ): Promise<VerifyDeviceResponseDto> {
    const userAgent = headers['user-agent'];
    const response = await this.authService.handleVerifyingDevice(requestData, requestBody, userAgent);
    return  {
      statusCode: HttpStatus.OK,
      message: response.message,
      token: response.token,
    };
  }

  @Post('/resend/otp')
  async resendOTPCode(
    @Body() requestBody: ResendOtpCodeDto,
  )
  {

  }


  @Post('/ask/reset/password')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  )
  async verifyResetPasswordRequest(
    @Body() requestBody: ResetPasswordDto,
  ):Promise<ResetPasswordResponseDto> {
    const response = await this.authService.handelVerifyResetPasswordRequest(requestBody);
    return {
      statusCode: HttpStatus.OK,
      message: response.message,
    };
  }

  @Post('/reset/password')
  @UseGuards(AuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  )
  async resetPassword(
    @Body() requestBody: ResetPasswordPasswordDto,
    @GetRequestData() requestData: ResetPasswordTokenType,
  ): Promise<ResetPasswordResponseDto>  {
    const response = await this.authService.handleResetPasswordToken(requestBody, requestData);
    return {
      message: response.message,
      statusCode: HttpStatus.ACCEPTED,
    };
  }

}
