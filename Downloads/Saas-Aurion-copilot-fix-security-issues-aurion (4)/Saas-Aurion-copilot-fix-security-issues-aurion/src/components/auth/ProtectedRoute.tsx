import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { useClerkSafe } from "@/hooks/use-clerk-safe";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

// Composant interne qui utilise useClerkSafe
function AuthenticatedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useClerkSafe();

  // Still loading auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Not signed in - redirect
  if (!isSignedIn) {
    return <Navigate to={redirectTo || "/"} replace />;
  }

  // Signed in - render children
  return <>{children}</>;
}

export function ProtectedRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  // Utiliser la même logique que dans App.tsx
  const PUBLISHABLE_KEY = 'pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA';
  const CLERK_ENABLED = true; // FORCE ACTIVATION

  // Mode Clerk activé - utiliser l'authentification normale
  return <AuthenticatedRoute redirectTo={redirectTo}>{children}</AuthenticatedRoute>;
}
