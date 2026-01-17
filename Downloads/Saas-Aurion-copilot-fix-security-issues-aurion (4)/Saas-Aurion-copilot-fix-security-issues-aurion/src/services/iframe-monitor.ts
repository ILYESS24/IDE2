// ============================================
// MONITORING DES IFRAMES
// Métriques de performance et d'utilisation
// Alertes automatiques pour iframes down
// ============================================

import { logger } from '@/services/logger';

interface IframeMetrics {
  toolId: string;
  userId: string;
  loadTime: number;
  errorCount: number;
  sessionDuration: number;
  creditsConsumed: number;
  timestamp: number;
  origin: string;
  userAgent: string;
}

// ============================================
// CONFIGURATION DES ALERTES
// ============================================

interface IframeHealthState {
  toolId: string;
  isHealthy: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  lastError?: string;
  alertSent: boolean;
}

const HEALTH_ALERT_THRESHOLD = 3; // Alerter après 3 échecs consécutifs
const HEALTH_CHECK_INTERVAL = 30000; // 30 secondes
const ALERT_COOLDOWN = 300000; // 5 minutes entre les alertes

class IframeMonitor {
  private metrics: IframeMetrics[] = [];
  private batchSize = 10;
  private healthStates: Map<string, IframeHealthState> = new Map();
  private healthCheckCallbacks: Map<string, (healthy: boolean, error?: string) => void> = new Map();
  private lastAlertTime: Map<string, number> = new Map();

