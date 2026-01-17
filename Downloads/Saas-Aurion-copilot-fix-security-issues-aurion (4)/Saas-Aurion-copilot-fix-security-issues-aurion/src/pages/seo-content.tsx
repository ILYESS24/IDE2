// SEO Content for AURION SaaS - Value-first approach
// Each page has clear H1, logical hierarchy, and natural keyword integration

export const SEO_CONTENT = {
  // Homepage
  home: {
    title: "AURION - Outils IA pour Créer Plus Efficacement | Plateforme de Création Automatisée",
    description: "Créez des sites web, applications, images et vidéos avec l'IA. Automatisez vos tâches répétitives et développez plus rapidement grâce aux outils IA d'AURION.",
    h1: "Créez avec l'IA, Travaillez Plus Efficacement",
    keywords: "IA création, outils IA, génération contenu, automatisation IA, développement assisté",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AURION",
      "description": "Plateforme de création IA pour sites web, applications et contenu automatisé",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "9",
        "priceCurrency": "EUR",
        "priceValidUntil": "2025-12-31"
      }
    }
  },

  // Pricing page
  pricing: {
    title: "Tarifs AURION - Plans IA Transparents | Abonnements Flexibles",
    description: "Comparez nos plans IA : Starter 9€, Plus 29€, Pro 79€. Crédits illimités, support dédié, API incluse. Annulation gratuite.",
    h1: "Choisissez le Plan Adapté à Vos Besoins",
    keywords: "prix IA, tarifs outils IA, abonnement IA, crédits IA, plan entreprise IA",
    faq: [
      {
        question: "Comment fonctionne la facturation ?",
        answer: "Vous payez mensuellement ou annuellement. Les crédits se renouvellent chaque mois selon votre plan. Aucun frais caché."
      },
      {
        question: "Puis-je changer de plan à tout moment ?",
        answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et la facturation s'ajuste automatiquement."
      },
      {
        question: "Que se passe-t-il si j'utilise tous mes crédits ?",
        answer: "Vous recevez une notification. Vous pouvez attendre le renouvellement mensuel ou upgrader temporairement vers un plan supérieur."
      },
      {
        question: "Proposez-vous des remises pour les équipes ?",
        answer: "Notre plan Enterprise offre des tarifs personnalisés pour les équipes. Contactez-nous pour discuter de vos besoins spécifiques."
      }
    ]
  },

  // Features/Tools pages
  tools: {
    websiteBuilder: {
      title: "Créateur de Sites Web IA - Sites Professionnels en Minutes | AURION",
      description: "Créez des sites web responsives automatiquement. Décrivez votre activité, l'IA génère votre site professionnel. Aucune compétence technique requise.",
      h1: "Créez Votre Site Web en Quelques Minutes",
      keywords: "créateur site web IA, site web automatique, génération site IA, site responsive IA",
      benefits: [
        "Génération automatique basée sur votre description",
        "Design professionnel et responsive",
        "Optimisation SEO automatique",
        "Intégration des réseaux sociaux",
        "Formulaires de contact fonctionnels"
      ]
    },
    appBuilder: {
      title: "Créateur d'Applications IA - Apps Mobiles/Web Sans Coder | AURION",
      description: "Transformez vos idées en applications fonctionnelles. L'IA génère automatiquement le code et l'interface de votre application mobile ou web.",
      h1: "Créez des Applications Sans Compétences Techniques",
      keywords: "créateur app IA, application automatique, génération app IA, no-code IA",
      benefits: [
        "Génération de code automatiquement",
        "Interfaces utilisateur intuitives",
        "Fonctionnalités adaptées à vos besoins",
        "Déploiement simplifié",
        "Maintenance automatique"
      ]
    },
    contentGenerator: {
      title: "Générateur de Contenu IA - Images & Vidéos Automatiques | AURION",
      description: "Créez des images et vidéos uniques en décrivant simplement ce que vous voulez. L'IA comprend vos besoins et génère du contenu adapté.",
      h1: "Créez des Images et Vidéos Sur Mesure",
      keywords: "générateur image IA, création vidéo IA, contenu automatique IA, génération visuelle IA",
      benefits: [
        "Images uniques et personnalisées",
        "Vidéos adaptées à votre message",
        "Résolutions haute qualité",
        "Formats optimisés pour le web",
        "Droits d'utilisation inclus"
      ]
    }
  },

  // Dashboard UI labels - Clear and helpful
  dashboard: {
    navigation: {
      studio: "Tableau de bord principal",
      video: "Création et montage vidéo",
      images: "Génération d'images IA",
      code: "Éditeur de code assisté",
      agents: "Configuration des agents IA",
      apps: "Créateur d'applications",
      websites: "Constructeur de sites web",
      projects: "Gestion de vos projets",
      ai: "Assistant IA général",
      settings: "Paramètres du compte",
      notifications: "Centre de notifications",
      help: "Aide et documentation"
    },
    emptyStates: {
      noProjects: "Vous n'avez pas encore créé de projets. Commencez par explorer nos outils IA pour créer votre premier contenu.",
      noCredits: "Vous avez utilisé tous vos crédits ce mois-ci. Ils se renouvelleront automatiquement le mois prochain, ou vous pouvez upgrader votre plan.",
      noResults: "Aucun résultat trouvé. Essayez de modifier vos critères de recherche ou contactez le support si vous pensez qu'il s'agit d'une erreur."
    },
    tooltips: {
      credits: "Nombre de crédits IA restants ce mois",
      usage: "Votre utilisation moyenne cette semaine",
      limits: "Limites de votre plan actuel"
    }
  },

  // Error messages - Clear and actionable
  errors: {
    network: "Problème de connexion. Vérifiez votre connexion internet et réessayez.",
    authentication: "Votre session a expiré. Reconnectez-vous pour continuer.",
    credits: "Crédits insuffisants. Upgradez votre plan ou attendez le renouvellement mensuel.",
    generation: "Erreur lors de la génération. Réessayez ou contactez le support si le problème persiste.",
    save: "Impossible de sauvegarder. Vérifiez votre connexion et réessayez."
  },

  // Stripe checkout texts - Clear and reassuring
  checkout: {
    processing: "Préparation de votre paiement sécurisé...",
    success: "Paiement confirmé. Configuration de votre compte en cours...",
    cancel: "Paiement annulé. Vous pouvez réessayer quand vous êtes prêt.",
    error: "Erreur de paiement. Vérifiez vos informations ou contactez votre banque."
  }
};

// Helper function to get SEO content for a page
export const getSEOContent = (page: keyof typeof SEO_CONTENT) => {
  return SEO_CONTENT[page];
};

// Helper for structured data generation
export const generateStructuredData = (page: string, data: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": `https://0c114c34.aurion-saas.pages.dev${page === 'home' ? '' : `/${page}`}`,
    ...data.structuredData
  };
};

