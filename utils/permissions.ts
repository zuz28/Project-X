import { Platform } from 'react-native';
import { logger } from './logger';

export type PermissionType =
  | 'bluetooth'
  | 'location'
  | 'health'
  | 'camera'
  | 'microphone'
  | 'storage';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export interface PermissionCheckResult {
  type: PermissionType;
  status: PermissionStatus;
  isGranted: boolean;
}

/**
 * Permission manager for handling app permissions
 */
export class PermissionManager {
  /**
   * Check if Bluetooth permission is granted
   */
  async checkBluetoothPermission(): Promise<PermissionCheckResult> {
    logger.debug('PermissionManager', 'Checking Bluetooth permission');

    if (Platform.OS === 'ios') {
      // iOS handles Bluetooth permissions automatically via BLE-PLX
      return {
        type: 'bluetooth',
        status: 'granted',
        isGranted: true,
      };
    }

    if (Platform.OS === 'android') {
      // Android requires explicit Bluetooth permission
      // This should be checked via react-native-permissions or similar
      logger.info('PermissionManager', 'Android Bluetooth permissions should be checked');
      return {
        type: 'bluetooth',
        status: 'undetermined',
        isGranted: false,
      };
    }

    return {
      type: 'bluetooth',
      status: 'granted',
      isGranted: true,
    };
  }

  /**
   * Check if location permission is granted
   */
  async checkLocationPermission(): Promise<PermissionCheckResult> {
    logger.debug('PermissionManager', 'Checking location permission');

    // Location may be needed for BLE scanning on some Android versions
    return {
      type: 'location',
      status: 'undetermined',
      isGranted: false,
    };
  }

  /**
   * Check if storage permission is granted
   */
  async checkStoragePermission(): Promise<PermissionCheckResult> {
    logger.debug('PermissionManager', 'Checking storage permission');

    if (Platform.OS === 'ios') {
      // iOS doesn't require explicit storage permission for app data
      return {
        type: 'storage',
        status: 'granted',
        isGranted: true,
      };
    }

    // Android may require storage permissions
    return {
      type: 'storage',
      status: 'undetermined',
      isGranted: false,
    };
  }

  /**
   * Request Bluetooth permission
   */
  async requestBluetoothPermission(): Promise<PermissionCheckResult> {
    logger.info('PermissionManager', 'Requesting Bluetooth permission');

    try {
      const result = await this.checkBluetoothPermission();

      if (!result.isGranted) {
        logger.warn('PermissionManager', 'Bluetooth permission not granted');
      }

      return result;
    } catch (error) {
      logger.error('PermissionManager', 'Failed to request Bluetooth permission', error);
      return {
        type: 'bluetooth',
        status: 'denied',
        isGranted: false,
      };
    }
  }

  /**
   * Request multiple permissions
   */
  async requestPermissions(types: PermissionType[]): Promise<PermissionCheckResult[]> {
    logger.info('PermissionManager', 'Requesting permissions', { types });

    const results: PermissionCheckResult[] = [];

    for (const type of types) {
      let result: PermissionCheckResult;

      switch (type) {
        case 'bluetooth':
          result = await this.requestBluetoothPermission();
          break;
        case 'location':
          result = await this.checkLocationPermission();
          break;
        case 'storage':
          result = await this.checkStoragePermission();
          break;
        default:
          result = {
            type,
            status: 'undetermined',
            isGranted: false,
          };
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Check if all required permissions are granted
   */
  async checkAllPermissions(): Promise<boolean> {
    const requiredPermissions: PermissionType[] = ['bluetooth', 'storage'];

    const results = await this.requestPermissions(requiredPermissions);
    const allGranted = results.every(r => r.isGranted);

    logger.info('PermissionManager', 'All permissions check', { allGranted });

    return allGranted;
  }

  /**
   * Get permission status display text
   */
  getPermissionStatusText(status: PermissionStatus): string {
    const statusTexts: Record<PermissionStatus, string> = {
      granted: 'Granted',
      denied: 'Denied',
      blocked: 'Blocked',
      undetermined: 'Not Determined',
    };

    return statusTexts[status];
  }
}

export const permissionManager = new PermissionManager();

/**
 * Hook-friendly permission check
 */
export async function checkRequiredPermissions(): Promise<{
  allGranted: boolean;
  missing: PermissionType[];
}> {
  const requiredPermissions: PermissionType[] = ['bluetooth'];

  const results = await permissionManager.requestPermissions(requiredPermissions);

  const missing = results
    .filter(r => !r.isGranted)
    .map(r => r.type);

  return {
    allGranted: missing.length === 0,
    missing,
  };
}
