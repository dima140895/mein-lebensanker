/**
 * Production-safe logging utility
 * Only logs errors in development environment to prevent information disclosure
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages - only in development
   * In production, errors are silently ignored to prevent information disclosure
   */
  error: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
    // In production, you could send to a monitoring service like Sentry
  },

  /**
   * Log warning messages - only in development
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },

  /**
   * Log info messages - only in development
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },

  /**
   * Log debug messages - only in development
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
};
