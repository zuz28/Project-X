// Authentication Service
// Handles user registration, login, and password recovery with email verification

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  type: 'signup' | 'login' | 'reset';
}

class AuthService {
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private users: Map<string, { email: string; name: string; password: string }> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: number }> = new Map();

  // Generate 6-digit verification code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Simulate sending email (in production, use real email service)
  async sendVerificationEmail(
    email: string,
    type: 'signup' | 'login' | 'reset'
  ): Promise<void> {
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const verification: VerificationCode = {
      code,
      email,
      expiresAt,
      type,
    };

    this.verificationCodes.set(email, verification);

    // Simulate email send
    console.log(`[EMAIL] Verification code for ${email}: ${code}`);
  }

  // Verify code and create account
  async verifyAndSignup(
    email: string,
    code: string,
    name: string,
    password: string
  ): Promise<User> {
    const verification = this.verificationCodes.get(email);

    if (!verification) {
      throw new Error('No verification code found');
    }

    if (verification.code !== code) {
      throw new Error('Invalid verification code');
    }

    if (verification.expiresAt < Date.now()) {
      throw new Error('Verification code expired');
    }

    if (verification.type !== 'signup') {
      throw new Error('Invalid verification type');
    }

    // Create user
    const userId = `user-${Date.now()}`;
    this.users.set(email, {
      email,
      name,
      password, // In production, this should be hashed
    });

    this.verificationCodes.delete(email);

    return {
      id: userId,
      email,
      name,
    };
  }

  // Verify code and login
  async verifyAndLogin(email: string, code: string): Promise<User> {
    const verification = this.verificationCodes.get(email);

    if (!verification) {
      throw new Error('No verification code found');
    }

    if (verification.code !== code) {
      throw new Error('Invalid verification code');
    }

    if (verification.expiresAt < Date.now()) {
      throw new Error('Verification code expired');
    }

    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    this.verificationCodes.delete(email);

    return {
      id: `user-${Date.now()}`,
      email,
      name: user.name,
    };
  }

  // Verify code and reset password
  async verifyAndResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const verification = this.verificationCodes.get(email);

    if (!verification) {
      throw new Error('No verification code found');
    }

    if (verification.code !== code) {
      throw new Error('Invalid verification code');
    }

    if (verification.expiresAt < Date.now()) {
      throw new Error('Verification code expired');
    }

    if (verification.type !== 'reset') {
      throw new Error('Invalid verification type');
    }

    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword; // In production, should be hashed
    this.verificationCodes.delete(email);
  }

  // Check if email exists
  emailExists(email: string): boolean {
    return this.users.has(email);
  }

  // Get user by email
  getUserByEmail(email: string): { email: string; name: string } | null {
    return this.users.get(email) || null;
  }
}

export const authService = new AuthService();
