// Transactional Email Templates - Clear, helpful, value-first
// No marketing content, only essential information

export const EMAIL_TEMPLATES = {
  // Welcome & onboarding
  welcome: {
    subject: "Bienvenue sur AURION - Votre compte est prêt",
    greeting: "Bienvenue sur AURION,",
    content: `
Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos outils IA.

Voici ce que vous pouvez faire immédiatement :
• Explorer nos 6 outils IA depuis votre tableau de bord
• Créer votre premier projet gratuitement
• Configurer vos préférences dans les paramètres

Vous disposez de {credits} crédits IA pour commencer.

Si vous avez des questions, notre support est disponible par email à hello@aurion-platform.com.
    `,
    signature: "L'équipe AURION"
  },

  // Payment confirmation
  paymentSuccess: {
    subject: "Confirmation de paiement - Plan {planName}",
    greeting: "Bonjour,",
    content: `
Votre paiement de {amount}€ pour le plan {planName} a été traité avec succès.

Détails de votre abonnement :
• Plan : {planName}
• Montant : {amount}€
• Crédits mensuels : {credits}
• Prochaine facturation : {nextBilling}

Vous pouvez consulter votre utilisation et gérer votre abonnement depuis votre tableau de bord.

Si vous avez des questions sur votre abonnement, contactez-nous à billing@aurion-platform.com.
    `,
    signature: "L'équipe de facturation AURION"
  },

  // Payment failed
  paymentFailed: {
    subject: "Échec de paiement - Action requise",
    greeting: "Bonjour,",
    content: `
Nous n'avons pas pu traiter votre paiement de {amount}€ pour le renouvellement de votre abonnement.

Raisons possibles :
• Carte expirée
• Fonds insuffisants
• Informations de paiement incorrectes

Pour éviter l'interruption de votre service :
1. Mettez à jour vos informations de paiement dans votre tableau de bord
2. Nous retenterons automatiquement le paiement dans 3 jours

Si vous avez changé de carte ou si c'est une erreur, mettez à jour vos informations dès maintenant.

Contactez-nous à billing@aurion-platform.com si vous avez besoin d'aide.
    `,
    signature: "L'équipe de facturation AURION"
  },

  // Credits running low
  creditsLow: {
    subject: "Crédits IA presque épuisés - {remaining} restants",
    greeting: "Bonjour,",
    content: `
Vous avez utilisé {used} de vos {total} crédits IA ce mois-ci. Il vous reste {remaining} crédits.

Vos crédits se renouvellent automatiquement le {renewalDate}.

Si vous prévoyez d'utiliser plus de crédits ce mois-ci, vous pouvez :
• Attendre le renouvellement automatique
• Upgrader temporairement vers un plan supérieur
• Contacter le support pour augmenter votre quota

Gérez votre abonnement depuis votre tableau de bord.
    `,
    signature: "L'équipe AURION"
  },

  // Credits exhausted
  creditsExhausted: {
    subject: "Crédits IA épuisés - Renouvellement le {renewalDate}",
    greeting: "Bonjour,",
    content: `
Vous avez utilisé tous vos crédits IA ce mois-ci. Vos fonctionnalités de génération sont temporairement suspendues.

Vos crédits se renouvellent automatiquement le {renewalDate}.

En attendant, vous pouvez :
• Consulter et modifier vos projets existants
• Accéder à votre historique de générations
• Planifier vos prochains projets

Si vous avez besoin de crédits supplémentaires immédiatement, contactez-nous à support@aurion-platform.com.
    `,
    signature: "L'équipe AURION"
  },

  // Plan upgrade/downgrade
  planChange: {
    subject: "Changement d'abonnement - Nouveau plan {newPlan}",
    greeting: "Bonjour,",
    content: `
Votre abonnement a été changé avec succès.

Ancien plan : {oldPlan}
Nouveau plan : {newPlan}
Nouveaux crédits mensuels : {newCredits}
Prochaine facturation : {nextBilling} pour {newAmount}€

Le changement prend effet immédiatement. Vous pouvez utiliser vos nouveaux crédits dès maintenant.

Consultez votre tableau de bord pour voir votre nouvelle utilisation.
    `,
    signature: "L'équipe de facturation AURION"
  },

  // Cancellation confirmation
  cancellation: {
    subject: "Confirmation d'annulation d'abonnement",
    greeting: "Bonjour,",
    content: `
Votre abonnement AURION a été annulé comme demandé.

Détails de l'annulation :
• Plan annulé : {planName}
• Accès maintenu jusqu'au : {accessUntil}
• Crédits restants : {remainingCredits}

Vous conservez l'accès à tous vos projets et pouvez les exporter à tout moment.

Si vous changez d'avis, vous pouvez réactiver votre abonnement depuis votre tableau de bord avant la date d'expiration.

Nous sommes tristes de vous voir partir. Si vous avez des commentaires pour nous aider à nous améliorer, n'hésitez pas à nous écrire.
    `,
    signature: "L'équipe AURION"
  },

  // Password reset
  passwordReset: {
    subject: "Réinitialisation de votre mot de passe AURION",
    greeting: "Bonjour,",
    content: `
Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien pour créer un nouveau mot de passe :
{resetLink}

Ce lien expire dans 24 heures pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe reste inchangé.

Pour votre sécurité, ne partagez jamais ce lien avec qui que ce soit.
    `,
    signature: "L'équipe de sécurité AURION"
  },

  // Account security
  securityAlert: {
    subject: "Activité inhabituelle détectée sur votre compte",
    greeting: "Bonjour,",
    content: `
Nous avons détecté une activité inhabituelle sur votre compte AURION.

Détails :
• Date/heure : {timestamp}
• Action : {action}
• Localisation : {location}
• Appareil : {device}

Si c'était vous :
Aucune action n'est nécessaire. Vos informations de connexion sont sécurisées.

Si ce n'était pas vous :
1. Changez immédiatement votre mot de passe
2. Contactez-nous à security@aurion-platform.com
3. Vérifiez vos projets récents pour toute modification suspecte

Pour renforcer la sécurité de votre compte, nous recommandons l'activation de l'authentification à deux facteurs.
    `,
    signature: "L'équipe de sécurité AURION"
  },

  // Feature updates (rare, only important changes)
  featureUpdate: {
    subject: "Nouvelle fonctionnalité disponible - {featureName}",
    greeting: "Bonjour,",
    content: `
Nous avons ajouté une nouvelle fonctionnalité à AURION : {featureName}

{featureDescription}

Comment l'utiliser :
{instructions}

Cette fonctionnalité est maintenant disponible dans votre tableau de bord.

Si vous avez des questions sur cette nouvelle fonctionnalité, consultez notre documentation ou contactez le support.
    `,
    signature: "L'équipe produit AURION"
  }
};

// Helper function to get email template
export const getEmailTemplate = (type: keyof typeof EMAIL_TEMPLATES) => {
  return EMAIL_TEMPLATES[type];
};

// Helper to format email with variables
export const formatEmail = (template: any, variables: Record<string, any>) => {
  let content = template.content;
  let subject = template.subject;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    content = content.replace(new RegExp(placeholder, 'g'), String(value));
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return {
    subject,
    greeting: template.greeting,
    content: content.trim(),
    signature: template.signature
  };
};

