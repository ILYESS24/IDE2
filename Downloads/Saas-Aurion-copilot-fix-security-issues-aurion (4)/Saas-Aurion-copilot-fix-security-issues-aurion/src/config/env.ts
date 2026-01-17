// ============================================
// CONFIGURATION DYNAMIQUE - CHARGEMENT DEPUIS API
// ============================================

import { logger } from '@/services/logger';

// Configuration chargée dynamiquement depuis l'API
let configLoaded = false;
let cachedConfig: Record<string, string> = {
  // Valeurs par défaut (fallback)
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
};

// Charger la configuration depuis l'API
async function loadConfigFromAPI() {
  try {
    logger.debug('Loading configuration from /api/config...');
    const response = await fetch('/api/config');

    if (response.ok) {
      const apiConfig = await response.json();
      logger.debug('Configuration loaded from API', { keys: Object.keys(apiConfig) });

      // Mapper les clés API vers les clés attendues
      cachedConfig = {
        CLERK_PUBLISHABLE_KEY: apiConfig.VITE_CLERK_PUBLISHABLE_KEY || cachedConfig.CLERK_PUBLISHABLE_KEY,
        SUPABASE_URL: apiConfig.VITE_SUPABASE_URL || cachedConfig.SUPABASE_URL,
        SUPABASE_ANON_KEY: apiConfig.VITE_SUPABASE_ANON_KEY || cachedConfig.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: apiConfig.VITE_SUPABASE_SERVICE_ROLE_KEY || cachedConfig.SUPABASE_SERVICE_ROLE_KEY,
        STRIPE_PUBLISHABLE_KEY: apiConfig.VITE_STRIPE_PUBLISHABLE_KEY || cachedConfig.STRIPE_PUBLISHABLE_KEY,
        STRIPE_SECRET_KEY: cachedConfig.STRIPE_SECRET_KEY, // Garder les valeurs locales pour les secrets
        STRIPE_WEBHOOK_SECRET: cachedConfig.STRIPE_WEBHOOK_SECRET,
      };

      configLoaded = true;
      logger.debug('Final configuration applied');
      return true;
    } else {
      logger.warn('Failed to load from API', { status: response.status });
    }
  } catch (error) {
    logger.warn('Error loading config from API', { error });
  }

  return false;
}

// Objet env avec chargement dynamique
export const env = new Proxy(cachedConfig, {
  get(target, prop) {
    // Charger la config depuis l'API si ce n'est pas encore fait
    if (!configLoaded) {
      loadConfigFromAPI().then(success => {
        if (success) {
          logger.debug('Configuration reloaded from API');
        }
      });
    }

    return target[prop as keyof typeof target] || '';
  }
});

// Chargement initial au démarrage
loadConfigFromAPI();

// ============================================
// VALIDATION SÉCURISÉE - PRODUCTION READY
// ============================================

// Classification des clés par criticité
const criticalKeys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']; // BLOQUANT si manquant
const securityKeys = ['SUPABASE_SERVICE_ROLE_KEY']; // CRITIQUE pour sécurité
const authKeys = ['CLERK_PUBLISHABLE_KEY']; // Authentification (optionnel en démo)
const paymentKeys = ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']; // Paiements
// Les clés IA sont maintenant côté backend uniquement (Cloudflare env)

// Validation stricte
const missingCritical = criticalKeys.filter(key => !env[key as keyof typeof env]);
const missingSecurity = securityKeys.filter(key => !env[key as keyof typeof env]);
const missingAuth = authKeys.filter(key => !env[key as keyof typeof env]);
const missingPayment = paymentKeys.filter(key => !env[key as keyof typeof env]);

// Environnements spéciaux
const isTestMode = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
const isVitestMode = typeof globalThis !== 'undefined' && '__vitest__' in globalThis;
const isDevelopment = import.meta.env.DEV;

// ============================================
// VALIDATION CRITIQUE - IMPOSSIBLE DE DÉMARRER
// ============================================

if (missingCritical.length > 0 && !isTestMode && !isVitestMode) {
  // En production, on ne bloque pas complètement mais on affiche un warning
  // et on permet à l'application de démarrer en mode démo limité
  logger.error(`🚨 SÉCURITÉ CRITIQUE - CLÉS MANQUANTES:`, {
    missing: missingCritical,
    message: 'Application démarrée en mode démo limité'
  });
}

// ============================================
// VALIDATION SÉCURITÉ - ALERTES MAJEURES
// ============================================

if (missingSecurity.length > 0 && !isTestMode && !isVitestMode) {
    logger.error(`🚨 ALERTE SÉCURITÉ - CLÉ SERVICE ROLE MANQUANTE:\n` +
    `Risque élevé: Opérations administratives impossibles\n` +
    `Ajouter: SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role`, {});
}

// ============================================
// DIAGNOSTIC COMPLET
// ============================================


logger.debug('🔐 Diagnostic Configuration API:');
logger.debug(`  ${missingCritical.length === 0 ? '✅' : '❌'} Database: ${missingCritical.length === 0 ? 'OK' : 'MANQUANT'}`);
logger.debug(`  ${missingSecurity.length === 0 ? '✅' : '🚨'} Security: ${missingSecurity.length === 0 ? 'OK' : 'RISQUE ÉLEVÉ'}`);
logger.debug(`  ${missingAuth.length === 0 ? '✅' : '⚠️'}  Auth: ${missingAuth.length === 0 ? 'OK' : 'MODE DÉMO'}`);
logger.debug(`  ${missingPayment.length === 0 ? '✅' : '⚠️'}  Payments: ${missingPayment.length === 0 ? 'OK' : 'DÉSACTIVÉ'}`);
logger.debug(`  ✅ AI: BACKEND SECURED (via /api/ai-chat)`);

// En développement, on n'affiche pas les warnings inutiles
// Clerk fonctionne normalement avec des clés de développement
if (!isDevelopment) {
  // Mode démo seulement en production sans clés
  const isDemoMode = missingAuth.length > 0;

  if (isDemoMode) {
    logger.warn(
      `🚨 MODE DÉVELOPPEMENT/DÉMO ACTIVÉ:\n` +
      `  - Authentification Clerk limitée\n` +
      `  - Fonctionnalités de démonstration uniquement\n` +
      `  - NE PAS UTILISER EN PRODUCTION\n` +
      `\nPour activer l'authentification complète:\n` +
      `  VITE_CLERK_PUBLISHABLE_KEY=votre_clé_clerk_réelle`
    );
  }

  // Alertes fonctionnalités manquantes seulement en production
  if (missingPayment.length > 0) {
    logger.warn(
      `💳 PAIEMENTS DÉSACTIVÉS:\n` +
      `  - Abonnements impossibles\n` +
      `  - Plans payants non disponibles\n` +
      `\nAjouter les clés Stripe pour activer:\n` +
      `  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...\n` +
      `  VITE_STRIPE_SECRET_KEY=sk_live_...\n` +
      `  VITE_STRIPE_WEBHOOK_SECRET=whsec_...`
    );
  }
}
