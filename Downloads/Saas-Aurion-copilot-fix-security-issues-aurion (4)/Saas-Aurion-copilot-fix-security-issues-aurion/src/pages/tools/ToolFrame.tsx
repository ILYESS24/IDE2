/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToolAccess } from "@/hooks/use-plan";
import { accessControl } from "@/services/access-control";
import { useErrorHandler } from "@/services/error-handler";
import { useCredits } from "@/hooks/use-dashboard";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Crown,
  Clock,
  Calendar
} from "lucide-react";

export default function ToolFrame() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { handleError, withErrorHandling } = useErrorHandler();
  const { data: credits } = useCredits();
  const { getToken } = useClerkSafe();
  const [isLoading, setIsLoading] = useState(false);

  // Mapping complet des outils
  const tools: Record<string, {
    name: string;
    url: string;
    description: string;
    icon: string;
    category: string;
    cost: number;
  }> = {
    "app-builder": {
      name: "AI App Builder - Développement d'Applications IA",
      url: "https://aurion-app-v2.pages.dev/",
      description: "Créez des applications mobiles et web professionnelles sans coder grâce à l'intelligence artificielle avancée",
      icon: "📱",
      category: "Développement IA",
      cost: 50
    },
    "website-builder": {
      name: "AI Website Builder - Créateur de Sites Web IA",
      url: "https://790d4da4.ai-assistant-xlv.pages.dev",
      description: "Construisez des sites web professionnels et responsives en quelques minutes grâce à l'intelligence artificielle",
      icon: "🌐",
      category: "Développement Web IA",
      cost: 25
    },
    "text-editor": {
      name: "AI Rich Text Editor - Éditeur de Texte Intelligent",
      url: "https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app",
      description: "Éditeur de texte enrichi avec intelligence artificielle intégrée pour une rédaction optimisée et créative",
      icon: "📝",
      category: "Productivité IA",
      cost: 5
    },
    "ai-agents": {
      name: "AI Agents Builder - Créateur d'Agents IA",
      url: "https://flo-1-2ba8.onrender.com",
      description: "Créez et déployez des agents IA personnalisables pour automatiser vos processus métier complexes",
      icon: "🤖",
      category: "Intelligence Artificielle",
      cost: 30
    },
    "code-editor": {
      name: "AI Code Editor - Éditeur de Code IA",
      url: "https://790d4da4.ai-assistant-xlv.pages.dev",
      description: "Éditeur de code source avec assistance IA avancée pour développement accéléré et débogage intelligent",
      icon: "💻",
      category: "Développement IA",
      cost: 10
    },
    "content-generator": {
      name: "AI Content Generator - Génération de Contenu Multimédia",
      url: "https://790d4da4.ai-assistant-xlv.pages.dev",
      description: "Générez automatiquement du contenu créatif : textes, images et vidéos avec l'intelligence artificielle",
      icon: "🎨",
      category: "Création de Contenu IA",
      cost: 15
    },
  };

  const tool = tools[toolId || ''];
  const { accessCheck, checkAndConsume } = useToolAccess(toolId as any);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Outil non trouvé</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              L'outil demandé n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLaunchTool = async () => {
    setIsLoading(true);

    const result = await withErrorHandling(async () => {
      // Obtenir le token JWT de Clerk
      const token = await getToken();

      if (!token) {
        throw new Error('Authentification requise');
      }

      // Appeler l'API serveur pour créer une session et obtenir l'URL sécurisée
      // NOTE: Plus de vérification côté client - tout se fait côté serveur
      const response = await fetch('/api/launch-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ toolId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lancement outil');
      }

      const data = await response.json();
      return data;
    }, 'tool_launch');

    setIsLoading(false);

    if (result) {
      // Ouvrir l'URL sécurisée avec token de session
      window.open(result.toolUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;
  // NOTE: Vérification d'accès simplifiée - la vraie vérification se fait côté serveur
  const canAccess = availableCredits > 0; // Au moins 1 crédit disponible

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
        </div>

        {/* Tool Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{tool.icon}</div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{tool.name}</CardTitle>
                <p className="text-gray-600">{tool.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{tool.cost} crédits</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Premium</span>
              </div>
            </div>

            {/* Status */}
            {accessCheck && (
              <div className="space-y-2">
                {accessCheck.allowed ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      Accès autorisé à cet outil
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {accessCheck.reason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Crédits disponibles */}
                <div className="flex items-center justify-between text-sm">
                  <span>Crédits disponibles:</span>
                  <Badge variant={availableCredits >= tool.cost ? "default" : "destructive"}>
                    {availableCredits} / {tool.cost} requis
                  </Badge>
                </div>

                {/* Limites d'utilisation */}
                {accessCheck.dailyRemaining !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Aujourd'hui:
                    </span>
                    <span>{accessCheck.dailyRemaining} utilisations restantes</span>
                  </div>
                )}

                {accessCheck.monthlyRemaining !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Ce mois:
                    </span>
                    <span>{accessCheck.monthlyRemaining} utilisations restantes</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleLaunchTool}
              disabled={!canAccess || isLoading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Lancement en cours...
                </>
              ) : (
                <>
                  🚀 Lancer {tool.name}
                </>
              )}
            </Button>

            {!canAccess && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Crédits insuffisants ou limites atteintes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Cet outil s'ouvrira dans un nouvel onglet</p>
          <p>Assurez-vous que les pop-ups sont autorisés dans votre navigateur</p>
        </div>
      </div>
    </div>
  );
}