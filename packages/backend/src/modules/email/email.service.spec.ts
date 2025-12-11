import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        FRONTEND_URL: 'http://localhost:5173',
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        SMTP_USER: 'test@test.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM: 'AgroDiario <noreply@agrodiario.com>',
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    // Setup mock sendMail function
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

    // Mock nodemailer.createTransport to return our mock transporter
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    jest.clearAllMocks();

    // Re-setup after clearAllMocks
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    const testEmail = 'usuario@teste.com';
    const testToken = 'abc123token';

    it('deve enviar email de recuperação de senha com sucesso', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      // Access the transporter directly through the service
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendPasswordResetEmail(testEmail, testToken);

      // Assert
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          subject: 'Redefinição de Senha - AgroDiário',
          from: 'AgroDiario <noreply@agrodiario.com>',
        }),
      );
    });

    it('deve incluir o token na URL do email', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendPasswordResetEmail(testEmail, testToken);

      // Assert
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`/reset-password?token=${testToken}`);
      expect(callArgs.html).toContain('http://localhost:5173');
    });

    it('deve incluir conteúdo HTML com informações de expiração', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendPasswordResetEmail(testEmail, testToken);

      // Assert
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('1 hora');
      expect(callArgs.html).toContain('Redefinir Senha');
      expect(callArgs.html).toContain('AgroDiário');
    });

    it('deve lançar erro quando o envio falhar', async () => {
      // Arrange
      const sendError = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(sendError);
      (service as any).transporter = { sendMail: mockSendMail };

      // Act & Assert
      await expect(service.sendPasswordResetEmail(testEmail, testToken)).rejects.toThrow(
        'SMTP connection failed',
      );
    });
  });

  describe('sendVerificationEmail', () => {
    const testEmail = 'novousuario@teste.com';
    const testToken = 'verification-token-xyz';

    it('deve enviar email de verificação com sucesso', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendVerificationEmail(testEmail, testToken);

      // Assert
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          subject: 'Verifique seu Email - AgroDiário',
          from: 'AgroDiario <noreply@agrodiario.com>',
        }),
      );
    });

    it('deve incluir o token de verificação na URL', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendVerificationEmail(testEmail, testToken);

      // Assert
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`/verify-email?token=${testToken}`);
    });

    it('deve incluir mensagem de boas-vindas no conteúdo', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });
      (service as any).transporter = { sendMail: mockSendMail };

      // Act
      await service.sendVerificationEmail(testEmail, testToken);

      // Assert
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Bem-vindo ao AgroDiário');
      expect(callArgs.html).toContain('Verificar Email');
    });

    it('deve lançar erro quando o envio falhar', async () => {
      // Arrange
      const sendError = new Error('Email service unavailable');
      mockSendMail.mockRejectedValue(sendError);
      (service as any).transporter = { sendMail: mockSendMail };

      // Act & Assert
      await expect(service.sendVerificationEmail(testEmail, testToken)).rejects.toThrow(
        'Email service unavailable',
      );
    });
  });

  describe('configuração do transporter', () => {
    it('deve criar transporter com configurações corretas', async () => {
      // Arrange - criar novo módulo para verificar a chamada do createTransport
      const createTransportSpy = jest.spyOn(nodemailer, 'createTransport');

      // Act - criar nova instância do serviço
      await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      // Assert
      expect(createTransportSpy).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@test.com',
          pass: 'password123',
        },
      });
    });
  });
});
