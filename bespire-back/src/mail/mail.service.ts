// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendResetPasswordEmail(email: string, resetUrl: string) {
    const mailOptions = {
      from: `"Bespire App" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <p>
            <a href="${resetUrl}" style="padding:10px 20px; background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending reset password email', error);
      throw new Error('Failed to send reset password email');
    }
  }

  async sendInvitedNewUserToWorkspace(
    email: string,
    resetUrl: string,
    companyName: string,
  ) {
    const mailOptions = {
      from: `"Bespire App" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Invitation to join ' + companyName + ' Workspace',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hi ${email} invited</h2>
          <p>Welcome to ${companyName}. Please activate your account to get started.</p>
          <p>
            <a href="${resetUrl}" style="padding:10px 20px; background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:5px; margin-top: 20px;">
              Activate Account
            </a>
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending reset password email', error);
      throw new Error('Failed to send reset password email');
    }
  }

  async sendClientInvitation(
    email: string,
    clientName: string,
    companyName: string,
    invitationLink: string,
  ) {
    const mailOptions = {
      from: `"Bespire App" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Welcome to Bespire - Complete Your Registration`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #697D67; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Bespire</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #181B1A; margin-bottom: 20px;">Hi ${clientName},</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              You've been invited to join <strong>${companyName}</strong> on Bespire, our comprehensive business management platform.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Complete your registration to start collaborating with your team and managing your projects efficiently.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${invitationLink}" 
                 style="background-color: #697D67; color: #ffffff; padding: 16px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Complete Registration
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 20px;">
              Best regards,<br>
              The Bespire Team
            </p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              This invitation link will expire in 7 days. If you didn't expect this invitation, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Client invitation email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending client invitation email', error);
      throw new Error('Failed to send client invitation email');
    }
  }

  async sendClientUpdateConfirmation(
    email: string,
    clientName: string,
    companyName: string,
    dashboardLink: string,
  ) {
    const mailOptions = {
      from: `"Bespire App" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Your Profile Information Has Been Updated`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #697D67; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Profile Updated</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #181B1A; margin-bottom: 20px;">Hi ${clientName},</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We wanted to let you know that your profile information for <strong>${companyName}</strong> has been updated on Bespire.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              The changes have been successfully applied to your account. You can review your updated information by logging into your dashboard.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${dashboardLink}" 
                 style="background-color: #697D67; color: #ffffff; padding: 16px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              If you didn't expect these changes or have any questions, please contact our support team immediately.
            </p>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 20px;">
              Best regards,<br>
              The Bespire Team
            </p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              This is an automated notification. If you have any concerns about your account security, please contact us immediately.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Client update confirmation email sent: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        'Error sending client update confirmation email',
        error,
      );
      throw new Error('Failed to send client update confirmation email');
    }
  }
}