  recordMetric(metric: Omit<IframeMetrics, 'timestamp'>) {
    const fullMetric: IframeMetrics = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Flush automatiquement si batch size atteint
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  // ============================================
  // SYSTÈME D'ALERTES IFRAME DOWN
  // ============================================

  /**
   * Enregistre un callback pour recevoir les alertes de santé
   */
  onHealthChange(toolId: string, callback: (healthy: boolean, error?: string) => void): () => void {
    this.healthCheckCallbacks.set(toolId, callback);
    return () => this.healthCheckCallbacks.delete(toolId);
  }

  /**
   * Met à jour l'état de santé d'une iframe
   */
  updateHealthStatus(toolId: string, isHealthy: boolean, error?: string) {
    const now = Date.now();
    const currentState = this.healthStates.get(toolId);
    
    const newState: IframeHealthState = {
      toolId,
      isHealthy,
      lastCheck: now,
      consecutiveFailures: isHealthy ? 0 : (currentState?.consecutiveFailures || 0) + 1,
      lastError: error,
      alertSent: currentState?.alertSent || false,
    };

    // Vérifier si on doit envoyer une alerte
    if (!isHealthy && newState.consecutiveFailures >= HEALTH_ALERT_THRESHOLD) {
      const lastAlert = this.lastAlertTime.get(toolId) || 0;
      
      if (now - lastAlert > ALERT_COOLDOWN && !newState.alertSent) {
        this.sendHealthAlert(toolId, error || 'Unknown error');
        newState.alertSent = true;
        this.lastAlertTime.set(toolId, now);
      }
    }

    // Si l'iframe est redevenue healthy, reset l'état d'alerte
    if (isHealthy && currentState && !currentState.isHealthy) {
      newState.alertSent = false;
      this.sendRecoveryNotification(toolId);
    }

    this.healthStates.set(toolId, newState);

    // Notifier les callbacks enregistrés
    const callback = this.healthCheckCallbacks.get(toolId);
    if (callback) {
      callback(isHealthy, error);
    }
  }

  /**
   * Envoie une alerte au backend lorsqu'une iframe est down
   */
  private async sendHealthAlert(toolId: string, error: string) {
    logger.security('[IframeMonitor] Iframe DOWN alert', { toolId, error });

    try {
      await fetch('/api/iframe-health-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iframe_down',
          toolId,
          error,
          timestamp: Date.now(),
          consecutiveFailures: this.healthStates.get(toolId)?.consecutiveFailures || 0,
          clientInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
          }
        })
      });
    } catch (err) {
      logger.error('[IframeMonitor] Failed to send health alert:', err);
    }
  }

  /**
   * Notifie le backend qu'une iframe est revenue en ligne
   */
  private async sendRecoveryNotification(toolId: string) {
    logger.info('[IframeMonitor] Iframe recovered', { toolId });

    try {
      await fetch('/api/iframe-health-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iframe_recovered',
          toolId,
          timestamp: Date.now(),
        })
      });
    } catch (err) {
      // Non critique, juste log
      logger.debug('[IframeMonitor] Failed to send recovery notification:', err);
    }
  }

  /**
   * Obtient l'état de santé actuel de toutes les iframes
   */
  getHealthStates(): IframeHealthState[] {
    return Array.from(this.healthStates.values());
  }

  /**
   * Vérifie si une iframe spécifique est en bonne santé
   */
  isIframeHealthy(toolId: string): boolean {
    const state = this.healthStates.get(toolId);
    if (!state) return true; // Par défaut, on suppose que c'est OK
    return state.isHealthy;
  }

  /**
   * Obtient le nombre d'iframes actuellement down
   */
  getDownIframesCount(): number {
    return Array.from(this.healthStates.values()).filter(s => !s.isHealthy).length;
  }

  recordLoadTime(toolId: string, userId: string, loadTime: number, origin: string) {
    this.recordMetric({
      toolId,
      userId,
      loadTime,
      errorCount: 0,
      sessionDuration: 0,
      creditsConsumed: 0,
      origin,
      userAgent: navigator.userAgent
    });
  }

  recordError(toolId: string, userId: string, _error: string, origin: string) {
    // Trouver la métrique existante ou créer une nouvelle
    const existingMetric = this.metrics.find(m =>
      m.toolId === toolId && m.userId === userId && m.errorCount === 0
    );

    if (existingMetric) {
      existingMetric.errorCount++;
    } else {
      this.recordMetric({
        toolId,
        userId,
        loadTime: 0,
        errorCount: 1,
        sessionDuration: 0,
        creditsConsumed: 0,
        origin,
        userAgent: navigator.userAgent
      });
    }
  }

  recordSessionEnd(toolId: string, userId: string, sessionDuration: number, creditsConsumed: number, origin: string) {
    this.recordMetric({
      toolId,
      userId,
      loadTime: 0,
      errorCount: 0,
      sessionDuration,
      creditsConsumed,
      origin,
      userAgent: navigator.userAgent
    });
  }

  private async flush() {
    if (this.metrics.length === 0) return;

    try {
      // Envoyer les métriques au backend pour logging
      const response = await fetch('/api/log-iframe-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Auth header sera ajouté automatiquement par les intercepteurs
        },
        body: JSON.stringify({
          metrics: this.metrics,
          clientVersion: '1.0.0'
        })
      });

      if (response.ok) {
        logger.debug('[IframeMonitor] Flushed metrics', { count: this.metrics.length });
        this.metrics = [];
      } else {
        logger.warn('[IframeMonitor] Failed to flush metrics', { status: response.status });
        // Garder les métriques pour retry plus tard
      }
    } catch (error) {
      logger.error('[IframeMonitor] Failed to flush iframe metrics', error);
      // En cas d'erreur réseau, garder les métriques pour retry
    }
  }

  // Force flush (utile avant unload de page)
  async forceFlush() {
    if (this.metrics.length > 0) {
      await this.flush();
    }
  }

  // Statistiques en temps réel
  getStats() {
    const totalMetrics = this.metrics.length;
    const errors = this.metrics.filter(m => m.errorCount > 0).length;
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / Math.max(1, this.metrics.length);

    return {
      pendingMetrics: totalMetrics,
      errorRate: totalMetrics > 0 ? (errors / totalMetrics) * 100 : 0,
      avgLoadTime: Math.round(avgLoadTime),
      toolsUsed: [...new Set(this.metrics.map(m => m.toolId))]
    };
  }
}

// Instance globale
export const iframeMonitor = new IframeMonitor();

// Cleanup automatique avant unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    iframeMonitor.forceFlush();
  });
}
