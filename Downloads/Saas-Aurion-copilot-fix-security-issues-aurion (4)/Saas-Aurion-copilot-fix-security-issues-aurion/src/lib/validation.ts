// ============================================
// RUNTIME VALIDATION & TYPE GUARDS
// Type-safe validation without external deps
// ============================================

// ============================================
// BASE VALIDATORS
// ============================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; path?: string };

export type Validator<T> = (value: unknown) => ValidationResult<T>;

// String validator
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function string(options?: { 
  minLength?: number; 
  maxLength?: number; 
  pattern?: RegExp;
  trim?: boolean;
}): Validator<string> {
  return (value: unknown) => {
    if (!isString(value)) {
      return { success: false, error: 'Expected string' };
    }

    const str = options?.trim ? value.trim() : value;

    if (options?.minLength !== undefined && str.length < options.minLength) {
      return { success: false, error: `String must be at least ${options.minLength} characters` };
    }

    if (options?.maxLength !== undefined && str.length > options.maxLength) {
      return { success: false, error: `String must be at most ${options.maxLength} characters` };
    }

    if (options?.pattern && !options.pattern.test(str)) {
      return { success: false, error: 'String does not match pattern' };
    }

    return { success: true, data: str };
  };
}

// Number validator
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function number(options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): Validator<number> {
  return (value: unknown) => {
    if (!isNumber(value)) {
      return { success: false, error: 'Expected number' };
    }

    if (options?.integer && !Number.isInteger(value)) {
      return { success: false, error: 'Expected integer' };
    }

    if (options?.min !== undefined && value < options.min) {
      return { success: false, error: `Number must be at least ${options.min}` };
    }

    if (options?.max !== undefined && value > options.max) {
      return { success: false, error: `Number must be at most ${options.max}` };
    }

    return { success: true, data: value };
  };
}

// Boolean validator
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function boolean(): Validator<boolean> {
  return (value: unknown) => {
    if (!isBoolean(value)) {
      return { success: false, error: 'Expected boolean' };
    }
    return { success: true, data: value };
  };
}

// Array validator
export function array<T>(itemValidator: Validator<T>, options?: {
  minLength?: number;
  maxLength?: number;
}): Validator<T[]> {
  return (value: unknown) => {
    if (!Array.isArray(value)) {
      return { success: false, error: 'Expected array' };
    }

    if (options?.minLength !== undefined && value.length < options.minLength) {
      return { success: false, error: `Array must have at least ${options.minLength} items` };
    }

    if (options?.maxLength !== undefined && value.length > options.maxLength) {
      return { success: false, error: `Array must have at most ${options.maxLength} items` };
    }

    const results: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const result = itemValidator(value[i]);
      if (!result.success) {
        return { success: false, error: (result as { error: string; path?: string }).error, path: `[${i}]` };
      }
      results.push(result.data);
    }

    return { success: true, data: results };
  };
}

// Object validator
export function object<T extends Record<string, Validator<unknown>>>(
  schema: T
): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
  return (value: unknown) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { success: false, error: 'Expected object' };
    }

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, validator] of Object.entries(schema)) {
      const fieldResult = validator(obj[key]);
      if (!fieldResult.success) {
        const errorResult = fieldResult as { error: string; path?: string };
        return { 
          success: false, 
          error: errorResult.error, 
          path: errorResult.path ? `${key}.${errorResult.path}` : key 
        };
      }
      result[key] = fieldResult.data;
    }

    return { success: true, data: result as { [K in keyof T]: T[K] extends Validator<infer U> ? U : never } };
  };
}

// Optional validator
export function optional<T>(validator: Validator<T>): Validator<T | undefined> {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return { success: true, data: undefined };
    }
    return validator(value);
  };
}

// Nullable validator
export function nullable<T>(validator: Validator<T>): Validator<T | null> {
  return (value: unknown) => {
    if (value === null) {
      return { success: true, data: null };
    }
    return validator(value);
  };
}

// Literal validator
export function literal<T extends string | number | boolean>(expected: T): Validator<T> {
  return (value: unknown) => {
    if (value !== expected) {
      return { success: false, error: `Expected ${JSON.stringify(expected)}` };
    }
    return { success: true, data: expected };
  };
}

// Union validator
export function union<T extends Validator<unknown>[]>(
  ...validators: T
): Validator<T[number] extends Validator<infer U> ? U : never> {
  return (value: unknown) => {
    for (const validator of validators) {
      const result = validator(value);
      if (result.success) {
        return result as ValidationResult<T[number] extends Validator<infer U> ? U : never>;
      }
    }
    return { success: false, error: 'Value does not match any union member' };
  };
}

