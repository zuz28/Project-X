// Bluetooth Configuration
export const BLE_CONFIG = {
  SERVICE_UUID: '12345678-1234-5678-1234-567812345678',
  IMPACT_CHARACTERISTIC_UUID: '87654321-4321-8765-4321-876543218765',
  SCAN_DURATION_MS: 10000,
  CONNECTION_TIMEOUT_MS: 15000,
};

// Impact Thresholds
export const IMPACT_THRESHOLDS = {
  MIN_G_FORCE: 0,
  MAX_G_FORCE: 200,
  CONCUSSION_RISK_G: 60,
  MIN_ROTATIONAL: 0,
  MAX_ROTATIONAL: 10000,
  CONCUSSION_RISK_ROTATIONAL: 6000,
  WARNING_G: 50,
  WARNING_ROTATIONAL: 5000,
};

// Session Configuration
export const SESSION_CONFIG = {
  AUTO_SAVE_INTERVAL_MS: 30000, // Save every 30 seconds
  MAX_IMPACTS_IN_MEMORY: 1000,
  SESSION_TIMEOUT_MS: 2 * 60 * 60 * 1000, // 2 hours
};

// Storage Configuration
export const STORAGE_CONFIG = {
  MAX_STORED_NOTIFICATIONS: 100,
  MAX_STORED_SESSIONS: 365, // 1 year of daily sessions
  MAX_LOCAL_STORAGE_MB: 10,
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION_MS: 300,
  TOAST_DEFAULT_DURATION_MS: 3000,
  TOAST_LONG_DURATION_MS: 5000,
  BOTTOM_NAV_HEIGHT: 60,
  HEADER_HEIGHT: 80,
};

// API Configuration
export const API_CONFIG = {
  SYNC_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 10000,
};

// Logging Configuration
export const LOGGING_CONFIG = {
  ENABLE_CONSOLE: true,
  MAX_LOG_SIZE_MB: 5,
  LOG_RETENTION_DAYS: 7,
  EXCLUDED_TAGS: ['BLE_RAW'], // Don't log raw BLE data
};

// App Metadata
export const APP_CONFIG = {
  NAME: 'Vela',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  BUNDLE_ID: 'com.vela.app',
  MINIMUM_OS_VERSION_IOS: '14.0',
  MINIMUM_OS_VERSION_ANDROID: '11',
};

// Feature Flags
export const FEATURES = {
  CLOUD_SYNC: true,
  NOTIFICATIONS: true,
  IMPACT_REPLAY: false, // Coming soon
  SOCIAL_SHARING: false, // Coming soon
  ADVANCED_ANALYTICS: false, // Coming soon
  CUSTOM_ALERTS: false, // Coming soon
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: { score: 0, label: 'Low', color: '#34C759' },
  MODERATE: { score: 1, label: 'Moderate', color: '#ffc107' },
  HIGH: { score: 2, label: 'High', color: '#ff6b6b' },
} as const;
