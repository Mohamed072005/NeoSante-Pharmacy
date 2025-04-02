import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { HttpStatus } from '@nestjs/common';
import { RegisterDTO } from '../DTOs/register/register.dto';
import { LoginDTO } from '../DTOs/login/login.dto';
import { VerifyDeviceDto } from '../DTOs/verify-device/verify-device.dto';
import { ResendOtpCodeDto } from '../DTOs/verify-device/resend-otp-code.dto';
import { ResetPasswordDto } from '../DTOs/reset-password/reset-password.dto';
import { ResetPasswordPasswordDto } from '../DTOs/reset-password/reset-password-password.dto';
import mongoose from "mongoose";
import { VerifyDeviceRequestDataType } from "../../../common/types/verify-device-request-data.type";
import { ResetPasswordTokenType } from "../../../common/types/reset-password-token.type";
import { JwtHelper } from "../../../core/helpers/jwt.helper";
import { AgentService } from "../services/agent.service";
import { OtpService } from "../services/otp.service";

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let jwtHelper: JwtHelper;
  let agentService: any;
  let otpService: any;
  let passwordService: any;

  beforeEach(async () => {
    const authServiceMock = {
      handleRegistration: jest.fn(),
      verifyAccount: jest.fn(),
      handleLogin: jest.fn(),
      handleVerifyingDevice: jest.fn(),
      handleResendOTPCode: jest.fn(),
      handelVerifyResetPasswordRequest: jest.fn(),
      handleResetPasswordToken: jest.fn(),
    };

    const jwtHelperMock = {
      VerifyJWTToken: jest.fn(),
      generateJWTToken: jest.fn(),
    }

    const agentServiceMock = {
      checkUserAgent: jest.fn(),
    }

    const otpServiceMock = {
      generateOTPCode: jest.fn(),
    }

    const passwordServiceMock = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AuthServiceInterface',
          useValue: authServiceMock,
        },
        {
          provide: 'PasswordServiceInterface',
          useValue: passwordServiceMock,
        },
        {
          provide: JwtHelper,
          useValue: jwtHelperMock,
        },
        {
          provide: AgentService,
          useValue: agentServiceMock,
        },
        {
          provide: OtpService,
          useValue: otpServiceMock,
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get('AuthServiceInterface');
    jwtHelper = module.get(JwtHelper);
    agentService = module.get(AgentService);
    otpService = module.get(OtpService);
    passwordService = module.get('PasswordServiceInterface');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new users successfully', async () => {
      // Arrange
      const registerDto: RegisterDTO = {
        email: 'test@example.com',
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        cin_number: 'BB245129',
        city: 'City',
        phone_number: '0923894576',
        role_id: new mongoose.Types.ObjectId()
      };

      const expectedResponse = {
        message: 'User registered successfully',
      };

      authService.handleRegistration.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.handleRegistration).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
      });
    });
  });

  describe('verifyUserAccount', () => {
    it('should verify a users account and redirect to frontend', async () => {
      // Arrange
      const token = 'verification-token';
      process.env.FRONT_END_URL = 'http://localhost';
      process.env.FRONT_APP_PORT = '3000';

      authService.verifyAccount.mockResolvedValue(undefined);

      // Act
      const result = await controller.verifyUserAccount(token);

      // Assert
      expect(authService.verifyAccount).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        url: 'http://localhost:3000/auth',
      });
    });
  });

  describe('login', () => {
    it('should login a users successfully without OTP requirement', async () => {
      // Arrange
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: 'Password123!',
        remember_me: null
      };

      const headers = {
        'user-agent': 'Mozilla/5.0',
      };

      const serviceResponse = {
        message: 'Login successful',
        token: 'jwt-token',
        user_id: '123',
        withOTP: false
      };

      authService.handleLogin.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.login(loginDto, headers);

      // Assert
      expect(authService.handleLogin).toHaveBeenCalledWith(loginDto, 'Mozilla/5.0');
      expect(result).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'Login successful',
        token: 'jwt-token',
        user_id: '123'
      });
    });

    it('should require OTP verification for login from new device', async () => {
      // Arrange
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: 'Password123!',
        remember_me: null
      };

      const headers = {
        'user-agent': 'Mozilla/5.0',
      };

      const serviceResponse = {
        message: 'OTP required for verification',
        token: 'temp-token',
        user_id: '123',
        withOTP: true
      };

      authService.handleLogin.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.login(loginDto, headers);

      // Assert
      expect(authService.handleLogin).toHaveBeenCalledWith(loginDto, 'Mozilla/5.0');
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'OTP required for verification',
        token: 'temp-token',
        user_id: '123'
      });
    });
  });

  describe('verifyDeviceByOTP', () => {
    it('should verify a device with OTP', async () => {
      // Arrange
      const verifyDeviceDto: VerifyDeviceDto = {
        otp_code: '123456',
        rememberMe: false
      };

      const requestData: VerifyDeviceRequestDataType = {
        user_id: '123',
        otp_code: '123456',
      };

      const headers = {
        'user-agent': 'Mozilla/5.0',
      };

      const serviceResponse = {
        message: 'Device verified successfully',
        token: 'jwt-token',
      };

      authService.handleVerifyingDevice.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.verifyDeviceByOTP(requestData, verifyDeviceDto, headers);

      // Assert
      expect(authService.handleVerifyingDevice).toHaveBeenCalledWith(requestData, verifyDeviceDto, 'Mozilla/5.0');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Device verified successfully',
        token: 'jwt-token',
      });
    });
  });

  describe('resendOTPCode', () => {
    it('should resend OTP code', async () => {
      // Arrange
      const resendOtpDto: ResendOtpCodeDto = {
        user_id: '123'
      };

      const serviceResponse = {
        message: 'OTP code resent successfully',
        token: 'temp-token',
      };

      authService.handleResendOTPCode.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.resendOTPCode(resendOtpDto);

      // Assert
      expect(authService.handleResendOTPCode).toHaveBeenCalledWith(resendOtpDto);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'OTP code resent successfully',
        token: 'temp-token',
      });
    });
  });

  describe('verifyResetPasswordRequest', () => {
    it('should verify reset password request', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com'
      };

      const serviceResponse = {
        message: 'Reset password link sent',
      };

      authService.handelVerifyResetPasswordRequest.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.verifyResetPasswordRequest(resetPasswordDto);

      expect(authService.handelVerifyResetPasswordRequest).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reset password link sent',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset users password', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordPasswordDto = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const requestData: ResetPasswordTokenType = {
        user_id: '123',
        identifier: 'reset-password-123',
      };

      const serviceResponse = {
        message: 'Password reset successfully',
      };

      authService.handleResetPasswordToken.mockResolvedValue(serviceResponse);

      // Act
      const result = await controller.resetPassword(resetPasswordDto, requestData);

      // Assert
      expect(authService.handleResetPasswordToken).toHaveBeenCalledWith(resetPasswordDto, requestData);
      expect(result).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'Password reset successfully',
      });
    });
  });
});