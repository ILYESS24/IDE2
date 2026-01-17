import { Suspense, lazy, memo, useMemo } from "react";
import { logger } from '@/services/logger';
import { Routes, Route, useLocation } from "react-router-dom";
import { Footer } from "./components/blocks/footer";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";
import { useClerkSync } from "./hooks/use-clerk-sync";
import { useRoutePreload } from "./hooks/use-route-preload";
import { useCoreWebVitals } from "./hooks/use-core-web-vitals";
import { ResourceHints } from "./components/ui/resource-hints";

// Import Clerk normalement
import { ClerkProvider } from '@clerk/clerk-react';
import { useClerkSafe } from "./hooks/use-clerk-safe";

// Nouvelle interface Fabrica
import Home from "@/components/home";

// ============================================
// LAZY LOADING - Groupés par priorité
// ============================================


// Pages principales (haute priorité)
const SignUp = lazy(() => import("./pages/SignUp"));

// Dashboard (chargé après authentification)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const DashboardStudio = lazy(() => import("./pages/dashboard/DashboardStudio"));
const DashboardVideo = lazy(() => import("./pages/dashboard/DashboardVideo"));
const DashboardImages = lazy(() => import("./pages/dashboard/DashboardImages"));
const DashboardCode = lazy(() => import("./pages/dashboard/DashboardCode"));
const DashboardAgents = lazy(() => import("./pages/dashboard/DashboardAgents"));
const DashboardApps = lazy(() => import("./pages/dashboard/DashboardApps"));
const DashboardWebsites = lazy(() => import("./pages/dashboard/DashboardWebsites"));
const DashboardProjects = lazy(() => import("./pages/dashboard/DashboardProjects"));


// Pages utilitaires (basse priorité)
const Settings = lazy(() => import("./pages/settings/Settings"));
const Help = lazy(() => import("./pages/help/Help"));
const Community = lazy(() => import("./pages/community/Community"));
const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const ProjectDetail = lazy(() => import("./pages/projects/ProjectDetail"));

