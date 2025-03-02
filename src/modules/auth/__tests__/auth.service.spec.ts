import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { JwtHelper } from '../../../core/helpers/jwt.helper';
import { AgentService } from '../services/agent.service';
import { OtpService } from '../services/otp.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDTO } from '../DTOs/register/register.dto';
import { LoginDTO } from '../DTOs/login/login.dto';
import { AgentStatusEnum } from '../enums/agent.status.enum';
import { VerifyDeviceDto } from '../DTOs/verify-device/verify-device.dto';
import { ResetPasswordDto } from '../DTOs/reset-password/reset-password.dto';
import { ResetPasswordPasswordDto } from '../DTOs/reset-password/reset-password-password.dto';
import { ResendOtpCodeDto } from '../DTOs/verify-device/resend-otp-code.dto';
import mongoose, { Types } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

jest.mock('../../../core/utils/password.util', () => ({
  comparePassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: any;
  let roleRepository: any;
  let emailService: any;
  let passwordService: any;
  let jwtHelper: any;
  let agentService: any;
  let otpService: any;

  const mockUserId = new Types.ObjectId();
  const mockRoleId = new Types.ObjectId();

  beforeEach(async () => {
    // Create mock repositories and services
    userRepository = {
      getUserByEmailOrPhoneNumberOrCINNumber: jest.fn(),
      createUser: jest.fn(),
      getUserById: jest.fn(),
      findUserByEmail: jest.fn(),
    };

    roleRepository = {
      findRoleByName: jest.fn(),
    };

    emailService = {
      sendAccountVerificationEmail: jest.fn(),
      sendOTPCodeVerificationEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
    };

    jwtHelper = {
      generateJWTToken: jest.fn(),
      VerifyJWTToken: jest.fn(),
      generateToken: jest.fn(),
    };

    agentService = {
      checkUserAgent: jest.fn(),
    };

    otpService = {
      generateOTPCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepositoryInterface',
          useValue: userRepository,
        },
        {
          provide: 'RoleRepositoryInterface',
          useValue: roleRepository,
        },
        {
          provide: 'EmailServiceInterface',
          useValue: emailService,
        },
        {
          provide: 'PasswordServiceInterface',
          useValue: passwordService,
        },
        {
          provide: JwtHelper,
          useValue: jwtHelper,
        },
        {
          provide: AgentService,
          useValue: agentService,
        },
        {
          provide: OtpService,
          useValue: otpService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleRegistration', () => {
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

    it('should register a new user successfully', async () => {
      // Arrange
      userRepository.getUserByEmailOrPhoneNumberOrCINNumber.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashed_password');
      roleRepository.findRoleByName.mockResolvedValue({ _id: mockRoleId });
      userRepository.createUser.mockResolvedValue({
        _id: mockUserId,
        email: registerDto.email,
        first_name: registerDto.first_name
      });
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'verification_token' });
      emailService.sendAccountVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handleRegistration(registerDto);

      // Assert
      expect(userRepository.getUserByEmailOrPhoneNumberOrCINNumber).toHaveBeenCalledWith(
        registerDto.email, registerDto.phone_number, registerDto.cin_number
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(roleRepository.findRoleByName).toHaveBeenCalledWith('User');
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
        role_id: mockRoleId,
      });
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { user_id: mockUserId },
        '300s'
      );
      expect(emailService.sendAccountVerificationEmail).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.first_name,
        'verification_token'
      );
      expect(result).toEqual({ message: 'Register Success and Verification sent' });
    });

    it('should throw an exception if user already exists', async () => {
      // Arrange
      userRepository.getUserByEmailOrPhoneNumberOrCINNumber.mockResolvedValue({
        _id: mockUserId,
        email: registerDto.email,
      });

      // Act & Assert
      await expect(authService.handleRegistration(registerDto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.CONFLICT)
      );
      expect(userRepository.getUserByEmailOrPhoneNumberOrCINNumber).toHaveBeenCalledWith(
        registerDto.email, registerDto.phone_number, registerDto.cin_number
      );
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw an exception if user creation fails', async () => {
      // Arrange
      userRepository.getUserByEmailOrPhoneNumberOrCINNumber.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashed_password');
      roleRepository.findRoleByName.mockResolvedValue({ _id: mockRoleId });
      userRepository.createUser.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handleRegistration(registerDto)).rejects.toThrow(
        new HttpException("Can't register right now", HttpStatus.CONFLICT)
      );
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
        role_id: mockRoleId,
      });
    });
  });

  describe('verifyAccount', () => {
    const token = 'valid_token';
    const userId = mockUserId;

    it('should verify a user account successfully', async () => {
      // Arrange
      const mockUser = {
        _id: userId,
        verified_at: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jwtHelper.VerifyJWTToken.mockReturnValue({ user_id: userId.toString() });
      userRepository.getUserById.mockResolvedValue(mockUser);

      // Act
      await authService.verifyAccount(token);

      // Assert
      expect(jwtHelper.VerifyJWTToken).toHaveBeenCalledWith(token);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUser.verified_at).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw an exception if token is empty', async () => {
      // Act & Assert
      await expect(authService.verifyAccount('')).rejects.toThrow(
        new HttpException('Token is required', HttpStatus.BAD_REQUEST)
      );
      expect(jwtHelper.VerifyJWTToken).not.toHaveBeenCalled();
    });

    it('should throw an exception if user is not found', async () => {
      // Arrange
      jwtHelper.VerifyJWTToken.mockReturnValue({ user_id: userId.toString() });
      userRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyAccount(token)).rejects.toThrow(
        new HttpException('User Not Found', HttpStatus.NOT_FOUND)
      );
      expect(jwtHelper.VerifyJWTToken).toHaveBeenCalledWith(token);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('handleLogin', () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'Password123!',
      remember_me: false,
    };
    const userAgent = 'Mozilla/5.0';

    it('should return verification email message if account is not verified', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        first_name: 'Test',
        password: 'hashed_password',
        verified_at: null,
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(true);
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'verification_token' });
      emailService.sendAccountVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handleLogin(loginDto, userAgent);

      // Assert
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { user_id: mockUser._id },
        '300s'
      );
      expect(emailService.sendAccountVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        'verification_token'
      );
      expect(result).toEqual({
        message: 'Account not verified, we send an email to verify you email',
        token: 'verification_token',
        withOTP: false,
        user_id: null,
      });
    });

    it('should generate and send OTP for a new agent', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        first_name: 'Test',
        password: 'hashed_password',
        verified_at: new Date(),
        agents: [],
        save: jest.fn().mockResolvedValue(true),
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(true);
      agentService.checkUserAgent.mockReturnValue(AgentStatusEnum.NEW_AGENT);
      otpService.generateOTPCode.mockReturnValue('123456');
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'otp_token' });
      emailService.sendOTPCodeVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handleLogin(loginDto, userAgent);

      // Assert
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(agentService.checkUserAgent).toHaveBeenCalledWith(mockUser, userAgent);
      expect(otpService.generateOTPCode).toHaveBeenCalled();
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { otp_code: '123456', user_id: mockUser._id },
        '300s'
      );
      expect(emailService.sendOTPCodeVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        123456
      );
      expect(mockUser.agents[0]).toEqual({
        name: userAgent,
        isCurrent: false,
        added_At: expect.any(Date),
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'OTP sent to your email. Please verify your new device.',
        token: 'otp_token',
        withOTP: true,
        user_id: mockUserId.toString(),
      });
    });

    it('should send OTP for a non-verified agent', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        first_name: 'Test',
        password: 'hashed_password',
        verified_at: new Date(),
        agents: [],
        save: jest.fn().mockResolvedValue(true),
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(true);
      agentService.checkUserAgent.mockReturnValue(AgentStatusEnum.NOT_VERIFIED_AGENT);
      otpService.generateOTPCode.mockReturnValue('123456');
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'otp_token' });
      emailService.sendOTPCodeVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handleLogin(loginDto, userAgent);

      // Assert
      expect(agentService.checkUserAgent).toHaveBeenCalledWith(mockUser, userAgent);
      expect(otpService.generateOTPCode).toHaveBeenCalled();
      expect(emailService.sendOTPCodeVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        123456
      );
      expect(result).toEqual({
        message: 'OTP sent to your email. Please verify your device.',
        token: 'otp_token',
        withOTP: true,
        user_id: mockUserId.toString(),
      });
    });

    it('should generate login token for verified agent', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        first_name: 'Test',
        password: 'hashed_password',
        verified_at: new Date(),
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(true);
      agentService.checkUserAgent.mockReturnValue(AgentStatusEnum.VERIFIED_AGENT);
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'login_token' });

      // Act
      const result = await authService.handleLogin(loginDto, userAgent);

      // Assert
      expect(agentService.checkUserAgent).toHaveBeenCalledWith(mockUser, userAgent);
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { user_id: mockUser._id.toString() },
        '3d'
      );
      expect(result).toEqual({
        message: 'Login successful',
        token: 'login_token',
        withOTP: false,
        user_id: null,
      });
    });

    it('should throw an exception for invalid credentials (user not found)', async () => {
      // Arrange
      userRepository.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handleLogin(loginDto, userAgent)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST)
      );
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw an exception for invalid credentials (wrong password)', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        password: 'hashed_password',
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.handleLogin(loginDto, userAgent)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST)
      );
      expect(comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw an exception for invalid agent status', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: loginDto.email,
        password: 'hashed_password',
        verified_at: new Date(),
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../../core/utils/password.util');
      comparePassword.mockResolvedValue(true);
      agentService.checkUserAgent.mockReturnValue('INVALID_STATUS');

      // Act & Assert
      await expect(authService.handleLogin(loginDto, userAgent)).rejects.toThrow(
        new HttpException('Invalid agent status', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('handleVerifyingDevice', () => {
    const verifyDeviceDto: VerifyDeviceDto = {
      otp_code: '123456',
      rememberMe: true,
    };
    const userAgent = 'Mozilla/5.0';
    const requestData = {
      otp_code: '123456',
      user_id: mockUserId.toString(),
    };

    it('should verify device and return login token', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        agents: [
          { name: userAgent, isCurrent: false },
        ],
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      userRepository.getUserById.mockResolvedValue(mockUser);
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'login_token' });

      // Act
      const result = await authService.handleVerifyingDevice(requestData, verifyDeviceDto, userAgent);

      // Assert
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(mockUser.agents[0].isCurrent).toBe(true);
      expect(mockUser.markModified).toHaveBeenCalledWith('agents');
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { user_id: mockUserId.toString() },
        '3d'
      );
      expect(result).toEqual({
        message: 'Login successful',
        token: 'login_token',
        user_id: null,
        withOTP: false,
      });
    });

    it('should throw an exception for invalid OTP code', async () => {
      // Arrange
      const invalidRequestData = {
        otp_code: '123456',
        user_id: mockUserId.toString(),
      };
      const invalidVerifyDeviceDto = {
        otp_code: '654321',
        rememberMe: true,
      };

      // Act & Assert
      await expect(authService.handleVerifyingDevice(invalidRequestData, invalidVerifyDeviceDto, userAgent)).rejects.toThrow(
        new HttpException('Invalid OTP code', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw an exception if user is not found', async () => {
      // Arrange
      userRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handleVerifyingDevice(requestData, verifyDeviceDto, userAgent)).rejects.toThrow(
        new HttpException('User Not Found', HttpStatus.NOT_FOUND)
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('handleResendOTPCode', () => {
    const resendOtpDto: ResendOtpCodeDto = {
      user_id: mockUserId.toString(),
    };

    it('should resend OTP code successfully', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
        first_name: 'Test',
      };

      userRepository.getUserById.mockResolvedValue(mockUser);
      otpService.generateOTPCode.mockReturnValue('123456');
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'otp_token' });
      emailService.sendOTPCodeVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handleResendOTPCode(resendOtpDto);

      // Assert
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(otpService.generateOTPCode).toHaveBeenCalled();
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { otp_code: '123456', user_id: mockUser._id },
        '300s'
      );
      expect(emailService.sendOTPCodeVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        123456
      );
      expect(result).toEqual({
        message: 'OTP code sent',
        token: 'otp_token',
      });
    });

    it('should throw an exception if user does not exist', async () => {
      // Arrange
      userRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handleResendOTPCode(resendOtpDto)).rejects.toThrow(
        new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('handelVerifyResetPasswordRequest', () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: 'test@example.com',
    };

    it('should send reset password email successfully', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        email: resetPasswordDto.email,
        first_name: 'Test',
      };

      userRepository.findUserByEmail.mockResolvedValue(mockUser);
      jwtHelper.generateJWTToken.mockResolvedValue({ token: 'reset_token' });
      emailService.sendResetPasswordEmail.mockResolvedValue(true);

      // Act
      const result = await authService.handelVerifyResetPasswordRequest(resetPasswordDto);

      // Assert
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(resetPasswordDto.email);
      expect(jwtHelper.generateJWTToken).toHaveBeenCalledWith(
        { user_id: mockUser._id, identifier: `password-reset-${mockUser._id}` },
        '300s'
      );
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
        'reset_token'
      );
      expect(result).toEqual({
        message: 'Reset password email sent',
      });
    });

    it('should throw an exception if user does not exist', async () => {
      // Arrange
      userRepository.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handelVerifyResetPasswordRequest(resetPasswordDto)).rejects.toThrow(
        new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
      );
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(resetPasswordDto.email);
    });
  });

  describe('handleResetPasswordToken', () => {
    const resetPasswordDto: ResetPasswordPasswordDto = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };
    const requestData = {
      user_id: mockUserId.toString(),
      identifier: `password-reset-${mockUserId}`,
    };

    it('should reset password successfully', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
        password: 'old_hashed_password',
        save: jest.fn().mockResolvedValue(true),
      };

      userRepository.getUserById.mockResolvedValue(mockUser);
      passwordService.hashPassword.mockResolvedValue('new_hashed_password');

      // Act
      const result = await authService.handleResetPasswordToken(resetPasswordDto, requestData);

      // Assert
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(resetPasswordDto.password);
      expect(mockUser.password).toBe('new_hashed_password');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password reset successfully',
      });
    });

    it('should throw an exception if user does not exist', async () => {
      // Arrange
      userRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.handleResetPasswordToken(resetPasswordDto, requestData)).rejects.toThrow(
        new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an exception for invalid token identifier', async () => {
      // Arrange
      const mockUser = {
        _id: mockUserId,
      };
      const invalidRequestData = {
        user_id: mockUserId.toString(),
        identifier: 'invalid-identifier',
      };

      userRepository.getUserById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.handleResetPasswordToken(resetPasswordDto, invalidRequestData)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.BAD_REQUEST)
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(mockUserId);
    });
  });
});