import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/services/logger';

// Hook pour précharger intelligemment les routes
export const useRoutePreload = () => {
  const location = useLocation();

  // Fonction pour précharger une route spécifique
  const preloadRoute = useCallback(async (route: string) => {
    try {
      // Simuler le chargement de la route (React.lazy s'occupera du reste)
      const routeModules = {
        '/dashboard': () => import('../pages/dashboard/DashboardLayout'),
        '/pricing': () => import('../pages/Pricing'),
        '/features': () => import('../pages/Features'),
        '/signup': () => import('../pages/SignUp'),
        '/contact': () => import('../pages/Contact'),
      };

      const moduleLoader = routeModules[route as keyof typeof routeModules];
      if (moduleLoader) {
        await moduleLoader();
      }
    } catch (error) {
      // Silent fail - le preload n'est pas critique
      logger.debug(`Failed to preload route: ${route}`, { error });
    }
  }, []);

  // Précharger les routes critiques selon la page actuelle
  const preloadCriticalRoutes = useCallback(async () => {
    const currentPath = location.pathname;

    // Routes à précharger selon le contexte
    const preloadRoutes = {
      '/': ['/dashboard', '/pricing', '/features'],
      '/pricing': ['/signup', '/contact'],
    };

    const routesToPreload = preloadRoutes[currentPath as keyof typeof preloadRoutes] || [];

    // Précharger les routes de manière asynchrone
    routesToPreload.forEach(route => {
      // Utiliser requestIdleCallback si disponible pour ne pas bloquer le thread principal
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => preloadRoute(route));
      } else {
        setTimeout(() => preloadRoute(route), 100);
      }
    });
  }, [location.pathname, preloadRoute]);

  // Précharger au changement de route
  useEffect(() => {
    preloadCriticalRoutes();
  }, [preloadCriticalRoutes]);

  return { preloadRoute };
};
