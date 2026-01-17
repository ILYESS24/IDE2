import React, { useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';

interface ResourceHintsProps {
  // Ressources à précharger selon la route
  resources?: {
    fonts?: string[];
    images?: string[];
    scripts?: string[];
    styles?: string[];
  };
}

// Hook pour gérer les resource hints dynamiques
const useResourceHints = (resources?: ResourceHintsProps['resources']) => {
  const location = useLocation();

  useEffect(() => {
    // Supprimer les anciens resource hints
    const existingHints = document.querySelectorAll('link[data-resource-hint]');
    existingHints.forEach(hint => hint.remove());

    // Ressources par défaut selon la route
    const defaultResources = {
      '/': {
        fonts: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ],
        images: [
          // Images hero principales
        ],
      },
      '/dashboard': {
        fonts: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ],
        scripts: [
          // Scripts critiques pour le dashboard
        ],
      },
    };

    const routeResources = defaultResources[location.pathname as keyof typeof defaultResources] || {};
    const allResources = { ...routeResources, ...resources };

    // Créer les resource hints
    const hints: HTMLLinkElement[] = [];

    // Fonts - preload avec high priority
    allResources.fonts?.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      link.crossOrigin = 'anonymous';
      link.setAttribute('data-resource-hint', 'font');
      hints.push(link);
    });

    // Images - preload pour LCP
    allResources.images?.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'image';
      link.setAttribute('data-resource-hint', 'image');
      hints.push(link);
    });

    // Scripts - preload pour les chunks critiques
    allResources.scripts?.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'script';
      link.setAttribute('data-resource-hint', 'script');
      hints.push(link);
    });

    // Styles - preload
    allResources.styles?.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      link.setAttribute('data-resource-hint', 'style');
      hints.push(link);
    });

    // Ajouter les hints au head
    hints.forEach(hint => {
      document.head.appendChild(hint);
    });

    // Nettoyer lors du démontage
    return () => {
      hints.forEach(hint => {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      });
    };
  }, [location.pathname, resources]);
};

// Composant pour optimiser le LCP et les resources
export const ResourceHints = memo<ResourceHintsProps>(({ resources }) => {
  useResourceHints(resources);

  return null; // Ce composant ne rend rien visuellement
});

ResourceHints.displayName = 'ResourceHints';

// Hook pour précharger des ressources spécifiques
export const usePreloadResource = (href: string, as: 'image' | 'script' | 'style' | 'font') => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;

    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }

    link.setAttribute('data-resource-hint', 'dynamic');
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [href, as]);
};

export default ResourceHints;
