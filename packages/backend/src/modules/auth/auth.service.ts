import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxLoginAttempts: number;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.maxLoginAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
      failedLoginAttempts: 0,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send verification email (non-blocking)
    this.emailService
      .sendVerificationEmail(savedUser.email, emailVerificationToken)
      .catch((err) => {
        this.logger.error(`Failed to send verification email: ${err.message}`);
      });

    // Generate JWT token for auto-login
    const accessToken = this.generateToken(savedUser.id, savedUser.email, false);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user with password field (normally excluded)
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'cpf',
        'phone',
        'birthDate',
        'emailVerified',
        'isActive',
        'failedLoginAttempts',
        'lastFailedLogin',
        'createdAt',
        'updatedAt',
      ],
    });

    // Generic error for security
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check rate limiting
    if (user.failedLoginAttempts >= this.maxLoginAttempts) {
      throw new HttpException(
        'Too many failed login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.usersRepository.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lastFailedLogin: new Date(),
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.usersRepository.update(user.id, {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    });

    // Generate JWT token
    const rememberMe = loginDto.rememberMe || false;
    const accessToken = this.generateToken(user.id, user.email, rememberMe);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    // Update user
    await this.usersRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found (security)
      return { message: 'If your email is registered, you will receive a verification link' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersRepository.update(user.id, { emailVerificationToken });

    // Send verification email (non-blocking)
    this.emailService.sendVerificationEmail(user.email, emailVerificationToken).catch((err) => {
      this.logger.error(`Failed to send verification email: ${err.message}`);
    });

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return {
        message: 'If your email is registered, you will receive a password reset link',
      };
    }

    // Generate reset token and expiration (1 hour)
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersRepository.update(user.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    // Send password reset email (non-blocking)
    this.emailService.sendPasswordResetEmail(user.email, passwordResetToken).catch((err) => {
      this.logger.error(`Failed to send password reset email: ${err.message}`);
    });

    return {
      message: 'If your email is registered, you will receive a password reset link',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update user
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0, // Reset failed attempts
    });

    return { message: 'Password reset successfully' };
  }

  private generateToken(userId: string, email: string, rememberMe: boolean): string {
    const payload = { sub: userId, email };
    const expiresIn = rememberMe
      ? this.configService.get<string>('JWT_REMEMBER_ME_EXPIRATION', '30d')
      : this.configService.get<string>('JWT_EXPIRATION', '1d');

    return this.jwtService.sign(payload, { expiresIn: expiresIn as any });
  }
}
