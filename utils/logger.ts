// Production-grade logging system
// Tracks errors, performance, and user actions

import { Platform } from 'react-native';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
  context?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs
  private isDev = __DEV__;

  log(level: LogLevel, message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      context,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (this.isDev) {
      const prefix = `[${context || 'APP'}] ${level}`;
      switch (level) {
        case LogLevel.DEBUG:
          console.log(prefix, message, data);
          break;
        case LogLevel.INFO:
          console.log(prefix, message, data);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data);
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data);
          break;
      }
    }

    // In production, send to analytics/crash reporting service
    if (level === LogLevel.ERROR && !this.isDev) {
      this.reportToService(entry);
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, error?: Error | any, context?: string) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : error;

    this.log(LogLevel.ERROR, message, errorData, context);
  }

  async trackEvent(eventName: string, properties?: any) {
    // In production, send to analytics service (Mixpanel, Segment, etc.)
    this.info(`Event: ${eventName}`, properties, 'ANALYTICS');
  }

  async trackError(error: Error, context?: string) {
    // In production, send to crash reporting (Sentry, Crashlytics, etc.)
    this.error('Unhandled Error', error, context);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }

  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  }

  private reportToService(entry: LogEntry) {
    // TODO: Implement sending to crash reporting service
    // Example: Sentry.captureException(entry);
  }
}

export const logger = new Logger();
