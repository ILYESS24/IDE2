// Error Messages & User Guidance - Clear, helpful, and actionable

export const ERROR_MESSAGES = {
  // Authentication errors
  auth: {
    sessionExpired: "Votre session a expiré pour des raisons de sécurité. Reconnectez-vous pour continuer.",
    invalidCredentials: "L'adresse email ou le mot de passe est incorrect. Vérifiez vos informations.",
    accountLocked: "Votre compte a été temporairement verrouillé après plusieurs tentatives. Réessayez dans 15 minutes ou contactez le support.",
    emailNotVerified: "Vérifiez votre boîte email et cliquez sur le lien de confirmation pour activer votre compte."
  },

  // Network & connectivity
  network: {
    offline: "Vous êtes hors ligne. Vérifiez votre connexion internet et réessayez.",
    timeout: "La requête prend trop de temps. Cela peut être dû à une connexion lente. Réessayez dans quelques instants.",
    serverError: "Problème temporaire du serveur. Notre équipe est informée. Réessayez dans 5 minutes."
  },

  // Credit & billing errors
  credits: {
    insufficient: "Crédits insuffisants pour cette action. Upgradez votre plan ou attendez le renouvellement mensuel.",
    limitReached: "Vous avez atteint la limite de votre plan. Contactez le support pour augmenter votre quota.",
    paymentFailed: "Le paiement n'a pas pu être traité. Vérifiez vos informations de carte ou contactez votre banque."
  },

  // Generation errors
  generation: {
    contentPolicy: "Le contenu demandé ne respecte pas nos conditions d'utilisation. Reformulez votre demande.",
    technicalError: "Erreur technique lors de la génération. Réessayez ou contactez le support si le problème persiste.",
    quotaExceeded: "Trop de demandes simultanées. Attendez quelques instants avant de réessayer.",
    invalidInput: "Les informations fournies ne permettent pas de générer le contenu demandé. Ajoutez plus de détails."
  },

  // File operations
  files: {
    uploadFailed: "Le fichier n'a pas pu être téléchargé. Vérifiez le format et la taille (max 50MB).",
    invalidFormat: "Format de fichier non supporté. Utilisez JPG, PNG, MP4, PDF ou TXT.",
    tooLarge: "Fichier trop volumineux. Réduisez la taille ou divisez en plusieurs parties.",
    corrupted: "Le fichier semble corrompu. Téléchargez une version valide."
  },

  // Save & export errors
  save: {
    autoSaveFailed: "La sauvegarde automatique a échoué. Vos modifications sont conservées localement.",
    exportFailed: "L'export a échoué. Réessayez ou contactez le support avec les détails de l'erreur.",
    diskFull: "Espace de stockage insuffisant. Libérez de l'espace ou contactez le support."
  }
};

// Success messages - Positive reinforcement
export const SUCCESS_MESSAGES = {
  saved: "Modifications sauvegardées avec succès.",
  generated: "Contenu généré avec succès. Vous pouvez maintenant l'utiliser ou le modifier.",
  exported: "Export terminé. Le fichier est disponible dans vos téléchargements.",
  payment: "Paiement traité avec succès. Votre nouveau plan est maintenant actif.",
  credits: "Crédits renouvelés. Vous pouvez continuer à utiliser nos outils IA."
};

// Loading messages - Informative
export const LOADING_MESSAGES = {
  generating: "Génération IA en cours... Cela peut prendre 10-30 secondes selon la complexité.",
  saving: "Sauvegarde en cours... Ne fermez pas cette page.",
  uploading: "Téléchargement en cours... Veuillez patienter.",
  processing: "Traitement en cours... Cette opération peut prendre quelques minutes."
};

// Validation messages - Helpful guidance
export const VALIDATION_MESSAGES = {
  required: "Ce champ est obligatoire.",
  email: "Veuillez entrer une adresse email valide.",
  password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.",
  url: "Veuillez entrer une URL valide (commençant par http:// ou https://).",
  fileSize: "Le fichier ne doit pas dépasser 50MB.",
  credits: "Vous n'avez pas assez de crédits pour cette action."
};

// Empty states - Helpful next steps
export const EMPTY_STATES = {
  projects: {
    icon: "📁",
    title: "Aucun projet trouvé",
    description: "Vous n'avez pas encore créé de projets. Commencez par explorer nos outils IA.",
    action: "Créer mon premier projet"
  },
  history: {
    icon: "🕐",
    title: "Aucun historique",
    description: "Vos générations précédentes apparaîtront ici pour faciliter vos reprises.",
    action: "Commencer une génération"
  },
  notifications: {
    icon: "🔔",
    title: "Aucune notification",
    description: "Vous serez informé ici des mises à jour importantes et des nouvelles fonctionnalités.",
    action: "Explorer les outils"
  },
  search: {
    icon: "🔍",
    title: "Aucun résultat",
    description: "Aucun contenu ne correspond à votre recherche. Essayez avec des termes différents.",
    action: "Effacer la recherche"
  }
};

// Helper functions
export const getErrorMessage = (category: keyof typeof ERROR_MESSAGES, key: string) => {
  const categoryMessages = ERROR_MESSAGES[category];
  return categoryMessages[key as keyof typeof categoryMessages] || "Une erreur inattendue s'est produite.";
};

export const getSuccessMessage = (key: keyof typeof SUCCESS_MESSAGES) => {
  return SUCCESS_MESSAGES[key];
};

export const getLoadingMessage = (key: keyof typeof LOADING_MESSAGES) => {
  return LOADING_MESSAGES[key];
};

export const getValidationMessage = (key: keyof typeof VALIDATION_MESSAGES) => {
  return VALIDATION_MESSAGES[key];
};

export const getEmptyState = (key: keyof typeof EMPTY_STATES) => {
  return EMPTY_STATES[key];
};

