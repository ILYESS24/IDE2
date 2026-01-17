import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLANS } from '@/types/plans';

export interface SearchResult {
  id: string;
  type: 'tool' | 'section' | 'feature' | 'plan';
  title: string;
  description: string;
  path?: string;
  icon?: React.ElementType;
  category: string;
  relevance: number;
  action?: () => void;
}

interface SearchDataItem {
  id: string;
  type: 'tool' | 'section' | 'feature' | 'plan';
  title: string;
  description: string;
  path?: string;
  category: string;
  keywords: string[];
}

// Search database - all available items (outils de création supprimés)
const SEARCH_DATA: SearchDataItem[] = [
  // Dashboard sections
  {
    id: 'dashboard_home',
    type: 'section' as const,
    title: 'Dashboard Home',
    description: 'Overview of your account and statistics',
    path: '/dashboard',
    category: 'Navigation',
    keywords: ['home', 'dashboard', 'overview', 'stats', 'account']
  },
  {
    id: 'dashboard_projects',
    type: 'section' as const,
    title: 'My Projects',
    description: 'Manage your projects and creations',
    path: '/dashboard/projects',
    category: 'Navigation',
    keywords: ['project', 'work', 'creation', 'management', 'portfolio']
  },
  {
    id: 'dashboard_ai',
    type: 'section' as const,
    title: 'AI & Intelligence',
    description: 'All artificial intelligence tools',
    path: '/dashboard/ai',
    category: 'Navigation',
    keywords: ['ai', 'intelligence', 'artificial', 'machine learning']
  },
  {
    id: 'dashboard_apps',
    type: 'section' as const,
    title: 'Applications',
    description: 'Your created applications',
    path: '/dashboard/apps',
    category: 'Navigation',
    keywords: ['application', 'app', 'mobile', 'software', 'program']
  },
  {
    id: 'dashboard_images',
    type: 'section' as const,
    title: 'Image Gallery',
    description: 'All your generated images',
    path: '/dashboard/images',
    category: 'Navigation',
    keywords: ['image', 'photo', 'gallery', 'visual', 'media']
  },
  {
    id: 'dashboard_video',
    type: 'section' as const,
    title: 'Video Library',
    description: 'Your created and animated videos',
    path: '/dashboard/video',
    category: 'Navigation',
    keywords: ['video', 'film', 'animation', 'cinema', 'motion']
  },

  // Special features
  {
    id: 'upgrade_plan',
    type: 'feature' as const,
    title: 'Upgrade My Plan',
    description: 'Unlock more features and credits',
    path: '/dashboard',
    category: 'Subscription',
    keywords: ['upgrade', 'plan', 'premium', 'subscription', 'credits', 'limits']
  },
  {
    id: 'settings',
    type: 'feature' as const,
    title: 'Settings',
    description: 'Configure your account and preferences',
    path: '/dashboard/settings',
    category: 'Configuration',
    keywords: ['settings', 'configuration', 'account', 'preferences', 'profile']
  },
  {
    id: 'help',
    type: 'feature' as const,
    title: 'Help & Support',
    description: 'Get help and contact support',
    path: '/help',
    category: 'Support',
    keywords: ['help', 'support', 'contact', 'question', 'problem']
  }
];

// Ajouter les plans disponibles
Object.entries(PLANS).forEach(([planId, plan]) => {
  SEARCH_DATA.push({
    id: `plan_${planId}`,
    type: 'plan' as const,
    title: plan.name,
    description: `${plan.credits} crédits/mois • ${plan.price === 0 ? 'Gratuit' : `${plan.price}$/mois`}`,
    path: '/dashboard',
    category: 'Abonnement',
    keywords: [plan.name.toLowerCase(), 'plan', 'abonnement', planId, ...plan.benefits.map(b => b.toLowerCase())]
  });
});

