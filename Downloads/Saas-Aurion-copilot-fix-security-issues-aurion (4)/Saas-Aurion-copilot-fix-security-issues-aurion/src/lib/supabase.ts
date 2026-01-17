import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/services/logger';

// ============================================
// SUPABASE CLIENT - PRODUCTION READY
// Handles both env vars and API config fallback
// ============================================

// Priority: env vars > API config > null
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// State
let supabaseUrl = VITE_SUPABASE_URL;
let supabaseKey = VITE_SUPABASE_ANON_KEY;
let supabaseClient: SupabaseClient | null = null;
let configLoaded = false;
let configLoadPromise: Promise<boolean> | null = null;

/**
 * Check if URL/key are valid (not placeholders)
 */
function isValidConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (url.includes('placeholder') || url.includes('dummy') || url.includes('test')) return false;
  if (key.includes('placeholder') || key.includes('dummy')) return false;
  if (key.length < 20) return false; // Supabase anon keys are long
  return url.startsWith('https://') && url.includes('.supabase.co');
}

/**
 * Initialize Supabase client with given credentials
 */
function initializeClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'aurion-saas/1.0.0',
      },
    },
  });
}

/**
 * Load config from API (fallback when env vars not available)
 */
async function loadSupabaseConfig(): Promise<boolean> {
  // Already have valid config from env
  if (isValidConfig(supabaseUrl, supabaseKey)) {
    if (!supabaseClient) {
      supabaseClient = initializeClient(supabaseUrl, supabaseKey);
    }
    configLoaded = true;
    logger.debug('Supabase initialized from environment variables');
    return true;
  }

  // Try API fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/config', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const config = await response.json();
      if (config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY) {
        if (isValidConfig(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY)) {
        supabaseUrl = config.VITE_SUPABASE_URL;
        supabaseKey = config.VITE_SUPABASE_ANON_KEY;
          supabaseClient = initializeClient(supabaseUrl, supabaseKey);
          configLoaded = true;
          logger.debug('Supabase initialized from API config');
        return true;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      logger.warn('Could not load Supabase config from API', { error: error.message });
    }
  }

  configLoaded = true; // Mark as loaded even if failed
  logger.warn('Supabase not configured - running in limited mode');
  return false;
}

// Start loading config immediately
configLoadPromise = loadSupabaseConfig();

// ============================================
// PUBLIC API
// ============================================

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return isValidConfig(supabaseUrl, supabaseKey) && supabaseClient !== null;
};

/**
 * Get Supabase client (null if not configured)
 * This is synchronous - assumes config is already loaded
 */
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return supabaseClient;
};

/**
 * Wait for Supabase config to be loaded, then get client
 * Use this when you need to ensure config is ready
 */
export const getSupabaseAsync = async (): Promise<SupabaseClient | null> => {
  if (configLoadPromise) {
    await configLoadPromise;
  }
  return getSupabase();
};

/**
 * Check if config has finished loading
 */
export const isConfigLoaded = (): boolean => configLoaded;

/**
 * Wait for config to be loaded
 */
export const waitForConfig = async (): Promise<boolean> => {
  if (configLoadPromise) {
    return await configLoadPromise;
  }
  return isSupabaseConfigured();
};

// For backwards compatibility - may be null!
export { supabaseClient as supabase };
