/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserPlan } from "@/hooks/use-plan";
import { iframeBridge, IFRAME_CLIENT_SCRIPT } from "@/services/iframe-bridge";
import { iframeMonitor } from "@/services/iframe-monitor";
import { logger } from "@/services/logger";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, Shield, Zap } from "lucide-react";
import { TOOL_COSTS, TOOL_LABELS, ToolType } from "@/types/plans";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { useToast } from "@/components/ui/use-toast";
import { retryWithBackoff } from "@/lib/circuit-breaker";
import { ALLOWED_IFRAME_ORIGINS, DEVELOPMENT_ORIGINS } from "@/constants/allowed-origins";
import { IframeErrorBoundary } from "./IframeErrorBoundary";

// ============================================
// CONFIGURATION DES OUTILS
// ============================================

const TOOL_URLS: Record<string, string> = {
  "app-builder": "https://aurion-app-v2.pages.dev/",
  "website-builder": "https://790d4da4.ai-assistant-xlv.pages.dev",
  "ai-agents": "https://flo-1-2ba8.onrender.com",
  "text-editor": "https://1bf06947.aieditor.pages.dev",
  "code-editor": "https://790d4da4.ai-assistant-xlv.pages.dev",
  "content-generator": "https://790d4da4.ai-assistant-xlv.pages.dev",
};

// ============================================
// SECURITY CONFIGURATION
// ============================================

// Sandbox permissions - minimal necessary
const SANDBOX_PERMISSIONS = [
  'allow-scripts',
  'allow-same-origin',
  'allow-forms',
  'allow-popups',
  'allow-presentation',
  // Explicitly NOT including:
  // - allow-top-navigation (prevents clickjacking)
  // - allow-top-navigation-by-user-activation (prevents redirect hijacking)
  // - allow-pointer-lock (prevents UI hijacking)
  // - allow-downloads (prevents drive-by downloads)
].join(' ');

// Feature policy - minimal necessary
const FEATURE_POLICY = [
  'fullscreen',
  'clipboard-write',
  // Explicitly NOT including:
  // - camera, microphone, geolocation, payment, usb, etc.
].join('; ');

// ============================================
// SÉCURITÉ: Helper pour l'origine de postMessage
// ============================================

/**
 * Get the secure target origin for a tool URL
 * Returns the exact origin if allowed, otherwise throws
 */
function getSecureTargetOrigin(url: string): string {
  try {
    const origin = new URL(url).origin;
    
    // Check production origins
    if (ALLOWED_IFRAME_ORIGINS.includes(origin)) {
      return origin;
    }
    
    // Check development origins
    if (import.meta.env.DEV && DEVELOPMENT_ORIGINS.includes(origin)) {
      return origin;
    }
    
    // Log warning but still return the origin (no wildcard!)
    logger.warn('[IframeTool] Using unregistered origin for postMessage:', { origin });
    return origin;
  } catch (err) {
    logger.error('[IframeTool] Invalid URL for origin extraction:', { url });
    throw new Error('Invalid iframe URL');
  }
}

// ============================================
// TYPES
// ============================================

interface IframeHealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  latency: number | null;
  consecutiveFailures: number;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

