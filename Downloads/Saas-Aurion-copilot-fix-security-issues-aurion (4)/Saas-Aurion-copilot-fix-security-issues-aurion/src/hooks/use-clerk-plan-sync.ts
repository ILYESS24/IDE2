 
import { useEffect } from 'react';
import { useClerkSafe } from './use-clerk-safe';
import { logger } from '@/services/logger';
import { getSupabase } from '@/lib/supabase';

/**
 * Hook qui synchronise le plan de l'utilisateur avec Supabase via Clerk
 * S'exécute automatiquement dès qu'un utilisateur se connecte
 * NE MODIFIE PAS LE PLAN - Seulement sync initiale
 */
export function useClerkPlanSync() {
  const { user } = useClerkSafe();
  const isSignedIn = !!user;

  useEffect(() => {
    if (isSignedIn && user?.id) {
      logger.debug('🔐 Utilisateur connecté via Clerk', { userId: user.id });
      
      // Synchroniser avec Supabase pour créer le profil/plan si nécessaire
      // C'est géré par le trigger handle_new_user() dans Supabase
      // Ici on vérifie juste que la connexion fonctionne
      
      const syncWithSupabase = async () => {
        const supabaseClient = getSupabase();
        if (!supabaseClient) {
          logger.warn('Supabase not configured - skipping profile sync');
          return;
        }

        try {
          // Vérifier que l'utilisateur existe dans Supabase
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
            // Profil n'existe pas encore - sera créé automatiquement par le trigger
            logger.debug('✨ Nouveau profil sera créé par le trigger Supabase');
          } else if (profile) {
            logger.debug('📦 Profil existant trouvé', { profileId: profile.id });
          }
        } catch (error) {
          logger.warn('⚠️ Erreur sync Supabase:', error);
        }
      };
      
      syncWithSupabase();
    }
  }, [isSignedIn, user?.id]);
}

