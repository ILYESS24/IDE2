 
// ============================================
// PLANS SYSTEM - PRODUCTION READY
// ============================================

export type PlanType = 'free' | 'starter' | 'plus' | 'pro' | 'enterprise';

export type ToolType = 
  | 'image_generation'
  | 'video_generation'
  | 'code_generation'
  | 'ai_chat'
  | 'agent_builder'
  | 'app_builder'
  | 'website_builder'
  | 'text_editor';

export interface PlanFeature {
  tool: ToolType;
  enabled: boolean;
  dailyLimit: number | null; // null = illimité
  monthlyLimit: number | null;
  priority: 'low' | 'normal' | 'high' | 'realtime';
  quality: 'standard' | 'hd' | 'ultra';
  description: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number; // Prix mensuel en USD
  yearlyPrice: number; // Prix annuel
  credits: number; // Crédits mensuels
  features: PlanFeature[];
  benefits: string[];
  recommended?: boolean;
  color: string;
}

export interface UserPlan {
  userId: string;
  planId: PlanType;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  creditsUsedThisPeriod: number;
  dailyUsage: Record<ToolType, number>;
  monthlyUsage: Record<ToolType, number>;
  lastResetDate: string;
}

export interface UsageCheck {
  allowed: boolean;
  reason?: string;
  remainingCredits: number;
  dailyRemaining: number | null;
  monthlyRemaining: number | null;
  suggestedPlan?: PlanType;
}

