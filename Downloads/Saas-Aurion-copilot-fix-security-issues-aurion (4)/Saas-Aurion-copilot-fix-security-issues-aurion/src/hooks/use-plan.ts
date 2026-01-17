import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useClerkSafe } from './use-clerk-safe';
import { planService, creditsService, UserPlan as DBUserPlan } from '@/services/supabase-db';
import { accessControl } from '@/services/access-control';
import { PlanType, ToolType, PLANS, TOOL_LABELS, UsageCheck } from '@/types/plans';
import { useToast } from '@/components/ui/use-toast';

// ============================================
// HOOK: PLAN UTILISATEUR - PRODUCTION READY
// UTILISE CLERK + SUPABASE (PAS DE LOCALSTORAGE)
// ============================================

export function useUserPlan() {
  const { user, isSignedIn } = useClerkSafe();

  // ALWAYS call hooks unconditionally - React rules of hooks
  const { data: userPlan, isLoading, refetch } = useQuery<DBUserPlan | null>({
    queryKey: ['user-plan', user?.id],
    queryFn: () => planService.getCurrentPlan(),
    staleTime: 1000 * 10, // 10 secondes - rafraîchissement plus rapide
    refetchInterval: 1000 * 15, // 15 secondes
    enabled: !!isSignedIn && !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: () => creditsService.getCredits(),
    staleTime: 1000 * 10, // 10 secondes
    refetchInterval: 1000 * 15, // 15 secondes
    enabled: !!isSignedIn && !!user,
  });

  // SECURITY: If not signed in, return empty values - NO DEMO MODE IN PRODUCTION
  if (!isSignedIn || !user) {
    return {
      userPlan: null,
      credits: null,
      planDetails: null,
      creditsRemaining: 0,
      usagePercentage: 0,
      isLoading: false,
      refetch: () => Promise.resolve(),
      isAuthenticated: false,
    };
  }

  const planDetails = userPlan ? PLANS[userPlan.plan_type] : null;
  const creditsRemaining = credits ? credits.total_credits - credits.used_credits : 0;
  const usagePercentage = planDetails && credits
    ? Math.round((credits.used_credits / (credits.total_credits || 1)) * 100)
    : 0;

  return {
    userPlan,
    credits,
    planDetails,
    creditsRemaining,
    usagePercentage,
    isLoading,
    refetch,
    isAuthenticated: true,
    userId: user?.id,
  };
}

// ============================================
// HOOK: VÉRIFICATION D'ACCÈS
// ============================================

export function useToolAccess(tool: ToolType) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useClerkSafe();
  const isSignedIn = !!user;

  const [accessCheck, setAccessCheck] = useState<UsageCheck | null>(null);

  useEffect(() => {
    // If not signed in, access denied
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccessCheck({
        allowed: false,
        reason: 'User not logged in',
        remainingCredits: 0,
        dailyRemaining: null,
        monthlyRemaining: null,
        suggestedPlan: null,
      });
      return;
    }

    const checkAccess = async () => {
      try {
        const check = await accessControl.checkAccess(tool);
         
        setAccessCheck({
          allowed: check.allowed,
          reason: check.reason,
          remainingCredits: check.creditsAvailable || 0,
          dailyRemaining: check.dailyRemaining || null,
          monthlyRemaining: check.monthlyRemaining || null,
          suggestedPlan: check.suggestedPlan as PlanType,
        });
      } catch {
        // In case of error, access denied for security
         
        setAccessCheck({
          allowed: false,
          reason: 'Access verification error',
          remainingCredits: 0,
          dailyRemaining: null,
          monthlyRemaining: null,
          suggestedPlan: null,
        });
      }
    };
    checkAccess();
  }, [tool, isSignedIn]);

  const checkAndConsume = useCallback(async (metadata?: Record<string, unknown>): Promise<{
    success: boolean;
    error?: string;
    creditsUsed: number;
  }> => {
    const result = await accessControl.performAction(tool, metadata);

    if (!result.allowed) {
      toast({
        title: "Access denied",
        description: result.reason,
        variant: "destructive",
      });

      // Suggest upgrade if applicable
      if (result.reason?.includes('plan')) {
        const suggestedPlan = accessControl.getSuggestedPlan(undefined, tool);
        if (suggestedPlan) {
          toast({
            title: `Upgrade to ${PLANS[suggestedPlan].name} plan`,
            description: `Débloquez ${TOOL_LABELS[tool]} et bien plus.`,
          });
        }
      }

      return { success: false, error: result.reason, creditsUsed: 0 };
    }

    if (!result.performed) {
      toast({
        title: "Error",
        description: result.reason || "Error during usage",
        variant: "destructive",
      });
      return { success: false, error: result.reason, creditsUsed: 0 };
    }

    // Succès - invalider les caches
    queryClient.invalidateQueries({ queryKey: ['user-plan'] });
    queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    queryClient.invalidateQueries({ queryKey: ['usage-stats'] });

    // Mettre à jour l'état local
    const newCheck = await accessControl.checkAccess(tool);
    setAccessCheck({
      allowed: newCheck.allowed,
      reason: newCheck.reason,
      remainingCredits: newCheck.creditsAvailable || 0,
      dailyRemaining: newCheck.dailyRemaining || null,
      monthlyRemaining: newCheck.monthlyRemaining || null,
      suggestedPlan: newCheck.suggestedPlan as PlanType,
    });

    return {
      success: true,
      creditsUsed: result.creditsUsed,
    };
  }, [tool, toast, queryClient]);

  // Utility function to check access without consuming
  const canAccess = useCallback(async () => {
    return await accessControl.canPerformAction(tool);
  }, [tool]);

  return {
    accessCheck,
    checkAndConsume,
    canAccess,
    isAllowed: accessCheck?.allowed ?? false,
  };
}

// ============================================
// HOOK: ÉTAT DE TOUS LES OUTILS
// ============================================

// This function has been removed as it used the old localStorage system

// ============================================
// HOOK: UPGRADE DE PLAN
// ============================================

// Function removed - upgrades now go through Stripe

// ============================================
// HOOK: HISTORIQUE D'USAGE
// ============================================

// Function removed - use useDashboardStats instead

// ============================================
// HOOK: STATISTIQUES DÉTAILLÉES
// ============================================

// Function removed - use useDashboardStats instead

