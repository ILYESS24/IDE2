/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { logger } from '@/services/logger';
import { env } from '@/config/env';
import { getSupabase } from '@/lib/supabase';

// Vérifier si nous utilisons des clés de test/dummy
const isUsingDummyKeys = env.VITE_SUPABASE_URL?.includes('dummy') ||
                        env.VITE_SUPABASE_ANON_KEY?.includes('dummy') ||
                        env.VITE_SUPABASE_URL?.includes('test') ||
                        !env.VITE_SUPABASE_URL ||
                        !env.VITE_SUPABASE_ANON_KEY;

// Types pour la base de données
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: 'free' | 'starter' | 'plus' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  credits_monthly: number;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  // Propriétés calculées pour compatibilité
  planId?: 'free' | 'starter' | 'plus' | 'pro' | 'enterprise';
  creditsUsedThisPeriod?: number;
  monthlyUsage?: Record<string, number>;
}

export interface UserCredits {
  id: string;
  user_id: string;
  total_credits: number;
  used_credits: number;
  bonus_credits: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action_type: string;
  credits_used: number;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface StripeSession {
  id: string;
  user_id: string;
  session_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  completed_at?: string;
}

export interface DashboardStats {
  credits: {
    total: number;
    used: number;
    available: number;
  };
  plan: UserPlan;
  usageToday: {
    total_requests: number;
    credits_used: number;
    by_type: Record<string, number>;
  };
  usageThisWeek: {
    total_requests: number;
    credits_used: number;
    by_type: Record<string, number>;
    daily: Array<{ date: string; credits: number; requests: number }>;
  };
  usageThisMonth: {
    total_requests: number;
    credits_used: number;
    by_type: Record<string, number>;
  };
  recentActivity: UsageLog[];
}

// Client Supabase (utilise la fonction getSupabase pour éviter les conflits d'exports)

// ============================================
// GESTION DES PROFILS UTILISATEUR
// ============================================

export const profileService = {
  // Récupérer le profil de l'utilisateur par ID (pour Clerk sync)
  async getProfileById(userId: string): Promise<UserProfile | null> {
    if (isUsingDummyKeys) {
      // Retourner un profil mocké pour le développement
      return {
        id: userId,
        email: 'user@example.com',
        full_name: 'Test User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Récupérer le profil de l'utilisateur connecté
  async getCurrentProfile(): Promise<UserProfile | null> {
    if (isUsingDummyKeys) {
      // Retourner un profil mocké pour le développement
      return {
        id: 'user_36MAgv4kOPW7EkixqvgWjCnUPbA', // ID de test basé sur l'erreur
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Créer un nouveau profil utilisateur (pour les utilisateurs Clerk)
   * Cette fonction est cruciale pour les nouveaux utilisateurs car Clerk n'utilise pas Supabase Auth,
   * donc le trigger on_auth_user_created ne s'exécute jamais.
   */
  async createProfile(userId: string, email: string, fullName?: string, avatarUrl?: string): Promise<UserProfile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: email,
        full_name: fullName || email,
        avatar_url: avatarUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le profil
  async updateProfile(updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>): Promise<UserProfile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mettre à jour le profil par ID (pour Clerk sync)
   */
  async updateProfileById(userId: string, updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>): Promise<UserProfile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// GESTION DES PLANS UTILISATEUR
// ============================================

export const planService = {
  /**
   * Récupérer le plan actif par ID utilisateur (pour Clerk sync)
   */
  async getPlanById(userId: string): Promise<UserPlan | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Initialiser un plan gratuit pour un nouvel utilisateur (pour Clerk sync)
   */
  async initializePlan(userId: string): Promise<UserPlan> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('user_plans')
      .insert([{
        user_id: userId,
        plan_type: 'free',
        status: 'active',
        credits_monthly: 100,
        current_period_start: now.toISOString(),
        current_period_end: thirtyDaysFromNow.toISOString(),
        trial_ends_at: fourteenDaysFromNow.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer le plan actif de l'utilisateur
  async getCurrentPlan(): Promise<UserPlan | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Ajouter les propriétés de compatibilité
    if (data) {
      data.planId = data.plan_type;
      // Calculer les crédits utilisés cette période depuis les logs
      try {
        const periodStart = new Date(data.current_period_start);
        const { data: usageLogs, error: usageError } = await supabase
          .from('usage_logs')
          .select('credits_used, action_type')
          .eq('user_id', user.id)
          .gte('created_at', periodStart.toISOString());
        
        if (!usageError && usageLogs) {
          // Calculer le total des crédits utilisés cette période
          data.creditsUsedThisPeriod = usageLogs.reduce((sum, log) => sum + (log.credits_used || 0), 0);
          
          // Calculer l'usage mensuel par type d'action
          data.monthlyUsage = usageLogs.reduce((acc: Record<string, number>, log) => {
            const actionType = log.action_type || 'unknown';
            acc[actionType] = (acc[actionType] || 0) + (log.credits_used || 0);
            return acc;
          }, {});
        } else {
          data.creditsUsedThisPeriod = 0;
          data.monthlyUsage = {};
        }
      } catch {
        // Fallback if usage calculation fails
        data.creditsUsedThisPeriod = 0;
        data.monthlyUsage = {};
      }
    }

    return data;
  },

  // Mettre à jour le plan après paiement Stripe
  async updatePlan(planData: Partial<UserPlan>): Promise<UserPlan> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_plans')
      .update({ ...planData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau plan (upgrade)
  async createPlan(planData: Omit<UserPlan, 'id' | 'created_at' | 'updated_at'>): Promise<UserPlan> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('user_plans')
      .insert([{
        ...planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// GESTION DES CRÉDITS UTILISATEUR
// ============================================

/** Nombre de crédits gratuits pour les nouveaux utilisateurs */
const FREE_INITIAL_CREDITS = 100;

export const creditsService = {
  // Récupérer les crédits de l'utilisateur
  async getCredits(): Promise<UserCredits | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Récupérer les crédits par ID utilisateur (pour Clerk sync)
   */
  async getCreditsById(userId: string): Promise<UserCredits | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Initialiser les crédits pour un nouvel utilisateur (pour Clerk sync)
   * Crée une entrée avec 100 crédits gratuits
   */
  async initializeCredits(userId: string): Promise<UserCredits> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('user_credits')
      .insert([{
        user_id: userId,
        total_credits: FREE_INITIAL_CREDITS,
        used_credits: 0,
        bonus_credits: 0,
        last_reset_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Logger l'initialisation
    await this.logUsageById(userId, 'account_created', 0, { 
      initial_credits: FREE_INITIAL_CREDITS, 
      plan: 'free', 
      source: 'clerk_signup' 
    });

    return data;
  },

  /**
   * Logger un usage par ID utilisateur (pour Clerk sync)
   */
  async logUsageById(userId: string, actionType: string, creditsUsed: number, metadata: Record<string, unknown> = {}): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('usage_logs')
      .insert([{
        user_id: userId,
        action_type: actionType,
        credits_used: creditsUsed,
        metadata,
        ip_address: null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        created_at: new Date().toISOString(),
      }]);

    if (error) logger.error('Failed to log usage:', error);
  },

  // Vérifier si l'utilisateur a assez de crédits
  async hasEnoughCredits(actionType: string, cost: number): Promise<boolean> {
    const credits = await this.getCredits();
    if (!credits) return false;

    const available = credits.total_credits - credits.used_credits;
    return available >= cost;
  },

  // Utiliser des crédits
  async useCredits(actionType: string, cost: number, metadata: Record<string, any> = {}): Promise<{
    success: boolean;
    creditsUsed: number;
    remaining: number;
    error?: string;
  }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, creditsUsed: 0, remaining: 0, error: 'User not authenticated' };
    }

    try {
      // Utiliser une fonction PostgreSQL avec transaction atomique
      const { data, error } = await supabase.rpc('consume_user_credits', {
        p_user_id: user.id,
        p_cost: cost,
        p_action_type: actionType,
        p_metadata: metadata
      });

      if (error) {
        logger.error('RPC consume_user_credits error:', error);
        return {
          success: false,
          creditsUsed: 0,
          remaining: 0,
          error: error.message
        };
      }

      if (!data.success) {
        return {
          success: false,
          creditsUsed: 0,
          remaining: data.available_credits || 0,
          error: data.error_message
        };
      }

      return {
        success: true,
        creditsUsed: cost,
        remaining: data.remaining_credits,
      };

    } catch (error) {
      logger.error('Erreur consommation crédits:', error);
      return {
        success: false,
        creditsUsed: 0,
        remaining: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },

  // Ajouter des crédits (bonus, achat, etc.)
  async addCredits(amount: number, reason: string = 'bonus'): Promise<UserCredits> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const credits = await this.getCredits();
    if (!credits) throw new Error('Credits not found');

    const { data, error } = await supabase
      .from('user_credits')
      .update({
        total_credits: credits.total_credits + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Logger l'ajout
    await this.logUsage('credits_added', -amount, { reason, added: amount });

    return data;
  },

  // Logger un usage
  async logUsage(actionType: string, creditsUsed: number, metadata: Record<string, any> = {}): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('usage_logs')
      .insert([{
        user_id: user.id,
        action_type: actionType,
        credits_used: creditsUsed,
        metadata,
        ip_address: null, // Sera rempli côté serveur si nécessaire
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      }]);

    if (error) logger.error('Failed to log usage:', error);
  },
};

// ============================================
// GESTION DES SESSIONS STRIPE
// ============================================

export const stripeService = {
  // Créer une session Stripe
  // Note: successUrl et cancelUrl seront utilisés avec l'API Stripe réelle
  async createCheckoutSession(planType: string, _successUrl: string, _cancelUrl: string): Promise<StripeSession> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('stripe_sessions')
      .insert([{
        user_id: user.id,
        session_id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporaire
        plan_type: planType,
        amount: this.getPlanAmount(planType),
        currency: 'eur',
        status: 'pending',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'une session
  async updateSessionStatus(sessionId: string, status: 'completed' | 'cancelled' | 'expired', completedAt?: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('stripe_sessions')
      .update({
        status,
        completed_at: completedAt || (status === 'completed' ? new Date().toISOString() : undefined),
      })
      .eq('session_id', sessionId);

    if (error) throw error;
  },

  // Prix des plans (en centimes)
  getPlanAmount(planType: string): number {
    const prices: Record<string, number> = {
      starter: 900,    // 9€
      plus: 2900,      // 29€
      pro: 9900,       // 99€
      enterprise: 49900, // 499€
    };
    return prices[planType] || 0;
  },
};

// ============================================
// DASHBOARD ET STATISTIQUES
// ============================================

export const dashboardService = {
  // Récupérer toutes les stats du dashboard
  async getDashboardStats(): Promise<DashboardStats | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const [credits, plan, usageStats] = await Promise.all([
        creditsService.getCredits(),
        planService.getCurrentPlan(),
        this.getUsageStats(),
      ]);

      if (!credits || !plan) return null;

      return {
        credits: {
          total: credits.total_credits,
          used: credits.used_credits,
          available: credits.total_credits - credits.used_credits,
        },
        plan,
        ...usageStats,
      };
    } catch (error) {
      logger.error('Failed to get dashboard stats:', error);
      return null;
    }
  },

  // Récupérer les statistiques d'utilisation
  async getUsageStats(): Promise<Pick<DashboardStats, 'usageToday' | 'usageThisWeek' | 'usageThisMonth' | 'recentActivity'>> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    // Récupérer les logs d'utilisation
    const { data: logs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Calculer les statistiques
    const usageToday = this.calculateUsageForPeriod(logs, (log) =>
      log.created_at.startsWith(today)
    );

    const usageThisWeek = this.calculateUsageForPeriod(logs, (log) =>
      new Date(log.created_at) >= weekAgo
    );

    const usageThisMonth = this.calculateUsageForPeriod(logs, (log) =>
      new Date(log.created_at) >= monthAgo
    );

    // Données journalières pour la semaine
    const dailyData: Record<string, { credits: number; requests: number }> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { credits: 0, requests: 0 };
    }

    logs.forEach(log => {
      const logDate = log.created_at.split('T')[0];
      if (dailyData[logDate]) {
        dailyData[logDate].credits += log.credits_used;
        dailyData[logDate].requests++;
      }
    });

    const weekDaily = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      usageToday,
      usageThisWeek: { ...usageThisWeek, daily: weekDaily },
      usageThisMonth,
      recentActivity: logs.slice(0, 10),
    };
  },

  // Calculer les stats pour une période donnée
  calculateUsageForPeriod(logs: UsageLog[], filterFn: (log: UsageLog) => boolean) {
    const filteredLogs = logs.filter(filterFn);
    const byType: Record<string, number> = {};

    filteredLogs.forEach(log => {
      if (!byType[log.action_type]) byType[log.action_type] = 0;
      byType[log.action_type]++;
    });

    return {
      total_requests: filteredLogs.length,
      credits_used: filteredLogs.reduce((sum, log) => sum + log.credits_used, 0),
      by_type: byType,
    };
  },
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

export const dbHelpers = {
  // Tester la connexion à Supabase
  async testConnection(): Promise<boolean> {
    try {
      const supabase = getSupabase();
      if (!supabase) return false;

      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  // Vérifier si l'utilisateur est connecté
  async getCurrentUserId(): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },
};

// Note: supabase est exporté depuis src/lib/supabase.ts pour éviter les conflits d'exports
