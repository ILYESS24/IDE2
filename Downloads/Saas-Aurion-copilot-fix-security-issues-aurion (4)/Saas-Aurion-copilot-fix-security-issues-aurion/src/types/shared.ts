// ============================================
// SHARED TYPES - SINGLE SOURCE OF TRUTH
// Used by both frontend and backend (via copy)
// ============================================

// ============================================
// TOOL SYSTEM
// ============================================

export type ToolId = 
  | 'app-builder'
  | 'website-builder'
  | 'ai-agents'
  | 'text-editor'
  | 'code-editor'
  | 'content-generator';

export type ToolType = 
  | 'image_generation'
  | 'video_generation'
  | 'code_generation'
  | 'ai_chat'
  | 'agent_builder'
  | 'app_builder'
  | 'website_builder'
  | 'text_editor';

// Mapping between iframe tool IDs and internal tool types
export const TOOL_ID_TO_TYPE: Record<ToolId, ToolType> = {
  'app-builder': 'app_builder',
  'website-builder': 'website_builder',
  'ai-agents': 'agent_builder',
  'text-editor': 'text_editor',
  'code-editor': 'code_generation',
  'content-generator': 'ai_chat',
};

// Tool URLs - Single source of truth
export const TOOL_URLS: Readonly<Record<ToolId, string>> = {
  'app-builder': 'https://aurion-app-v2.pages.dev/',
  'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'ai-agents': 'https://flo-1-2ba8.onrender.com',
  'text-editor': 'https://1bf06947.aieditor.pages.dev',
  'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
};

// Tool costs by iframe ID
export const TOOL_COSTS_BY_ID: Readonly<Record<ToolId, number>> = {
  'app-builder': 50,
  'website-builder': 50,
  'ai-agents': 30,
  'text-editor': 5,
  'code-editor': 10,
  'content-generator': 15,
};

// Tool costs by type
export const TOOL_COSTS_BY_TYPE: Readonly<Record<ToolType, number>> = {
  image_generation: 10,
  video_generation: 50,
  code_generation: 5,
  ai_chat: 1,
  agent_builder: 20,
  app_builder: 100,
  website_builder: 50,
  text_editor: 0,
};

// Tool labels
export const TOOL_LABELS: Readonly<Record<ToolType, string>> = {
  image_generation: 'AI Images',
  video_generation: 'AI Videos',
  code_generation: 'AI Code',
  ai_chat: 'AI Chat',
  agent_builder: 'AI Agents',
  app_builder: 'App Builder',
  website_builder: 'Site Builder',
  text_editor: 'Text Editor',
};

// ============================================
// PLAN SYSTEM
// ============================================

export type PlanType = 'free' | 'starter' | 'plus' | 'pro' | 'enterprise';
export type PlanStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
export type QualityLevel = 'standard' | 'hd' | 'ultra';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'realtime';

export interface PlanFeature {
  readonly tool: ToolType;
  readonly enabled: boolean;
  readonly dailyLimit: number | null;
  readonly monthlyLimit: number | null;
  readonly priority: PriorityLevel;
  readonly quality: QualityLevel;
  readonly description: string;
}

export interface Plan {
  readonly id: PlanType;
  readonly name: string;
  readonly price: number;
  readonly yearlyPrice: number;
  readonly credits: number;
  readonly features: readonly PlanFeature[];
  readonly benefits: readonly string[];
  readonly recommended?: boolean;
  readonly color: string;
}

// ============================================
// USER TYPES
// ============================================

export interface UserCredits {
  readonly id: string;
  readonly user_id: string;
  readonly total_credits: number;
  readonly used_credits: number;
  readonly bonus_credits: number;
  readonly last_reset_date: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserPlan {
  readonly id: string;
  readonly user_id: string;
  readonly plan_type: PlanType;
  readonly status: PlanStatus;
  readonly stripe_subscription_id?: string;
  readonly stripe_customer_id?: string;
  readonly credits_monthly: number;
  readonly current_period_start: string;
  readonly current_period_end: string;
  readonly trial_ends_at?: string;
  readonly cancelled_at?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly full_name?: string;
  readonly avatar_url?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

// ============================================
// SESSION TYPES
// ============================================

export interface ToolSession {
  readonly id: string;
  readonly user_id: string;
  readonly tool_id: string;
  readonly credits_consumed: number;
  readonly session_token: string;
  readonly expires_at: string;
  readonly created_at: string;
  readonly is_active: boolean;
  readonly last_activity?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly code?: string;
}

export interface ToolAccessResponse {
  readonly sessionToken: string;
  readonly sessionId: string;
  readonly isReusedSession: boolean;
  readonly creditsConsumed: number;
  readonly iframeUrl: string;
  readonly isDemoMode?: boolean;
  readonly credits: {
    readonly total: number;
    readonly used: number;
    readonly remaining: number;
  };
  readonly plan: {
    readonly type: PlanType;
    readonly status: string;
  };
  readonly expiresAt: string;
}

export interface AccessCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly suggestedPlan?: PlanType;
  readonly creditsRequired?: number;
  readonly creditsAvailable?: number;
  readonly dailyRemaining?: number | null;
  readonly monthlyRemaining?: number | null;
}

// ============================================
// IFRAME BRIDGE TYPES
// ============================================

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
  | 'GENIM_IFRAME_READY'
  | 'GENIM_HEALTH_CHECK'
  | 'GENIM_HEALTH_CHECK_ACK'
  | 'GENIM_ACTION_COMPLETED'
  | 'GENIM_ERROR';

export interface IframeBridgeMessage {
  readonly type: IframeBridgeMessageType;
  readonly requestId?: string;
  readonly tool?: ToolType;
  readonly toolId?: ToolId;
  readonly payload?: unknown;
  readonly origin?: string;
  readonly timestamp?: number;
  readonly token?: string;
  readonly nonce?: string;
}

// ============================================
// USAGE LOGGING
// ============================================

export interface UsageLog {
  readonly id: string;
  readonly user_id: string;
  readonly action_type: string;
  readonly credits_used: number;
  readonly metadata: Record<string, unknown>;
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly created_at: string;
}

// ============================================
// HEALTH & METRICS
// ============================================

export interface HealthStatus {
  readonly isHealthy: boolean;
  readonly lastCheck: number;
  readonly latency: number | null;
  readonly consecutiveFailures: number;
}

export interface IframeMetrics {
  readonly toolId: string;
  readonly userId: string;
  readonly loadTime: number;
  readonly errorCount: number;
  readonly sessionDuration: number;
  readonly creditsConsumed: number;
  readonly timestamp: number;
  readonly origin: string;
  readonly userAgent: string;
}
