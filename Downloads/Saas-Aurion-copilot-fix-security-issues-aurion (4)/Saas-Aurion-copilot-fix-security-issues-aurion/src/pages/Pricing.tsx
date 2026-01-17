import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { redirectToCheckout, STRIPE_PLANS, type PlanId } from "@/services/stripe-service";
import { logger } from "@/services/logger";
import { useToast } from "@/components/ui/use-toast";
import { useClerkSafe } from "@/hooks/use-clerk-safe";

const CheckIcon = ({ dark }: { dark?: boolean }) => (
  <div className={cn(
    "flex items-center justify-center w-5 h-5 rounded-full",
    dark ? "bg-white text-black" : "bg-gray-100 text-gray-900"
  )}>
    <Check size={12} strokeWidth={3} />
  </div>
);

interface PricingCardProps {
  planId: PlanId;
  isYearly: boolean;
  isPopular?: boolean;
  onSubscribe: (planId: PlanId) => void;
  isLoading: boolean;
  loadingPlan: PlanId | null;
}

const PricingCard = ({ planId, isYearly, isPopular, onSubscribe, isLoading, loadingPlan }: PricingCardProps) => {
  const plan = STRIPE_PLANS[planId];
  const isEnterprise = planId === 'enterprise';
  const price = isYearly ? Math.round(plan.price * 0.7) : plan.price; // 30% discount for yearly
  const isLoadingThis = isLoading && loadingPlan === planId;

  return (
    <div className={cn(
      "relative flex flex-col p-8 rounded-[32px]",
      isEnterprise
        ? "bg-[#0A0A0A] text-white shadow-2xl"
        : "bg-white text-gray-900 border border-gray-100 shadow-sm",
      "min-h-[520px]"
    )}>
      {isPopular && (
        <span className="absolute top-8 right-8 bg-[#FF5F38] text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
          Popular
        </span>
      )}

      <div className="mb-8">
        <h3 className={cn("text-xl font-bold font-display mb-4", isEnterprise ? "text-white" : "text-gray-900")}>
          {plan.name}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-4">
          {planId === 'enterprise' ? (
            <span className="text-5xl font-bold font-display tracking-tight">Custom</span>
          ) : (
            <>
              <span className="text-5xl font-bold font-display tracking-tight">{price}€</span>
              <span className={cn("text-sm", isEnterprise ? "text-gray-400" : "text-gray-500")}>
                /{isYearly ? 'mois' : 'mois'}
              </span>
            </>
          )}
        </div>

        <p className={cn("text-sm leading-relaxed font-body", isEnterprise ? "text-gray-400" : "text-gray-500")}>
          {planId === 'starter' && "Vous découvrez nos outils IA et voulez tester les fonctionnalités de base."}
          {planId === 'plus' && "Vous créez régulièrement du contenu et avez besoin de plus de crédits."}
          {planId === 'pro' && "Vous utilisez l'IA quotidiennement pour votre travail ou votre entreprise."}
          {planId === 'enterprise' && "Votre équipe utilise nos outils intensivement et a besoin de support dédié."}
        </p>
      </div>

      <div className="flex-grow mb-8">
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm font-medium font-body">
              <CheckIcon dark={isEnterprise} />
              <span className={cn(
                isEnterprise ? "text-gray-300" : "text-gray-600"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onSubscribe(planId)}
        disabled={isLoading}
        className={cn(
          "w-full py-4 rounded-xl text-center font-bold text-sm border flex items-center justify-center gap-2",
          isEnterprise
            ? "bg-white text-black border-white"
            : "bg-white text-black border-gray-200",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
        style={{ transition: 'none' }}
      >
        {isLoadingThis ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Redirection...
          </>
        ) : (
          planId === 'enterprise' ? 'Contacter les ventes' : `Commencer avec ${plan.name}`
        )}
      </button>
    </div>
  );
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const { toast } = useToast();
  const { user } = useClerkSafe();

  const handleSubscribe = async (planId: PlanId) => {
    // Tous les plans utilisent maintenant Stripe Checkout
    // Plus de redirection vers contact pour Enterprise

    setIsLoading(true);
    setLoadingPlan(planId);

    try {
      const result = await redirectToCheckout(planId, user?.primaryEmailAddress?.emailAddress);

      if (result.success && result.url) {
        logger.info(`Redirection vers Stripe pour le plan ${planId}:`, { url: result.url });
        // Rediriger vers l'URL Stripe Checkout
        window.location.href = result.url;
      } else {
        const errorMessage = result.error || "Impossible de créer la session de paiement";
        logger.error('Checkout failed:', result);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        setLoadingPlan(null);
      }
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Impossible de créer la session de paiement";
      logger.error('Checkout error:', error);
      toast({
        title: "Erreur",
        description: errMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const displayPlans: PlanId[] = ['starter', 'plus', 'pro', 'enterprise'];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900">
      {/* Navbar Minimaliste */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            AURION
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
          <Link to="/features" className="hover:text-black transition-colors">Solutions</Link>
          <Link to="/features" className="hover:text-black transition-colors">Industries</Link>
          <Link to="/pricing" className="text-black font-bold">Pricing</Link>
          <Link to="/blog" className="hover:text-black transition-colors">Resources</Link>
          <Link to="/about" className="hover:text-black transition-colors">Company</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/signup" className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="px-6 py-16 md:py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">Choisissez le Plan Adapté à Vos Besoins</h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            Chaque plan vous donne accès à tous nos outils IA. La différence est dans le nombre de crédits disponibles et le niveau de support.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mt-8 gap-4">
            <span className={cn("text-sm font-bold", !isYearly ? "text-black" : "text-gray-400")}>Mensuel</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none",
                isYearly ? "bg-black" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300",
                isYearly ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
            <span className={cn("text-sm font-bold", isYearly ? "text-black" : "text-gray-400")}>
              Annuel <span className="text-green-500 font-bold ml-1">-30%</span>
            </span>
          </div>
        </div>

        {/* Pricing Grid - 4 Colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {displayPlans.map((planId, index) => (
            <PricingCard 
              key={planId}
              planId={planId}
              isYearly={isYearly} 
              isPopular={index === 1} // Plus est "Popular"
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
              loadingPlan={loadingPlan}
            />
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 text-sm mb-6">Paiement sécurisé par</p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#635BFF"/>
                <path d="M18.5 16.5C18.5 15.12 19.62 14 21 14C22.38 14 23.5 15.12 23.5 16.5V17H18.5V16.5ZM16.5 17V16.5C16.5 14.01 18.51 12 21 12C23.49 12 25.5 14.01 25.5 16.5V17H27V28H15V17H16.5Z" fill="white"/>
              </svg>
              <span className="font-bold text-gray-600">Stripe</span>
            </div>
            <div className="text-gray-300">•</div>
            <span className="text-gray-500 text-sm">SSL 256-bit</span>
            <div className="text-gray-300">•</div>
            <span className="text-gray-500 text-sm">Annulation à tout moment</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Que signifient les "crédits IA" ?</h3>
              <p className="text-gray-500 text-sm">Chaque outil IA consomme des crédits selon sa complexité. Par exemple, créer une image simple coûte 10 crédits, une vidéo complexe peut en coûter 100. Vous pouvez voir votre consommation en temps réel dans le tableau de bord.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Puis-je utiliser le contenu généré commercialement ?</h3>
              <p className="text-gray-500 text-sm">Oui, tous les plans incluent les droits d'utilisation commerciale. Vous pouvez utiliser le contenu généré pour votre business, vos produits ou vos services sans restriction.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Comment fonctionne l'annulation ?</h3>
              <p className="text-gray-500 text-sm">Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. Vous conservez l'accès à tous les crédits restants jusqu'à la fin de votre période de facturation en cours.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Que se passe-t-il si j'utilise tous mes crédits avant la fin du mois ?</h3>
              <p className="text-gray-500 text-sm">Vous recevez une notification par email. Vous pouvez soit attendre le renouvellement mensuel automatique, soit upgrader temporairement vers un plan supérieur pour continuer à travailler.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Proposez-vous des remises pour les équipes ?</h3>
              <p className="text-gray-500 text-sm">Notre plan Enterprise est adapté aux équipes. Contactez-nous pour discuter de vos besoins spécifiques et obtenir un devis personnalisé avec des remises pour volumes.</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