// Enum validator
export function enumValidator<T extends string>(values: readonly T[]): Validator<T> {
  return (value: unknown) => {
    if (!isString(value) || !values.includes(value as T)) {
      return { success: false, error: `Expected one of: ${values.join(', ')}` };
    }
    return { success: true, data: value as T };
  };
}

// ============================================
// SPECIALIZED VALIDATORS
// ============================================

// Email validator
export function email(): Validator<string> {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (value: unknown) => {
    const strResult = string({ maxLength: 254 })(value);
    if (!strResult.success) return strResult;

    if (!emailPattern.test(strResult.data)) {
      return { success: false, error: 'Invalid email format' };
    }
    return { success: true, data: strResult.data.toLowerCase() };
  };
}

// UUID validator
export function uuid(): Validator<string> {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return (value: unknown) => {
    const strResult = string()(value);
    if (!strResult.success) return strResult;

    if (!uuidPattern.test(strResult.data)) {
      return { success: false, error: 'Invalid UUID format' };
    }
    return { success: true, data: strResult.data.toLowerCase() };
  };
}

// URL validator
export function url(options?: { protocols?: string[] }): Validator<string> {
  const allowedProtocols = options?.protocols || ['http:', 'https:'];
  
  return (value: unknown) => {
    const strResult = string({ maxLength: 2048 })(value);
    if (!strResult.success) return strResult;

    try {
      const parsed = new URL(strResult.data);
      if (!allowedProtocols.includes(parsed.protocol)) {
        return { success: false, error: `URL must use protocol: ${allowedProtocols.join(', ')}` };
      }
      return { success: true, data: strResult.data };
    } catch {
      return { success: false, error: 'Invalid URL format' };
    }
  };
}

// Date validator
export function date(): Validator<Date> {
  return (value: unknown) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return { success: true, data: value };
    }

    if (isString(value) || isNumber(value)) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return { success: true, data: parsed };
      }
    }

    return { success: false, error: 'Invalid date' };
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validate<T>(validator: Validator<T>, value: unknown): T {
  const result = validator(value);
  if (!result.success) {
    const errorResult = result as { error: string; path?: string };
    throw new ValidationError(errorResult.error, errorResult.path);
  }
  return result.data;
}

export function tryValidate<T>(validator: Validator<T>, value: unknown): T | null {
  const result = validator(value);
  return result.success ? result.data : null;
}

export class ValidationError extends Error {
  public path?: string;

  constructor(message: string, path?: string) {
    super(path ? `${path}: ${message}` : message);
    this.name = 'ValidationError';
    this.path = path;
  }
}

// ============================================
// SECURITY-FOCUSED VALIDATORS
// Prevent injection attacks and malicious input
// ============================================

// Safe string - prevents XSS and injection
export function safeString(options?: {
  minLength?: number;
  maxLength?: number;
  allowedChars?: RegExp;
}): Validator<string> {
  // Default: alphanumeric, spaces, and common punctuation
  const defaultAllowed = /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+='":;\/\\[\]{}|~`]+$/;
  
  return (value: unknown) => {
    const strResult = string({ ...options, trim: true })(value);
    if (!strResult.success) return strResult;

    const str = strResult.data;
    
    // Check for null bytes
    if (str.includes('\0')) {
      return { success: false, error: 'String contains invalid characters (null byte)' };
    }
    
    // Check for control characters
    if (/[\x00-\x1F\x7F]/.test(str)) {
      return { success: false, error: 'String contains control characters' };
    }
    
    // Check allowed characters if specified
    const pattern = options?.allowedChars || defaultAllowed;
    if (!pattern.test(str)) {
      return { success: false, error: 'String contains disallowed characters' };
    }
    
    return { success: true, data: str };
  };
}

// Tool ID validator - only allow valid tool identifiers
export function toolId(): Validator<string> {
  const validTools = [
    'app-builder', 'website-builder', 'ai-agents', 'text-editor',
    'code-editor', 'content-generator', 'image_generation', 'video_generation',
    'code_generation', 'ai_chat', 'agent_builder'
  ];
  
  return (value: unknown) => {
    const strResult = string({ minLength: 1, maxLength: 50 })(value);
    if (!strResult.success) return strResult;
    
    // Allow both formats: kebab-case and snake_case
    const normalized = strResult.data.toLowerCase();
    
    // Check if it matches pattern of a valid tool ID
    if (!/^[a-z][a-z0-9_-]*$/.test(normalized)) {
      return { success: false, error: 'Invalid tool ID format' };
    }
    
    // Optional: strict validation against known tools
    // For flexibility, we allow any well-formed ID
    
    return { success: true, data: normalized };
  };
}

