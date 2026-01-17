// Stripe Checkout Content - Clear, reassuring, value-first

export const CHECKOUT_CONTENT = {
  // Page titles and headers
  titles: {
    checkout: "Finaliser votre abonnement",
    processing: "Traitement de votre paiement",
    success: "Paiement confirmé",
    cancel: "Paiement annulé"
  },

  // Step indicators
  steps: {
    plan: "Choix du plan",
    payment: "Paiement",
    confirm: "Confirmation"
  },

  // Plan summary
  planSummary: {
    starter: {
      name: "Plan Starter",
      price: "9€/mois",
      credits: "500 crédits IA",
      description: "Accès à tous les outils IA avec 500 crédits par mois"
    },
    plus: {
      name: "Plan Plus",
      price: "29€/mois",
      credits: "2000 crédits IA",
      description: "Outils IA complets avec 2000 crédits et support prioritaire"
    },
    pro: {
      name: "Plan Pro",
      price: "79€/mois",
      credits: "10000 crédits IA",
      description: "IA illimitée avec 10000 crédits et support dédié"
    },
    enterprise: {
      name: "Plan Enterprise",
      price: "Prix sur mesure",
      credits: "Crédits illimités",
      description: "Solution complète pour équipes avec support personnalisé"
    }
  },

  // Billing information labels
  billingLabels: {
    email: "Adresse email",
    cardNumber: "Numéro de carte",
    expiry: "Date d'expiration",
    cvc: "Code de sécurité",
    name: "Nom sur la carte",
    country: "Pays",
    billingAddress: "Adresse de facturation"
  },

  // Payment security messages
  security: {
    stripeSecured: "Paiement sécurisé par Stripe",
    sslEncrypted: "Connexion chiffrée SSL 256-bit",
    pciCompliant: "Conforme PCI DSS",
    noCardStored: "Nous ne stockons pas vos informations de carte"
  },

  // Terms and conditions
  terms: {
    billingCycle: "Facturation mensuelle renouvelée automatiquement",
    cancelAnytime: "Annulation possible à tout moment",
    refundPolicy: "Remboursement sous 14 jours si insatisfait",
    privacyPolicy: "Vos données sont protégées selon notre politique de confidentialité"
  },

  // Action buttons
  buttons: {
    payNow: "Payer maintenant",
    processing: "Traitement en cours...",
    completeOrder: "Finaliser la commande",
    backToDashboard: "Retour au tableau de bord",
    tryAgain: "Réessayer le paiement",
    contactSupport: "Contacter le support"
  },

  // Success messages
  success: {
    title: "Paiement traité avec succès !",
    subtitle: "Votre abonnement {planName} est maintenant actif",
    credits: "Vous disposez de {credits} crédits IA",
    nextBilling: "Prochaine facturation : {date}",
    accessNow: "Vous pouvez accéder à tous vos outils immédiatement",
    welcomeEmail: "Un email de confirmation vous a été envoyé"
  },

  // Cancellation messages
  cancel: {
    title: "Paiement annulé",
    subtitle: "Aucun montant n'a été débité",
    explanation: "Vous pouvez réessayer quand vous êtes prêt",
    keepExploring: "Continuez à explorer nos outils gratuitement",
    contactUs: "Questions ? Contactez-nous à hello@aurion-platform.com"
  },

  // Error messages
  errors: {
    cardDeclined: "Carte refusée. Vérifiez vos informations ou contactez votre banque",
    insufficientFunds: "Fonds insuffisants. Utilisez une autre carte ou contactez votre banque",
    expiredCard: "Carte expirée. Utilisez une carte valide",
    incorrectCvc: "Code de sécurité incorrect. Vérifiez le code au dos de votre carte",
    genericError: "Erreur de paiement. Réessayez ou contactez le support",
    networkError: "Problème de connexion. Vérifiez votre internet et réessayez"
  },

  // Help text
  help: {
    securePayment: "Vos informations de paiement sont chiffrées et sécurisées",
    billingHistory: "Vous pouvez consulter votre historique de facturation dans les paramètres",
    changePlan: "Vous pouvez changer de plan à tout moment depuis votre tableau de bord",
    support: "Besoin d'aide ? Écrivez-nous à billing@aurion-platform.com"
  }
};

// Helper functions
export const getCheckoutContent = (section: keyof typeof CHECKOUT_CONTENT) => {
  return CHECKOUT_CONTENT[section];
};

export const formatCheckoutContent = (template: string, variables: Record<string, any> = {}) => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  return result;
};

// Get plan summary by plan ID
export const getPlanSummary = (planId: string) => {
  return CHECKOUT_CONTENT.planSummary[planId as keyof typeof CHECKOUT_CONTENT.planSummary];
};

