// Email delivery service.
//
// Three delivery modes, checked in order:
//
// 1. EmailJS (quickest real-email path, ~10 min setup, no server needed):
//    - Create a free account at https://www.emailjs.com (200 emails/month)
//    - Add an email service (e.g. your Gmail) and note its Service ID
//    - Create a template with variables {{to_email}} and {{code}},
//      set "To email" to {{to_email}}, and note its Template ID
//    - Copy your Public Key from Account → General
//    - Put all three in .env (see .env.example) and restart expo
//    EmailJS is designed for client-side use: the public key is safe to
//    ship in the app.
//
// 2. Custom backend (production path): set EXPO_PUBLIC_EMAIL_API_URL to
//    your server endpoint. The server holds the real provider credentials
//    (SendGrid, SES, Resend, ...) and sends the email; the code never
//    travels back to the client.
//
// 3. Demo mode (no configuration): the verification code is generated,
//    stored, and validated exactly like production, but shown on screen
//    in a labeled banner instead of emailed.

import { logger } from '../utils/logger';

export interface EmailResult {
  delivered: boolean;
  // Only populated in demo mode so the UI can show the code to the tester.
  demoCode?: string;
}

const EMAILJS_SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAIL_API_URL = process.env.EXPO_PUBLIC_EMAIL_API_URL;

const TYPE_SUBJECTS: Record<string, string> = {
  signup: 'Your Vela sign-up code',
  login: 'Your Vela login code',
  reset: 'Your Vela password reset code',
};

class EmailService {
  async sendVerificationCode(
    email: string,
    code: string,
    type: 'signup' | 'login' | 'reset'
  ): Promise<EmailResult> {
    // Mode 1: EmailJS
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: email,
            code,
            subject: TYPE_SUBJECTS[type],
          },
        }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.error('EmailJS send failed', { status: response.status, body }, 'EMAIL');
        throw new Error('Failed to send verification email. Please try again.');
      }
      logger.info('Verification email sent via EmailJS', { email, type }, 'EMAIL');
      return { delivered: true };
    }

    // Mode 2: custom backend
    if (EMAIL_API_URL) {
      const response = await fetch(EMAIL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type }),
      });
      if (!response.ok) {
        throw new Error('Failed to send verification email. Please try again.');
      }
      logger.info('Verification email sent via backend', { email, type }, 'EMAIL');
      return { delivered: true };
    }

    // Mode 3: demo — surface the code to the tester on screen
    logger.info('DEMO MODE — verification code (would be emailed in production)', { email, type }, 'EMAIL');
    return { delivered: false, demoCode: code };
  }
}

export const emailService = new EmailService();
