// Resilience utilities for handling transient failures
// Implements exponential backoff, circuit breaker, and retry logic

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  monitorIntervalMs?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

class RetryService {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelayMs = 1000,
      maxDelayMs = 30000,
      backoffMultiplier = 2,
      shouldRetry = (error) => this.isTransientError(error),
    } = options;

    let lastError: any;
    let delayMs = initialDelayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (!shouldRetry(error) || attempt === maxAttempts) {
          throw error;
        }

        // Wait before retrying
        await this.sleep(delayMs);

        // Exponential backoff with jitter
        delayMs = Math.min(
          delayMs * backoffMultiplier + Math.random() * 1000,
          maxDelayMs
        );
      }
    }

    throw lastError;
  }

  private isTransientError(error: any): boolean {
    // Network timeouts, temporary server errors, etc.
    if (error.code === 'TIMEOUT') return true;
    if (error.code === 'ECONNREFUSED') return true;
    if (error.status >= 500 && error.status < 600) return true; // Server errors
    if (error.status === 408) return true; // Request timeout
    if (error.status === 429) return true; // Too many requests
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(private config: CircuitBreakerConfig = {}) {
    this.config = {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitorIntervalMs: 30000,
      ...config,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();

      if (this.state === CircuitState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= 2) {
          this.reset();
        }
      } else {
        // Success in CLOSED state
        this.failureCount = Math.max(0, this.failureCount - 1);
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= (this.config.failureThreshold || 5)) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= (this.config.resetTimeoutMs || 60000);
  }

  private reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Timeout wrapper
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

export const retryService = new RetryService();
export { CircuitBreaker };
