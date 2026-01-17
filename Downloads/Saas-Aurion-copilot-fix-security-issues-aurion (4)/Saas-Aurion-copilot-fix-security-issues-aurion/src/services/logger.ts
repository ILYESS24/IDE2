 // ============================================
// PRODUCTION LOGGING SERVICE
// High-performance structured logging with batching
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly userAgent?: string;
  readonly context?: Readonly<Record<string, unknown>>;
  readonly stack?: string;
}

// Pre-computed constants for performance
const IS_PRODUCTION = import.meta.env.PROD;
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30_000;
const MAX_QUEUE_SIZE = 1000; // Prevent memory leaks
const MAX_MESSAGE_LENGTH = 10_000;

// Cached values to avoid repeated lookups
let cachedSessionId: string | undefined;
let cachedUserId: string | undefined;
let userIdLastCheck = 0;
const USER_ID_CACHE_DURATION = 60_000; // 1 minute

class Logger {
  private logQueue: LogEntry[] = [];
  private flushTimerId: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor() {
    if (IS_PRODUCTION) {
      this.flushTimerId = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
      
      // Flush on page unload to prevent log loss
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => this.flushSync());
      }
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    // Truncate message to prevent oversized payloads
    const truncatedMessage = message.length > MAX_MESSAGE_LENGTH 
      ? message.slice(0, MAX_MESSAGE_LENGTH) + '...[truncated]'
      : message;