// ============================================
// PLAN DEFINITIONS - CONSISTENT AND PRECISE
// ============================================

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    credits: 100,
    color: 'gray',
    benefits: [
      '100 credits/month',
      'Basic image generation',
      'Limited AI chat',
      'Discord community',
    ],
    features: [
      { tool: 'image_generation', enabled: true, dailyLimit: 5, monthlyLimit: 20, priority: 'low', quality: 'standard', description: '512x512 images' },
      { tool: 'video_generation', enabled: false, dailyLimit: 0, monthlyLimit: 0, priority: 'low', quality: 'standard', description: 'Not available' },
      { tool: 'code_generation', enabled: true, dailyLimit: 10, monthlyLimit: 50, priority: 'low', quality: 'standard', description: 'Basic code' },
      { tool: 'ai_chat', enabled: true, dailyLimit: 20, monthlyLimit: 100, priority: 'low', quality: 'standard', description: 'GPT-3.5 only' },
      { tool: 'agent_builder', enabled: false, dailyLimit: 0, monthlyLimit: 0, priority: 'low', quality: 'standard', description: 'Not available' },
      { tool: 'app_builder', enabled: false, dailyLimit: 0, monthlyLimit: 0, priority: 'low', quality: 'standard', description: 'Not available' },
      { tool: 'website_builder', enabled: false, dailyLimit: 0, monthlyLimit: 0, priority: 'low', quality: 'standard', description: 'Not available' },
      { tool: 'text_editor', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'low', quality: 'standard', description: 'Basic editor' },
    ],
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    yearlyPrice: 90,
    credits: 1000,
    color: 'green',
    benefits: [
      '1,000 credits/month',
      'HD images (1024x1024)',
      'Short videos (15s)',
      'GPT-4 AI chat',
      'Email support',
    ],
    features: [
      { tool: 'image_generation', enabled: true, dailyLimit: 20, monthlyLimit: 100, priority: 'normal', quality: 'hd', description: 'Images 1024x1024' },
      { tool: 'video_generation', enabled: true, dailyLimit: 3, monthlyLimit: 15, priority: 'normal', quality: 'standard', description: 'Vidéos 15s, 720p' },
      { tool: 'code_generation', enabled: true, dailyLimit: 30, monthlyLimit: 200, priority: 'normal', quality: 'hd', description: 'Code assisté GPT-4' },
      { tool: 'ai_chat', enabled: true, dailyLimit: 50, monthlyLimit: 500, priority: 'normal', quality: 'hd', description: 'GPT-4 + Claude' },
      { tool: 'agent_builder', enabled: true, dailyLimit: 5, monthlyLimit: 20, priority: 'low', quality: 'standard', description: 'Agents basiques' },
      { tool: 'app_builder', enabled: false, dailyLimit: 0, monthlyLimit: 0, priority: 'low', quality: 'standard', description: 'Non disponible' },
      { tool: 'website_builder', enabled: true, dailyLimit: 2, monthlyLimit: 5, priority: 'low', quality: 'standard', description: 'Sites simples' },
      { tool: 'text_editor', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'normal', quality: 'hd', description: 'Éditeur IA' },
    ],
  },
  
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 29,
    yearlyPrice: 290,
    credits: 5000,
    color: 'blue',
    recommended: true,
    benefits: [
      '5,000 credits/month',
      'Ultra HD images (2048x2048)',
      'Long videos (60s, 1080p)',
      'All AI models',
      'Advanced AI agents',
      'App Builder',
      'Priority support',
    ],
    features: [
      { tool: 'image_generation', enabled: true, dailyLimit: 50, monthlyLimit: 500, priority: 'high', quality: 'ultra', description: 'Images 2048x2048' },
      { tool: 'video_generation', enabled: true, dailyLimit: 10, monthlyLimit: 50, priority: 'high', quality: 'hd', description: 'Vidéos 60s, 1080p' },
      { tool: 'code_generation', enabled: true, dailyLimit: 100, monthlyLimit: null, priority: 'high', quality: 'ultra', description: 'Tous langages, debug IA' },
      { tool: 'ai_chat', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'high', quality: 'ultra', description: 'Tous modèles premium' },
      { tool: 'agent_builder', enabled: true, dailyLimit: 20, monthlyLimit: 100, priority: 'high', quality: 'hd', description: 'Agents autonomes' },
      { tool: 'app_builder', enabled: true, dailyLimit: 5, monthlyLimit: 20, priority: 'normal', quality: 'hd', description: 'Apps mobiles' },
      { tool: 'website_builder', enabled: true, dailyLimit: 10, monthlyLimit: 50, priority: 'high', quality: 'hd', description: 'Sites pro' },
      { tool: 'text_editor', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'high', quality: 'ultra', description: 'Éditeur IA avancé' },
    ],
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    yearlyPrice: 990,
    credits: 25000,
    color: 'purple',
    benefits: [
      '25,000 credits/month',
      'Maximum quality on everything',
      '4K videos, unlimited duration',
      'Dedicated GPU (real-time priority)',
      'Full API access',
      'Unlimited AI agents',
      '24/7 support',
      'White-label possible',
    ],
    features: [
      { tool: 'image_generation', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Images 4K+, batch' },
      { tool: 'video_generation', enabled: true, dailyLimit: null, monthlyLimit: 200, priority: 'realtime', quality: 'ultra', description: 'Vidéos 4K, 5min' },
      { tool: 'code_generation', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Code complet, refactoring' },
      { tool: 'ai_chat', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Tous modèles, contexte long' },
      { tool: 'agent_builder', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Agents autonomes illimités' },
      { tool: 'app_builder', enabled: true, dailyLimit: null, monthlyLimit: 100, priority: 'realtime', quality: 'ultra', description: 'Apps full-stack' },
      { tool: 'website_builder', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Sites illimités' },
      { tool: 'text_editor', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Éditeur complet' },
    ],
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    yearlyPrice: 4990,
    credits: 100000,
    color: 'gold',
    benefits: [
      '100,000+ credits/month',
      'Dedicated infrastructure',
      '99.9% SLA guaranteed',
      'Dedicated account manager',
      'Team training',
      'Custom integrations',
      'Security audit',
      'Enterprise billing',
    ],
    features: [
      { tool: 'image_generation', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'video_generation', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'code_generation', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'ai_chat', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'agent_builder', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'app_builder', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'website_builder', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
      { tool: 'text_editor', enabled: true, dailyLimit: null, monthlyLimit: null, priority: 'realtime', quality: 'ultra', description: 'Illimité' },
    ],
  },
};

// ============================================
// CENTRALIZED TOOL CONFIGURATION - SINGLE SOURCE OF TRUTH
// ============================================

// API tool costs (underscore format)
export const TOOL_COSTS: Record<ToolType, number> = {
  image_generation: 10,
  video_generation: 50,
  code_generation: 5,
  ai_chat: 1,
  agent_builder: 20,
  app_builder: 100,
  website_builder: 50,
  text_editor: 0, // Free
};

// Iframe tool costs (hyphenated format)
export const IFRAME_TOOL_COSTS: Record<string, number> = {
  'app-builder': 50,
  'website-builder': 50,
  'ai-agents': 30,
  'text-editor': 5,
  'code-editor': 10,
  'content-generator': 15,
};

// Combined tool costs supporting both formats
export const ALL_TOOL_COSTS: Record<string, number> = {
  ...TOOL_COSTS,
  ...IFRAME_TOOL_COSTS,
};

// Tool URLs for iframe embedding
export const TOOL_URLS: Record<string, string> = {
  'app-builder': 'https://aurion-app-v2.pages.dev/',
  'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'ai-agents': 'https://flo-1-2ba8.onrender.com',
  'text-editor': 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
  'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
};

// Display labels
export const TOOL_LABELS: Record<ToolType, string> = {
  image_generation: 'AI Images',
  video_generation: 'AI Videos',
  code_generation: 'AI Code',
  ai_chat: 'AI Chat',
  agent_builder: 'AI Agents',
  app_builder: 'App Builder',
  website_builder: 'Site Builder',
  text_editor: 'Text Editor',
};

