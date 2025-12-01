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
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
      failedLoginAttempts: 0,
    });

    const savedUser = await this.usersRepository.save(user);

    this.emailService
      .sendVerificationEmail(savedUser.email, emailVerificationToken)
      .catch((err) => {
        this.logger.error(`Falha ao enviar email de verificação: ${err.message}`);
      });

    const accessToken = this.generateToken(savedUser.id, savedUser.email, false);

    const { password, ...userWithoutPassword } = savedUser;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
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

    if (!user) {
      throw new UnauthorizedException('Credenciais incorretas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Esta conta está inativa');
    }

    if (user.failedLoginAttempts >= this.maxLoginAttempts) {
      throw new HttpException(
        'Muitas tentativas de login. Por favor, tente novamente mais tarde',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      await this.usersRepository.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lastFailedLogin: new Date(),
      });

      throw new UnauthorizedException('Credenciais incorretas');
    }

    await this.usersRepository.update(user.id, {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    });

    const rememberMe = loginDto.rememberMe || false;
    const accessToken = this.generateToken(user.id, user.email, rememberMe);

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
      throw new BadRequestException('Token de verificação inválido');
    }

    await this.usersRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verificado com sucesso' };
  }

  async resendVerification(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Se seu email estiver registrado, você receberá um link de verificação',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email já foi verificado');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersRepository.update(user.id, { emailVerificationToken });

    this.emailService
      .sendVerificationEmail(user.email, emailVerificationToken)
      .catch((err) => {
        this.logger.error(`Falha ao enviar email de verificação: ${err.message}`);
      });

    return { message: 'Email de verificação enviado com sucesso' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return {
        message:
          'Se seu email estiver registrado, você receberá um link para redefinição de senha',
      };
    }

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersRepository.update(user.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    this.emailService
      .sendPasswordResetEmail(user.email, passwordResetToken)
      .catch((err) => {
        this.logger.error(`Falha ao enviar email de redefinição de senha: ${err.message}`);
      });

    return {
      message:
        'Se seu email estiver registrado, você receberá um link para redefinição de senha',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('Token de redefinição inválido ou expirado');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('O token de redefinição expirou');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  private generateToken(userId: string, email: string, rememberMe: boolean): string {
    const payload = { sub: userId, email };
    const expiresIn = rememberMe
      ? this.configService.get<string>('JWT_REMEMBER_ME_EXPIRATION', '30d')
      : this.configService.get<string>('JWT_EXPIRATION', '1d');

    return this.jwtService.sign(payload, { expiresIn: expiresIn as any });
  }
}
