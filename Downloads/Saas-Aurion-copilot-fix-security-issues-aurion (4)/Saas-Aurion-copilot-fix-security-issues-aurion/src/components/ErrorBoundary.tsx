/**
 * @fileoverview Error boundary component for graceful error handling
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 * 
 * @module components/ErrorBoundary
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/services/logger';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Props {
  /** Child components to render */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details (dev mode) */
  showDetails?: boolean;
}

interface State {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error */
  error: Error | null;
  /** Error info with component stack */
  errorInfo: ErrorInfo | null;
  /** Number of retry attempts */
  retryCount: number;
}

/** Maximum number of automatic retries */
const MAX_RETRIES = 3;

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

/**
 * Error boundary component that catches errors in child components
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error) => trackError(error)}
 *   fallback={<CustomErrorPage />}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  /**
   * Update state when an error is caught
   */
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store error info in state
    this.setState({ errorInfo });
    
    // Log the error
    logger.error('ErrorBoundary caught an error:', error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset error state and retry rendering
   */
  private handleRetry = (): void => {
    this.setState((state) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: state.retryCount + 1,
    }));
  };

  /**
   * Navigate to home page
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Reload the page completely
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(): string {
    const { error } = this.state;
    
    if (!error) return 'Une erreur inattendue s\'est produite.';
    
    // Check by error name first (most reliable)
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }
    
    // Check for chunk loading errors (common with lazy loading)
    if (error.name === 'ChunkLoadError' || 
        (error.name === 'Error' && error.message.toLowerCase().includes('loading chunk'))) {
      return 'Erreur de chargement. Essayez de rafraîchir la page.';
    }
    
    // Network-related errors
    if (error.name === 'NetworkError' || error.message.toLowerCase().includes('network')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }
    
    return error.message || 'Une erreur inattendue s\'est produite.';
  }

  public render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-md w-full text-center">
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" aria-hidden="true" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Une erreur est survenue
            </h2>
            
            {/* Error message */}
            <p className="text-gray-500 mb-6">
              {this.getErrorMessage()}
            </p>
            
            {/* Retry count warning */}
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <p className="text-amber-600 text-sm mb-4">
                Tentative {retryCount}/{MAX_RETRIES}
              </p>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {retryCount < MAX_RETRIES ? (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  <RefreshCw size={18} aria-hidden="true" />
                  Réessayer
                </button>
              ) : (
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  <RefreshCw size={18} aria-hidden="true" />
                  Rafraîchir la page
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                type="button"
              >
                <Home size={18} aria-hidden="true" />
                Accueil
              </button>
            </div>
            
            {/* Error details (development only) */}
            {showDetails && error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-auto max-h-48">
                  {error.stack || error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

