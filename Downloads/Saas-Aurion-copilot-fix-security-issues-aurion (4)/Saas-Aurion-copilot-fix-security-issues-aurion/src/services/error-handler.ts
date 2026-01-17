/**
 * Centralized Error Handling for AURION SaaS
 * 
 * This module provides:
 * - Type-safe error definitions
 * - Error normalization from various sources (Supabase, Stripe, Network)
 * - User-friendly error messages
 * - Action suggestions (retry, redirect, contact support)
 * 
 * @module error-handler
 */

import { useToast } from "@/components/ui/use-toast";
import { logger } from '@/services/logger';

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Possible actions to take when an error occurs */
export type ErrorAction = 'retry' | 'redirect' | 'contact_support';

/** Standard error structure for the application */
export interface AppError {
  /** Unique error code for programmatic handling */
  readonly code: string;
  /** Technical error message (for logging) */
  readonly message: string;
  /** Additional error details */
  readonly details?: unknown;
  /** User-friendly error message (for display) */
  readonly userMessage: string;
  /** Suggested action to take */
  readonly action?: ErrorAction;
  /** Redirect URL if action is 'redirect' */
  readonly redirectTo?: string;
}

/**
 * Custom error class for SaaS-specific errors
 * Extends Error with additional context for user-facing error handling
 */
export class SaaSError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly userMessage: string;
  public readonly action?: ErrorAction;
  public readonly redirectTo?: string;
  public readonly timestamp: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'SaaSError';
    this.code = error.code;
    this.details = error.details;
    this.userMessage = error.userMessage;
    this.action = error.action;
    this.redirectTo = error.redirectTo;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, SaaSError.prototype);
  }

  /** Converts error to a plain object for serialization */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      action: this.action,
      redirectTo: this.redirectTo,
      timestamp: this.timestamp,
    };
  }
}

// ============================================
// CATALOGUE DES ERREURS
// ============================================

export const ERROR_CODES = {
  // Authentification
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Crédits
  CREDITS_INSUFFICIENT: 'CREDITS_INSUFFICIENT',
  CREDITS_UPDATE_FAILED: 'CREDITS_UPDATE_FAILED',

  // Limites d'utilisation
  LIMIT_DAILY_EXCEEDED: 'LIMIT_DAILY_EXCEEDED',
  LIMIT_MONTHLY_EXCEEDED: 'LIMIT_MONTHLY_EXCEEDED',

  // Outils
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_ACCESS_DENIED: 'TOOL_ACCESS_DENIED',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',

  // Plans
  PLAN_UPGRADE_FAILED: 'PLAN_UPGRADE_FAILED',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',

  // Paiements
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  WEBHOOK_PROCESSING_FAILED: 'WEBHOOK_PROCESSING_FAILED',

  // Base de données
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',

  // Réseau
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Générique
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGES: Record<string, AppError> = {
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: {
    code: ERROR_CODES.AUTH_USER_NOT_FOUND,
    message: 'User not found in database',
    userMessage: 'Utilisateur non trouvé. Veuillez vous reconnecter.',
    action: 'redirect',
    redirectTo: '/sign-in',
  },

  [ERROR_CODES.CREDITS_INSUFFICIENT]: {
    code: ERROR_CODES.CREDITS_INSUFFICIENT,
    message: 'Insufficient credits for operation',
    userMessage: 'Crédits insuffisants pour cette action.',
    action: 'redirect',
    redirectTo: '/dashboard?tab=plans',
  },

  [ERROR_CODES.LIMIT_DAILY_EXCEEDED]: {
    code: ERROR_CODES.LIMIT_DAILY_EXCEEDED,
    message: 'Daily usage limit exceeded',
    userMessage: 'Limite quotidienne dépassée. Réessayez demain.',
    action: 'retry',
  },

  [ERROR_CODES.TOOL_ACCESS_DENIED]: {
    code: ERROR_CODES.TOOL_ACCESS_DENIED,
    message: 'Access denied to tool',
    userMessage: 'Accès refusé à cet outil.',
    action: 'redirect',
    redirectTo: '/dashboard',
  },

  [ERROR_CODES.PAYMENT_FAILED]: {
    code: ERROR_CODES.PAYMENT_FAILED,
    message: 'Payment processing failed',
    userMessage: 'Échec du paiement. Veuillez réessayer.',
    action: 'retry',
  },

  [ERROR_CODES.DATABASE_CONNECTION_FAILED]: {
    code: ERROR_CODES.DATABASE_CONNECTION_FAILED,
    message: 'Failed to connect to database',
    userMessage: 'Problème de connexion. Veuillez réessayer.',
    action: 'retry',
  },

  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: 'Network request failed',
    userMessage: 'Problème de connexion réseau. Vérifiez votre connexion.',
    action: 'retry',
  },

  [ERROR_CODES.UNKNOWN_ERROR]: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    action: 'contact_support',
  },
};

