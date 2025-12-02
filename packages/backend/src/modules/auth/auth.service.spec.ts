import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockEmailService: any;

  // Mock user data
  const mockUser = {
    id: 'user-uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
    birthDate: new Date('1990-01-01'),
    emailVerified: false,
    emailVerificationToken: 'verification-token',
    isActive: true,
    failedLoginAttempts: 0,
    lastFailedLogin: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Setup mocks
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          MAX_LOGIN_ATTEMPTS: 5,
          JWT_EXPIRATION: '1d',
          JWT_REMEMBER_ME_EXPIRATION: '30d',
        };
        return config[key] ?? defaultValue;
      }),
    };

    mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // REGISTER TESTS
  // ============================================
  describe('register', () => {
    const registerDto = {
      name: 'Novo Usuario',
      email: 'novo@example.com',
      password: 'senha123',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999',
      birthDate: '1990-01-01',
    };

    it('deve registrar um novo usuário com sucesso', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...mockUser, ...registerDto });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...registerDto, id: 'new-user-id' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se email já existir', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
    });

    it('deve enviar email de verificação após registro', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...mockUser, ...registerDto });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...registerDto, id: 'new-user-id' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      await service.register(registerDto);

      // Assert - Aguardar um tick para o catch do Promise
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        registerDto.email,
        expect.any(String),
      );
    });

    it('deve gerar token JWT para auto-login', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...mockUser, ...registerDto });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...registerDto, id: 'new-user-id' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });

  // ============================================
  // LOGIN TESTS
  // ============================================
  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'senha123',
      rememberMe: false,
    };

    it('deve fazer login com sucesso com credenciais válidas', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, failedLoginAttempts: 0 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve lançar UnauthorizedException se usuário não existir', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('deve lançar UnauthorizedException se conta estiver inativa', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, isActive: false });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account is inactive');
    });

    it('deve lançar HttpException TOO_MANY_REQUESTS se exceder tentativas', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, failedLoginAttempts: 5 });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
      try {
        await service.login(loginDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('deve incrementar tentativas falhas com senha incorreta', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, failedLoginAttempts: 0 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        failedLoginAttempts: 1,
        lastFailedLogin: expect.any(Date),
      });
    });

    it('deve resetar tentativas falhas após login bem-sucedido', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, failedLoginAttempts: 3 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login(loginDto);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
      });
    });

    it('deve gerar token com expiração estendida quando rememberMe for true', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, failedLoginAttempts: 0 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login({ ...loginDto, rememberMe: true });

      // Assert
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '30d' }),
      );
    });
  });

  // ============================================
  // VERIFY EMAIL TESTS
  // ============================================
  describe('verifyEmail', () => {
    it('deve verificar email com token válido', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.verifyEmail('valid-token');

      // Assert
      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        emailVerified: true,
        emailVerificationToken: null,
      });
    });

    it('deve lançar BadRequestException com token inválido', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid verification token',
      );
    });
  });

  // ============================================
  // RESEND VERIFICATION TESTS
  // ============================================
  describe('resendVerification', () => {
    it('deve reenviar email de verificação para usuário não verificado', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, emailVerified: false });

      // Act
      const result = await service.resendVerification(mockUser.email);

      // Assert
      expect(result).toEqual({ message: 'Verification email sent successfully' });
      expect(mockUserRepository.update).toHaveBeenCalled();
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('deve retornar mensagem genérica se email não existir (segurança)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.resendVerification('naoexiste@example.com');

      // Assert
      expect(result).toEqual({
        message: 'If your email is registered, you will receive a verification link',
      });
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se email já verificado', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, emailVerified: true });

      // Act & Assert
      await expect(service.resendVerification(mockUser.email)).rejects.toThrow(BadRequestException);
      await expect(service.resendVerification(mockUser.email)).rejects.toThrow(
        'Email already verified',
      );
    });
  });

  // ============================================
  // FORGOT PASSWORD TESTS
  // ============================================
  describe('forgotPassword', () => {
    const forgotPasswordDto = { email: 'test@example.com' };

    it('deve gerar token e enviar email para usuário existente', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toEqual({
        message: 'If your email is registered, you will receive a password reset link',
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          passwordResetToken: expect.any(String),
          passwordResetExpires: expect.any(Date),
        }),
      );
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
      );
    });

    it('deve retornar mensagem genérica se email não existir (segurança)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword({ email: 'naoexiste@example.com' });

      // Assert
      expect(result).toEqual({
        message: 'If your email is registered, you will receive a password reset link',
      });
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('deve definir expiração do token para 1 hora', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const beforeCall = Date.now();

      // Act
      await service.forgotPassword(forgotPasswordDto);

      // Assert
      const updateCall = mockUserRepository.update.mock.calls[0][1];
      const expiresTime = updateCall.passwordResetExpires.getTime();
      const expectedTime = beforeCall + 60 * 60 * 1000; // 1 hour

      // Allow 5 second tolerance
      expect(expiresTime).toBeGreaterThanOrEqual(expectedTime - 5000);
      expect(expiresTime).toBeLessThanOrEqual(expectedTime + 5000);
    });
  });

  // ============================================
  // RESET PASSWORD TESTS
  // ============================================
  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'novaSenha123',
    };

    it('deve redefinir senha com token válido', async () => {
      // Arrange
      const userWithToken = {
        ...mockUser,
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };
      mockUserRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userWithToken.id,
        expect.objectContaining({
          password: 'newHashedPassword',
          passwordResetToken: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
        }),
      );
    });

    it('deve lançar BadRequestException com token inválido', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('deve lançar BadRequestException com token expirado', async () => {
      // Arrange
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: 'expired-token',
        passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };
      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);

      // Act & Assert
      await expect(
        service.resetPassword({ ...resetPasswordDto, token: 'expired-token' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword({ ...resetPasswordDto, token: 'expired-token' }),
      ).rejects.toThrow('Reset token has expired');
    });

    it('deve resetar contador de tentativas falhas ao redefinir senha', async () => {
      // Arrange
      const userWithToken = {
        ...mockUser,
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        failedLoginAttempts: 4,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      await service.resetPassword(resetPasswordDto);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userWithToken.id,
        expect.objectContaining({
          failedLoginAttempts: 0,
        }),
      );
    });

    it('deve fazer hash da nova senha com bcrypt', async () => {
      // Arrange
      const userWithToken = {
        ...mockUser,
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      };
      mockUserRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      await service.resetPassword(resetPasswordDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.newPassword, 10);
    });
  });
});