function IframeToolContent() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { getToken } = useClerkSafe();
  const { creditsRemaining: _creditsRemaining, refetch: refetchCredits } = useUserPlan();
  const { toast } = useToast();

  // États
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [, setIsReusedSession] = useState(false);
  const [corsRestricted, setCorsRestricted] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [healthStatus, setHealthStatus] = useState<IframeHealthStatus>({
    isHealthy: true,
    lastCheck: Date.now(),
    latency: null,
    consecutiveFailures: 0,
  });

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionIdRef = useRef<string>();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const iframeLoadStartRef = useRef<number>();
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Infos outil (memoized)
  const toolConfig = useMemo(() => {
    if (!toolId) return null;
    return {
      url: TOOL_URLS[toolId],
      cost: TOOL_COSTS[toolId as ToolType] || 0,
      label: TOOL_LABELS[toolId as ToolType] || toolId,
    };
  }, [toolId]);

  // ============================================
  // COMMUNICATION POSTMESSAGE SÉCURISÉE
  // ============================================

  const sendTokenToIframe = useCallback((token: string) => {
    if (!iframeRef.current?.contentWindow || !toolConfig?.url) return;

    // Obtenir l'origine sécurisée (JAMAIS '*')
    let targetOrigin: string;
    try {
      targetOrigin = getSecureTargetOrigin(toolConfig.url);
    } catch {
      logger.error('[IframeTool] Cannot send token - invalid target origin');
      return;
    }

    // Structure de message sécurisée avec nonce
    const nonce = crypto.randomUUID();
    const message = {
      type: 'GENIM_SESSION_TOKEN',
      token,
      toolId,
      nonce,
      timestamp: Date.now(),
      origin: window.location.origin,
    };

    // Envoyer avec retry - UTILISE L'ORIGINE SPÉCIFIQUE
    const sendMessage = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(message, targetOrigin);
        logger.debug('[IframeTool] Token sent via postMessage', { nonce, targetOrigin });
      } catch (err) {
        logger.error('[IframeTool] Failed to send token:', err);
      }
    };

    // Envoyer immédiatement et avec retry
    sendMessage();
    setTimeout(sendMessage, 500);
    setTimeout(sendMessage, 1500);
  }, [toolId, toolConfig]);

  // ============================================
  // HEALTH CHECK
  // ============================================

  const performHealthCheck = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !iframeReady || !toolConfig?.url) return;

    // Obtenir l'origine sécurisée
    let targetOrigin: string;
    try {
      targetOrigin = getSecureTargetOrigin(toolConfig.url);
    } catch {
      return;
    }

    const startTime = Date.now();
    const checkId = crypto.randomUUID();

    // Envoyer ping avec origine spécifique
    try {
      iframeRef.current.contentWindow.postMessage({
        type: 'GENIM_HEALTH_CHECK',
        checkId,
        timestamp: startTime,
      }, targetOrigin);

      // Timeout pour la réponse
      setTimeout(() => {
        // Si pas de réponse, marquer comme unhealthy
        setHealthStatus(prev => {
          if (prev.lastCheck < startTime) {
            return {
              isHealthy: false,
              lastCheck: Date.now(),
              latency: null,
              consecutiveFailures: prev.consecutiveFailures + 1,
            };
          }
          return prev;
        });
      }, 5000);
    } catch (err) {
      logger.warn('[IframeTool] Health check failed:', err);
    }
  }, [iframeReady, toolConfig]);

  // Start health checks
  useEffect(() => {
    if (iframeReady) {
      healthCheckIntervalRef.current = setInterval(performHealthCheck, 30000);
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [iframeReady, performHealthCheck]);

  // ============================================
  // VALIDATION ET CHARGEMENT
  // ============================================

  useEffect(() => {
    if (!toolId || !toolConfig?.url) {
      setError("Tool not found");
      setIsLoading(false);
      return;
    }

    const validateAndLoadTool = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtenir le token JWT de Clerk
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // Appeler l'endpoint sécurisé avec retry
        const response = await retryWithBackoff(
          async () => {
            const res = await fetch('/api/validate-tool-access', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
              body: JSON.stringify({ 
                toolId,
                reuseSession: true,
              }),
            });

            if (!res.ok && res.status !== 402 && res.status !== 403) {
              throw new Error(`HTTP ${res.status}`);
            }

            return res;
          },
          {
            maxRetries: 2,
            baseDelay: 1000,
            retryableErrors: ['HTTP 5', 'network', 'fetch'],
          }
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = {
              error: `Service unavailable (HTTP ${response.status})`,
              message: 'The tool service is temporarily unavailable. Please try again later.'
            };
          }
          handleErrorResponse(response.status, errorData);
          return;
        }

        let data;
        try {
          data = await response.json();
        } catch {
          logger.error('[IframeTool] Failed to parse API response as JSON');
          setError('Service communication error. Please try again.');
          return;
        }

        // Succès - configurer l'iframe
        logger.debug(`[IframeTool] Access validated for ${toolId}`);
        
        setSessionToken(data.sessionToken);
        setIsReusedSession(data.isReusedSession || false);
        setIsDemoMode(data.isDemoMode || false);
        sessionIdRef.current = data.sessionId;

        // Notification selon le mode
        if (data.isDemoMode) {
          toast({
            title: "Demo mode activated",
            description: "No credits consumed - you're viewing this tool in demo mode.",
            variant: "destructive",
          });
        } else if (data.isReusedSession) {
          toast({
            title: "Session restored",
            description: "Your previous session has been restored.",
          });
        } else {
          toast({
            title: "Credits consumed",
            description: `${data.creditsConsumed} credits used for this tool.`,
          });
        }

        // Rafraîchir les crédits
        refetchCredits();

        // Initialiser l'iframe bridge
        iframeBridge.init();

        // Définir l'URL de l'iframe (sans token dans l'URL)
        setIframeUrl(data.iframeUrl);

        // Marquer le début du chargement pour mesurer les performances
        iframeLoadStartRef.current = Date.now();

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to access the tool";
        logger.error('[IframeTool] Validation error:', err);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    validateAndLoadTool();

    // Cleanup
    return () => {
      if (sessionIdRef.current) {
        iframeBridge.unregisterIframe(sessionIdRef.current);
      }
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, [toolId, toolConfig, getToken, refetchCredits, toast]);

  // ============================================
  // GESTION ERREURS
  // ============================================

  const handleErrorResponse = (status: number, errorData: { required?: number; reason?: string; message?: string; error?: string; suggestedPlan?: string }) => {
    setIsLoading(false);

    switch (status) {
      case 402:
        setError(`Insufficient credits. ${errorData.required || toolConfig?.cost} credits required.`);
        toast({
          title: "Insufficient credits",
          description: "Please recharge your credits to continue.",
          variant: "destructive",
        });
        break;

      case 403:
        if (errorData.reason === 'plan_upgrade_required') {
          setError("This tool requires a higher plan.");
          toast({
            title: "Plan upgrade required",
            description: `Upgrade to ${errorData.suggestedPlan} to access this tool.`,
            variant: "destructive",
          });
        } else if (errorData.reason === 'subscription_required') {
          setError("Subscription required for this tool.");
        } else if (errorData.reason === 'security_violation') {
          setError("Security error. Please reload the page.");
        } else {
          setError(errorData.error || "Access denied");
        }
        break;

      case 429:
        setError(`Rate limit reached: ${errorData.error}`);
        toast({
          title: "Rate limit",
          description: "Please wait before trying again.",
          variant: "destructive",
        });
        break;

      case 500:
        setError("Server error. Please try again later.");
        toast({
          title: "Server error",
          description: "The service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
        break;

      case 503:
        setError("Service temporarily unavailable - configuration issue.");
        toast({
          title: "Service unavailable",
          description: "The tool is being configured. Please try again in a few minutes.",
          variant: "destructive",
        });
        break;

      default:
        setError(errorData.error || "Validation error");
    }
  };

  // ============================================
  // GESTION CHARGEMENT IFRAME
  // ============================================

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || !sessionToken || !toolId || !toolConfig) return;

    try {
      // Mesurer et logger le temps de chargement
      const loadTime = Date.now() - (iframeLoadStartRef.current || Date.now());
      iframeMonitor.recordLoadTime(
        toolId,
        getToken ? 'authenticated' : 'anonymous',
        loadTime,
        window.location.origin
      );

      // Log performance metric
      logger.info('[IframeTool] Iframe loaded', {
        toolId,
        loadTime,
        url: toolConfig.url,
      });

      // Enregistrer l'iframe dans le bridge
      const iframeId = sessionIdRef.current || `iframe_${toolId}_${Date.now()}`;
      iframeBridge.registerIframe(iframeId, toolId as ToolType, toolConfig.url, iframeRef.current);

      // Envoyer le token de session via postMessage (plus sécurisé que query string)
      sendTokenToIframe(sessionToken);

      // Tenter d'injecter le script client (peut échouer avec CORS)
      try {
        if (iframeRef.current.contentDocument) {
          const script = iframeRef.current.contentDocument.createElement('script');
          script.textContent = IFRAME_CLIENT_SCRIPT;
          iframeRef.current.contentDocument.head.appendChild(script);
          logger.debug(`[IframeTool] SDK injected for: ${toolId}`);
        }
      } catch {
        logger.warn('[IframeTool] CORS restriction - using postMessage fallback');
        setCorsRestricted(true);
      }

      // Notifier que l'iframe est prête
      setTimeout(() => {
        iframeBridge.notifyIframeReady(iframeId);
      }, 1000);

    } catch (err) {
      logger.error('[IframeTool] Load handler error:', err);
      setCorsRestricted(true);
    }

    setIsLoading(false);
  }, [sessionToken, toolId, toolConfig, sendTokenToIframe, getToken]);

  // ============================================
  // ÉCOUTE DES MESSAGES IFRAME
  // ============================================

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier que le message vient de notre iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type, data, checkId, timestamp } = event.data || {};

      switch (type) {
        case 'GENIM_IFRAME_READY':
          setIframeReady(true);
          logger.debug('[IframeTool] Iframe ready signal received');
          // Renvoyer le token au cas où le premier message a été manqué
          if (sessionToken) {
            sendTokenToIframe(sessionToken);
          }
          break;

        case 'GENIM_REQUEST_TOKEN':
          // L'iframe demande le token
          if (sessionToken) {
            sendTokenToIframe(sessionToken);
          }
          break;

        case 'GENIM_ACTION_COMPLETED':
          // L'iframe notifie qu'une action a été effectuée
          logger.debug('[IframeTool] Action completed:', data);
          refetchCredits();
          break;

        case 'GENIM_ERROR':
          logger.error('[IframeTool] Iframe error:', data);
          toast({
            title: "Tool error",
            description: data?.message || "An error occurred in the tool.",
            variant: "destructive",
          });
          break;

        case 'GENIM_HEALTH_CHECK_ACK':
          // Health check response
          if (checkId && timestamp) {
            const latency = Date.now() - timestamp;
            setHealthStatus({
              isHealthy: true,
              lastCheck: Date.now(),
              latency,
              consecutiveFailures: 0,
            });
          }
          break;
      }
    };

    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sessionToken, sendTokenToIframe, refetchCredits, toast]);

  // ============================================
  // ACTIONS UTILISATEUR
  // ============================================

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    setIframeUrl(null);
    setSessionToken(null);
    
    // Re-trigger validation
    window.location.reload();
  };

  // ============================================
  // RENDU
  // ============================================

  // Outil non trouvé
  if (!toolConfig?.url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tool not found</h3>
          <p className="text-gray-600 mb-6">
            The requested tool does not exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Bandeau mode démo */}
      {isDemoMode && (
        <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
          🎯 Mode démo activé - Aucun crédit consommé pour cet outil
        </div>
      )}

      {/* Status bar (production) */}
      {!isDemoMode && iframeReady && (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-2 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            healthStatus.isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {healthStatus.isHealthy ? (
              <>
                <Zap className="w-3 h-3" />
                <span>{healthStatus.latency ? `${healthStatus.latency}ms` : 'Connected'}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Reconnecting...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            <Shield className="w-3 h-3" />
            <span>Secured</span>
          </div>
        </div>
      )}

      {/* Iframe plein écran avec sécurité renforcée */}
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-screen border-0"
          title={toolConfig.label}
          sandbox={SANDBOX_PERMISSIONS}
          allow={FEATURE_POLICY}
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          onLoad={handleIframeLoad}
          onError={() => {
            setError("Failed to load the tool");
            setIsLoading(false);
          }}
        />
      )}

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading {toolConfig.label}...</p>
            <p className="text-gray-400 text-sm mt-2">Verifying access permissions...</p>
          </div>
        </div>
      )}

      {/* Overlay d'erreur */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="max-w-md w-full p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement CORS (dev uniquement) */}
      {corsRestricted && !iframeReady && import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-40">
          <Alert className="border-yellow-200 bg-yellow-50 shadow-lg max-w-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <p className="font-medium mb-1">CORS restrictions detected</p>
              <p className="text-xs">Some features may be limited. The tool is functional but cannot receive real-time updates.</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

// ============================================
// WRAPPER WITH ERROR BOUNDARY
// ============================================

/**
 * IframeTool component wrapped with specialized error boundary
 * Catches and handles iframe-specific errors gracefully
 */
export default function IframeTool() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  
  // Get tool info for error display
  const toolName = TOOL_LABELS[toolId as ToolType] || toolId || 'Unknown Tool';
  
  const handleRetry = useCallback(() => {
    // Force re-render by reloading
    window.location.reload();
  }, []);
  
  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <IframeErrorBoundary
      toolId={toolId || 'unknown'}
      toolName={toolName}
      onRetry={handleRetry}
      onBack={handleBack}
    >
      <IframeToolContent />
    </IframeErrorBoundary>
  );
}