// ============================================
// UTILITAIRES DE GESTION D'ERREUR
// ============================================

export const errorHandler = {
  /**
   * Convertit une erreur en SaaSError
   */
  normalizeError(error: unknown): SaaSError {
    if (error instanceof SaaSError) {
      return error;
    }

    // Erreurs Supabase
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code?: string; type?: string; message?: string };
      switch (supabaseError.code) {
        case 'PGRST116': // Not found
          return new SaaSError(ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND]);
        case '23505': // Unique constraint violation
          return new SaaSError({
            ...ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
            message: 'Duplicate entry',
            userMessage: 'Cette action a déjà été effectuée.',
          });
        default:
          return new SaaSError({
            ...ERROR_MESSAGES[ERROR_CODES.DATABASE_QUERY_FAILED],
            details: supabaseError,
          });
      }
    }

    // Erreurs réseau
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new SaaSError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
    }

    // Erreurs Stripe
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { code?: string; type?: string; message?: string };
      if (stripeError.type === 'card_error') {
        return new SaaSError({
          ...ERROR_MESSAGES[ERROR_CODES.PAYMENT_FAILED],
          details: stripeError,
          userMessage: stripeError.message || 'Erreur de paiement.',
        });
      }
    }

    // Erreur générique
    return new SaaSError({
      ...ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  },

  /**
   * Gère une erreur et retourne une réponse appropriée
   */
  handleError(error: unknown, context?: string): {
    error: SaaSError;
    toastMessage: string;
    action?: 'retry' | 'redirect' | 'contact_support';
    redirectTo?: string;
  } {
    const normalizedError = this.normalizeError(error);

    logger.error(`[${context || 'UNKNOWN'}] ${normalizedError.code}:`, normalizedError.message, normalizedError.details);

    return {
      error: normalizedError,
      toastMessage: normalizedError.userMessage,
      action: normalizedError.action,
      redirectTo: normalizedError.redirectTo,
    };
  },

  /**
   * Wrapper pour les opérations async avec gestion d'erreur
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ success: boolean; data?: T; error?: SaaSError }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const { error: normalizedError } = this.handleError(error, context);
      return { success: false, error: normalizedError };
    }
  },

  /**
   * Valide les données d'entrée
   */
  validateInput(data: Record<string, unknown>, schema: Record<string, (value: unknown) => boolean>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(data[field])) {
        errors.push(`${field} est invalide`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ============================================
// HOOK POUR GESTION D'ERREURS DANS LES COMPOSANTS
// ============================================

/** Error handler result type */
export interface HandleErrorResult {
  error: SaaSError;
  toastMessage: string;
  action?: ErrorAction;
  redirectTo?: string;
}

/**
 * React hook for error handling in components
 * Provides toast notifications and automatic redirects
 * 
 * @example
 * const { handleError, withErrorHandling } = useErrorHandler();
 * 
 * // Using handleError directly
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, 'MyComponent');
 * }
 * 
 * // Using withErrorHandling wrapper
 * const result = await withErrorHandling(
 *   () => someAsyncOperation(),
 *   'MyComponent'
 * );
 */
export function useErrorHandler() {
  const { toast } = useToast();

  /**
   * Handles an error by showing a toast and optionally redirecting
   */
  const handleError = (error: unknown, context?: string): void => {
    const { toastMessage, action, redirectTo } = errorHandler.handleError(error, context);

    toast({
      title: "Erreur",
      description: toastMessage,
      variant: "destructive",
    });

    if (action === 'redirect' && redirectTo) {
      // Delay redirect to allow user to see the error message
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 2000);
    }
  };

  /**
   * Wraps an async operation with automatic error handling
   * Returns null if the operation fails
   */
  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    const result = await errorHandler.withErrorHandling(operation, context);

    if (!result.success && result.error) {
      handleError(result.error, context);
      return null;
    }

    return result.data ?? null;
  };

  return {
    handleError,
    withErrorHandling,
  } as const;
}
