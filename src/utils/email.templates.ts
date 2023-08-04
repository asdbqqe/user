import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplatesService {
  private serverUrl: string;

  constructor() {
    this.serverUrl = 'http://localhost:3003';
  }

  getConfirmationEmailTemplate(confirmationLink: string): string {
    const fullLink = this.serverUrl + confirmationLink;
    return `
      <h1>Email Confirmation</h1>
      <p>Please confirm your email by clicking the following link:</p>
      <a href="${fullLink}">${fullLink}</a>
    `;
  }
}
