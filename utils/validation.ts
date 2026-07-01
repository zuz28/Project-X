// Input validation and sanitization utilities
// Production-grade validation schemas

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strong password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

export class Validator {
  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
      return { isValid: false, errors };
    }

    if (email.length > 254) {
      errors.push({ field: 'email', message: 'Email is too long' });
      return { isValid: false, errors };
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
      return { isValid: false, errors };
    }

    return { isValid: true, errors };
  }

  static validatePassword(password: string, checkStrength: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
      return { isValid: false, errors };
    }

    if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (checkStrength && !PASSWORD_REGEX.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain uppercase, lowercase, number, and special character',
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateName(name: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!name || !name.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
      return { isValid: false, errors };
    }

    if (name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (name.length > 100) {
      errors.push({ field: 'name', message: 'Name is too long' });
    }

    // Prevent script injection
    if (/<[^>]*>/g.test(name)) {
      errors.push({ field: 'name', message: 'Name contains invalid characters' });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateCode(code: string, length: number = 6): ValidationResult {
    const errors: ValidationError[] = [];

    if (!code) {
      errors.push({ field: 'code', message: 'Code is required' });
      return { isValid: false, errors };
    }

    if (!/^\d+$/.test(code)) {
      errors.push({ field: 'code', message: 'Code must contain only digits' });
    }

    if (code.length !== length) {
      errors.push({ field: 'code', message: `Code must be ${length} digits` });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateHelmetName(name: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!name || !name.trim()) {
      errors.push({ field: 'helmetName', message: 'Helmet name is required' });
      return { isValid: false, errors };
    }

    if (name.length < 2) {
      errors.push({ field: 'helmetName', message: 'Helmet name must be at least 2 characters' });
    }

    if (name.length > 50) {
      errors.push({ field: 'helmetName', message: 'Helmet name is too long' });
    }

    if (/<[^>]*>/g.test(name)) {
      errors.push({ field: 'helmetName', message: 'Helmet name contains invalid characters' });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateSerialNumber(serial: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!serial || !serial.trim()) {
      errors.push({ field: 'serial', message: 'Serial number is required' });
      return { isValid: false, errors };
    }

    // Allow alphanumeric and hyphens
    if (!/^[a-zA-Z0-9\-]+$/.test(serial)) {
      errors.push({ field: 'serial', message: 'Serial number contains invalid characters' });
    }

    if (serial.length > 50) {
      errors.push({ field: 'serial', message: 'Serial number is too long' });
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove potentially dangerous characters
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }
}
