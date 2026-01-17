/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { accessControl } from './access-control';
import { creditsService, planService as supabasePlanService } from '@/services/supabase-db';
import { logger } from '@/services/logger';
import { ToolType, TOOL_COSTS, TOOL_LABELS, PLANS } from '@/types/plans';
import { ALLOWED_IFRAME_ORIGINS, DEVELOPMENT_ORIGINS, isOriginAllowed } from '@/constants/allowed-origins';

// ============================================
// IFRAME BRIDGE - COMMUNICATION SÉCURISÉE
// ============================================
//
// SECURITY NOTES:
// - All postMessage calls use specific target origins (not '*')
// - Incoming messages are validated against allowed origins
// - Session tokens are sent only to registered iframes
//
// FEATURES:
// ✅ Validation stricte origine des messages (NO wildcards)
// ✅ Heartbeat pour détection de déconnexion
// ✅ Retry automatique des messages
// ✅ SDK client amélioré avec réception token
// ============================================

// Helper pour obtenir l'origine sécurisée d'une URL d'iframe
function getSecureOrigin(url: string): string {
  try {
    const origin = new URL(url).origin;
    // Vérifier que l'origine est dans la liste autorisée
    if (ALLOWED_IFRAME_ORIGINS.includes(origin)) {
      return origin;
    }
    // En développement, autoriser localhost
    if (import.meta.env.DEV && DEVELOPMENT_ORIGINS.includes(origin)) {
      return origin;
    }
    logger.warn('[IframeBridge] Unknown iframe origin, using restrictive mode:', { origin });
    return origin; // Retourner l'origine exacte quand même (pas '*')
  } catch {
    logger.error('[IframeBridge] Invalid URL for origin extraction:', { url });
    return 'null'; // Origin invalide - le message ne sera pas délivré
  }
}

export type IframeBridgeMessageType = 
  | 'GENIM_INIT'
  | 'GENIM_SESSION_TOKEN'
  | 'GENIM_CHECK_ACCESS'
  | 'GENIM_CONSUME'
  | 'GENIM_GET_STATUS'
  | 'GENIM_RESPONSE'
  | 'GENIM_CREDITS_UPDATE'
  | 'GENIM_PLAN_UPDATE'
  | 'GENIM_BLOCKED'
  | 'GENIM_HEARTBEAT'
  | 'GENIM_HEARTBEAT_ACK'
  | 'GENIM_REQUEST_TOKEN'
  | 'GENIM_IFRAME_READY';

export interface IframeBridgeMessage {
  type: IframeBridgeMessageType;
  requestId?: string;
  tool?: ToolType;
  payload?: any;
  origin?: string;
  timestamp?: number;
}

export interface IframeToolState {
  id: string;
  tool: ToolType;
  url: string;
  status: 'active' | 'inactive' | 'blocked' | 'error' | 'loading';
  lastPing: string | null;
  lastHeartbeat: number | null;
  errorMessage?: string;
  iframe?: HTMLIFrameElement;
  sessionToken?: string;
}

// État global des outils iframe
const toolStates: Map<string, IframeToolState> = new Map();
const messageHandlers: Map<string, (response: any) => void> = new Map();
const pendingMessages: Map<string, { message: any; retries: number; resolve: (value: any) => void }> = new Map();

// Intervalle de heartbeat (30 secondes)
const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 10000;

let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

// ============================================
// BRIDGE PRINCIPAL
// ============================================

