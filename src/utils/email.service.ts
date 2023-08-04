import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailTemplatesService } from './email.templates';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_HOST_PASSWORD'),
      },
    });

    this.fromEmail = this.configService.get<string>('GMAIL_USER');
  }

  async sendConfirmationEmail(
    email: string,
    confirmationLink: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: 'Email Confirmation',
      html: this.emailTemplatesService.getConfirmationEmailTemplate(
        confirmationLink,
      ),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error('Failed to send confirmation email.');
    }
  }
}
