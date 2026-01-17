 
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useClerkSafe } from './use-clerk-safe';
import { useEffect, useCallback } from 'react';
import { dashboardService, DashboardStats } from '@/services/supabase-db';
import { logger } from '@/services/logger';
import { getSupabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// ============================================
// HOOK DASHBOARD AVEC TEMPS RÉEL
// PRODUCTION READY - PAS DE DONNÉES DÉMO
// ============================================

export function useDashboardStats() {
  const { user, isSignedIn } = useClerkSafe();

  return useQuery<DashboardStats | null>({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // Vérifier si Supabase est configuré avant de faire l'appel
      const { getSupabase } = await import('@/lib/supabase');
      if (!getSupabase()) {
        logger.warn('Dashboard stats skipped - Supabase not configured');
        return null;
      }
      return dashboardService.getDashboardStats();
    },
    staleTime: 1000 * 15, // 15 secondes - plus réactif
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 15, // Rafraîchir toutes les 15 secondes
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    networkMode: 'online',
    enabled: !!isSignedIn && !!user,
  });
}

// ============================================
// HOOK WEBSOCKET TEMPS RÉEL
// ============================================

export function useRealtimeDashboard() {
  const { user } = useClerkSafe();
  const isSignedIn = !!user;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Type for realtime event data
  interface RealtimeEventData {
    remaining_credits?: number;
    plan_type?: string;
    [key: string]: unknown;
  }

  const handleRealtimeUpdate = useCallback((eventType: string, data: RealtimeEventData) => {
    logger.debug('🔄 Événement temps réel:', { eventType, dataKeys: Object.keys(data) });

    // Invalider les caches appropriés
    switch (eventType) {
      case 'credits_consumed':
      case 'credits_exhausted':
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['user-plan'] });

        // Notification spéciale pour crédits épuisés
        if (eventType === 'credits_exhausted' || data.remaining_credits === 0) {
          toast({
            title: "🚨 Crédits épuisés !",
            description: "Vous avez utilisé tous vos crédits. Upgradez votre plan pour continuer.",
            variant: "destructive",
            duration: 8000, // Plus long pour attirer l'attention
          });
        }
        break;

      case 'subscription_created':
      case 'subscription_updated':
        queryClient.invalidateQueries({ queryKey: ['user-plan'] });
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

        toast({
          title: "Plan mis à jour",
          description: `Votre abonnement ${data.plan_type || 'nouveau'} est maintenant actif.`,
        });
        break;

      case 'payment_succeeded':
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

        toast({
          title: "Paiement réussi",
          description: "Vos crédits ont été ajoutés à votre compte.",
        });
        break;

      default:
        // Rafraîchir toutes les données pour les autres événements
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['user-plan'] });
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    }
  }, [queryClient, toast]);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      logger.warn('Supabase not configured - skipping real-time dashboard subscriptions');
      return;
    }

    logger.debug('🔌 Connexion WebSocket temps réel pour:', { userId: user.id });

    // S'abonner aux changements de crédits
    const creditsSubscription = supabaseClient
      .channel('user_credits_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('💰 Changement crédits détecté:', payload);
          handleRealtimeUpdate('credits_changed', payload.new);
        }
      )
      .subscribe();

    // S'abonner aux changements de plan
    const planSubscription = supabaseClient
      .channel('user_plans_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_plans',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('📋 Changement plan détecté:', payload);
          handleRealtimeUpdate(`subscription_${payload.eventType}`, payload.new);
        }
      )
      .subscribe();

    // S'abonner aux nouveaux logs d'usage
    const usageSubscription = supabaseClient
      .channel('usage_logs_changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'usage_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('📊 Nouvel usage détecté:', payload);
          handleRealtimeUpdate('usage_logged', payload.new);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      logger.debug('🔌 Déconnexion WebSocket');
      creditsSubscription.unsubscribe();
      planSubscription.unsubscribe();
      usageSubscription.unsubscribe();
    };
  }, [isSignedIn, user?.id, handleRealtimeUpdate]);

  return { isConnected: isSignedIn };
}

export function useUsageStats() {
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => dashboardService.getUsageStats(),
    staleTime: 1000 * 30, // 30 secondes (amélioré)
    refetchInterval: 1000 * 30, // Rafraîchir toutes les 30 secondes
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const stats = await dashboardService.getUsageStats();
      return stats.recentActivity.slice(0, limit);
    },
    staleTime: 1000 * 15, // 15 secondes pour activité récente
  });
}

// ============================================
// HOOK CRÉDITS
// ============================================

export function useCredits() {
  const { user } = useClerkSafe();
  const isSignedIn = !!user;

  return useQuery({
    queryKey: ['user-credits'],
    queryFn: () => import('@/services/supabase-db').then(m => m.creditsService.getCredits()),
    staleTime: 1000 * 15, // 15 secondes (amélioré)
    refetchInterval: 1000 * 30, // 30 secondes (amélioré)
    enabled: !!isSignedIn,
  });
}

// ============================================
// HOOK PLAN
// ============================================

export function useCurrentPlan() {
  return useQuery({
    queryKey: ['user-plan'],
    queryFn: () => import('@/services/supabase-db').then(m => m.planService.getCurrentPlan()),
    staleTime: 1000 * 30, // 30 secondes (amélioré)
    refetchInterval: 1000 * 30, // 30 secondes (amélioré)
  });
}
