import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { logger } from "@/services/logger"

// ============================================
// CSS CLASS UTILITIES
// ============================================

/**
 * Combines class names using clsx and tailwind-merge
 * Handles conditional classes and merges Tailwind classes correctly
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ============================================
// FETCH UTILITIES
// ============================================

/**
 * Custom error for API responses
 */
export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly contentType: string | null
  ) {
    super(message);
    this.name = 'ApiResponseError';
    Object.setPrototypeOf(this, ApiResponseError.prototype);
  }
}

/**
 * Safely parses JSON from a Response object
 * @param response - Fetch Response object
 * @returns Parsed JSON data
 * @throws ApiResponseError if response is not JSON
 */
export async function safeJsonResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiResponseError(
      `Server returned ${contentType || 'unknown'} instead of JSON`,
      response.status,
      contentType
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Options for safeFetch
 */
export interface SafeFetchOptions extends RequestInit {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to throw on non-2xx responses (default: false) */
  throwOnError?: boolean;
}

/**
 * Performs a fetch request with enhanced error handling and logging
 * @param url - Request URL
 * @param options - Fetch options with additional safety options
 * @returns Fetch Response
 * @throws Error on network failure or timeout
 */
export async function safeFetch(
  url: string, 
  options?: SafeFetchOptions
): Promise<Response> {
  const { timeout = 30000, throwOnError = false, ...fetchOptions } = options || {};
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log non-JSON responses for non-OK status
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        logger.warn(`API ${url} returned non-JSON response`, { 
          status: response.status,
          contentType 
        });
      }
      
      if (throwOnError) {
        throw new ApiResponseError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          contentType
        );
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error(`Request timeout for ${url}`, { timeout });
      throw new ApiResponseError('Request timeout', 408, null);
    }
    
    logger.error(`Fetch error for ${url}`, error);
    throw error;
  }
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncates a string to a maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated string
 */
export function truncate(str: string, maxLength = 100): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formats bytes to human readable string
 * @param bytes - Number of bytes
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  
  return d.toLocaleDateString('fr-FR');
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Creates a debounced version of a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
}

/**
 * Creates a throttled version of a function
 * @param fn - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): T {
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn(...args);
    }
  }) as T;
}
