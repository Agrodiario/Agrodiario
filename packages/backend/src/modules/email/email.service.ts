import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject: 'Redefinição de Senha - AgroDiário',
      html: this.getPasswordResetTemplate(resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject: 'Verifique seu Email - AgroDiário',
      html: this.getVerificationEmailTemplate(verifyUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9f7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <h1 style="color: #008542; font-size: 28px; margin: 0;">AgroDiário</h1>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <h2 style="color: #101828; font-size: 24px; font-weight: 400; margin: 0;">
                      Redefinição de Senha
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="color: #475467; font-size: 16px; line-height: 1.6; padding-bottom: 30px; text-align: center;">
                    <p style="margin: 0 0 16px 0;">
                      Recebemos uma solicitação para redefinir a senha da sua conta.
                    </p>
                    <p style="margin: 0;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <a href="${resetUrl}"
                       style="display: inline-block; background-color: #008542; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #475467; font-size: 14px; line-height: 1.6; text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0 0 8px 0;">
                      Este link expira em <strong>1 hora</strong>.
                    </p>
                    <p style="margin: 0;">
                      Se você não solicitou essa redefinição, ignore este email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Se o botão não funcionar, copie e cole este link no navegador:
                    </p>
                    <p style="color: #008542; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getVerificationEmailTemplate(verifyUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9f7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <h1 style="color: #008542; font-size: 28px; margin: 0;">AgroDiário</h1>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <h2 style="color: #101828; font-size: 24px; font-weight: 400; margin: 0;">
                      Bem-vindo ao AgroDiário!
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="color: #475467; font-size: 16px; line-height: 1.6; padding-bottom: 30px; text-align: center;">
                    <p style="margin: 0 0 16px 0;">
                      Obrigado por se cadastrar! Para completar seu registro, por favor verifique seu email.
                    </p>
                    <p style="margin: 0;">
                      Clique no botão abaixo para verificar sua conta:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <a href="${verifyUrl}"
                       style="display: inline-block; background-color: #008542; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Verificar Email
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #475467; font-size: 14px; line-height: 1.6; text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0;">
                      Se você não criou uma conta, ignore este email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Se o botão não funcionar, copie e cole este link no navegador:
                    </p>
                    <p style="color: #008542; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
                      ${verifyUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