    return {
      timestamp: new Date().toISOString(),
      level,
      message: truncatedMessage,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      context: context ? Object.freeze({ ...context }) : undefined,
    };
  }

  private getUserId(): string | undefined {
    const now = Date.now();
    
    // Use cached value if still valid
    if (cachedUserId && now - userIdLastCheck < USER_ID_CACHE_DURATION) {
      return cachedUserId;
    }

    try {
      const clerkUser = localStorage.getItem('clerk-user');
      if (clerkUser) {
        const user = JSON.parse(clerkUser);
        cachedUserId = user.id;
        userIdLastCheck = now;
        return cachedUserId;
      }
    } catch {
      // Storage access may fail (private browsing, etc.)
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    if (cachedSessionId) return cachedSessionId;

    try {
      cachedSessionId = sessionStorage.getItem('sessionId') ?? undefined;
      if (!cachedSessionId) {
        // Use crypto.randomUUID for better randomness when available
        const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);
        cachedSessionId = `session_${Date.now()}_${randomPart}`;
        sessionStorage.setItem('sessionId', cachedSessionId);
      }
      return cachedSessionId;
    } catch {
      return undefined;
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const logsToFlush = this.logQueue.splice(0, this.logQueue.length);

    try {
      if (!IS_PRODUCTION) {
        // Development: grouped console output
        this.outputToConsole(logsToFlush);
      } else {
        await this.sendToLoggingService(logsToFlush);
      }
    } catch {
      // Re-queue logs on failure (limited to prevent infinite growth)
      if (this.logQueue.length < MAX_QUEUE_SIZE / 2) {
        this.logQueue.unshift(...logsToFlush.slice(-50)); // Keep only last 50
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private flushSync(): void {
    if (this.logQueue.length === 0) return;
    
    // Use sendBeacon for reliable delivery on unload
    if (IS_PRODUCTION && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({ logs: this.logQueue });
      navigator.sendBeacon('/api/logs', payload);
      this.logQueue = [];
    }
  }

  private outputToConsole(logs: LogEntry[]): void {
    if (logs.length === 0) return;
    
    console.groupCollapsed(`📋 Logger: ${logs.length} entries`);
    for (const log of logs) {
      const method = log.level === 'error' || log.level === 'security' 
        ? 'error' 
        : log.level === 'warn' ? 'warn' : 'debug';
      console[method](`[${log.level.toUpperCase()}] ${log.message}`, log.context ?? '');
    }
    console.groupEnd();
  }

  private async sendToLoggingService(logs: LogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    // Skip logging to API if we're using dummy/test keys
    const isUsingDummyKeys = import.meta.env.VITE_SUPABASE_URL?.includes('dummy') ||
                            import.meta.env.VITE_SUPABASE_ANON_KEY?.includes('dummy');

    if (isUsingDummyKeys) {
      // Just log to console in development mode
      this.outputToConsole(logs);
      return;
    }

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
        keepalive: true, // Ensures request completes even if page unloads
      });

      if (!response.ok && response.status !== 429) {
        // Don't log errors from the logging service to prevent loops
      }
    } catch {
      // Silently fail - logging should never break the app
    }
  }

  private queueLog(entry: LogEntry, immediate: boolean = false): void {
    // Prevent unbounded growth
    if (this.logQueue.length >= MAX_QUEUE_SIZE) {
      this.logQueue.shift(); // Remove oldest
    }
    
    this.logQueue.push(entry);

    if (immediate || this.logQueue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  // ============================================
  // PUBLIC LOGGING METHODS
  // ============================================

  debug(message: string, context?: Record<string, unknown>): void {
    if (IS_PRODUCTION) return; // Skip debug in production entirely
    
    const entry = this.createLogEntry('debug', message, context);
    console.debug(`🐛 ${message}`, context ?? '');
    this.queueLog(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context);
    
    if (!IS_PRODUCTION) {
      console.info(`ℹ️ ${message}`, context ?? '');
    }
    
    this.queueLog(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, context);
    
    if (!IS_PRODUCTION) {
      console.warn(`⚠️ ${message}`, context ?? '');
    }
    
    this.queueLog(entry, true); // Immediate flush for warnings
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : undefined;
    const fullContext: Record<string, unknown> = {
      ...context,
      ...(errorObj && {
        errorMessage: errorObj.message,
        errorName: errorObj.name,
        stack: errorObj.stack,
      }),
      ...(error && !(error instanceof Error) && { rawError: String(error) }),
    };

    const entry: LogEntry = {
      ...this.createLogEntry('error', message, fullContext),
      stack: errorObj?.stack,
    };

    if (!IS_PRODUCTION) {
      console.error(`❌ ${message}`, error ?? '', context ?? '');
    }

    this.queueLog(entry, true); // Immediate flush for errors
  }

  security(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('security', message, {
      ...context,
      securityEvent: true,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    if (!IS_PRODUCTION) {
      console.error(`🔒 SECURITY: ${message}`, context ?? '');
    }

    this.queueLog(entry, true); // Immediate flush for security events
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  userAction(action: string, details?: Record<string, unknown>): void {
    this.info(`User Action: ${action}`, { action, ...details });
  }

  businessEvent(event: string, data?: Record<string, unknown>): void {
    this.info(`Business Event: ${event}`, { event, ...data });
  }

  performance(metric: string, value: number, context?: Record<string, unknown>): void {
    this.info(`Performance: ${metric}`, { metric, value, unit: 'ms', ...context });
  }

  // ============================================
  // ADVANCED PERFORMANCE TRACKING
  // ============================================

  /**
   * Measure async operation duration
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      this.performance(name, Math.round(duration), { 
        ...context, 
        success: true,
        category: 'async_operation'
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.performance(name, Math.round(duration), { 
        ...context, 
        success: false,
        error: error instanceof Error ? error.message : String(error),
        category: 'async_operation'
      });
      throw error;
    }
  }

  /**
   * Track API call performance
   */
  apiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    durationMs: number,
    context?: Record<string, unknown>
  ): void {
    this.info(`API: ${method} ${endpoint}`, {
      endpoint,
      method,
      statusCode,
      durationMs,
      success: statusCode >= 200 && statusCode < 300,
      category: 'api_call',
      ...context,
    });
  }

  /**
   * Track render performance (React)
   */
  renderPerformance(
    componentName: string,
    renderTimeMs: number,
    context?: Record<string, unknown>
  ): void {
    if (renderTimeMs > 16) { // Flag slow renders (>60fps threshold)
      this.warn(`Slow Render: ${componentName}`, {
        componentName,
        renderTimeMs,
        category: 'render_performance',
        threshold: 16,
        ...context,
      });
    } else {
      this.debug(`Render: ${componentName}`, {
        componentName,
        renderTimeMs,
        category: 'render_performance',
        ...context,
      });
    }
  }

  /**
   * Track Web Vitals
   */
  webVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor'): void {
    const level = rating === 'poor' ? 'warn' : 'info';
    this[level](`Web Vital: ${name}`, {
      metric: name,
      value,
      rating,
      category: 'web_vitals',
    });
  }

  /**
   * Track credit consumption for billing
   */
  creditConsumption(
    userId: string,
    toolId: string,
    creditsUsed: number,
    remaining: number,
    context?: Record<string, unknown>
  ): void {
    this.info('Credit Consumed', {
      userId,
      toolId,
      creditsUsed,
      creditsRemaining: remaining,
      category: 'billing',
      ...context,
    });
  }

  /**
   * Track iframe health for monitoring
   */
  iframeHealth(
    toolId: string,
    status: 'healthy' | 'unhealthy' | 'timeout',
    latencyMs?: number,
    context?: Record<string, unknown>
  ): void {
    const level = status === 'healthy' ? 'info' : 'warn';
    this[level](`Iframe Health: ${toolId}`, {
      toolId,
      status,
      latencyMs,
      category: 'iframe_monitoring',
      ...context,
    });
  }

  // Cleanup method for testing/hot reload
  destroy(): void {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
    this.flushSync();
  }
}

// Singleton instance
export const logger = new Logger();

// ============================================
// CONSOLE OVERRIDE (opt-in for production)
// ============================================

export const replaceConsoleLogs = (): void => {
  if (!IS_PRODUCTION) return;

  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  // Capture console calls and route to logger
  console.log = (...args: unknown[]) => {
    logger.debug(args.map(String).join(' '));
  };

  console.info = (...args: unknown[]) => {
    logger.info(args.map(String).join(' '));
  };

  console.warn = (...args: unknown[]) => {
    logger.warn(args.map(String).join(' '));
  };

  console.error = (...args: unknown[]) => {
    const [first, ...rest] = args;
    if (first instanceof Error) {
      logger.error(first.message, first);
    } else {
      logger.error(args.map(String).join(' '));
    }
  };
};