// JWT token validator
export function jwtToken(): Validator<string> {
  return (value: unknown) => {
    const strResult = string({ minLength: 10, maxLength: 4096 })(value);
    if (!strResult.success) return strResult;
    
    // JWT format: header.payload.signature
    const parts = strResult.data.split('.');
    if (parts.length !== 3) {
      return { success: false, error: 'Invalid JWT format' };
    }
    
    // Each part should be base64url encoded
    const base64urlPattern = /^[A-Za-z0-9_-]+$/;
    for (const part of parts) {
      if (!base64urlPattern.test(part)) {
        return { success: false, error: 'Invalid JWT encoding' };
      }
    }
    
    return { success: true, data: strResult.data };
  };
}

// Secure password validator
export function securePassword(): Validator<string> {
  return (value: unknown) => {
    const strResult = string({ minLength: 8, maxLength: 128 })(value);
    if (!strResult.success) return strResult;
    
    const password = strResult.data;
    
    // Check complexity requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const score = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score < 3) {
      return { 
        success: false, 
        error: 'Password must contain at least 3 of: uppercase, lowercase, number, special character' 
      };
    }
    
    // Check for common patterns
    const commonPatterns = /^(password|123456|qwerty|admin|letmein)/i;
    if (commonPatterns.test(password)) {
      return { success: false, error: 'Password is too common' };
    }
    
    return { success: true, data: password };
  };
}

// IP address validator
export function ipAddress(): Validator<string> {
  return (value: unknown) => {
    const strResult = string({ maxLength: 45 })(value); // IPv6 max length
    if (!strResult.success) return strResult;
    
    const ip = strResult.data;
    
    // IPv4 pattern
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:)*:([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Pattern.test(ip) && !ipv6Pattern.test(ip)) {
      return { success: false, error: 'Invalid IP address format' };
    }
    
    return { success: true, data: ip };
  };
}

// Webhook payload validator - prevents prototype pollution
export function webhookPayload<T extends Record<string, Validator<unknown>>>(
  schema: T
): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
  return (value: unknown) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { success: false, error: 'Expected object' };
    }
    
    // Check for prototype pollution attempts
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const keys = Object.keys(value);
    
    for (const key of keys) {
      if (dangerousKeys.includes(key)) {
        return { success: false, error: `Forbidden key: ${key}` };
      }
    }
    
    // Validate against schema
    return object(schema)(value);
  };
}

// Rate limit key validator
export function rateLimitKey(): Validator<string> {
  return (value: unknown) => {
    const strResult = string({ minLength: 1, maxLength: 256 })(value);
    if (!strResult.success) return strResult;
    
    // Only allow safe characters for cache keys
    if (!/^[a-zA-Z0-9:_.-]+$/.test(strResult.data)) {
      return { success: false, error: 'Invalid rate limit key format' };
    }
    
    return { success: true, data: strResult.data };
  };
}

// ============================================
// COMMON SCHEMAS
// ============================================

export const schemas = {
  // User credentials schema
  userCredits: object({
    id: uuid(),
    user_id: uuid(),
    total_credits: number({ min: 0 }),
    used_credits: number({ min: 0 }),
    bonus_credits: number({ min: 0 }),
  }),

  // Plan schema
  userPlan: object({
    id: uuid(),
    user_id: uuid(),
    plan_type: enumValidator(['free', 'starter', 'plus', 'pro', 'enterprise'] as const),
    status: enumValidator(['active', 'cancelled', 'past_due', 'trialing'] as const),
  }),

  // Tool access request - with security validation
  toolAccessRequest: object({
    toolId: toolId(),
    reuseSession: optional(boolean()),
  }),

  // Tool session token request
  toolSessionRequest: object({
    token: jwtToken(),
    toolId: toolId(),
  }),

  // Pagination params
  pagination: object({
    page: number({ min: 1, integer: true }),
    limit: number({ min: 1, max: 100, integer: true }),
  }),

  // Stripe webhook event
  stripeWebhook: webhookPayload({
    id: string({ minLength: 1, maxLength: 255 }),
    type: string({ minLength: 1, maxLength: 255 }),
    data: object({}),
  }),

  // Log entry
  logEntry: object({
    level: enumValidator(['debug', 'info', 'warn', 'error', 'security'] as const),
    message: string({ maxLength: 10000 }),
    context: optional(object({})),
  }),
};
