/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { creditsService, dashboardService } from '@/services/supabase-db';
import { useClerkSafe } from './use-clerk-safe';
import { useToast } from '@/components/ui/use-toast';
import { TOOL_COSTS } from '@/types/plans';

// ============================================
// HOOKS CRÉDITS - PRODUCTION READY (SUPABASE)
// ============================================

// Hook pour obtenir les crédits de l'utilisateur depuis Supabase
export function useCredits() {
  const _queryClient = useQueryClient();
  const { user, isSignedIn } = useClerkSafe();

  const { data: credits, isLoading, error, refetch } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: () => creditsService.getCredits(),
    staleTime: 1000 * 15, // 15 secondes
    refetchInterval: 1000 * 15, // Refresh toutes les 15 secondes
    enabled: !!isSignedIn && !!user,
  });

  const availableCredits = credits 
    ? credits.total_credits - credits.used_credits 
    : 0;

  const usagePercentage = credits 
    ? Math.round((credits.used_credits / (credits.total_credits || 1)) * 100) 
    : 0;

  return {
    credits,
    availableCredits,
    usagePercentage,
    isLoading,
    error,
    refetch,
  };
}

// Hook pour utiliser des crédits via Supabase (avec vérification serveur)
export function useConsumeCredits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useClerkSafe();

  const consumeCredits = useCallback(async (
    actionType: string,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!user) {
      return { success: false, creditsUsed: 0, remaining: 0, error: 'Not authenticated' };
    }

    const cost = TOOL_COSTS[actionType as keyof typeof TOOL_COSTS] || 0;
    const result = await creditsService.useCredits(actionType, cost, metadata);
    
    if (!result.success) {
      toast({
        title: "Crédits insuffisants",
        description: result.error,
        variant: "destructive",
      });
      return result;
    }

    // Invalider le cache pour forcer un refresh immédiat
    queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

    return result;
  }, [toast, queryClient, user]);

  const checkCredits = useCallback(async (actionType: string): Promise<boolean> => {
    const cost = TOOL_COSTS[actionType as keyof typeof TOOL_COSTS] || 0;
    return await creditsService.hasEnoughCredits(actionType, cost);
  }, []);

  const getCost = useCallback((actionType: string): number => {
    return TOOL_COSTS[actionType as keyof typeof TOOL_COSTS] || 0;
  }, []);

  return {
    consumeCredits,
    checkCredits,
    getCost,
  };
}

// Hook pour les statistiques d'utilisation depuis Supabase
export function useUsageStats() {
  const { user, isSignedIn } = useClerkSafe();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['usage-stats', user?.id],
    queryFn: async () => {
      const fullStats = await dashboardService.getUsageStats();
      return fullStats;
    },
    staleTime: 1000 * 15, // 15 secondes
    refetchInterval: 1000 * 30, // 30 secondes
    enabled: !!isSignedIn && !!user,
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

// Hook pour les logs d'utilisation depuis Supabase
export function useUsageLogs(limit = 50) {
  const { user, isSignedIn } = useClerkSafe();

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['usage-logs', user?.id, limit],
    queryFn: async () => {
      const stats = await dashboardService.getUsageStats();
      return stats.recentActivity.slice(0, limit);
    },
    staleTime: 1000 * 10, // 10 secondes
    enabled: !!isSignedIn && !!user,
  });

  return {
    logs: logs || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook pour upgrader le plan - REDIRIGE VERS STRIPE
export function useUpgradePlan() {
  const { toast } = useToast();

  const upgradePlan = useCallback(async (planId: string) => {
    toast({
      title: "Redirection vers le paiement",
      description: "Vous allez être redirigé vers Stripe pour finaliser votre abonnement.",
    });

    // La vraie logique d'upgrade passe par Stripe Checkout
    // Pas de modification directe du plan sans paiement
    window.location.href = `/pricing?upgrade=${planId}`;
    
    return { success: true };
  }, [toast]);

  return { upgradePlan };
}

// Hook pour ajouter des crédits via Supabase
export function useAddCredits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useClerkSafe();

  const addCredits = useCallback(async (amount: number, reason: string = 'bonus') => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return null;
    }

    const result = await creditsService.addCredits(amount, reason);
    
    toast({
      title: "Crédits ajoutés !",
      description: `+${amount} crédits ajoutés à votre compte.`,
    });

    queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    
    return result;
  }, [toast, queryClient, user]);

  return { addCredits };
}