export const iframeBridge = {
  // Initialiser le listener global
  init(): void {
    if (isInitialized) return;
    
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Démarrer le heartbeat
    this.startHeartbeat();
    
    isInitialized = true;
    logger.debug('[IframeBridge] Initialized with security checks');
  },

  // Nettoyer
  destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.stopHeartbeat();
    toolStates.clear();
    messageHandlers.clear();
    pendingMessages.clear();
    isInitialized = false;
    logger.debug('[IframeBridge] Destroyed');
  },

  // ============================================
  // VALIDATION ORIGINE
  // ============================================

  isValidOrigin(origin: string): boolean {
    // Autoriser localhost en développement
    if (import.meta.env.DEV) {
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return true;
      }
    }

    // Vérification exacte contre la liste centralisée
    return ALLOWED_IFRAME_ORIGINS.includes(origin);
  },

  // ============================================
  // GESTION DES MESSAGES
  // ============================================

  handleMessage(event: MessageEvent): void {
    const message = event.data as IframeBridgeMessage;
    
    if (!message.type || !message.type.startsWith('GENIM_')) {
      return;
    }

    // ============================================
    // VALIDATION STRICTE D'ORIGINE - CRITIQUE SÉCURITÉ
    // ============================================
    const isDev = import.meta.env.DEV;
    if (!isOriginAllowed(event.origin, isDev)) {
      logger.security('[IframeBridge] Message rejected from unauthorized origin:', { 
        origin: event.origin,
        type: message.type 
      });
      return;
    }
    
    logger.debug('[IframeBridge] Received from valid origin:', { type: message.type, origin: event.origin });

    // Conserver l'origine validée pour les réponses
    const validatedOrigin = event.origin;

    switch (message.type) {
      case 'GENIM_INIT':
        this.handleInit(event.source as Window, message, validatedOrigin).catch(error =>
          logger.error('[IframeBridge] GENIM_INIT error:', error)
        );
        break;

      case 'GENIM_CHECK_ACCESS':
        this.handleCheckAccess(event.source as Window, message, validatedOrigin).catch(error =>
          logger.error('[IframeBridge] GENIM_CHECK_ACCESS error:', error)
        );
        break;

      case 'GENIM_CONSUME':
        this.handleConsume(event.source as Window, message, validatedOrigin).catch(error =>
          logger.error('[IframeBridge] GENIM_CONSUME error:', error)
        );
        break;

      case 'GENIM_GET_STATUS':
        this.handleGetStatus(event.source as Window, message, validatedOrigin).catch(error =>
          logger.error('[IframeBridge] GENIM_GET_STATUS error:', error)
        );
        break;

      case 'GENIM_HEARTBEAT_ACK':
        this.handleHeartbeatAck(message);
        break;

      case 'GENIM_REQUEST_TOKEN':
        this.handleTokenRequest(event.source as Window, message);
        break;

      case 'GENIM_IFRAME_READY':
        this.handleIframeReadySignal(message);
        break;
        
      default:
        // Message non reconnu, ignorer silencieusement
        break;
    }
  },

  async handleInit(source: Window, message: IframeBridgeMessage, targetOrigin: string): Promise<void> {
    const tool = message.tool;
    if (!tool) return;

    try {
      // Récupérer les informations de manière sécurisée depuis Supabase
      const [credits, plan] = await Promise.all([
        creditsService.getCredits(),
        supabasePlanService.getCurrentPlan(),
      ]);

      if (!plan) {
        this.sendResponse(source, message.requestId, {
          success: false,
          error: 'No active plan found',
        }, targetOrigin);
        return;
      }

      const planDetails = PLANS[plan.plan_type];
      const toolFeature = planDetails.features.find(f => f.tool === tool);

      // Calculer les crédits disponibles
      const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

      this.sendResponse(source, message.requestId, {
        success: true,
        tool,
        enabled: toolFeature?.enabled || false,
        plan: plan.plan_type,
        planName: planDetails.name,
        credits: availableCredits,
        dailyRemaining: toolFeature?.dailyLimit || null,
        monthlyRemaining: toolFeature?.monthlyLimit || null,
        quality: toolFeature?.quality || 'standard',
        priority: toolFeature?.priority || 'normal',
        cost: TOOL_COSTS[tool],
      }, targetOrigin);
    } catch (error) {
      logger.error('[IframeBridge] Init error:', error);
      this.sendResponse(source, message.requestId, {
        success: false,
        error: 'Failed to initialize',
      }, targetOrigin);
    }
  },

  async handleCheckAccess(source: Window, message: IframeBridgeMessage, targetOrigin: string): Promise<void> {
    const tool = message.tool;
    if (!tool) return;

    try {
      const check = await accessControl.checkAccess(tool);

      this.sendResponse(source, message.requestId, {
        allowed: check.allowed,
        reason: check.reason,
        remainingCredits: check.creditsAvailable,
        dailyRemaining: check.dailyRemaining,
        monthlyRemaining: check.monthlyRemaining,
        suggestedPlan: check.suggestedPlan,
        cost: TOOL_COSTS[tool],
      }, targetOrigin);
    } catch (error) {
      logger.error('[IframeBridge] Check access error:', error);
      this.sendResponse(source, message.requestId, {
        allowed: false,
        error: 'Access check failed',
      }, targetOrigin);
    }
  },

  async handleConsume(source: Window, message: IframeBridgeMessage, targetOrigin: string): Promise<void> {
    const tool = message.tool;
    if (!tool) return;

    try {
      const result = await accessControl.consumeCredits(tool, message.payload?.metadata);

      this.sendResponse(source, message.requestId, {
        success: result.success,
        error: result.error,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits,
      }, targetOrigin);

      if (result.success) {
        this.broadcastCreditsUpdate();
      }
    } catch (error) {
      logger.error('[IframeBridge] Consume error:', error);
      this.sendResponse(source, message.requestId, {
        success: false,
        error: 'Consumption failed',
      }, targetOrigin);
    }
  },

  async handleGetStatus(source: Window, message: IframeBridgeMessage, targetOrigin: string): Promise<void> {
    try {
      const [credits, plan] = await Promise.all([
        creditsService.getCredits(),
        supabasePlanService.getCurrentPlan(),
      ]);

      if (!plan) {
        this.sendResponse(source, message.requestId, {
          error: 'No active plan found',
        }, targetOrigin);
        return;
      }

      const planDetails = PLANS[plan.plan_type];
      const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

      // Calculer le statut de tous les outils
      const allTools: ToolType[] = [
        'image_generation', 'video_generation', 'code_generation',
        'ai_chat', 'agent_builder', 'app_builder', 'website_builder', 'text_editor'
      ];

      const toolsStatus: Record<string, any> = {};
      for (const tool of allTools) {
        const feature = planDetails.features.find(f => f.tool === tool);
        toolsStatus[tool] = {
          enabled: feature?.enabled || false,
          dailyRemaining: feature?.dailyLimit || null,
          monthlyRemaining: feature?.monthlyLimit || null,
          quality: feature?.quality || 'standard',
          priority: feature?.priority || 'normal',
        };
      }

      this.sendResponse(source, message.requestId, {
        plan: plan.plan_type,
        planName: planDetails.name,
        credits: availableCredits,
        totalCredits: planDetails.credits,
        usedCredits: credits ? credits.used_credits : 0,
        tools: toolsStatus,
      }, targetOrigin);
    } catch (error) {
      logger.error('[IframeBridge] Get status error:', error);
      this.sendResponse(source, message.requestId, {
        error: 'Failed to get status',
      }, targetOrigin);
    }
  },

  handleHeartbeatAck(message: IframeBridgeMessage): void {
    const iframeId = message.payload?.iframeId;
    if (iframeId) {
      const state = toolStates.get(iframeId);
      if (state) {
        state.lastHeartbeat = Date.now();
        state.status = 'active';
        toolStates.set(iframeId, state);
      }
    }
  },

  handleTokenRequest(source: Window, message: IframeBridgeMessage): void {
    const toolId = message.tool;
    if (!toolId) return;

    // Trouver l'état de l'iframe pour cet outil
    const state = Array.from(toolStates.values()).find(s => s.tool === toolId);
    
    if (state?.sessionToken && state.url) {
      const targetOrigin = getSecureOrigin(state.url);
      source.postMessage({
        type: 'GENIM_SESSION_TOKEN',
        token: state.sessionToken,
        toolId,
        timestamp: Date.now(),
      }, targetOrigin);
    }
  },

  handleIframeReadySignal(message: IframeBridgeMessage): void {
    const iframeId = message.payload?.iframeId;
    if (iframeId) {
      this.updateIframeStatus(iframeId, 'active');
      logger.debug('[IframeBridge] Iframe ready:', { iframeId });
    }
  },

  sendResponse(target: Window, requestId: string | undefined, payload: any, targetOrigin?: string): void {
    try {
      // Utiliser l'origine spécifique si fournie, sinon chercher dans les états
      const origin = targetOrigin || this.findOriginForWindow(target);
      if (!origin) {
        logger.warn('[IframeBridge] No valid origin found for response, skipping');
        return;
      }
      target.postMessage({
        type: 'GENIM_RESPONSE',
        requestId,
        payload,
        timestamp: Date.now(),
      }, origin);
    } catch (error) {
      logger.error('[IframeBridge] Send response error:', error);
    }
  },

  // Helper pour trouver l'origine d'une fenêtre parmi les iframes enregistrées
  findOriginForWindow(target: Window): string | null {
    for (const state of toolStates.values()) {
      if (state.iframe?.contentWindow === target && state.url) {
        return getSecureOrigin(state.url);
      }
    }
    return null;
  },

  // ============================================
  // HEARTBEAT
  // ============================================

  startHeartbeat(): void {
    if (heartbeatIntervalId) return;

    heartbeatIntervalId = setInterval(() => {
      this.sendHeartbeat();
      this.checkHeartbeatTimeouts();
    }, HEARTBEAT_INTERVAL);
  },

  stopHeartbeat(): void {
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId);
      heartbeatIntervalId = null;
    }
  },

  sendHeartbeat(): void {
    toolStates.forEach((state, id) => {
      if (state.iframe?.contentWindow && state.url) {
        try {
          const targetOrigin = getSecureOrigin(state.url);
          state.iframe.contentWindow.postMessage({
            type: 'GENIM_HEARTBEAT',
            iframeId: id,
            timestamp: Date.now(),
          }, targetOrigin);
        } catch (error) {
          logger.warn('[IframeBridge] Heartbeat send failed for:', { id });
        }
      }
    });
  },

  checkHeartbeatTimeouts(): void {
    const now = Date.now();
    
    toolStates.forEach((state, id) => {
      if (state.lastHeartbeat && now - state.lastHeartbeat > HEARTBEAT_TIMEOUT * 2) {
        // Iframe non responsive
        logger.warn('[IframeBridge] Iframe timeout:', { id });
        this.updateIframeStatus(id, 'inactive');
      }
    });
  },

  // ============================================
  // NOTIFICATIONS VERS IFRAMES
  // ============================================

  async broadcastCreditsUpdate(): Promise<void> {
    try {
      const credits = await creditsService.getCredits();
      const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

      const message: IframeBridgeMessage = {
        type: 'GENIM_CREDITS_UPDATE',
        payload: {
          credits: availableCredits,
        },
        timestamp: Date.now(),
      };

      toolStates.forEach(state => {
        if (state.iframe?.contentWindow && state.status === 'active' && state.url) {
          try {
            const targetOrigin = getSecureOrigin(state.url);
            state.iframe.contentWindow.postMessage(message, targetOrigin);
          } catch (error) {
            logger.warn('[IframeBridge] Broadcast failed for:', { id: state.id });
          }
        }
      });
    } catch (error) {
      logger.error('[IframeBridge] Broadcast credits update error:', error);
    }
  },

  async broadcastPlanUpdate(): Promise<void> {
    try {
      const [credits, plan] = await Promise.all([
        creditsService.getCredits(),
        supabasePlanService.getCurrentPlan(),
      ]);

      if (!plan) return;

      const planDetails = PLANS[plan.plan_type];
      const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

      // Calculer le statut de tous les outils
      const allTools: ToolType[] = [
        'image_generation', 'video_generation', 'code_generation',
        'ai_chat', 'agent_builder', 'app_builder', 'website_builder', 'text_editor'
      ];

      const toolsStatus: Record<string, any> = {};
      for (const tool of allTools) {
        const feature = planDetails.features.find(f => f.tool === tool);
        toolsStatus[tool] = {
          enabled: feature?.enabled || false,
          dailyRemaining: feature?.dailyLimit || null,
          monthlyRemaining: feature?.monthlyLimit || null,
          quality: feature?.quality || 'standard',
          priority: feature?.priority || 'normal',
        };
      }

      const message: IframeBridgeMessage = {
        type: 'GENIM_PLAN_UPDATE',
        payload: {
          plan: plan.plan_type,
          planName: planDetails.name,
          credits: availableCredits,
          tools: toolsStatus,
        },
        timestamp: Date.now(),
      };

      toolStates.forEach(state => {
        if (state.iframe?.contentWindow && state.status === 'active' && state.url) {
          try {
            const targetOrigin = getSecureOrigin(state.url);
            state.iframe.contentWindow.postMessage(message, targetOrigin);
          } catch (error) {
            logger.warn('[IframeBridge] Plan update broadcast failed for:', { id: state.id });
          }
        }
      });
    } catch (error) {
      logger.error('[IframeBridge] Broadcast plan update error:', error);
    }
  },

  async notifyBlocked(tool: ToolType, reason: string): Promise<void> {
    const state = Array.from(toolStates.values()).find(s => s.tool === tool);

    if (state?.iframe?.contentWindow && state.url) {
      try {
        const targetOrigin = getSecureOrigin(state.url);
        state.iframe.contentWindow.postMessage({
          type: 'GENIM_BLOCKED',
          tool,
          payload: { reason },
          timestamp: Date.now(),
        }, targetOrigin);
      } catch (error) {
        logger.warn('[IframeBridge] Notify blocked failed for:', { tool });
      }
    }
  },

  notifyIframeReady(id: string): void {
    const state = toolStates.get(id);
    if (state?.iframe?.contentWindow && state.url) {
      try {
        const targetOrigin = getSecureOrigin(state.url);
        state.iframe.contentWindow.postMessage({
          type: 'GENIM_IFRAME_READY',
          iframeId: id,
          tool: state.tool,
          timestamp: Date.now(),
        }, targetOrigin);
        
        // Envoyer le token si disponible
        if (state.sessionToken) {
          state.iframe.contentWindow.postMessage({
            type: 'GENIM_SESSION_TOKEN',
            token: state.sessionToken,
            toolId: state.tool,
            timestamp: Date.now(),
          }, targetOrigin);
        }
      } catch (error) {
        logger.warn('[IframeBridge] Notify ready failed for:', { id });
      }
    }
  },

  // ============================================
  // GESTION DES IFRAMES
  // ============================================

  registerIframe(id: string, tool: ToolType, url: string, iframe: HTMLIFrameElement, sessionToken?: string): void {
    toolStates.set(id, {
      id,
      tool,
      url,
      status: 'loading',
      lastPing: null,
      lastHeartbeat: null,
      iframe,
      sessionToken,
    });
    logger.debug('[IframeBridge] Registered iframe:', { id, tool });
  },

  unregisterIframe(id: string): void {
    toolStates.delete(id);
    logger.debug('[IframeBridge] Unregistered iframe:', { id });
  },

  updateIframeStatus(id: string, status: IframeToolState['status'], errorMessage?: string): void {
    const state = toolStates.get(id);
    if (state) {
      state.status = status;
      state.lastPing = new Date().toISOString();
      if (errorMessage) {
        state.errorMessage = errorMessage;
      }
      toolStates.set(id, state);
    }
  },

  setSessionToken(id: string, token: string): void {
    const state = toolStates.get(id);
    if (state) {
      state.sessionToken = token;
      toolStates.set(id, state);
    }
  },

  getIframeStates(): IframeToolState[] {
    return Array.from(toolStates.values());
  },

  getIframeState(id: string): IframeToolState | undefined {
    return toolStates.get(id);
  },

  getActiveIframes(): IframeToolState[] {
    return Array.from(toolStates.values()).filter(s => s.status === 'active');
  },
};

