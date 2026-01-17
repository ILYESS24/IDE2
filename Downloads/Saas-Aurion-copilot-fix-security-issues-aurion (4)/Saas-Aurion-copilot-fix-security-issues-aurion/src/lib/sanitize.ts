// ============================================
// INPUT SANITIZATION UTILITIES
// Zero-dependency, performance-optimized XSS prevention
// ============================================

// Pre-compiled patterns for performance
const DANGEROUS_PROTOCOL_PATTERN = /^(?:javascript|data|vbscript|file|blob)\s*:/i;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;
const HTML_SPECIAL_CHARS = /[&<>"'`=/]/g;
const ANGLE_BRACKETS = /[<>]/g;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Constants
const MAX_STRING_LENGTH = 10_000;
const MAX_EMAIL_LENGTH = 254; // RFC 5321
const MAX_URL_LENGTH = 2048;

// Pre-computed entity map (frozen for immutability)
const HTML_ENTITIES: Readonly<Record<string, string>> = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
});

/**
 * Sanitizes a string by removing dangerous patterns
 * Time complexity: O(n) where n is string length
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  let result = input.trim();
  if (result.length === 0) return '';
  
  // Remove dangerous protocols (iterative to handle nested attempts)
  let prevLength: number;
  do {
    prevLength = result.length;
    result = result.replace(DANGEROUS_PROTOCOL_PATTERN, '');
  } while (result.length !== prevLength && result.length > 0);
  
  // Remove event handlers (iterative)
  do {
    prevLength = result.length;
    result = result.replace(EVENT_HANDLER_PATTERN, '');
  } while (result.length !== prevLength && result.length > 0);
  
  // Remove angle brackets
  result = result.replace(ANGLE_BRACKETS, '');
  
  // Truncate
  return result.length > MAX_STRING_LENGTH 
    ? result.slice(0, MAX_STRING_LENGTH) 
    : result;
}

/**
 * Escapes HTML special characters to prevent XSS
 * Use for content that will be rendered as HTML
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const escaped = input.replace(
    HTML_SPECIAL_CHARS, 
    char => HTML_ENTITIES[char] ?? char
  );
  
  return escaped.length > MAX_STRING_LENGTH 
    ? escaped.slice(0, MAX_STRING_LENGTH) 
    : escaped;
}

/**
 * Validates and sanitizes an email address
 * Returns null for invalid emails
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  
  const email = input.trim().toLowerCase();
  
  if (email.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(email)) return null;
  
  return email;
}

/**
 * Validates and sanitizes a URL
 * Only allows http/https protocols
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  
  const trimmed = input.trim();
  if (trimmed.length > MAX_URL_LENGTH) return null;
  
  // Quick check for dangerous protocols before URL parsing
  if (DANGEROUS_PROTOCOL_PATTERN.test(trimmed)) return null;
  
  try {
    const url = new URL(trimmed);
    
    // Whitelist: only http and https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Recursively sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const value = obj[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Validates UUID format
 */
export function isValidUUID(input: string | null | undefined): boolean {
  if (!input) return false;
  return UUID_PATTERN.test(input.trim());
}

/**
 * Sanitizes and clamps a number within bounds
 */
export function sanitizeNumber(
  input: unknown, 
  min?: number, 
  max?: number
): number | null {
  const num = typeof input === 'number' ? input : Number(input);
  
  if (!Number.isFinite(num)) return null;
  
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

// ============================================
// CLIENT-SIDE RATE LIMITER
// Token bucket implementation
// ============================================

export class ClientRateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private readonly maxActions: number;
  private readonly windowMs: number;

  constructor(maxActions = 10, windowMs = 60_000) {
    this.maxActions = maxActions;
    this.windowMs = windowMs;
  }

  isAllowed(action: string): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    
    // Get or create bucket
    let bucket = this.buckets.get(action);
    if (!bucket) {
      bucket = [];
      this.buckets.set(action, bucket);
    }
    
    // Remove expired entries (more efficient than filter)
    let writeIndex = 0;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] >= cutoff) {
        bucket[writeIndex++] = bucket[i];
      }
    }
    bucket.length = writeIndex;
    
    // Check limit
    if (bucket.length >= this.maxActions) {
      return false;
    }
    
    bucket.push(now);
    return true;
  }

  reset(action: string): void {
    this.buckets.delete(action);
  }

  resetAll(): void {
    this.buckets.clear();
  }

  getRemainingAttempts(action: string): number {
    const bucket = this.buckets.get(action);
    if (!bucket) return this.maxActions;
    
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const validCount = bucket.filter(time => time >= cutoff).length;
    
    return Math.max(0, this.maxActions - validCount);
  }
}

// Default instance for general use
export const defaultRateLimiter = new ClientRateLimiter();
