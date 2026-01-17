// ============================================
// CIRCUIT BREAKER PATTERN
// Prevents cascade failures with state machine
// ============================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly timeout: number;
  readonly resetTimeout: number;
}

const DEFAULT_CONFIG: Readonly<CircuitBreakerConfig> = Object.freeze({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30_000,
  resetTimeout: 120_000,
});

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

export class CircuitBreakerError extends Error {
  public readonly circuitName: string;

  constructor(circuitName: string, message: string) {
    super(`[CircuitBreaker:${circuitName}] ${message}`);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, CircuitBreakerError.prototype);
  }
}

class CircuitBreaker {
  private readonly circuits = new Map<string, CircuitBreakerState>();
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getOrCreateCircuit(name: string): CircuitBreakerState {
    let circuit = this.circuits.get(name);
    if (!circuit) {
      circuit = {
        state: 'CLOSED',
        failures: 0,
        successes: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
      };
      this.circuits.set(name, circuit);
    }
    return circuit;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    name: string,
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(name);
    const now = Date.now();

    // Check circuit state
    if (circuit.state === 'OPEN') {
      if (circuit.nextAttemptTime && now >= circuit.nextAttemptTime) {
        // Transition to HALF_OPEN
        circuit.state = 'HALF_OPEN';
        circuit.successes = 0;
      } else {
        // Circuit still open
        if (fallback) return fallback();
        throw new CircuitBreakerError(name, 'Circuit is OPEN');
      }
    }

    try {
      const result = await operation();
      this.recordSuccess(circuit);
      return result;
    } catch (error) {
      this.recordFailure(circuit);
      
      // Use fallback if circuit transitioned to OPEN after failure
      if (fallback && this.getOrCreateCircuit(name).state === 'OPEN') {
        return fallback();
      }
      throw error;
    }
  }

  private recordSuccess(circuit: CircuitBreakerState): void {
    if (circuit.state === 'HALF_OPEN') {
      circuit.successes++;
      if (circuit.successes >= this.config.successThreshold) {
        // Close circuit
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.lastFailureTime = null;
        circuit.nextAttemptTime = null;
      }
    } else if (circuit.state === 'CLOSED') {
      // Decay failures on success
      circuit.failures = Math.max(0, circuit.failures - 1);
    }
  }

  private recordFailure(circuit: CircuitBreakerState): void {
    const now = Date.now();
    circuit.failures++;
    circuit.lastFailureTime = now;

    if (circuit.state === 'HALF_OPEN') {
      // Back to OPEN
      circuit.state = 'OPEN';
      circuit.nextAttemptTime = now + this.config.timeout;
    } else if (circuit.failures >= this.config.failureThreshold) {
      // Open circuit
      circuit.state = 'OPEN';
      circuit.nextAttemptTime = now + this.config.timeout;
    }
  }

  getState(name: string): Readonly<CircuitBreakerState> {
    return this.getOrCreateCircuit(name);
  }

  reset(name: string): void {
    this.circuits.delete(name);
  }

  getStats(): ReadonlyMap<string, CircuitBreakerState> {
    return this.circuits;
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreaker();

// ============================================
// RETRY WITH EXPONENTIAL BACKOFF
// Production-grade retry logic
// ============================================

interface RetryConfig {
  readonly maxRetries: number;
  readonly baseDelay: number;
  readonly maxDelay: number;
  readonly backoffFactor: number;
  readonly retryableErrors?: readonly string[];
  readonly shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_RETRY_CONFIG: Readonly<RetryConfig> = Object.freeze({
  maxRetries: 3,
  baseDelay: 1_000,
  maxDelay: 30_000,
  backoffFactor: 2,
});

/**
 * Retry an async operation with exponential backoff and jitter
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffFactor, retryableErrors, shouldRetry } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (shouldRetry && !shouldRetry(lastError)) {
        throw lastError;
      }
      
      if (retryableErrors?.length) {
        const isRetryable = retryableErrors.some(pattern => 
          lastError!.message.toLowerCase().includes(pattern.toLowerCase())
        );
        if (!isRetryable) throw lastError;
      }

      // Last attempt - throw
      if (attempt === maxRetries) throw lastError;

      // Calculate delay with exponential backoff + jitter
      const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);
      const jitter = Math.random() * (baseDelay * 0.5); // 50% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      await sleep(delay);
    }
  }

  // TypeScript: This should never be reached
  throw lastError ?? new Error('Retry failed');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// API CLIENT WITH CIRCUIT BREAKER
// Type-safe HTTP client wrapper
// ============================================

interface ApiClientConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly headers?: Readonly<Record<string, string>>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly body: string;
  public readonly isRetryable: boolean;

  constructor(status: number, body: string) {
    super(`API Error ${status}: ${body}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    // 5xx errors and 429 are retryable
    this.isRetryable = status >= 500 || status === 429;
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipCircuitBreaker?: boolean;
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, timeout, headers: defaultHeaders = {} } = config;

  async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { body, skipCircuitBreaker, ...fetchOptions } = options;
    const circuitName = `api:${new URL(endpoint, baseUrl).pathname}`;

    const executeRequest = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...defaultHeaders,
            ...fetchOptions.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error');
          throw new ApiError(response.status, errorBody);
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) return {} as T;
        
        return JSON.parse(text) as T;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof ApiError) throw error;
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new ApiError(408, 'Request timeout');
        }
        throw error;
      }
    };

    if (skipCircuitBreaker) {
      return executeRequest();
    }

    return circuitBreaker.execute(
      circuitName,
      executeRequest,
      () => { throw new ApiError(503, `Service ${endpoint} is currently unavailable`); }
    );
  }

  return {
    get: <T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) => 
      request<T>(endpoint, { ...options, method: 'GET' }),
    
    post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>(endpoint, { ...options, method: 'POST', body }),
    
    put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>(endpoint, { ...options, method: 'PUT', body }),
    
    patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>(endpoint, { ...options, method: 'PATCH', body }),
    
    delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
}