// Pages publiques (basse priorité)
const Services = lazy(() => import("./pages/Services"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Legal = lazy(() => import("./pages/Legal"));
const GDPR = lazy(() => import("./pages/GDPR"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const Contact = lazy(() => import("./pages/Contact"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Entreprise = lazy(() => import("./pages/Entreprise"));
const AIPage = lazy(() => import("./pages/AIPage"));
const Docs = lazy(() => import("./pages/Docs"));
const Ressources = lazy(() => import("./pages/Ressources"));
const Blog = lazy(() => import("./pages/Blog"));
const About = lazy(() => import("./pages/About"));

// Tool iframe
const ToolFrame = lazy(() => import("./pages/tools/ToolFrame"));
const IframeTool = lazy(() => import("./components/tools/IframeTool"));

// ============================================
// CONFIGURATION
// ============================================

// CLERK RÉACTIVÉ AVEC SÉCURITÉ
const PUBLISHABLE_KEY = 'pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA';
const CLERK_ENABLED = !!PUBLISHABLE_KEY && PUBLISHABLE_KEY.length > 10;

// ============================================
// CLERK PROVIDER SÉCURISÉ (DÉPLACÉ ICI)
// ============================================


if (!CLERK_ENABLED) {
  logger.info('🚨 MODE DÉMO: Clerk désactivé - Application en mode démonstration');
  logger.info('Pour activer l\'authentification: VITE_CLERK_PUBLISHABLE_KEY=votre_clé_réelle dans .env');
}

// ============================================
// CLERK PROVIDER SÉCURISÉ (DÉPLACÉ ICI)
// ============================================

// Clerk Provider sécurisé avec gestion d'erreur
const ClerkProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  if (!CLERK_ENABLED) {
    // Mode démo - pas de Clerk Provider
    return <>{children}</>;
  }

  try {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        {children}
      </ClerkProvider>
    );
  } catch (error) {
    logger.warn('Clerk initialization failed, running in demo mode', { error });
    return <>{children}</>;
  }
};

// ============================================
// LOADING COMPONENTS - Optimisés
// ============================================

const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black"
        style={{
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p className="text-gray-500 text-sm font-medium">Chargement...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
));

// Loading pour les sections principales (supprimé car non utilisé)

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================
// FOOTER WRAPPER - Mémorisé
// ============================================
const ConditionalFooter = memo(({ pathname }: { pathname: string }) => {
  const hideFooter = useMemo(() => {
    return pathname.startsWith("/dashboard") ||
           pathname.startsWith("/tools") ||
           pathname === "/" ||
           pathname === "/entreprise" ||
           pathname === "/ai" ||
           pathname === "/docs" ||
           pathname === "/ressources" ||
           pathname === "/signup";
  }, [pathname]);

  if (hideFooter) return null;
  return <Footer />;
});

ConditionalFooter.displayName = 'ConditionalFooter';

// ============================================
// CLERK PLAN SYNC WRAPPER (UNIQUEMENT SI CLERK EST ACTIVÉ)
// ============================================
const ClerkSyncWrapper = memo(({ children }: { children: React.ReactNode }) => {
  // En mode démo, ne pas utiliser Clerk du tout
  if (!CLERK_ENABLED) {
    return <>{children}</>;
  }

  // UNIQUEMENT appeler les hooks quand Clerk est activé
  const { user } = useClerkSafe();
  const isLoaded = true; // Simplifié pour éviter les erreurs
  const { isSyncing, syncError } = useClerkSync();

  // Afficher un loader pendant le chargement initial de Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
          <p className="text-gray-500 text-sm">
            Chargement de l'application...
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher directement l'application
  if (!user) {
    return <>{children}</>;
  }

  // Afficher un loader seulement pendant la synchronisation ACTIVE (pas sur erreur)
  if (isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
          <p className="text-gray-500 text-sm">
            Synchronisation de votre compte...
          </p>
        </div>
      </div>
    );
  }

  // Si erreur de sync, logger mais NE PAS BLOQUER l'application
  if (syncError) {
    logger.warn('⚠️ Erreur de synchronisation (non bloquante)', { error: syncError });
    // L'application continue de fonctionner - certaines fonctionnalités peuvent être limitées
  }

  return <>{children}</>;
});

ClerkSyncWrapper.displayName = 'ClerkSyncWrapper';

// ============================================
// APP COMPONENT
// ============================================
function App() {
  const location = useLocation();

  // Précharger intelligemment les routes critiques
  useRoutePreload();

  // Surveiller les Core Web Vitals
  useCoreWebVitals();

  return (
    <QueryProvider>
      <ClerkProviderWrapper>
        <ClerkSyncWrapper>
          <ErrorBoundary>
            <ResourceHints />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Home />} />

              {/* ========== DASHBOARD ROUTES ========== */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* ========== SUB DASHBOARD ROUTES ========== */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardStudio />} />
                <Route path="video" element={<DashboardVideo />} />
                <Route path="images" element={<DashboardImages />} />
                <Route path="code" element={<DashboardCode />} />
                <Route path="agents" element={<DashboardAgents />} />
                <Route path="apps" element={<DashboardApps />} />
                <Route path="websites" element={<DashboardWebsites />} />
                <Route path="projects" element={<DashboardProjects />} />
                <Route path="project/:id" element={<ProjectDetail />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>


              {/* ========== TOOL IFRAME ROUTES ========== */}
              <Route path="/tools/:toolId" element={
                <ProtectedRoute>
                  <IframeTool />
                </ProtectedRoute>
              } />

              {/* ========== LEGACY TOOL FRAME (for external tools) ========== */}
              <Route path="/external-tools/:toolId" element={
                <ProtectedRoute>
                  <ToolFrame />
                </ProtectedRoute>
              } />

              {/* ========== PUBLIC ROUTES ========== */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/services" element={<Services />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/entreprise" element={<Entreprise />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/ressources" element={<Ressources />} />

              {/* ========== LEGAL ROUTES ========== */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              </Routes>

              <ConditionalFooter pathname={location.pathname} />
              <Toaster />
              <CookieConsent />
            </Suspense>
          </ErrorBoundary>
        </ClerkSyncWrapper>
      </ClerkProviderWrapper>
    </QueryProvider>
  );
}

export default App;