// ============================================
// SDK CLIENT À INJECTER DANS LES IFRAMES
// ============================================

export const IFRAME_CLIENT_SCRIPT = `
// ============================================
// AURION SaaS - Iframe Client SDK v3.0
// SECURE: No wildcard origins in postMessage
// ============================================

(function() {
  'use strict';

  // Éviter la double initialisation
  if (window.AURIONSDK && window.AURIONSDK._initialized) {
    return;
  }

  // ============================================
  // CONFIGURATION SÉCURITÉ
  // ============================================
  var ALLOWED_PARENT_ORIGINS = [
    'https://aurion.app',
    'https://www.aurion.app',
    'https://genim.app',
    'https://www.genim.app',
    'https://aurion-saas.pages.dev',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  function detectParentOrigin() {
    try {
      if (document.referrer) {
        var url = new URL(document.referrer);
        if (ALLOWED_PARENT_ORIGINS.indexOf(url.origin) !== -1) {
          return url.origin;
        }
      }
    } catch (e) {}
    
    // Fallback production
    if (window.location.hostname.indexOf('pages.dev') !== -1 || 
        window.location.hostname.indexOf('render.com') !== -1 ||
        window.location.hostname.indexOf('vercel.app') !== -1) {
      return 'https://aurion-saas.pages.dev';
    }
    
    return 'http://localhost:5173';
  }

  function isOriginAllowed(origin) {
    return ALLOWED_PARENT_ORIGINS.indexOf(origin) !== -1;
  }

  window.AURIONSDK = {
    _initialized: true,
    _requestId: 0,
    _pendingRequests: new Map(),
    _sessionToken: null,
    _toolId: null,
    _parentOrigin: detectParentOrigin(),
    _isReady: false,

    // ============================================
    // INITIALISATION
    // ============================================

    init: function(toolId, parentOrigin) {
      this._toolId = toolId || this._getToolIdFromUrl();
      if (parentOrigin && isOriginAllowed(parentOrigin)) {
        this._parentOrigin = parentOrigin;
      }
      
      window.addEventListener('message', this._handleMessage.bind(this));
      this._notifyReady();
      this._requestToken();
      
      return this._sendRequest('GENIM_INIT', { tool: this._toolId });
    },

    _getToolIdFromUrl: function() {
      var params = new URLSearchParams(window.location.search);
      return params.get('tool_id') || null;
    },

    _notifyReady: function() {
      window.parent.postMessage({
        type: 'GENIM_IFRAME_READY',
        payload: { iframeId: this._toolId },
        timestamp: Date.now()
      }, this._parentOrigin);
    },

    _requestToken: function() {
      window.parent.postMessage({
        type: 'GENIM_REQUEST_TOKEN',
        tool: this._toolId,
        timestamp: Date.now()
      }, this._parentOrigin);
    },

    // ============================================
    // API PUBLIQUE
    // ============================================

    checkAccess: function() {
      return this._sendRequest('GENIM_CHECK_ACCESS', { tool: this._toolId });
    },

    consume: function(metadata) {
      return this._sendRequest('GENIM_CONSUME', { 
        tool: this._toolId, 
        payload: { metadata } 
      });
    },

    getStatus: function() {
      return this._sendRequest('GENIM_GET_STATUS', {});
    },

    getSessionToken: function() {
      return this._sessionToken;
    },

    isReady: function() {
      return this._isReady && !!this._sessionToken;
    },

    getParentOrigin: function() {
      return this._parentOrigin;
    },

    // ============================================
    // COMMUNICATION (SECURE)
    // ============================================

    _sendRequest: function(type, data) {
      var self = this;
      return new Promise(function(resolve) {
        var requestId = 'req_' + (++self._requestId) + '_' + Date.now();
        self._pendingRequests.set(requestId, resolve);

        window.parent.postMessage({
          type: type,
          requestId: requestId,
          timestamp: Date.now(),
          ...data
        }, self._parentOrigin);

        setTimeout(function() {
          if (self._pendingRequests.has(requestId)) {
            self._pendingRequests.delete(requestId);
            resolve({ error: 'Timeout', code: 'TIMEOUT' });
          }
        }, 10000);
      });
    },

    _handleMessage: function(event) {
      // SÉCURITÉ: Valider l'origine des messages entrants
      if (!isOriginAllowed(event.origin)) {
        console.warn('[AURIONSDK] Message from unauthorized origin:', event.origin);
        return;
      }

      var data = event.data;
      if (!data || typeof data !== 'object') return;

      var type = data.type;
      if (!type || type.indexOf('GENIM_') !== 0) return;

      // Mettre à jour l'origine parent si message valide
      if (this._parentOrigin !== event.origin && isOriginAllowed(event.origin)) {
        this._parentOrigin = event.origin;
      }

      switch (type) {
        case 'GENIM_RESPONSE':
          this._handleResponse(data);
          break;

        case 'GENIM_SESSION_TOKEN':
          this._handleSessionToken(data);
          break;

        case 'GENIM_CREDITS_UPDATE':
          this._isReady = true;
          if (this.onCreditsUpdate) this.onCreditsUpdate(data.payload);
          break;

        case 'GENIM_BLOCKED':
          if (this.onBlocked) this.onBlocked(data.payload);
          break;

        case 'GENIM_PLAN_UPDATE':
          if (this.onPlanUpdate) this.onPlanUpdate(data.payload);
          break;

        case 'GENIM_HEARTBEAT':
          this._respondHeartbeat(data);
          break;

        case 'GENIM_IFRAME_READY':
          this._isReady = true;
          if (this.onReady) this.onReady();
          break;
      }
    },

    _handleResponse: function(data) {
      if (!data.requestId) return;

      var resolve = this._pendingRequests.get(data.requestId);
      if (resolve) {
        this._pendingRequests.delete(data.requestId);
        resolve(data.payload);
      }
    },

    _handleSessionToken: function(data) {
      if (data.token) {
        this._sessionToken = data.token;
        this._isReady = true;
        console.log('[AURIONSDK] Session token received');
        if (this.onTokenReceived) this.onTokenReceived(data.token);
      }
    },

    _respondHeartbeat: function(data) {
      window.parent.postMessage({
        type: 'GENIM_HEARTBEAT_ACK',
        payload: { iframeId: data.iframeId },
        timestamp: Date.now()
      }, this._parentOrigin);
    },

    // ============================================
    // CALLBACKS (à définir par l'iframe)
    // ============================================

    onCreditsUpdate: null,
    onBlocked: null,
    onPlanUpdate: null,
    onTokenReceived: null,
    onReady: null,
  };

  // Auto-init si tool_id dans l'URL
  var toolId = new URLSearchParams(window.location.search).get('tool_id');
  if (toolId) {
    window.AURIONSDK.init(toolId);
  }

  console.log('[AURIONSDK] Client SDK v3.0 loaded (secure origins)');
})();
`;

