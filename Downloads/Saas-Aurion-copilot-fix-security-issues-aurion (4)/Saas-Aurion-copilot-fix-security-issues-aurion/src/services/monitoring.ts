/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// ============================================
// MONITORING & ALERTES - Production Ready
// Système centralisé de surveillance applicative
// ============================================

import { logger } from './logger';

// Types pour le monitoring
export interface MonitoringMetric {
  name: string;
  value: number;
  unit: 'ms' | 'count' | 'bytes' | 'percent';
  tags?: Record<string, string>;
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: number;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastCheck: number;
  message?: string;
}

// Configuration des seuils d'alerte
const ALERT_THRESHOLDS = {
  // Performance
  apiLatencyWarning: 1000, // ms
  apiLatencyCritical: 3000, // ms
  
  // Erreurs
  errorRateWarning: 0.01, // 1%
  errorRateCritical: 0.05, // 5%
  
  // Ressources
  creditsLowWarning: 10, // crédits
  creditsLowCritical: 0,
  
  // Business
  paymentFailureThreshold: 3, // échecs consécutifs
};

class MonitoringService {
  private metrics: MonitoringMetric[] = [];
  private alerts: Alert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private errorCount = 0;
  private requestCount = 0;
  private isProduction = import.meta.env.PROD;

  constructor() {
    // Surveillance périodique en production
    if (this.isProduction) {
      // Vérification de santé toutes les 30 secondes
      setInterval(() => this.runHealthChecks(), 30000);
      
      // Envoi des métriques toutes les 60 secondes
      setInterval(() => this.flushMetrics(), 60000);
      
      // Nettoyage des anciennes alertes toutes les heures
      setInterval(() => this.cleanupAlerts(), 3600000);
    }
  }

  // ============================================
  // MÉTRIQUES
  // ============================================

  /**
   * Enregistre une métrique
   */
  recordMetric(name: string, value: number, unit: MonitoringMetric['unit'], tags?: Record<string, string>) {
    const metric: MonitoringMetric = {
      name,
      value,
      unit,
      tags,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Vérifier les seuils d'alerte
    this.checkMetricThresholds(metric);

    // En dev, afficher dans la console
    if (!this.isProduction) {
      logger.debug(`📊 Metric: ${name} = ${value}${unit}`, tags);
    }
  }

  /**
   * Enregistre la latence d'une requête API
   */
  recordApiLatency(endpoint: string, latencyMs: number, statusCode: number) {
    this.recordMetric('api_latency', latencyMs, 'ms', {
      endpoint,
      status: String(statusCode)
    });

    this.requestCount++;

    // Alerter si latence élevée
    if (latencyMs > ALERT_THRESHOLDS.apiLatencyCritical) {
      this.createAlert('critical', 'API Performance Critical', 
        `L'endpoint ${endpoint} a une latence de ${latencyMs}ms`, 'api');
    } else if (latencyMs > ALERT_THRESHOLDS.apiLatencyWarning) {
      this.createAlert('warning', 'API Performance Warning',
        `L'endpoint ${endpoint} a une latence de ${latencyMs}ms`, 'api');
    }
  }

  /**
   * Enregistre une erreur
   */
  recordError(source: string, error: Error | string, context?: Record<string, unknown>) {
    this.errorCount++;
    
    this.recordMetric('error_count', 1, 'count', {
      source,
      error: typeof error === 'string' ? error : error.message
    });

    // Calculer le taux d'erreur
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
    
    if (errorRate > ALERT_THRESHOLDS.errorRateCritical) {
      this.createAlert('critical', 'Error Rate Critical',
        `Taux d'erreur: ${(errorRate * 100).toFixed(2)}%`, source);
    } else if (errorRate > ALERT_THRESHOLDS.errorRateWarning) {
      this.createAlert('warning', 'Error Rate Warning',
        `Taux d'erreur: ${(errorRate * 100).toFixed(2)}%`, source);
    }

    logger.error(`Monitored error in ${source}`, error, context);
  }

  /**
   * Enregistre une transaction de paiement
   */
  recordPayment(userId: string, amount: number, success: boolean, planType?: string) {
    this.recordMetric('payment', amount, 'count', {
      userId,
      success: String(success),
      planType: planType || 'unknown'
    });

    if (!success) {
      logger.security('Payment failed', { userId, amount, planType });
    }
  }

  /**
   * Enregistre la consommation de crédits
   */
  recordCreditUsage(userId: string, amount: number, remaining: number, toolId: string) {
    this.recordMetric('credit_usage', amount, 'count', {
      userId,
      toolId,
      remaining: String(remaining)
    });

    // Alerter si crédits bas
    if (remaining <= ALERT_THRESHOLDS.creditsLowCritical) {
      this.createAlert('info', 'User Out of Credits',
        `L'utilisateur ${userId} n'a plus de crédits`, 'credits');
    } else if (remaining <= ALERT_THRESHOLDS.creditsLowWarning) {
      this.createAlert('info', 'User Low Credits',
        `L'utilisateur ${userId} a ${remaining} crédits restants`, 'credits');
    }
  }

  // ============================================
  // ALERTES
  // ============================================

  /**
   * Crée une nouvelle alerte
   */
  createAlert(severity: Alert['severity'], title: string, message: string, source: string): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      message,
      source,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);

