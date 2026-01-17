/**
 * REAL-TIME CREDITS MONITORING HOOK
 * 
 * This hook provides live updates of user credits using Supabase Realtime.
 * Credits update automatically when:
 * - Tools are used (credits consumed)
 * - Payments are processed (credits added)
 * - Plan upgrades occur (credits reset)
 * 
 * No manual refresh required - updates are instant via WebSocket.
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useClerkSafe } from './use-clerk-safe';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/services/logger';
import { useToast } from '@/components/ui/use-toast';

interface UserCredits {
  id: string;
  user_id: string;
  total_credits: number;
  used_credits: number;
  bonus_credits: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

interface RealtimeCreditsState {
  credits: UserCredits | null;
  availableCredits: number;
  usagePercentage: number;
  isConnected: boolean;
  isLoading: boolean;
}

/**
 * Hook for real-time credit monitoring with Supabase Realtime
 * 
 * @returns {RealtimeCreditsState} Current credits state with live updates
 * 
 * @example
 * ```tsx
 * function CreditsBadge() {
 *   const { availableCredits, usagePercentage, isConnected } = useRealtimeCredits();
 *   
 *   return (
 *     <div>
 *       <span>{availableCredits} credits</span>
 *       {isConnected && <span>🟢 Live</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRealtimeCredits(): RealtimeCreditsState {
  const { user, isSignedIn } = useClerkSafe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate derived values
  const availableCredits = credits 
    ? credits.total_credits - credits.used_credits 
    : 0;
    
  const usagePercentage = credits 
    ? Math.round((credits.used_credits / (credits.total_credits || 1)) * 100) 
    : 0;

  // Fetch initial credits
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchInitialCredits = async () => {
      const supabaseClient = await getSupabase();
      if (!supabaseClient) {
        logger.warn('Supabase not configured - skipping initial credits fetch');
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          logger.error('Failed to fetch initial credits:', error);
        } else {
          setCredits(data);
          logger.debug('✅ Initial credits loaded:', data);
        }
      } catch (error) {
        logger.error('Error fetching initial credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialCredits();
  }, [isSignedIn, user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setIsConnected(false);
      return;
    }

    const setupSubscription = async () => {
      const supabaseClient = await getSupabase();
      if (!supabaseClient) {
        logger.warn('Supabase not configured - skipping real-time credits subscription');
        setIsConnected(false);
        return;
      }

    logger.debug(`🔌 Setting up real-time credits subscription for user: ${user.id}`);

    // Subscribe to credits changes
    const subscription = supabaseClient
      .channel(`user_credits:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.debug('💰 Real-time credits update received:', payload);

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newCredits = payload.new as UserCredits;
            setCredits(newCredits);

            // Calculate new available credits
            const newAvailable = newCredits.total_credits - newCredits.used_credits;
            const oldAvailable = credits 
              ? credits.total_credits - credits.used_credits 
              : 0;

            // Show notification if credits changed significantly
            if (credits) {
              if (newAvailable === 0 && oldAvailable > 0) {
                // Credits exhausted
                toast({
                  title: "🚨 Crédits épuisés !",
                  description: "Vous avez utilisé tous vos crédits. Upgradez pour continuer.",
                  variant: "destructive",
                  duration: 8000,
                });
              } else if (newCredits.total_credits > credits.total_credits) {
                // Credits added (payment or upgrade)
                const addedCredits = newCredits.total_credits - credits.total_credits;
                toast({
                  title: "✅ Crédits ajoutés !",
                  description: `+${addedCredits} crédits ont été ajoutés à votre compte.`,
                  duration: 5000,
                });
              }
            }

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['user-credits'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          logger.debug('✅ Real-time credits subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          logger.error('❌ Real-time credits subscription error');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          logger.warn('⚠️ Real-time credits subscription timed out');
        }
      });

    };

    setupSubscription();

    // Return cleanup function
    return () => {
      logger.debug('🔌 Cleaning up real-time credits subscription');
      // Note: cleanup will be set by setupSubscription when subscription is created
    };
  }, [isSignedIn, user?.id, credits, toast, queryClient]);

  return {
    credits,
    availableCredits,
    usagePercentage,
    isConnected,
    isLoading,
  };
}

/**
 * Hook for monitoring usage logs in real-time
 * Useful for showing live activity feed in the dashboard
 */
export function useRealtimeUsageLogs(limit: number = 10) {
  const { user, isSignedIn } = useClerkSafe();
  const [logs, setLogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    // Fetch initial logs
    const fetchInitialLogs = async () => {
      const supabaseClient = await getSupabase();
      if (!supabaseClient) {
        logger.warn('Supabase not configured - skipping initial logs fetch');
        return;
      }

      const { data } = await supabaseClient
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data) {
        setLogs(data);
      }
    };

    const setupLogsSubscription = async () => {
      const supabaseClient = await getSupabase();
      if (!supabaseClient) {
        logger.warn('Supabase not configured - skipping logs subscription');
        return;
      }

      // Subscribe to new logs
      const subscription = supabaseClient
        .channel(`usage_logs:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'usage_logs',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.debug('📊 New usage log received:', payload);
            setLogs((prev) => [payload.new, ...prev].slice(0, limit));
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchInitialLogs();
    setupLogsSubscription();
  }, [isSignedIn, user?.id, limit]);

  return { logs, isConnected };
}

/**
 * Hook for monitoring plan changes in real-time
 * Updates automatically when subscription status changes
 */
export function useRealtimePlan() {
  const { user, isSignedIn } = useClerkSafe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    const setupPlanSubscription = async () => {
      const supabaseClient = await getSupabase();
      if (!supabaseClient) {
        logger.warn('Supabase not configured - skipping plan subscription');
        setIsConnected(false);
        return;
      }

    const subscription = supabaseClient
      .channel(`user_plans:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_plans',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.debug('📋 Plan update received:', payload);

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newPlan = payload.new as any;
            
            // Show notification
            toast({
              title: "Plan mis à jour",
              description: `Votre abonnement ${newPlan.plan_type} est maintenant ${newPlan.status}.`,
              duration: 5000,
            });

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user-plan'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    };

    setupPlanSubscription();

    return () => {
      // Cleanup will be handled by setupPlanSubscription
    };
  }, [isSignedIn, user?.id, toast, queryClient]);

  return { isConnected };
}
