/**
 * Access Control Service for AURION SaaS
 * 
 * Handles:
 * - Tool access verification
 * - Credit checking and consumption
 * - Usage limits (daily/monthly)
 * - Plan-based feature gating
 * 
 * @module access-control
 */

import { creditsService, planService, UserPlan } from './supabase-db';
import { logger } from '@/services/logger';
import { PLANS, TOOL_COSTS, ToolType, PlanType } from '@/types/plans';

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Result of an access check */
export interface AccessCheck {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly suggestedPlan?: PlanType;
  readonly creditsRequired?: number;
  readonly creditsAvailable?: number;
  readonly dailyRemaining?: number | null;
  readonly monthlyRemaining?: number | null;
}

/** Result of a credit usage operation */
export interface UsageResult {
  readonly success: boolean;
  readonly creditsUsed: number;
  readonly remainingCredits: number;
  readonly error?: string;
}

/** Result of a limit check */
interface LimitCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly dailyRemaining?: number;
  readonly monthlyRemaining?: number;
}

/** Result of a complete action (check + consume) */
export interface ActionResult {
  readonly allowed: boolean;
  readonly performed: boolean;
  readonly reason?: string;
  readonly creditsUsed: number;
  readonly remainingCredits: number;
}

/** Blockage information for UI display */
export interface BlockageInfo {
  readonly isBlocked: boolean;
  readonly reason: string;
  readonly suggestedAction?: string;
  readonly suggestedPlan?: PlanType;
}

/** Middleware access result */
export interface ToolAccessResult {
  readonly canAccess: boolean;
  readonly error?: string;
  readonly redirectTo?: string;
}

// ============================================
// SERVICE DE CONTRÔLE D'ACCÈS
// ============================================

