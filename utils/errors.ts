export type ErrorCode =
  | 'BLE_SCAN_FAILED'
  | 'BLE_CONNECT_FAILED'
  | 'BLE_DISCONNECT_FAILED'
  | 'DEVICE_NOT_FOUND'
  | 'SERVICE_DISCOVERY_FAILED'
  | 'CHARACTERISTIC_SUBSCRIBE_FAILED'
  | 'DATA_DECODE_FAILED'
  | 'DATA_VALIDATION_FAILED'
  | 'STORAGE_ERROR'
  | 'SYNC_FAILED'
  | 'NETWORK_ERROR'
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode,
    public originalError?: Error,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      originalError: this.originalError?.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

export class BLEError extends AppError {
  constructor(message: string, code: ErrorCode, originalError?: Error) {
    super(message, code, originalError, { component: 'BLE' });
    this.name = 'BLEError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'STORAGE_ERROR', originalError, { component: 'Storage' });
    this.name = 'StorageError';
  }
}

export class SyncError extends AppError {
  constructor(message: string, originalError?: Error, retriable = true) {
    super(message, 'SYNC_FAILED', originalError, { component: 'Sync', retriable });
    this.name = 'SyncError';
  }

  isRetriable(): boolean {
    return this.context?.retriable ?? true;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, public value?: any) {
    super(message, 'DATA_VALIDATION_FAILED', undefined, {
      component: 'Validation',
      field,
      value,
    });
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown, context?: string): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', error, {
      context,
      originalName: error.name,
    });
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', undefined, { context });
  }

  // Unknown error type
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', undefined, {
    context,
    errorType: typeof error,
  });
}

export function isRetriableError(error: AppError): boolean {
  const retriableCodes: ErrorCode[] = [
    'BLE_SCAN_FAILED',
    'BLE_CONNECT_FAILED',
    'NETWORK_ERROR',
    'SYNC_FAILED',
  ];

  return retriableCodes.includes(error.code);
}

export function getErrorMessage(error: AppError): string {
  const messages: Record<ErrorCode, string> = {
    BLE_SCAN_FAILED: 'Failed to scan for Bluetooth devices. Make sure Bluetooth is enabled.',
    BLE_CONNECT_FAILED: 'Failed to connect to helmet. Try again or restart the device.',
    BLE_DISCONNECT_FAILED: 'Error disconnecting from helmet.',
    DEVICE_NOT_FOUND: 'Helmet device not found. Make sure it is nearby and powered on.',
    SERVICE_DISCOVERY_FAILED: 'Could not discover helmet services.',
    CHARACTERISTIC_SUBSCRIBE_FAILED: 'Failed to subscribe to impact data.',
    DATA_DECODE_FAILED: 'Failed to decode impact data.',
    DATA_VALIDATION_FAILED: 'Impact data is invalid.',
    STORAGE_ERROR: 'Failed to save data locally.',
    SYNC_FAILED: 'Failed to sync data to cloud.',
    NETWORK_ERROR: 'Network error. Check your connection.',
    AUTH_FAILED: 'Authentication failed. Please log in again.',
    PERMISSION_DENIED: 'Permission denied. Check app settings.',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  };

  return messages[error.code] || messages.UNKNOWN_ERROR;
}
