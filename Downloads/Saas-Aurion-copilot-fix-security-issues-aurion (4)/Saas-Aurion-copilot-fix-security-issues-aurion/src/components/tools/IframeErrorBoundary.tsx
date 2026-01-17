/**
 * @fileoverview Specialized error boundary for iframe tools
 * Handles iframe-specific errors like network failures, timeouts, CORS issues
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/services/logger';
import { 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  Wifi, 
  Shield, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// TYPES
// ============================================

interface Props {
  children: ReactNode;
  toolId: string;
  toolName: string;
  onRetry?: () => void;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'network' | 'cors' | 'timeout' | 'security' | 'unknown';
  retryCount: number;
}

const MAX_RETRIES = 3;

// ============================================
// ERROR TYPE DETECTION
// ============================================

function detectErrorType(error: Error): State['errorType'] {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || name === 'networkerror') {
    return 'network';
  }
  
  if (message.includes('cors') || message.includes('cross-origin') || message.includes('blocked')) {
    return 'cors';
  }
  
  if (message.includes('timeout') || message.includes('timed out') || name === 'aborterror') {
    return 'timeout';
  }
  
  if (message.includes('security') || message.includes('csp') || message.includes('sandbox')) {
    return 'security';
  }
  
  return 'unknown';
}

// ============================================
// ERROR UI CONFIGS
// ============================================

const ERROR_CONFIGS: Record<State['errorType'], {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  network: {
    icon: Wifi,
    title: 'Connexion impossible',
    description: 'L\'outil ne peut pas se connecter au serveur. Vérifiez votre connexion internet.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
  },
  cors: {
    icon: Shield,
    title: 'Erreur de sécurité',
    description: 'L\'outil est bloqué par les paramètres de sécurité. Contactez le support si le problème persiste.',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  timeout: {
    icon: Clock,
    title: 'Délai dépassé',
    description: 'L\'outil met trop de temps à charger. Réessayez dans quelques instants.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  security: {
    icon: Shield,
    title: 'Blocage de sécurité',
    description: 'Une politique de sécurité empêche le chargement de l\'outil.',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  unknown: {
    icon: AlertCircle,
    title: 'Erreur inattendue',
    description: 'Une erreur s\'est produite lors du chargement de l\'outil.',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
};

// ============================================
// COMPONENT
// ============================================

export class IframeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorType: 'unknown',
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorType: detectErrorType(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error(`[IframeErrorBoundary] Tool ${this.props.toolId} crashed:`, error, {
      toolId: this.props.toolId,
      toolName: this.props.toolName,
      errorType: detectErrorType(error),
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = (): void => {
    const { onRetry } = this.props;
    
    this.setState((state) => ({
      hasError: false,
      error: null,
      retryCount: state.retryCount + 1,
    }), () => {
      onRetry?.();
    });
  };

  private handleBack = (): void => {
    const { onBack } = this.props;
    
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    const { hasError, error, errorType, retryCount } = this.state;
    const { children, toolName } = this.props;

    if (!hasError) {
      return children;
    }

    const config = ERROR_CONFIGS[errorType];
    const Icon = config.icon;
    const canRetry = retryCount < MAX_RETRIES;

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full text-center">
          {/* Error icon */}
          <div className={`w-20 h-20 mx-auto mb-6 ${config.bgColor} rounded-2xl flex items-center justify-center`}>
            <Icon size={40} className={config.color} />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h2>
          
          {/* Tool name */}
          <p className="text-sm text-gray-400 mb-4">
            Outil: {toolName}
          </p>
          
          {/* Description */}
          <p className="text-gray-600 mb-6">
            {config.description}
          </p>
          
          {/* Retry count */}
          {retryCount > 0 && canRetry && (
            <p className="text-amber-600 text-sm mb-4">
              Tentative {retryCount}/{MAX_RETRIES}
            </p>
          )}

          {/* Too many retries */}
          {!canRetry && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">
                Trop de tentatives échouées. Veuillez rafraîchir la page ou contacter le support.
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {canRetry ? (
              <Button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Réessayer
              </Button>
            ) : (
              <Button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Rafraîchir la page
              </Button>
            )}
            
            <Button
              onClick={this.handleBack}
              variant="outline"
              className="inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Retour au dashboard
            </Button>
          </div>
          
          {/* Technical details */}
          {import.meta.env.DEV && error && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Détails techniques (dev)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-auto max-h-48">
                {`Error Type: ${errorType}\n`}
                {`Retry Count: ${retryCount}\n\n`}
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default IframeErrorBoundary;
