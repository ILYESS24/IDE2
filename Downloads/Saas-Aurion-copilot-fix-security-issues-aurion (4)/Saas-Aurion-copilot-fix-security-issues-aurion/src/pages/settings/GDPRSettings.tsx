/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { Button } from "@/components/ui/button";
import { safeJsonResponse } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Trash2,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Database,
  Mail
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

export default function GDPRSettings() {
  const { user, getToken } = useClerkSafe();
  const isSignedIn = !!user;
  const { toast } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  // Charger l'historique des exports
  const loadExportHistory = async () => {
    try {
      // Simulation - en production, récupérer depuis l'API
      const mockHistory = [
        {
          id: 'export_001',
          date: '2024-01-15',
          status: 'completed',
          downloadUrl: '/api/gdpr/export/export_001.zip'
        }
      ];
      setExportHistory(mockHistory);
    } catch (error) {
      logger.error('Failed to load export history', error);
    }
  };

  // Exporter les données utilisateur
  const handleDataExport = async () => {
    if (!isSignedIn || !user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour exporter vos données.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      logger.userAction('gdpr_data_export_requested', { userId: user.id });

      // Appeler l'API d'export
      const token = await getToken();
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          includeUsageHistory: true,
          includePayments: true,
          includePreferences: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la demande d\'export');
      }

      const result = await safeJsonResponse(response);

      toast({
        title: "Demande d'export envoyée",
        description: "Vous recevrez un email lorsque vos données seront prêtes.",
      });

      // Recharger l'historique
      setTimeout(() => loadExportHistory(), 2000);

    } catch (error) {
      logger.error('Data export failed', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande d'export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Télécharger un export existant
  const handleDownloadExport = async (exportId: string, downloadUrl: string) => {
    try {
      logger.userAction('gdpr_export_downloaded', { exportId, userId: user?.id });

      // En production, déclencher le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aurion-data-export-${exportId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      logger.error('Export download failed', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'export.",
        variant: "destructive",
      });
    }
  };

  // Supprimer le compte utilisateur
  const handleAccountDeletion = async () => {
    if (!isSignedIn || !user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer votre compte.",
        variant: "destructive",
      });
      return;
    }

    if (deleteConfirmation !== 'SUPPRIMER MON COMPTE') {
      toast({
        title: "Confirmation requise",
        description: "Veuillez saisir le texte de confirmation exact.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      logger.security('account_deletion_requested', { userId: user.id });

      // Appeler l'API de suppression
      const token = await getToken();
      const response = await fetch('/api/gdpr/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          confirmation: deleteConfirmation,
          reason: 'user_request'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte');
      }

      toast({
        title: "Demande de suppression envoyée",
        description: "Votre compte sera supprimé dans 30 jours. Vous pouvez annuler pendant ce délai.",
      });

      // Déconnexion automatique
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      logger.error('Account deletion failed', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande de suppression.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Charger l'historique au montage
  useState(() => {
    loadExportHistory();
  });

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder aux paramètres RGPD.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Droits RGPD</h2>
        <p className="text-gray-600 mt-1">
          Gérez vos données personnelles et vos droits selon le RGPD.
        </p>
      </div>

      {/* Export des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export de vos données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Téléchargez une copie complète de toutes vos données personnelles stockées dans notre système.
            L'export inclut votre profil, historique d'utilisation, paiements, et préférences.
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Format: ZIP chiffré</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Délai: 24-48h</span>
            </div>
          </div>

          <Button
            onClick={handleDataExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Demande en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Demander l'export de mes données
              </>
            )}
          </Button>

          {/* Historique des exports */}
          {exportHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Exports précédents</h4>
              <div className="space-y-2">
                {exportHistory.map((exportItem) => (
                  <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Export #{exportItem.id}</p>
                        <p className="text-xs text-gray-500">{exportItem.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exportItem.status === 'completed' ? 'default' : 'secondary'}>
                        {exportItem.status === 'completed' ? 'Prêt' : 'En cours'}
                      </Badge>
                      {exportItem.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadExport(exportItem.id, exportItem.downloadUrl)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Suppression du compte */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            Suppression du compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Action irréversible:</strong> Cette action supprimera définitivement toutes vos données,
              historique d'utilisation, et annule tous vos abonnements actifs.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saisissez "SUPPRIMER MON COMPTE" pour confirmer
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="SUPPRIMER MON COMPTE"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Ce qui sera supprimé :</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Votre profil utilisateur et données personnelles</li>
                <li>• Historique complet d'utilisation et générations</li>
                <li>• Tous les abonnements actifs (remboursement automatique)</li>
                <li>• Crédits restants et historique de paiement</li>
                <li>• Préférences et paramètres personnalisés</li>
              </ul>
            </div>

            <Button
              onClick={handleAccountDeletion}
              disabled={isDeleting || deleteConfirmation !== 'SUPPRIMER MON COMPTE'}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Suppression en cours...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer définitivement mon compte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations RGPD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Vos droits RGPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Droit d'accès</h4>
                <p className="text-sm text-gray-600">Demandez une copie de vos données</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Droit de rectification</h4>
                <p className="text-sm text-gray-600">Corrigez vos données inexactes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Droit à l'effacement</h4>
                <p className="text-sm text-gray-600">Supprimez vos données</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Portabilité</h4>
                <p className="text-sm text-gray-600">Exportez vos données</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-sm text-gray-600">
            <p>
              Pour toute question concernant vos données ou l'exercice de vos droits RGPD,
              contactez notre DPO à :{" "}
              <a href="mailto:privacy@aurion.ai" className="text-blue-600 hover:underline">
                privacy@aurion.ai
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
