// Dashboard UI Content - Clear, helpful, and value-first

export const DASHBOARD_CONTENT = {
  // Navigation labels
  navigation: {
    studio: "Tableau de bord",
    video: "Création vidéo",
    images: "Génération d'images",
    code: "Éditeur de code",
    agents: "Agents IA",
    apps: "Créateur d'apps",
    websites: "Créateur de sites",
    projects: "Mes projets",
    ai: "Assistant IA",
    settings: "Paramètres",
    notifications: "Notifications",
    help: "Aide",
    billing: "Facturation",
    usage: "Utilisation"
  },

  // Empty states - Helpful guidance
  emptyStates: {
    noProjects: {
      title: "Commencez votre premier projet",
      description: "Vous n'avez pas encore créé de contenu. Choisissez un outil ci-dessous pour commencer.",
      action: "Explorer les outils"
    },
    noCredits: {
      title: "Crédits épuisés",
      description: "Vous avez utilisé tous vos crédits IA ce mois-ci. Ils se renouvellent automatiquement le 1er du mois prochain.",
      action: "Voir les plans"
    },
    noResults: {
      title: "Aucun résultat trouvé",
      description: "Nous n'avons pas trouvé de contenu correspondant à votre recherche. Essayez avec des termes différents.",
      action: "Effacer la recherche"
    },
    noNotifications: {
      title: "Pas de nouvelles notifications",
      description: "Vous serez informé ici des mises à jour importantes et des nouvelles fonctionnalités.",
      action: "Explorer les outils"
    }
  },

  // Tool descriptions - Clear value propositions
  tools: {
    websiteBuilder: {
      title: "Créateur de Sites Web",
      description: "Transformez vos idées en sites web professionnels. Décrivez votre activité, l'IA s'occupe du reste.",
      benefits: [
        "Sites responsives automatiquement",
        "Optimisés pour le référencement",
        "Formulaires de contact intégrés",
        "Intégration réseaux sociaux",
        "Hébergement inclus"
      ],
      useCase: "Idéal pour : Pages d'accueil, sites vitrines, landing pages"
    },
    appBuilder: {
      title: "Créateur d'Applications",
      description: "Créez des applications mobiles et web sans compétences techniques. L'IA génère le code automatiquement.",
      benefits: [
        "Code source généré automatiquement",
        "Interfaces utilisateur intuitives",
        "Déploiement simplifié",
        "Maintenance automatique",
        "Mises à jour transparentes"
      ],
      useCase: "Idéal pour : Apps internes, prototypes, MVPs"
    },
    contentGenerator: {
      title: "Générateur de Contenu",
      description: "Créez des images et vidéos uniques adaptées à vos besoins. Décrivez ce que vous voulez, l'IA le crée.",
      benefits: [
        "Images sur mesure et uniques",
        "Vidéos adaptées à votre message",
        "Formats optimisés pour le web",
        "Résolutions haute qualité",
        "Droits d'utilisation complets"
      ],
      useCase: "Idéal pour : Contenu marketing, illustrations, vidéos explicatives"
    },
    codeEditor: {
      title: "Éditeur de Code IA",
      description: "Développez plus rapidement avec l'assistance intelligente. L'IA détecte les erreurs et propose des améliorations.",
      benefits: [
        "Correction automatique des erreurs",
        "Suggestions de code contextuelles",
        "Optimisation des performances",
        "Documentation automatique",
        "Support multi-langages"
      ],
      useCase: "Idéal pour : Développement web, applications, scripts"
    },
    aiAgents: {
      title: "Agents IA",
      description: "Automatisez vos processus répétitifs. Configurez des agents qui s'occupent des tâches administratives.",
      benefits: [
        "Automatisation des tâches répétitives",
        "Traitement intelligent des données",
        "Intégration avec vos outils existants",
        "Rapports automatiques",
        "Réduction des erreurs humaines"
      ],
      useCase: "Idéal pour : Traitement de données, génération de rapports, modération de contenu"
    },
    textEditor: {
      title: "Éditeur de Texte IA",
      description: "Améliorez votre écriture avec l'assistance intelligente. L'IA vous aide à structurer et optimiser vos textes.",
      benefits: [
        "Correction grammaticale intelligente",
        "Suggestions stylistiques",
        "Adaptation du ton",
        "Résumé automatique",
        "Traduction assistée"
      ],
      useCase: "Idéal pour : Articles, emails, contenu marketing, documentation"
    }
  },

  // Action buttons - Clear and reassuring
  actions: {
    create: "Créer",
    generate: "Générer",
    edit: "Modifier",
    save: "Sauvegarder",
    delete: "Supprimer",
    duplicate: "Dupliquer",
    export: "Exporter",
    share: "Partager",
    preview: "Aperçu",
    publish: "Publier",
    cancel: "Annuler"
  },

  // Status messages - Informative and helpful
  status: {
    generating: "Génération en cours... Cela peut prendre quelques secondes.",
    saving: "Sauvegarde en cours...",
    processing: "Traitement en cours...",
    completed: "Terminé avec succès",
    error: "Une erreur s'est produite. Réessayez ou contactez le support.",
    credits: "Crédits restants ce mois : {count}"
  },

  // Help tooltips - Educational
  tooltips: {
    credits: "Chaque génération IA consomme des crédits. Le coût dépend de la complexité.",
    quality: "La qualité haute donne de meilleurs résultats mais consomme plus de crédits.",
    templates: "Les templates vous aident à commencer plus rapidement.",
    history: "Votre historique vous permet de reprendre et modifier vos créations précédentes."
  },

  // Settings labels - Clear categories
  settings: {
    profile: {
      title: "Profil",
      description: "Informations personnelles et préférences"
    },
    billing: {
      title: "Facturation",
      description: "Gérer votre abonnement et vos paiements"
    },
    api: {
      title: "API",
      description: "Clés API et intégrations"
    },
    notifications: {
      title: "Notifications",
      description: "Préférences de communication"
    },
    privacy: {
      title: "Confidentialité",
      description: "Contrôles de confidentialité et données"
    }
  }
};

// Helper function to get dashboard content
export const getDashboardContent = (section: keyof typeof DASHBOARD_CONTENT) => {
  return DASHBOARD_CONTENT[section];
};

// Helper for dynamic content with variables
export const formatDashboardContent = (key: string, variables: Record<string, any> = {}) => {
  let content = key;
  Object.entries(variables).forEach(([varName, value]) => {
    content = content.replace(`{${varName}}`, String(value));
  });
  return content;
};

