// Authentication Service
// Handles user registration, login, and password recovery with email
// verification codes. Users and codes are persisted in AsyncStorage (the
// app's local database) so accounts survive app restarts. Passwords are
// stored as salted SHA-256 hashes, never as plaintext.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { emailService } from './email';
import { generateSalt, hashPassword } from '../utils/hash';

export interface User {
  id: string;
  email: string;
  name: string;
}

export type VerificationType = 'signup' | 'login' | 'reset';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

interface StoredCode {
  code: string;
  expiresAt: number;
  type: VerificationType;
  attempts: number;
}

const USERS_KEY = '@vela_users';
const CODES_KEY = '@vela_verification_codes';
const CODE_TTL_MS = 15 * 60 * 1000; // codes expire after 15 minutes
const MAX_CODE_ATTEMPTS = 5;

class AuthService {
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async loadUsers(): Promise<Record<string, StoredUser>> {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      logger.error('Failed to load users', error, 'AUTH');
      return {};
    }
  }

  private async saveUsers(users: Record<string, StoredUser>): Promise<void> {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private async loadCodes(): Promise<Record<string, StoredCode>> {
    try {
      const raw = await AsyncStorage.getItem(CODES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      logger.error('Failed to load verification codes', error, 'AUTH');
      return {};
    }
  }

  private async saveCodes(codes: Record<string, StoredCode>): Promise<void> {
    await AsyncStorage.setItem(CODES_KEY, JSON.stringify(codes));
  }

  // Validates a submitted code against the stored one. Throws with a
  // user-friendly message on any failure; consumes the code on success.
  private async consumeCode(
    email: string,
    submittedCode: string,
    expectedType: VerificationType
  ): Promise<void> {
    const key = this.normalizeEmail(email);
    const codes = await this.loadCodes();
    const stored = codes[key];

    if (!stored) {
      throw new Error('No verification code found. Please request a new one.');
    }

    if (stored.type !== expectedType) {
      throw new Error('This code was issued for a different action. Please request a new one.');
    }

    if (stored.expiresAt < Date.now()) {
      delete codes[key];
      await this.saveCodes(codes);
      throw new Error('Verification code expired. Please request a new one.');
    }

    if (stored.attempts >= MAX_CODE_ATTEMPTS) {
      delete codes[key];
      await this.saveCodes(codes);
      throw new Error('Too many incorrect attempts. Please request a new code.');
    }

    if (stored.code !== submittedCode) {
      stored.attempts += 1;
      await this.saveCodes(codes);
      throw new Error('Incorrect verification code. Please try again.');
    }

    // Success — codes are single-use.
    delete codes[key];
    await this.saveCodes(codes);
  }

  // Generates a code, stores it with expiry, and hands it to the email
  // service for delivery. Returns the demo code when no email backend is
  // configured so the UI can display it to the tester.
  async sendVerificationEmail(
    email: string,
    type: VerificationType
  ): Promise<{ demoCode?: string }> {
    const key = this.normalizeEmail(email);
    const users = await this.loadUsers();
    const accountExists = !!users[key];

    if (type === 'signup' && accountExists) {
      throw new Error('An account with this email already exists. Try signing in instead.');
    }
    if ((type === 'login' || type === 'reset') && !accountExists) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    const code = this.generateCode();
    const codes = await this.loadCodes();
    codes[key] = {
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
      type,
      attempts: 0,
    };
    await this.saveCodes(codes);

    const result = await emailService.sendVerificationCode(key, code, type);
    logger.info(`Verification code issued for ${type}`, { email: key }, 'AUTH');
    return { demoCode: result.demoCode };
  }

  async verifyAndSignup(
    email: string,
    code: string,
    name: string,
    password: string
  ): Promise<User> {
    const key = this.normalizeEmail(email);
    await this.consumeCode(key, code, 'signup');

    const users = await this.loadUsers();
    if (users[key]) {
      throw new Error('An account with this email already exists.');
    }

    const salt = generateSalt();
    const user: StoredUser = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      email: key,
      name: name.trim(),
      passwordHash: hashPassword(password, salt),
      salt,
      createdAt: Date.now(),
    };
    users[key] = user;
    await this.saveUsers(users);

    logger.info('Account created', { userId: user.id }, 'AUTH');
    return { id: user.id, email: user.email, name: user.name };
  }

  async verifyAndLogin(email: string, code: string): Promise<User> {
    const key = this.normalizeEmail(email);
    await this.consumeCode(key, code, 'login');

    const users = await this.loadUsers();
    const user = users[key];
    if (!user) {
      throw new Error('No account found with this email.');
    }

    logger.info('Login verified', { userId: user.id }, 'AUTH');
    return { id: user.id, email: user.email, name: user.name };
  }

  async verifyAndResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const key = this.normalizeEmail(email);
    await this.consumeCode(key, code, 'reset');

    const users = await this.loadUsers();
    const user = users[key];
    if (!user) {
      throw new Error('No account found with this email.');
    }

    const salt = generateSalt();
    user.salt = salt;
    user.passwordHash = hashPassword(newPassword, salt);
    await this.saveUsers(users);

    logger.info('Password reset', { userId: user.id }, 'AUTH');
  }

  async emailExists(email: string): Promise<boolean> {
    const users = await this.loadUsers();
    return !!users[this.normalizeEmail(email)];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.loadUsers();
    const user = users[this.normalizeEmail(email)];
    return user ? { id: user.id, email: user.email, name: user.name } : null;
  }
}

export const authService = new AuthService();
