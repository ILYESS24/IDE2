 
import { useEffect, useState, useRef } from 'react';
import { useClerkSafe } from './use-clerk-safe';
import { profileService, planService, creditsService } from '@/services/supabase-db';
import { logger } from '@/services/logger';

/**
 * Vérifie si une erreur est due à une clé dupliquée (profil/plan/crédits déjà existant)
 * PostgreSQL error code 23505 = unique_violation
 */
function isDuplicateKeyError(error: unknown): boolean {
  const errorMsg = error instanceof Error ? error.message : String(error);
  return errorMsg.includes('duplicate') || 
         errorMsg.includes('conflict') || 
         errorMsg.includes('23505') ||
         errorMsg.includes('unique');
}

/**
 * Hook qui synchronise l'utilisateur Clerk avec Supabase
 * Crée automatiquement le profil, plan et crédits (100 gratuits) lors de la première connexion
 * 
 * IMPORTANT: Comme l'app utilise Clerk (pas Supabase Auth), le trigger on_auth_user_created
 * ne s'exécute jamais. Ce hook doit donc créer explicitement toutes les données utilisateur.
 */
export function useClerkSync() {
  const { user } = useClerkSafe();
  const isSignedIn = !!user;
  const isLoaded = true;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Éviter les synchronisations multiples
  const syncAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    // Si Clerk n'est pas encore chargé, attendre
    if (!isLoaded) {
      return;
    }

    // Si l'utilisateur n'est pas connecté, pas de synchronisation nécessaire
    if (!isSignedIn) {
      setSyncError(null);
      setIsSyncing(false);
      syncAttemptedRef.current = null;
      return;
    }

    // Utilisateur connecté mais pas d'ID utilisateur ? Erreur
    if (!user?.id) {
      setSyncError('ID utilisateur manquant');
      setIsSyncing(false);
      return;
    }

    // Éviter les synchronisations répétées pour le même utilisateur
    if (syncAttemptedRef.current === user.id) {
      return;
    }

    const syncUser = async () => {
      try {
        setIsSyncing(true);
        setSyncError(null);
        syncAttemptedRef.current = user.id;

        logger.debug('🔄 Synchronisation utilisateur Clerk → Supabase', { 
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress 
        });

        // Étape 1: Vérifier/Créer le profil
        let existingProfile = null;
        try {
          existingProfile = await profileService.getProfileById(user.id);
        } catch (profileError) {
          logger.warn('⚠️ Erreur récupération profil', { error: profileError });
        }

        if (!existingProfile) {
          logger.debug('📝 Création du profil utilisateur (nouveau compte)...');
          
          const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
          if (!email) {
            throw new Error('Email utilisateur manquant - impossible de créer le profil');
          }

          try {
            await profileService.createProfile(
              user.id,
              email,
              user.fullName || undefined,
              user.imageUrl || undefined
            );
            logger.debug('✅ Profil créé');
          } catch (createError) {
            if (isDuplicateKeyError(createError)) {
              logger.debug('ℹ️ Profil déjà existant (conflit ignoré)');
            } else {
              throw createError;
            }
          }
        } else {
          logger.debug('✅ Profil existant trouvé');
          
          // Mettre à jour le profil si les infos ont changé
          try {
            const updates: { full_name?: string; avatar_url?: string } = {};
            if (user.fullName && user.fullName !== existingProfile.full_name) {
              updates.full_name = user.fullName;
            }
            if (user.imageUrl && user.imageUrl !== existingProfile.avatar_url) {
              updates.avatar_url = user.imageUrl;
            }
            if (Object.keys(updates).length > 0) {
              await profileService.updateProfileById(user.id, updates);
              logger.debug('✅ Profil mis à jour');
            }
          } catch (updateError) {
            logger.warn('⚠️ Impossible de mettre à jour le profil', { error: updateError });
          }
        }

        // Étape 2: Vérifier/Créer le plan
        let existingPlan = null;
        try {
          existingPlan = await planService.getPlanById(user.id);
        } catch (planError) {
          logger.warn('⚠️ Erreur récupération plan', { error: planError });
        }

        if (!existingPlan) {
          logger.debug('📝 Création du plan gratuit (100 crédits/mois)...');
          try {
            await planService.initializePlan(user.id);
            logger.debug('✅ Plan gratuit créé');
          } catch (planCreateError) {
            if (isDuplicateKeyError(planCreateError)) {
              logger.debug('ℹ️ Plan déjà existant (conflit ignoré)');
            } else {
              logger.warn('⚠️ Impossible de créer le plan', { error: planCreateError });
            }
          }
        } else {
          logger.debug('✅ Plan existant trouvé', { planType: existingPlan.plan_type });
        }

        // Étape 3: Vérifier/Créer les crédits (100 gratuits pour nouveaux utilisateurs)
        let existingCredits = null;
        try {
          existingCredits = await creditsService.getCreditsById(user.id);
        } catch (creditsError) {
          logger.warn('⚠️ Erreur récupération crédits', { error: creditsError });
        }

        if (!existingCredits) {
          logger.debug('📝 Initialisation des crédits (100 gratuits)...');
          try {
            const newCredits = await creditsService.initializeCredits(user.id);
            logger.debug('✅ Crédits initialisés', { 
              totalCredits: newCredits.total_credits,
              usedCredits: newCredits.used_credits 
            });
          } catch (creditsCreateError) {
            if (isDuplicateKeyError(creditsCreateError)) {
              logger.debug('ℹ️ Crédits déjà existants (conflit ignoré)');
            } else {
              logger.warn('⚠️ Impossible de créer les crédits', { error: creditsCreateError });
            }
          }
        } else {
          logger.debug('✅ Crédits existants trouvés', { 
            total: existingCredits.total_credits, 
            used: existingCredits.used_credits,
            available: existingCredits.total_credits - existingCredits.used_credits
          });
        }

        // Synchronisation réussie
        logger.debug('🎉 Synchronisation Clerk → Supabase terminée avec succès');
        setSyncError(null);

      } catch (error) {
        logger.error('❌ Erreur de synchronisation Clerk → Supabase', { error });
        // Ne pas bloquer l'application - fonctionnalités limitées sans Supabase
        setSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
    // Sync only on user ID change - profile updates are handled internally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  return {
    isSyncing,
    syncError,
    isReady: isLoaded && (!isSignedIn || (!isSyncing && !syncError)),
  };
}
