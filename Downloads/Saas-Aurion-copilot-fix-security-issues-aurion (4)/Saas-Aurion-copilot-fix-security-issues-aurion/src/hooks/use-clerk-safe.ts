 
// Hook sécurisé qui gère le cas où Clerk n'est pas disponible
import { useClerk, useUser, useAuth } from '@clerk/clerk-react';
import { logger } from '@/services/logger';

// Vérifier si Clerk est correctement configuré
function isClerkEnabled(): boolean {
  // FORCE ACTIVATION CLERK POUR PRODUCTION
  return true;
}

// Interface pour le retour du hook
interface ClerkSafeReturn {
  openSignIn: () => void;
  openSignUp: () => void;
  user: ReturnType<typeof useUser>['user'] | null;
  signOut: () => Promise<void> | void;
  getToken: () => Promise<string | null>;
  loaded: boolean;
  session: unknown;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
}

// Valeurs mock pour le mode démo
const MOCK_VALUES: ClerkSafeReturn = {
  openSignIn: () => {
    logger.warn('Clerk not configured - Sign in unavailable');
  },
  openSignUp: () => {
    logger.warn('Clerk not configured - Sign up unavailable');
  },
  user: null,
  signOut: () => {
    logger.warn('Clerk not configured - Sign out unavailable');
  },
  getToken: async () => null,
  loaded: true,
  session: null,
  isLoaded: true,
  isSignedIn: false,
  userId: null,
};

// Hook principal - Appeler les hooks Clerk SEULEMENT si activé
export function useClerkSafe(): ClerkSafeReturn {
  const clerkEnabled = isClerkEnabled();

  // Si Clerk n'est pas activé, retourner mock values SANS appeler les hooks
  if (!clerkEnabled) {
    return MOCK_VALUES;
  }

  // SEULEMENT appeler les hooks Clerk quand activé
  const clerkResult = useClerk();
  const userResult = useUser();
  const authResult = useAuth();

  // Mode normal - utiliser les vraies valeurs Clerk
  return {
    openSignIn: () => clerkResult.openSignIn(),
    openSignUp: () => clerkResult.openSignUp(),
    user: userResult.user,
    signOut: () => clerkResult.signOut(),
    getToken: async () => {
      try {
        return await authResult.getToken();
      } catch {
        return null;
      }
    },
    loaded: clerkResult.loaded,
    session: clerkResult.session,
    isLoaded: authResult.isLoaded,
    isSignedIn: authResult.isSignedIn ?? false,
    userId: authResult.userId,
  };
}

// Export des utilitaires
export { isClerkEnabled };