    // Log selon la sévérité
    if (severity === 'critical' || severity === 'error') {
      logger.security(`🚨 ALERT [${severity.toUpperCase()}]: ${title}`, { message, source });
    } else {
      logger.warn(`⚠️ ALERT [${severity}]: ${title}`, { message, source });
    }

    // En production, envoyer à un service externe
    if (this.isProduction) {
      this.sendAlertToExternalService(alert);
    }

    return alert;
  }

  /**
   * Résout une alerte
   */
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
    }
  }

  /**
   * Récupère les alertes actives
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  /**
   * Exécute les vérifications de santé
   */
  async runHealthChecks() {
    // Check Supabase
    await this.checkSupabaseHealth();
    
    // Check API externe (si applicable)
    await this.checkExternalApiHealth();
  }

  /**
   * Vérifie la santé de Supabase
   */
  async checkSupabaseHealth() {
    const start = Date.now();
    
    try {
      // Simple ping vers Supabase
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      const latency = Date.now() - start;
      
      this.updateHealthCheck('supabase', 
        response.ok ? 'healthy' : 'degraded',
        latency,
        response.ok ? 'Connected' : `Status: ${response.status}`
      );

    } catch (error) {
      this.updateHealthCheck('supabase', 'unhealthy', Date.now() - start,
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Vérifie la santé des APIs externes
   * ✅ OpenRouter est maintenant vérifié via le backend /api/ai-chat
   */
  async checkExternalApiHealth() {
    // Check AI Chat API health endpoint (intentionally public for health checks)
    // Note: GET /api/ai-chat is a public endpoint that returns model list + status
    // This allows monitoring without auth while POST requires authentication
    const start = Date.now();
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'GET'
      });
      this.updateHealthCheck('ai-chat', 
        response.ok ? 'healthy' : 'degraded',
        Date.now() - start
      );
    } catch {
      this.updateHealthCheck('ai-chat', 'unhealthy', Date.now() - start);
    }
  }

  /**
   * Met à jour l'état de santé d'un service
   */
  private updateHealthCheck(
    service: string, 
    status: HealthCheck['status'], 
    latency?: number, 
    message?: string
  ) {
    this.healthChecks.set(service, {
      service,
      status,
      latency,
      lastCheck: Date.now(),
      message
    });

    // Alerter si unhealthy
    if (status === 'unhealthy') {
      this.createAlert('error', `Service Unhealthy: ${service}`,
        message || 'Service is not responding', 'health');
    }
  }

  /**
   * Récupère l'état de santé global
   */
  getHealthStatus(): { overall: HealthCheck['status']; services: HealthCheck[] } {
    const services = Array.from(this.healthChecks.values());
    
    let overall: HealthCheck['status'] = 'healthy';
    if (services.some(s => s.status === 'unhealthy')) {
      overall = 'unhealthy';
    } else if (services.some(s => s.status === 'degraded')) {
      overall = 'degraded';
    }

    return { overall, services };
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  private checkMetricThresholds(metric: MonitoringMetric) {
    // Vérifications spécifiques par métrique
    // Ajoutez ici des vérifications personnalisées
  }

  private async sendAlertToExternalService(alert: Alert) {
    // En production, envoyer à Sentry/PagerDuty/Slack
    try {
      // Exemple avec un webhook (à configurer)
      const webhookUrl = import.meta.env.VITE_ALERT_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 [${alert.severity.toUpperCase()}] ${alert.title}\n${alert.message}`,
            alert
          })
        });
      }
    } catch (error) {
      logger.error('Failed to send alert to external service', error);
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    // En production, envoyer à un service de métriques (DataDog, etc.)
    if (this.isProduction) {
      const metricsUrl = import.meta.env.VITE_METRICS_ENDPOINT;
      if (metricsUrl) {
        try {
          await fetch(metricsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.metrics)
          });
        } catch (error) {
          logger.error('Failed to flush metrics', error);
        }
      }
    }

    // Nettoyer les anciennes métriques (garder les 5 dernières minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.metrics = this.metrics.filter(m => m.timestamp > fiveMinutesAgo);
  }

  private cleanupAlerts() {
    // Garder les alertes des dernières 24 heures
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(a => a.timestamp > oneDayAgo || !a.resolved);
  }

  /**
   * Obtenir un résumé du dashboard monitoring
   */
  getDashboardSummary() {
    const health = this.getHealthStatus();
    const activeAlerts = this.getActiveAlerts();
    
    return {
      health,
      alerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        warnings: activeAlerts.filter(a => a.severity === 'warning').length,
      },
      metrics: {
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) + '%' : '0%'
      }
    };
  }
}

// Instance globale
// Export a function to create monitoring instance instead of a global instance
export const createMonitoring = () => new MonitoringService();

// Global monitoring instance for the application
const monitoringInstance = new MonitoringService();
export { monitoringInstance as monitoring };

// ============================================
// HELPERS POUR MESURER LES PERFORMANCES
// ============================================

/**
 * Mesure le temps d'exécution d'une fonction
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    monitoringInstance.recordMetric(name, duration, 'ms');
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitoringInstance.recordMetric(name, duration, 'ms', { error: 'true' });
    throw error;
  }
}

/**
 * Wrapper pour mesurer automatiquement les appels API
 */
export function withMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: Parameters<T>) => {
    return measurePerformance(name, () => fn(...args));
  }) as T;
}
