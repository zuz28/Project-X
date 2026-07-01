// Enhanced authentication hook with biometric support and session persistence
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore, User } from '../store';
import { authService } from '../services/auth';
import { logger } from '../utils/logger';
import { Validator } from '../utils/validation';

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, code: string) => Promise<void>;
  signup: (name: string, email: string, password: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  sendVerificationCode: (email: string, type: 'signup' | 'login' | 'reset') => Promise<void>;
  clearError: () => void;
}

const AUTH_SESSION_KEY = '@vela_auth_session';
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useAuth(): UseAuthResult {
  const { user, setUser, logout: storeLogout, isAuthenticated } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionData = await AsyncStorage.getItem(AUTH_SESSION_KEY);

      if (sessionData) {
        const { user: savedUser, timestamp } = JSON.parse(sessionData);

        // Check if session is still valid
        if (Date.now() - timestamp < SESSION_TIMEOUT_MS) {
          setUser(savedUser);
          logger.info('Session restored from storage', {}, 'AUTH');
        } else {
          // Session expired
          await AsyncStorage.removeItem(AUTH_SESSION_KEY);
          logger.info('Session expired', {}, 'AUTH');
        }
      }
    } catch (err) {
      logger.error('Failed to restore session', err, 'AUTH');
      // Silent fail - user will need to login
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const sendVerificationCode = useCallback(
    async (email: string, type: 'signup' | 'login' | 'reset') => {
      try {
        setError(null);

        // Validate email
        const emailValidation = Validator.validateEmail(email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0].message);
        }

        await authService.sendVerificationEmail(email, type);
        logger.info(`Verification code sent for ${type}`, { email }, 'AUTH');
      } catch (err: any) {
        const message = err.message || 'Failed to send verification code';
        setError(message);
        logger.error('Send verification code failed', err, 'AUTH');
        throw err;
      }
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, code: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Validate inputs
        const nameValidation = Validator.validateName(name);
        if (!nameValidation.isValid) {
          throw new Error(nameValidation.errors[0].message);
        }

        const emailValidation = Validator.validateEmail(email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0].message);
        }

        const passwordValidation = Validator.validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors[0].message);
        }

        const codeValidation = Validator.validateCode(code);
        if (!codeValidation.isValid) {
          throw new Error(codeValidation.errors[0].message);
        }

        const newUser = await authService.verifyAndSignup(email, code, name, password);
        setUser(newUser);

        // Persist session
        await AsyncStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ user: newUser, timestamp: Date.now() })
        );

        logger.info('User signed up successfully', { userId: newUser.id }, 'AUTH');
      } catch (err: any) {
        const message = err.message || 'Signup failed';
        setError(message);
        logger.error('Signup failed', err, 'AUTH');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const login = useCallback(
    async (email: string, code: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Validate inputs
        const emailValidation = Validator.validateEmail(email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0].message);
        }

        const codeValidation = Validator.validateCode(code);
        if (!codeValidation.isValid) {
          throw new Error(codeValidation.errors[0].message);
        }

        const loginUser = await authService.verifyAndLogin(email, code);
        setUser(loginUser);

        // Persist session
        await AsyncStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ user: loginUser, timestamp: Date.now() })
        );

        logger.info('User logged in successfully', { userId: loginUser.id }, 'AUTH');
      } catch (err: any) {
        const message = err.message || 'Login failed';
        setError(message);
        logger.error('Login failed', err, 'AUTH');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      storeLogout();
      logger.info('User logged out', {}, 'AUTH');
    } catch (err) {
      logger.error('Logout failed', err, 'AUTH');
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Validate inputs
        const emailValidation = Validator.validateEmail(email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0].message);
        }

        const codeValidation = Validator.validateCode(code);
        if (!codeValidation.isValid) {
          throw new Error(codeValidation.errors[0].message);
        }

        const passwordValidation = Validator.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors[0].message);
        }

        await authService.verifyAndResetPassword(email, code, newPassword);
        logger.info('Password reset successfully', {}, 'AUTH');
      } catch (err: any) {
        const message = err.message || 'Password reset failed';
        setError(message);
        logger.error('Password reset failed', err, 'AUTH');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    sendVerificationCode,
    clearError,
  };
}
