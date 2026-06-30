export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLogLevel = LogLevel.INFO;

export const logger = {
  debug: (tag: string, message: string, data?: any) => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${tag}: ${message}`, data || '');
    }
  },

  info: (tag: string, message: string, data?: any) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${tag}: ${message}`, data || '');
    }
  },

  warn: (tag: string, message: string, data?: any) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${tag}: ${message}`, data || '');
    }
  },

  error: (tag: string, message: string, error?: Error | any) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${tag}: ${message}`, error || '');
    }
  },
};
