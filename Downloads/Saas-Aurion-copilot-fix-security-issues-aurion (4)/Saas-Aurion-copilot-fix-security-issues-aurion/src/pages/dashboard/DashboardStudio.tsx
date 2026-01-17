/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  Code2,
  Bot,
  Lock,
  Globe,
  Smartphone,
  FileText,
  Crown,
  ChevronRight,
  ArrowUpRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserPlan } from "@/hooks/use-plan";
import { useDashboardStats, useRealtimeDashboard } from "@/hooks/use-dashboard";
import { redirectToCheckout } from "@/services/stripe-service";
import { useToast } from "@/components/ui/use-toast";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { PLANS, TOOL_LABELS, TOOL_COSTS, ToolType, PlanType } from "@/types/plans";
import { logger } from "@/services/logger";

// Detect if Clerk is available (but always use mock data for stability)
const CLERK_AVAILABLE = !!(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
  !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
  !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('demo'));

// ... existing Card, StatCard, ToolCard components ...
const Card = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border-2 border-black/20 transition-all",
      onClick && "cursor-pointer hover:shadow-md hover:border-black/30",
      className
    )}
  >
    {children}
  </div>
);

// StatCard supprimé - Dashboard épuré

const ToolCard = ({ tool, status, cost, onClick }: { 
  tool: ToolType, 
  status: any, 
  cost: number,
  onClick: () => void 
}) => {
  const icons: Record<ToolType, any> = {
    image_generation: ImageIcon,
    video_generation: Video,
    code_generation: Code2,
    ai_chat: Bot,
    agent_builder: Sparkles,
    app_builder: Smartphone,
    website_builder: Globe,
    text_editor: FileText,
  };
  
  const Icon = icons[tool] || Zap;
  const label = TOOL_LABELS[tool];
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group",
        !status.enabled && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          status.enabled ? "bg-black text-white" : "bg-gray-100 text-gray-400"
        )}>
          {status.enabled ? <Icon size={20} /> : <Lock size={18} />}
        </div>
        
        {status.enabled && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full border-2 border-black/10">
            <Zap size={10} className="text-yellow-500" />
            <span className="text-[10px] font-bold text-gray-600">{cost}</span>
          </div>
        )}
      </div>
      
      <h3 className="font-bold text-sm mb-1">{label}</h3>
      
      {status.enabled ? (
        <div className="text-[10px] text-gray-500 space-y-0.5">
          {status.dailyRemaining !== null && (
            <p className={cn(status.dailyRemaining <= 2 && "text-orange-500")}>
              Jour: {status.dailyRemaining} restants
            </p>
          )}
          {status.monthlyRemaining !== null && (
            <p className={cn(status.monthlyRemaining <= 5 && "text-orange-500")}>
              Mois: {status.monthlyRemaining} restants
            </p>
          )}
          {status.dailyRemaining === null && status.monthlyRemaining === null && (
            <p className="text-green-500">Illimité</p>
          )}
          <p className="text-gray-400 capitalize">Qualité: {status.quality}</p>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400">Non disponible dans votre plan</p>
      )}
      
      {/* Hover Arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={16} className="text-gray-400" />
      </div>
    </Card>
  );
};

const PricingCard = ({ plan, currentPlan, onUpgrade }: { 
  plan: PlanType, 
  currentPlan: boolean,
  onUpgrade: () => void 
}) => {
  const planDetails = PLANS[plan];
  const isEnterprise = plan === 'enterprise';
  const isPopular = plan === 'plus'; // "Plus" corresponds to "Pro" slot in visual hierarchy
  
  return (
    <div className={cn(
      "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
      isEnterprise 
        ? "bg-black text-white border-black" 
        : "bg-white text-gray-900 border-gray-200 hover:shadow-xl hover:-translate-y-1",
      isPopular && !isEnterprise && "ring-2 ring-orange-500 border-orange-500",
      currentPlan && "ring-2 ring-black border-black"
    )}>
      {isPopular && !currentPlan && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Popular
        </span>
      )}
      
      {currentPlan && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Current Plan
        </span>
      )}

      <div className="mb-4">
        <h3 className={cn("text-lg font-bold mb-1", isEnterprise ? "text-white" : "text-gray-900")}>
          {planDetails.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">${planDetails.price}</span>
          <span className={cn("text-xs", isEnterprise ? "text-gray-400" : "text-gray-500")}>/month</span>
        </div>
      </div>

      <div className="flex-grow mb-6">
        <ul className="space-y-3">
          {planDetails.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <div className={cn("mt-0.5 rounded-full p-0.5", isEnterprise ? "bg-white/20" : "bg-blue-100")}>
                <Check size={10} className={cn(isEnterprise ? "text-white" : "text-blue-600")} />
              </div>
              <span className={cn(
                isEnterprise ? "text-gray-200" : "text-gray-700"
              )}>
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

    <button
      onClick={(e) => {
        e.preventDefault();
        logger.debug('Button clicked for plan', { plan });
        if (typeof onUpgrade === 'function') {
          logger.debug('onUpgrade is a function');
          onUpgrade();
        } else {
          logger.error('onUpgrade is not a function', { onUpgrade });
        }
      }}
      disabled={currentPlan}
      className={cn(
        "block w-full py-3 rounded-xl text-center font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        isEnterprise
          ? "bg-white text-black hover:bg-gray-100"
          : "bg-black text-white hover:bg-gray-800",
        plan === 'free' && "bg-white text-black border border-gray-200 hover:bg-gray-50"
      )}
    >
      {currentPlan ? "Plan Actuel" : (plan === 'free' ? 'Downgrade' : `Passer à ${planDetails.name}`)}
    </button>
    </div>
  );
};

export default function DashboardStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  
  // Données LIVE via les hooks
  const { userPlan, planDetails, creditsRemaining, usagePercentage, isLoading: planLoading, refetch } = useUserPlan();
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { isConnected: realtimeConnected } = useRealtimeDashboard(); // WebSocket temps réel
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkSafe();

  // Utiliser les vraies données Clerk au lieu des mocks
  const user = clerkUser && isSignedIn ? {
    id: clerkUser.id,
    fullName: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    primaryEmailAddress: {
      emailAddress: clerkUser.primaryEmailAddress?.emailAddress
    }
  } : null;
  const { toast } = useToast();

  const isLoading = planLoading || statsLoading;

  // Function to handle plan upgrade (via Stripe)
  const handlePlanUpgrade = async (plan: PlanType) => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      toast({
        title: "Chargement...",
        description: "Veuillez patienter pendant le chargement de l'application",
      });
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour souscrire à un abonnement",
        variant: "destructive",
      });
      return;
    }

    // If it's the free plan, do nothing
    if (plan === 'free') {
      toast({
        title: "Plan gratuit",
        description: "Vous êtes déjà sur le plan gratuit",
      });
      return;
    }

    // If it's the current plan, do nothing
    if (userPlan?.planId === plan) {
      toast({
        title: "Plan actuel",
        description: "Vous êtes déjà sur ce plan",
      });
      return;
    }

    // For Enterprise, redirect to contact page
    if (plan === 'enterprise') {
      navigate('/contact?plan=enterprise');
      return;
    }

    // Check user authentication
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour souscrire à un abonnement",
        variant: "destructive",
      });
      return;
    }

    // For other plans, redirect to Stripe Checkout
    try {
      logger.debug('Starting Stripe checkout process', { plan });

      // Convert PlanType to PlanId for Stripe
      const planIdMap: Record<PlanType, 'starter' | 'plus' | 'pro'> = {
        free: 'starter', // fallback
        starter: 'starter',
        plus: 'plus',
        pro: 'pro',
        enterprise: 'pro', // fallback
      };

      const stripePlanId = planIdMap[plan];
      logger.debug('Converting plan to Stripe plan ID', { plan, stripePlanId });

      logger.debug('User email', { email: user.primaryEmailAddress.emailAddress });

      const checkoutResult = await redirectToCheckout(
        stripePlanId,
        user.primaryEmailAddress.emailAddress
      );

      logger.debug('Checkout result received', { checkoutResult });

      if (checkoutResult && checkoutResult.success && checkoutResult.url) {
        logger.debug('Redirecting to Stripe', { url: checkoutResult.url });
        // Redirection vers Stripe Checkout
        window.location.href = checkoutResult.url;
        return; // Sortir de la fonction après redirection
      } else {
        logger.warn('Checkout failed', { checkoutResult });
        toast({
          title: "Erreur",
          description: checkoutResult?.error || "Impossible de créer une session de paiement",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      logger.error('Unexpected error in handlePlanUpgrade', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer une session de paiement",
        variant: "destructive",
      });
    }
  };

  // Navigation to tools
  const toolRoutes: Record<ToolType, string> = {
    image_generation: '/dashboard',              // Fonctionnalité supprimée
    video_generation: '/dashboard',              // Fonctionnalité supprimée
    code_generation: '/tools/code-editor',        // Iframe intégré
    ai_chat: '/dashboard/ai',
    agent_builder: '/tools/ai-agents',           // Iframe intégré
    app_builder: '/tools/app-builder',           // Iframe intégré
    website_builder: '/tools/website-builder',   // Iframe intégré
    text_editor: '/tools/text-editor',           // Iframe intégré
  };

  const handleToolClick = (tool: ToolType) => {
    const route = toolRoutes[tool];
    if (route) navigate(route);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-10">

      {/* Header with Tabs */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
                    {["Overview", "Tools", "History", "Plans"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0",
                activeTab === tab 
                  ? "text-black bg-white shadow-sm ring-1 ring-gray-100" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Real-time connection indicator */}
          <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-gray-50 rounded-full border-2 border-black/10 text-xs font-medium">
            <div className={cn(
              "w-2 h-2 rounded-full",
              realtimeConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="hidden md:inline text-gray-600">
              {realtimeConnected ? "Live" : "Offline"}
            </span>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-white rounded-full border border-gray-100 text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={12} className={cn("md:w-3.5 md:h-3.5", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* TAB: VUE D'ENSEMBLE */}
      {/* ============================================ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          
          {/* Carte Crédits Principale */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Card className="h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Crédits Disponibles</p>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                      {isLoading ? "..." : creditsRemaining.toLocaleString()}
                    </h2>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1",
                    userPlan?.planId === 'pro' ? "bg-purple-100 text-purple-700" :
                    userPlan?.planId === 'plus' ? "bg-blue-100 text-blue-700" :
                    userPlan?.planId === 'starter' ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    <Crown size={12} />
                    {planDetails?.name || "Free"}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Utilisé: {userPlan?.creditsUsedThisPeriod || 0}</span>
                    <span>Total: {planDetails?.credits || 100}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        usagePercentage > 90 ? "bg-red-500" :
                        usagePercentage > 70 ? "bg-orange-500" :
                        "bg-gradient-to-r from-purple-500 to-pink-500"
                      )}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Alert if credits are low */}
                {creditsRemaining < 50 && creditsRemaining > 0 && (
                  <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 px-3 py-2 rounded-lg mb-4">
                    <AlertCircle size={14} />
                    <span>Low credits! Consider upgrading.</span>
                  </div>
                )}

                {/* Stats rapides - Optimisées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Aujourd'hui</p>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-2xl font-black text-blue-900 mb-1">{dashboardStats?.usageToday.credits_used || 0}</p>
                    <p className="text-xs text-blue-600 font-medium">{dashboardStats?.usageToday.total_requests || 0} requêtes IA</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Cette semaine</p>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-2xl font-black text-purple-900 mb-1">{dashboardStats?.usageThisWeek.credits_used || 0}</p>
                    <p className="text-xs text-purple-600 font-medium">{dashboardStats?.usageThisWeek.total_requests || 0} requêtes IA</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Graphique hebdomadaire */}
          <div className="sm:col-span-2 lg:col-span-7">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base">Consommation IA sur 7 jours</h3>
                <span className="text-xs text-gray-400">{dashboardStats?.usageThisWeek.credits_used || 0} crédits IA utilisés</span>
              </div>

              <div className="h-40 flex items-end justify-between gap-2">
                {dashboardStats?.usageThisWeek.daily.map((day) => {
                  const maxCredits = Math.max(...(dashboardStats?.usageThisWeek.daily.map(d => d.credits) || []), 1);
                  const height = maxCredits > 0 ? (day.credits / maxCredits) * 100 : 0;
                  const dayName = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' });
                  const isToday = day.date === new Date().toISOString().split('T')[0];

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gray-100 rounded-t-lg relative h-[120px]">
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500",
                            isToday
                              ? "bg-gradient-to-t from-purple-500 to-pink-400"
                              : "bg-gray-300"
                          )}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className={cn("text-[10px] uppercase", isToday ? "text-black font-bold" : "text-gray-400")}>{dayName}</span>
                      <span className="text-[10px] font-bold">{day.credits}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* KPI Cards supprimées - Dashboard épuré */}

          {/* Activité Récente */}
          <div className="sm:col-span-2 lg:col-span-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base">Activité Récente</h3>
                <button 
                  onClick={() => setActiveTab("Historique")}
                  className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                >
                  See all <ChevronRight size={12} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" />
                  </div>
                ) : (dashboardStats?.recentActivity.length || 0) > 0 ? (
                  dashboardStats!.recentActivity.slice(0, 5).map((log: any) => {
                    const Icon = {
                      image_generation: ImageIcon,
                      video_generation: Video,
                      code_generation: Code2,
                      ai_chat: Bot,
                      agent_builder: Sparkles,
                      app_builder: Smartphone,
                      website_builder: Globe,
                      text_editor: FileText,
                    }[log.tool] || Zap;
                    
                    const time = new Date(log.timestamp);
                    const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon size={14} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{TOOL_LABELS[log.tool]}</p>
                          <p className="text-[10px] text-gray-400">{timeStr}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-500">-{log.credits}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Usage par Outil */}
          <div className="sm:col-span-2 lg:col-span-6">
            <Card>
              <h3 className="font-bold text-base mb-4">Répartition par Outil</h3>
              
              <div className="space-y-3">
                <p className="text-center text-gray-400 text-sm py-8">
                  Répartition par outil en cours d'implémentation
                </p>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* ============================================ */}
      {/* TAB: OUTILS */}
      {/* ============================================ */}
      {activeTab === "Tools" && (
        <div className="space-y-6">
          {/* Header avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(TOOL_LABELS).length}
              </div>
              <p className="text-sm text-gray-500">Available tools</p>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userPlan ? Object.keys(TOOL_LABELS).filter((tool) => {
                  const toolConfig = PLANS[userPlan.plan_type]?.features?.find(f => f.tool === tool);
                  return toolConfig?.enabled;
                }).length : 0}
              </div>
              <p className="text-sm text-gray-500">Enabled in your plan</p>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {creditsRemaining}
              </div>
              <p className="text-sm text-gray-500">Available credits</p>
            </Card>
          </div>

          {/* Grille d'outils */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(Object.keys(TOOL_LABELS) as ToolType[]).map((tool) => {
              const toolConfig = PLANS[userPlan?.plan_type || 'free']?.features?.find(f => f.tool === tool);
              const cost = TOOL_COSTS[tool] || 0;
              const isEnabled = toolConfig?.enabled || false;
              const hasCredits = creditsRemaining >= cost;

              return (
                <Card
                  key={tool}
                  onClick={() => isEnabled && hasCredits && handleToolClick(tool)}
                  className={cn(
                    "relative overflow-hidden group transition-all duration-200",
                    !isEnabled && "opacity-60",
                    isEnabled && hasCredits && "hover:shadow-lg hover:scale-105 cursor-pointer",
                    !hasCredits && isEnabled && "border-orange-200 bg-orange-50/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isEnabled ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {(() => {
                        const icons: Record<ToolType, any> = {
                          image_generation: ImageIcon,
                          video_generation: Video,
                          code_generation: Code2,
                          ai_chat: Bot,
                          agent_builder: Sparkles,
                          app_builder: Smartphone,
                          website_builder: Globe,
                          text_editor: FileText,
                        };
                        const Icon = icons[tool] || Zap;
                        return <Icon size={24} />;
                      })()}
                    </div>

                    {isEnabled && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full border-2 border-black/10">
                        <Zap size={10} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-gray-600">{cost}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm mb-2">{TOOL_LABELS[tool]}</h3>

                  <div className="space-y-2">
                    {/* Statut */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isEnabled ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <span className="text-[10px] text-gray-500 capitalize">
                        {isEnabled ? "Available" : "Not available"}
                      </span>
                    </div>

                    {/* Crédits */}
                    {isEnabled && (
                      <div className="text-[10px] text-gray-500">
                        {hasCredits ? (
                          <span className="text-green-600">Enough credits</span>
                        ) : (
                          <span className="text-orange-600">Not enough credits</span>
                        )}
                      </div>
                    )}

                    {/* Limites du plan */}
                    {toolConfig?.monthlyLimit && (
                      <div className="text-[10px] text-gray-500">
                        Limite: {toolConfig.monthlyLimit}/mois
                      </div>
                    )}

                    {/* Qualité */}
                    {toolConfig?.quality && (
                      <div className="text-[10px] text-gray-500 capitalize">
                        Qualité: {toolConfig.quality}
                      </div>
                    )}
                  </div>

                  {/* Hover Arrow */}
                  {isEnabled && hasCredits && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={16} className="text-gray-400" />
                    </div>
                  )}

                  {/* Overlay pour outils non disponibles */}
                  {!isEnabled && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="text-center">
                        <Lock size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Higher plan required</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay pour crédits insuffisants */}
                  {isEnabled && !hasCredits && (
                    <div className="absolute inset-0 bg-orange-50/90 flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle size={24} className="text-orange-500 mx-auto mb-2" />
                        <p className="text-xs text-orange-600">Not enough credits</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Section d'aide */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={16} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How to use the tools</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Click on an available tool to start using it. Each tool consumes credits according to its cost.
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>• Gray tools are available in higher plans</p>
                  <p>• Recharge your credits via subscription or one-time purchases</p>
                  <p>• Monthly limits reset automatically</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: HISTORIQUE */}
      {/* ============================================ */}
      {activeTab === "History" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Historique Complet</h3>
            <button
              onClick={() => refetchStats()}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-black"
            >
              <RefreshCw size={12} className={statsLoading ? "animate-spin" : ""} />
              Actualiser
            </button>
          </div>
          
          {statsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Outil</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium text-right">Crédits</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                  {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                    dashboardStats.recentActivity.map((log: any) => {
                  const date = new Date(log.timestamp);
                      const Icon = {
                        image_generation: ImageIcon,
                        video_generation: Video,
                        code_generation: Code2,
                        ai_chat: Bot,
                        agent_builder: Sparkles,
                        app_builder: Smartphone,
                        website_builder: Globe,
                        text_editor: FileText,
                      }[log.tool as ToolType] || Zap;
                  
                  return (
                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                        <p className="font-medium">{date.toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-gray-400">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Icon size={14} className="text-gray-600" />
                              </div>
                              <span className="font-medium">{TOOL_LABELS[log.tool as ToolType] || log.tool}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs text-gray-500 capitalize">{log.action || 'usage'}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="font-bold text-red-600">-{log.credits}</span>
                          </td>
                    </tr>
                  );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText size={24} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-600 mb-1">Aucun historique disponible</p>
                            <p className="text-xs text-gray-400">Votre historique d'utilisation apparaîtra ici</p>
                          </div>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination hint */}
          {dashboardStats?.recentActivity && dashboardStats.recentActivity.length >= 10 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">Affichage des 10 dernières actions</p>
            </div>
          )}
        </Card>
      )}

      {/* ============================================ */}
      {/* TAB: PLANS */}
      {/* ============================================ */}
      {activeTab === "Plans" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Choisissez votre plan</h2>
            <p className="text-gray-500">Chaque plan correspond exactement à ce qu'il permet de faire. Zéro incohérence.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(['free', 'starter', 'plus', 'pro', 'enterprise'] as PlanType[]).map((plan) => (
              <PricingCard 
                key={plan}
                plan={plan}
                currentPlan={userPlan?.planId === plan}
                onUpgrade={() => handlePlanUpgrade(plan)}
              />
            ))}
          </div>

          {/* Tableau comparatif */}
          <Card className="mt-8 overflow-x-auto">
            <h3 className="font-bold text-lg mb-6">Comparaison des fonctionnalités</h3>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 font-medium">Fonctionnalité</th>
                  {(['free', 'starter', 'plus', 'pro'] as PlanType[]).map((plan) => (
                    <th key={plan} className="text-center py-3 font-bold">{PLANS[plan].name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(TOOL_LABELS) as ToolType[]).map((tool) => (
                  <tr key={tool} className="border-b border-gray-50">
                    <td className="py-3 font-medium">{TOOL_LABELS[tool]}</td>
                    {(['free', 'starter', 'plus', 'pro'] as PlanType[]).map((plan) => {
                      const feature = PLANS[plan].features.find(f => f.tool === tool);
                      return (
                        <td key={plan} className="text-center py-3">
                          {feature?.enabled ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <Check size={16} className="text-green-500" />
                              {feature.monthlyLimit && (
                                <span className="text-[10px] text-gray-400">{feature.monthlyLimit}/mois</span>
                              )}
                            </div>
                          ) : (
                            <Lock size={14} className="text-gray-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
