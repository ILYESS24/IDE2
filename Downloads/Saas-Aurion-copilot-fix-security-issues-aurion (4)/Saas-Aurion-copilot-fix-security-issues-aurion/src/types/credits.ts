 
// Types pour le système de crédits et d'usage

export interface UserCredits {
  user_id: string;
  total_credits: number;
  used_credits: number;
  plan: 'free' | 'starter' | 'plus' | 'pro';
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
  metadata: {
    prompt?: string;
    model?: string;
    tokens_input?: number;
    tokens_output?: number;
    duration_ms?: number;
    success: boolean;
    error?: string;
  };
  created_at: string;
}

export interface UsageStats {
  today: {
    total_requests: number;
    credits_used: number;
    by_type: Record<UsageLog['action_type'], number>;
  };
  this_week: {
    total_requests: number;
    credits_used: number;
    by_type: Record<UsageLog['action_type'], number>;
    daily: { date: string; credits: number; requests: number }[];
  };
  this_month: {
    total_requests: number;
    credits_used: number;
    by_type: Record<UsageLog['action_type'], number>;
  };
  all_time: {
    total_requests: number;
    credits_used: number;
  };
}

// Coûts en crédits par action
export const CREDIT_COSTS: Record<UsageLog['action_type'], number> = {
  image_generation: 10,
  video_generation: 50,
  ai_chat: 1,
  code_generation: 5,
  agent_action: 2,
};

// Crédits par plan
export const PLAN_CREDITS: Record<UserCredits['plan'], number> = {
  free: 100,
  starter: 1000,
  plus: 5000,
  pro: 25000,
};
