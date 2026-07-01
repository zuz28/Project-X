// Biometric authentication service
// Supports Face ID, Touch ID, Fingerprint, etc.

import { Platform } from 'react-native';
import { logger } from '../utils/logger';

export enum BiometricType {
  FACE_ID = 'faceId',
  TOUCH_ID = 'touchId',
  FINGERPRINT = 'fingerprint',
  IRIS = 'iris',
}

export interface BiometricConfig {
  reason: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

class BiometricService {
  private isAvailable: boolean = false;
  private biometricType: BiometricType | null = null;

  constructor() {
    this.initializeBiometric();
  }

  private async initializeBiometric() {
    try {
      // In production, use:
      // - expo-local-authentication for Expo
      // - react-native-biometrics for bare React Native
      // - react-native-touch-id / react-native-face-api

      this.isAvailable = true;
      this.biometricType = Platform.OS === 'ios' ? BiometricType.FACE_ID : BiometricType.FINGERPRINT;

      logger.info('Biometric initialized', { type: this.biometricType }, 'BIOMETRIC');
    } catch (error) {
      logger.warn('Biometric not available', error, 'BIOMETRIC');
      this.isAvailable = false;
    }
  }

  async isAvailableAsync(): Promise<boolean> {
    return this.isAvailable;
  }

  async getBiometricType(): Promise<BiometricType | null> {
    return this.biometricType;
  }

  async authenticate(config: BiometricConfig): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication not available');
    }

    try {
      // In production, call actual biometric authentication
      // const result = await LocalAuthentication.authenticateAsync({
      //   reason: config.reason,
      //   fallbackLabel: config.fallbackLabel,
      //   disableDeviceFallback: config.disableDeviceFallback,
      // });
      // return result.success;

      // Stub: simulate successful authentication
      logger.info('Biometric authentication attempt', { reason: config.reason }, 'BIOMETRIC');
      return true;
    } catch (error) {
      logger.error('Biometric authentication failed', error, 'BIOMETRIC');
      throw error;
    }
  }

  async enableBiometric() {
    if (!this.isAvailable) {
      throw new Error('Biometric not available on this device');
    }
    // Store biometric auth preference
    logger.info('Biometric authentication enabled', {}, 'BIOMETRIC');
  }

  async disableBiometric() {
    // Remove biometric auth preference
    logger.info('Biometric authentication disabled', {}, 'BIOMETRIC');
  }
}

export const biometricService = new BiometricService();
