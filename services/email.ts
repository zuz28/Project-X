// Email delivery service.
//
// IMPORTANT — how email works in this app:
// A mobile/web app can never send email directly; email is always sent by a
// backend service holding provider credentials (SendGrid, AWS SES, Postmark,
// Resend, Firebase, etc.). This module is the single seam where that backend
// call belongs. Until a backend is connected, the app runs in DEMO MODE:
// the verification code is generated, stored, and validated exactly like
// production, but instead of being emailed it is returned so the UI can
// display it to the tester.

import { logger } from '../utils/logger';

export interface EmailResult {
  delivered: boolean;
  // Only populated in demo mode so the UI can show the code to the tester.
  // A production email provider never returns the code to the client.
  demoCode?: string;
}

// Set to a real endpoint (e.g. 'https://api.yourbackend.com/auth/send-code')
// to switch from demo mode to real email delivery.
const EMAIL_API_ENDPOINT: string | null = null;

class EmailService {
  async sendVerificationCode(
    email: string,
    code: string,
    type: 'signup' | 'login' | 'reset'
  ): Promise<EmailResult> {
    if (EMAIL_API_ENDPOINT) {
      // Production path: the backend generates/validates delivery and emails
      // the code. The code itself never travels back to the client.
      const response = await fetch(EMAIL_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type }),
      });
      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }
      logger.info('Verification email sent via backend', { email, type }, 'EMAIL');
      return { delivered: true };
    }

    // Demo mode: no backend configured, surface the code to the tester.
    logger.info('DEMO MODE — verification code (would be emailed in production)', { email, type }, 'EMAIL');
    return { delivered: false, demoCode: code };
  }
}

export const emailService = new EmailService();
