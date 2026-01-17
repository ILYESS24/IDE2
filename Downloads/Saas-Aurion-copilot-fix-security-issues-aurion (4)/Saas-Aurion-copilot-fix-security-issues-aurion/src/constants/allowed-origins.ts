// ============================================
// ORIGINES AUTORISÉES POUR IFRAMES
// SOURCE UNIQUE DE VÉRITÉ - PAS DE DUPLICATION
// ============================================
// Toutes les origines iframe doivent être déclarées ici
// et importées depuis les autres fichiers

export const ALLOWED_IFRAME_ORIGINS: string[] = [
  'https://aurion-app-v2.pages.dev',
  'https://790d4da4.ai-assistant-xlv.pages.dev',
  'https://flo-1-2ba8.onrender.com',
  'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
  'https://1bf06947.aieditor.pages.dev',
];

export const DEVELOPMENT_ORIGINS: string[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
];

// CORS allowed origins for API
export const CORS_ALLOWED_ORIGINS: string[] = [
  'https://aurion.app',
  'https://www.aurion.app',
  'https://genim.app',
  'https://www.genim.app',
  'https://aurion-saas.pages.dev',
];

/**
 * Safely compares origins using exact matching
 * Normalizes origins by removing trailing slashes for comparison
 */
function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

/**
 * Helper function to check if origin is allowed
 * Uses exact matching to prevent subdomain attacks
 */
export function isOriginAllowed(origin: string | null, isDevelopment: boolean = false): boolean {
  if (!origin) return false;
  
  const normalizedOrigin = normalizeOrigin(origin);
  
  // Check production iframe origins (exact match)
  if (ALLOWED_IFRAME_ORIGINS.some(allowed => normalizeOrigin(allowed) === normalizedOrigin)) {
    return true;
  }
  
  // Check CORS origins (exact match)
  if (CORS_ALLOWED_ORIGINS.some(allowed => normalizeOrigin(allowed) === normalizedOrigin)) {
    return true;
  }
  
  // Check development origins (exact match only in development)
  if (isDevelopment && DEVELOPMENT_ORIGINS.some(allowed => normalizeOrigin(allowed) === normalizedOrigin)) {
    return true;
  }
  
  return false;
}