export function useSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // Fonction pour normaliser le texte (supprimer accents, etc.)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s]/g, ' ') // Remplacer la ponctuation par des espaces
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  };

  // Dictionnaire de synonymes
  const SYNONYMS: Record<string, string[]> = {
    'video': ['vidéo', 'film', 'cinéma', 'animation', 'motion', 'clip'],
    'image': ['photo', 'illustration', 'visuel', 'picture', 'art'],
    'code': ['programmation', 'développement', 'script', 'logiciel'],
    'chat': ['conversation', 'discussion', 'talk', 'messagerie'],
    'app': ['application', 'logiciel', 'programme', 'mobile'],
    'site': ['website', 'web', 'internet', 'page', 'online'],
    'ai': ['ia', 'intelligence artificielle', 'artificielle', 'bot'],
    'projet': ['project', 'travail', 'création', 'portfolio'],
    'outil': ['tool', 'fonctionnalité', 'feature', 'option'],
    'plan': ['abonnement', 'subscription', 'offre', 'tarif']
  };

  // Étendre les termes de recherche avec les synonymes
  const expandSearchTerms = (terms: string[]): string[] => {
    const expanded = new Set(terms);
    terms.forEach(term => {
      const synonyms = SYNONYMS[term] || [];
      synonyms.forEach(synonym => expanded.add(synonym));
    });
    return Array.from(expanded);
  };

  // Résultats de recherche calculés
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = normalizeText(query);
    const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
    const expandedWords = expandSearchTerms(searchWords);

    const scoredResults = SEARCH_DATA.map(item => {
      let score = 0;
      const title = normalizeText(item.title);
      const description = normalizeText(item.description);
      const category = normalizeText(item.category);
      const allKeywords = normalizeText([...item.keywords, title, description, category].join(' '));

      // Score basé sur la correspondance avec tous les termes (originaux + synonymes)
      [...searchWords, ...expandedWords].forEach(word => {
        // Correspondance exacte dans le titre (score élevé)
        if (title.includes(word)) {
          score += 15;
        }
        // Correspondance exacte dans les mots-clés
        if (item.keywords.some(k => normalizeText(k).includes(word))) {
          score += 12;
        }
        // Correspondance dans la description
        if (description.includes(word)) {
          score += 8;
        }
        // Correspondance partielle dans tous les champs
        if (allKeywords.includes(word)) {
          score += 5;
        }
        // Bonus pour les correspondances au début des mots
        if (title.startsWith(word) || item.keywords.some(k => normalizeText(k).startsWith(word))) {
          score += 8;
        }
        // Bonus pour les correspondances exactes de mots complets
        const titleWords = title.split(' ');
        const descWords = description.split(' ');
        if (titleWords.includes(word) || descWords.includes(word)) {
          score += 6;
        }
      });

      // Pénalité pour les résultats moins pertinents
      if (score > 0 && score < 10) {
        score *= 0.5; // Réduire le score des correspondances faibles
      }

      return {
        ...item,
        relevance: score,
        action: item.path ? () => navigate(item.path!) : undefined
      };
    });

    // Filtrer et trier par pertinence
    return scoredResults
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8); // Limiter à 8 résultats max
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, navigate]); // expandSearchTerms is stable (defined in component scope)

  // Simulation de délai de recherche pour UX
  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 150);
      return () => clearTimeout(timer);
    } else {
       
      setIsSearching(false);
    }
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setSelectedIndex(-1);
  };

  const executeSearch = (result?: SearchResult) => {
    const targetResult = result || (selectedIndex >= 0 ? results[selectedIndex] : null);
    if (targetResult && targetResult.action) {
      targetResult.action();
    }
    clearSearch();
  };

  // Navigation dans les résultats
  const selectNext = () => {
    if (results.length > 0) {
      setSelectedIndex(prev => (prev + 1) % results.length);
    }
  };

  const selectPrevious = () => {
    if (results.length > 0) {
      setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
    }
  };

  const resetSelection = () => {
    setSelectedIndex(-1);
  };

  // Mettre à jour la sélection quand les résultats changent
  useEffect(() => {
    if (results.length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= results.length) {
       
      setSelectedIndex(results.length - 1);
    }
  }, [results.length, selectedIndex]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults: results.length > 0,
    selectedIndex,
    clearSearch,
    executeSearch,
    selectNext,
    selectPrevious,
    resetSelection
  };
}
