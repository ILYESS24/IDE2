 
// Credits Service - Frontend Integration
// This service is DEPRECATED - use @/services/supabase-db.creditsService instead
// Keeping for backwards compatibility only

import { creditsService as supabaseCreditsService } from '@/services/supabase-db';
import { logger } from '@/services/logger';

// Re-export the Supabase-based service as the main service
// This ensures all components that import from this file get the secure backend service

// Types for backwards compatibility
export interface UserCredits {
  user_id: string;
  total_credits: number;
  used_credits: number;
  plan: string;
  plan_credits_monthly: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action_type: 'image_generation' | 'video_generation' | 'ai_chat' | 'code_generation' | 'agent_action';
  credits_used: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Deprecated - use CREDIT_COSTS from @/types/credits instead
export const CREDIT_COSTS: Record<string, number> = {
  image_generation: 5,
  video_generation: 15,
  ai_chat: 1,
  code_generation: 2,
  agent_action: 3,
};

// Deprecated - use PLAN_CREDITS from @/types/credits instead
export const PLAN_CREDITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  plus: 5000,
  pro: 25000,
  enterprise: 100000,
};

// ============================================
// CREDIT SERVICE (WRAPPER FOR SUPABASE)
// ============================================

export const creditsService = {
  // Obtenir les crédits de l'utilisateur - BACKEND ONLY
  async getCredits(): Promise<UserCredits | null> {
    logger.warn('creditsService.getCredits() called - consider using supabase-db.creditsService directly');
    const credits = await supabaseCreditsService.getCredits();
    if (!credits) return null;
    
    // Map to old interface for backwards compatibility
    return {
      user_id: credits.user_id,
      total_credits: credits.total_credits,
      used_credits: credits.used_credits,
      plan: 'free', // Plan is managed separately now
      plan_credits_monthly: credits.total_credits,
      last_reset: credits.last_reset_date,
      created_at: credits.created_at,
      updated_at: credits.updated_at,
    };
  },

  // Obtenir les crédits disponibles
  async getAvailableCredits(): Promise<number> {
    const credits = await supabaseCreditsService.getCredits();
    if (!credits) return 0;
    return credits.total_credits - credits.used_credits;
  },

  // Vérifier si l'utilisateur a assez de crédits
  async hasEnoughCredits(actionType: string): Promise<boolean> {
    const cost = CREDIT_COSTS[actionType] || 1;
    return await supabaseCreditsService.hasEnoughCredits(actionType, cost);
  },

  // Utiliser des crédits (déduire) - BACKEND ATOMIC OPERATION
  async useCredits(actionType: string, metadata: Record<string, unknown> = {}): Promise<{
    success: boolean;
    creditsUsed: number;
    remaining: number;
    error?: string;
  }> {
    const cost = CREDIT_COSTS[actionType] || 1;
    return await supabaseCreditsService.useCredits(actionType, cost, metadata);
  },

  // Ajouter des crédits (achat, bonus, etc.)
  async addCredits(amount: number): Promise<UserCredits | null> {
    const result = await supabaseCreditsService.addCredits(amount, 'bonus');
    if (!result) return null;
    
    return {
      user_id: result.user_id,
      total_credits: result.total_credits,
      used_credits: result.used_credits,
      plan: 'free',
      plan_credits_monthly: result.total_credits,
      last_reset: result.last_reset_date,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  },

  // Logger une utilisation
  async logUsage(actionType: string, creditsUsed: number, metadata: Record<string, unknown> = {}): Promise<void> {
    await supabaseCreditsService.logUsage(actionType, creditsUsed, metadata);
  },

  // DEPRECATED: These methods are no longer supported
  // Changer de plan - use Stripe checkout instead
  upgradePlan(): never {
    throw new Error('upgradePlan() is deprecated. Use Stripe checkout instead.');
  },

  // DEPRECATED: Logs are stored in Supabase
  getUsageLogs(): never {
    throw new Error('getUsageLogs() is deprecated. Use dashboardService.getUsageStats() instead.');
  },

  // DEPRECATED: Stats are stored in Supabase  
  getUsageStats(): never {
    throw new Error('getUsageStats() is deprecated. Use dashboardService.getUsageStats() instead.');
  },

  // DEPRECATED: No reset in production - use Supabase admin
  resetAll(): never {
    throw new Error('resetAll() is not available in production.');
  },
};