export const accessControl = {
  /**
   * Checks if user can access a tool
   * @param toolType - The type of tool to check access for
   * @returns Access check result with detailed information
   */
  async checkAccess(toolType: ToolType | string): Promise<AccessCheck> {
    try {
      const [credits, plan] = await Promise.all([
        creditsService.getCredits(),
        planService.getCurrentPlan(),
      ]);

      if (!credits) {
        return {
          allowed: false,
          reason: 'User not found',
        };
      }

      // Check available credits
      const cost = TOOL_COSTS[toolType as ToolType] ?? 0;
      const availableCredits = credits.total_credits - credits.used_credits;

      if (availableCredits < cost) {
        return {
          allowed: false,
          reason: `Insufficient credits. ${cost} credits required, ${availableCredits} available.`,
          creditsRequired: cost,
          creditsAvailable: availableCredits,
          suggestedPlan: this.getSuggestedPlan(plan?.plan_type, toolType),
        };
      }

      // Check plan limits
      if (plan) {
        const planConfig = PLANS[plan.plan_type];
        const toolConfig = planConfig.features.find(f => f.tool === toolType);

        if (!toolConfig || !toolConfig.enabled) {
          return {
            allowed: false,
            reason: `Tool not available in your ${planConfig.name} plan`,
            suggestedPlan: this.getSuggestedPlan(plan.plan_type, toolType),
          };
        }

        // Check daily/monthly limits
        const limits = await this.checkUsageLimits(plan, toolType);
        if (!limits.allowed) {
          return {
            allowed: false,
            reason: limits.reason ?? 'Usage limit reached',
            creditsRequired: cost,
            creditsAvailable: availableCredits,
            suggestedPlan: this.getSuggestedPlan(plan.plan_type, toolType),
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error during access verification:', error);
      return {
        allowed: false,
        reason: 'Access verification error',
      };
    }
  },

  /**
   * Checks daily/monthly usage limits for a tool
   * Uses PostgreSQL function with row locking to prevent race conditions
   */
  async checkUsageLimits(plan: UserPlan, toolType: ToolType | string): Promise<LimitCheckResult> {
    try {
      const planConfig = PLANS[plan.plan_type];
      const toolConfig = planConfig.features.find(f => f.tool === toolType);

      if (!toolConfig) {
        return { allowed: false, reason: 'Tool configuration not found' };
      }

      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase');

      // Calculate date ranges
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      try {
        // Use PostgreSQL function with row locking for atomic limit check
        const { data: limitCheck, error } = await supabase.rpc('check_tool_limits', {
          p_user_id: plan.user_id,
          p_tool_type: toolType,
          p_today: today,
          p_current_month: currentMonth,
          p_daily_limit: toolConfig.dailyLimit ?? null,
          p_monthly_limit: toolConfig.monthlyLimit ?? null
        });

        if (error) {
          logger.error('Error checking tool limits:', error);
          return { allowed: false, reason: 'Limit verification error' };
        }

        if (!limitCheck.allowed) {
          return {
            allowed: false,
            reason: limitCheck.reason,
            dailyRemaining: limitCheck.daily_remaining,
            monthlyRemaining: limitCheck.monthly_remaining,
          };
        }

        return {
          allowed: true,
          dailyRemaining: limitCheck.daily_remaining,
          monthlyRemaining: limitCheck.monthly_remaining,
        };

      } catch (rpcError) {
        logger.error('RPC check_tool_limits failed:', rpcError);
        // Fallback: allow access on technical error but log for monitoring
        logger.warn('⚠️ Fallback limit check - RPC failed', { userId: plan.user_id, toolType });
        return { allowed: true };
      }

    } catch (error) {
      logger.error('Error checking usage limits:', error);
      // Deny access on error for security
      return { allowed: false, reason: 'Usage limit verification failed' };
    }
  },

  /**
   * Consumes credits for an action
   * @param toolType - The type of tool consuming credits
   * @param metadata - Additional metadata for the usage log
   */
  async consumeCredits(toolType: ToolType | string, metadata: Record<string, unknown> = {}): Promise<UsageResult> {
    try {
      const cost = TOOL_COSTS[toolType as ToolType] ?? 0;
      const result = await creditsService.useCredits(toolType, cost, metadata);

      return {
        success: result.success,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remaining,
        error: result.error,
      };
    } catch (error) {
      logger.error('Error during credit consumption:', error);
      return {
        success: false,
        creditsUsed: 0,
        remainingCredits: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Checks if user can perform an action without consuming credits
   * @param toolType - The type of tool to check
   */
  async canPerformAction(toolType: ToolType | string): Promise<boolean> {
    const check = await this.checkAccess(toolType);
    return check.allowed;
  },

  /**
   * Performs a complete action: verification + consumption
   * @param toolType - The type of tool
   * @param metadata - Additional metadata for logging
   */
  async performAction(toolType: ToolType | string, metadata: Record<string, unknown> = {}): Promise<ActionResult> {
    const accessCheck = await this.checkAccess(toolType);

    if (!accessCheck.allowed) {
      return {
        allowed: false,
        performed: false,
        reason: accessCheck.reason,
        creditsUsed: 0,
        remainingCredits: accessCheck.creditsAvailable ?? 0,
      };
    }

    const usageResult = await this.consumeCredits(toolType, metadata);

    // Emit real-time notification if credits exhausted
    if (usageResult.success && usageResult.remainingCredits === 0) {
      await this.notifyCreditsExhausted(toolType, metadata);
    }

    return {
      allowed: true,
      performed: usageResult.success,
      reason: usageResult.error,
      creditsUsed: usageResult.creditsUsed,
      remainingCredits: usageResult.remainingCredits,
    };
  },

  /**
   * Notifies that user credits are exhausted (private helper)
   */
  async notifyCreditsExhausted(toolType: ToolType | string, lastAction: Record<string, unknown>): Promise<void> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('usage_logs')
          .insert([{
            user_id: user.id,
            action_type: 'credits_exhausted',
            credits_used: 0,
            metadata: {
              tool_used: toolType,
              last_action: lastAction,
              exhausted_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
          }]);
      }
    } catch (error) {
      logger.warn('Error notifying exhausted credits:', error);
    }
  },

  /**
   * Suggests a higher plan to access a tool
   * @param currentPlan - User's current plan type
   * @param toolType - The tool they're trying to access
   * @returns Suggested plan type or undefined if no upgrade available
   */
  getSuggestedPlan(currentPlan: PlanType | string | undefined, toolType: ToolType | string): PlanType | undefined {
    const planHierarchy: PlanType[] = ['free', 'starter', 'plus', 'pro', 'enterprise'];
    const currentIndex = currentPlan ? planHierarchy.indexOf(currentPlan as PlanType) : 0;

    // Find the first plan that allows this tool
    for (let i = currentIndex + 1; i < planHierarchy.length; i++) {
      const planType = planHierarchy[i];
      const planConfig = PLANS[planType];
      const toolConfig = planConfig.features.find(f => f.tool === toolType);

      if (toolConfig?.enabled) {
        return planType;
      }
    }

    return undefined;
  },

  /**
   * Checks if user has exhausted all credits
   */
  async hasCreditsExhausted(): Promise<boolean> {
    try {
      const credits = await creditsService.getCredits();
      if (!credits) return true;
      return credits.total_credits - credits.used_credits <= 0;
    } catch {
      return true;
    }
  },

  /**
   * Gets blockage information for user display
   */
  async getBlockageInfo(): Promise<BlockageInfo> {
    const creditsExhausted = await this.hasCreditsExhausted();

    if (creditsExhausted) {
      return {
        isBlocked: true,
        reason: 'Vous avez épuisé vos 100 crédits d\'essai gratuit',
        suggestedAction: 'Abonnez-vous à un plan payant pour continuer à utiliser nos outils',
        suggestedPlan: 'starter',
      };
    }

    return {
      isBlocked: false,
      reason: 'Accès autorisé',
    };
  },
};

// ============================================
// MIDDLEWARE POUR LES OUTILS
// ============================================

/**
 * Middleware for tool access control
 * Use before opening tools and after tool usage
 */
export const toolMiddleware = {
  /**
   * Pre-access middleware - checks if user can access a tool
   * @param toolType - The type of tool to check
   * @returns Access result with error and redirect info
   */
  async beforeToolAccess(toolType: ToolType | string): Promise<ToolAccessResult> {
    const accessCheck = await accessControl.checkAccess(toolType);

    if (!accessCheck.allowed) {
      return {
        canAccess: false,
        error: accessCheck.reason,
        redirectTo: `/dashboard?error=access_denied&tool=${encodeURIComponent(toolType)}`,
      };
    }

    return { canAccess: true };
  },

  /**
   * Post-usage middleware - consumes credits after tool usage
   * @param toolType - The type of tool used
   * @param metadata - Additional metadata for logging
   * @returns Success status
   */
  async afterToolUsage(toolType: ToolType | string, metadata: Record<string, unknown> = {}): Promise<boolean> {
    try {
      const result = await accessControl.consumeCredits(toolType, metadata);
      return result.success;
    } catch (error) {
      logger.error('Error during credit consumption:', error);
      return false;
    }
  },
};
