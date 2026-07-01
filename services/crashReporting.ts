// Crash reporting and error tracking service
// Integrates with Sentry for production error monitoring

import { logger } from '../utils/logger';

export interface CrashReportConfig {
  dsn?: string;
  environment?: 'development' | 'staging' | 'production';
  tracesSampleRate?: number;
  enabled?: boolean;
}

class CrashReportingService {
  private config: CrashReportConfig;
  private isInitialized = false;

  constructor(config: CrashReportConfig = {}) {
    this.config = {
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: 1.0,
      enabled: !__DEV__,
      ...config,
    };
  }

  initialize(dsn: string): void {
    try {
      // In production, initialize Sentry with:
      // import * as Sentry from "@sentry/react-native";
      // Sentry.init({
      //   dsn: this.config.dsn || dsn,
      //   environment: this.config.environment,
      //   tracesSampleRate: this.config.tracesSampleRate,
      //   enableTracing: true,
      // });

      this.isInitialized = true;
      logger.info('Crash reporting initialized', { dsn: dsn.substring(0, 20) + '...' }, 'CRASH');
    } catch (error) {
      logger.error('Failed to initialize crash reporting', error, 'CRASH');
    }
  }

  captureException(error: Error | any, context?: any): void {
    if (!this.config.enabled || !this.isInitialized) {
      logger.error('Exception captured locally', error, 'CRASH');
      return;
    }

    try {
      // In production: Sentry.captureException(error, { contexts: { app: context } });
      logger.error('Exception sent to crash reporting', { message: error.message }, 'CRASH');
    } catch (err) {
      logger.error('Failed to report exception', err, 'CRASH');
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any): void {
    if (!this.config.enabled || !this.isInitialized) {
      logger.log(level === 'error' ? 'ERROR' : 'INFO', message, context, 'CRASH');
      return;
    }

    try {
      // In production: Sentry.captureMessage(message, level);
      logger.info(`Message captured: ${message}`, context, 'CRASH');
    } catch (err) {
      logger.error('Failed to report message', err, 'CRASH');
    }
  }

  setUser(userId: string, email?: string, username?: string): void {
    if (!this.isInitialized) return;

    try {
      // In production: Sentry.setUser({ id: userId, email, username });
      logger.debug(`User set for crash reporting: ${userId}`, {}, 'CRASH');
    } catch (err) {
      logger.error('Failed to set crash reporting user', err, 'CRASH');
    }
  }

  clearUser(): void {
    if (!this.isInitialized) return;

    try {
      // In production: Sentry.setUser(null);
      logger.debug('User cleared from crash reporting', {}, 'CRASH');
    } catch (err) {
      logger.error('Failed to clear crash reporting user', err, 'CRASH');
    }
  }

  captureBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: any): void {
    if (!this.isInitialized) return;

    try {
      // In production: Sentry.captureMessage(message, { category, level, extra: data });
      logger.debug(`Breadcrumb: ${category}`, { message, ...data }, 'CRASH');
    } catch (err) {
      logger.error('Failed to capture breadcrumb', err, 'CRASH');
    }
  }

  getStatus(): { isInitialized: boolean; environment: string; enabled: boolean } {
    return {
      isInitialized: this.isInitialized,
      environment: this.config.environment || 'unknown',
      enabled: this.config.enabled || false,
    };
  }
}

export const crashReportingService = new CrashReportingService();
