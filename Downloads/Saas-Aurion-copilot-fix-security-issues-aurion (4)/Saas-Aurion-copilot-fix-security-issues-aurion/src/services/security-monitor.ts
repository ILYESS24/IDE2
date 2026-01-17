/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * SECURITY MONITORING SERVICE
 *
 * Service de surveillance sécurité pour détecter :
 * - Tentatives de contournement
 * - Anomalies de consommation
 * - Race conditions
 * - Erreurs de sécurité
 */

import { logger } from './logger';
import { getSupabase } from '@/lib/supabase';

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  details: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

type SecurityEventType =
  | 'access_denied'
  | 'limit_exceeded'
  | 'race_condition_detected'
  | 'security_violation'
  | 'suspicious_activity'
  | 'validation_error'
  | 'database_error'
  | 'authentication_failure';

// ============================================
// MONITORING SERVICE
// ============================================

export class SecurityMonitor {
  private supabase: any;
  private events: SecurityEvent[] = [];
  private anomalyThresholds = {
    dailyRequests: 1000,      // Requêtes/jour max par utilisateur
    hourlyFailures: 50,       // Échecs/heure max
    concurrentAccess: 10,     // Accès simultanés max par outil
    creditConsumption: 1000   // Crédits/jour max
  };

  constructor() {
    // Utiliser le client Supabase configuré
    this.supabase = getSupabase();
  }

  // ============================================
  // LOGGING ÉVÉNEMENTS SÉCURITÉ
  // ============================================

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    // Stocker en mémoire pour analyse rapide
    this.events.push(securityEvent);

    // Limiter la mémoire (garder 1000 derniers événements)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Logger selon sévérité
    const logMethod = this.getLogMethod(event.severity);
    logMethod(`[${event.type.toUpperCase()}] ${event.severity}: ${JSON.stringify(event.details)}`);

    // Persister les événements critiques/high en base
    if (event.severity === 'high' || event.severity === 'critical') {
      try {
        await this.persistSecurityEvent(securityEvent);
      } catch (error) {
        logger.error('Failed to persist security event:', error);
      }
    }

    // Alertes immédiates pour événements critiques
    if (event.severity === 'critical') {
      await this.triggerCriticalAlert(securityEvent);
    }
  }

  private getLogMethod(severity: SecurityEvent['severity']) {
    switch (severity) {
      case 'critical': return logger.error;
      case 'high': return logger.warn;
      case 'medium': return logger.warn;
      default: return logger.info;
    }
  }

  private async persistSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.supabase) {
      logger.warn('Supabase not configured - skipping security event persistence');
      return;
    }

    try {
      await this.supabase.from('security_events').insert([{
        id: event.id,
        event_type: event.type,
        severity: event.severity,
        user_id: event.userId,
        details: event.details,
        ip_address: event.ip,
        user_agent: event.userAgent,
        created_at: event.timestamp
      }]);
    } catch (error) {
      // Fallback: logger dans usage_logs
      await this.supabase.from('usage_logs').insert([{
        user_id: event.userId,
        action_type: 'security_event',
        credits_used: 0,
        metadata: {
          security_event: event,
          error: 'Failed to persist to security_events table'
        },
        created_at: event.timestamp
      }]);
    }
  }

  private async triggerCriticalAlert(event: SecurityEvent): Promise<void> {
    // Ici on pourrait envoyer des alertes Slack, email, etc.
    logger.error('🚨 CRITICAL SECURITY ALERT 🚨');
    logger.error(`Type: ${event.type}`);
    logger.error(`User: ${event.userId}`);
    logger.error(`Details: ${JSON.stringify(event.details, null, 2)}`);

    // TODO: Intégrer avec service d'alertes (Slack, PagerDuty, etc.)
  }

  // ============================================
  // DÉTECTION ANOMALIES
  // ============================================

  async detectAnomalies(userId: string): Promise<{
    anomalies: SecurityEvent[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    const userEvents = this.events.filter(e => e.userId === userId);
    const recentEvents = userEvents.filter(e =>
      new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
    );

    const anomalies: SecurityEvent[] = [];
    const recommendations: string[] = [];

    // 1. Détection tentatives répétées d'accès refusé
    const accessDeniedCount = recentEvents.filter(e => e.type === 'access_denied').length;
    if (accessDeniedCount > 10) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'suspicious_activity',
        severity: 'medium',
        userId,
        details: { reason: 'multiple_access_denied', count: accessDeniedCount },
        timestamp: new Date().toISOString()
      });
      recommendations.push('Monitorer activité utilisateur - tentatives répétées d\'accès refusé');
    }

    // 2. Détection consommation crédits anormale
    const creditConsumption = recentEvents
      .filter(e => e.details.creditsUsed)
      .reduce((sum, e) => sum + (e.details.creditsUsed || 0), 0);

    if (creditConsumption > this.anomalyThresholds.creditConsumption) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'suspicious_activity',
        severity: 'high',
        userId,
        details: { reason: 'excessive_credit_consumption', amount: creditConsumption },
        timestamp: new Date().toISOString()
      });
      recommendations.push('Vérifier utilisation légitime - consommation excessive détectée');
    }

    // 3. Détection erreurs de validation répétées
    const validationErrors = recentEvents.filter(e => e.type === 'validation_error').length;
    if (validationErrors > 5) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'suspicious_activity',
        severity: 'medium',
        userId,
        details: { reason: 'repeated_validation_errors', count: validationErrors },
        timestamp: new Date().toISOString()
      });
      recommendations.push('Investiguer erreurs de validation - possible tentative de contournement');
    }

    // Calculer niveau de risque
    const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
    const mediumSeverityCount = anomalies.filter(a => a.severity === 'medium').length;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (highSeverityCount > 0) riskLevel = 'high';
    else if (mediumSeverityCount > 2) riskLevel = 'medium';
    else if (anomalies.length > 0) riskLevel = 'medium';

    return { anomalies, riskLevel, recommendations };
  }

  // ============================================
  // MONITORING TEMPS RÉEL
  // ============================================

  async monitorToolAccess(userId: string, toolId: string, result: any): Promise<void> {
    if (!result.allowed) {
      // Log accès refusé
      await this.logSecurityEvent({
        type: 'access_denied',
        severity: result.reason?.includes('insufficient') ? 'low' : 'medium',
        userId,
        details: {
          tool: toolId,
          reason: result.reason,
          creditsRequired: result.creditsRequired,
          creditsAvailable: result.creditsAvailable
        }
      });
    } else {
      // Vérifier anomalies sur succès
      const { riskLevel } = await this.detectAnomalies(userId);
      if (riskLevel === 'high') {
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          userId,
          details: {
            tool: toolId,
            context: 'high_risk_user_accessed_tool',
            riskLevel
          }
        });
      }
    }
  }

  async monitorCreditConsumption(userId: string, actionType: string, creditsUsed: number): Promise<void> {
    // Vérifier consommation anormale
    const recentConsumption = this.events
      .filter(e => e.userId === userId && e.details.creditsUsed && e.timestamp > new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .reduce((sum, e) => sum + (e.details.creditsUsed || 0), 0);

    if (recentConsumption + creditsUsed > this.anomalyThresholds.creditConsumption / 24) { // /24 pour heure
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        userId,
        details: {
          action: actionType,
          creditsUsed,
          recentConsumption,
          threshold: this.anomalyThresholds.creditConsumption / 24
        }
      });
    }
  }

  // ============================================
  // RAPPORTS ET MÉTRIQUES
  // ============================================

  async getSecurityMetrics(hours: number = 24): Promise<{
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    anomaliesDetected: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const relevantEvents = this.events.filter(e => e.timestamp >= since);

    const eventsByType = relevantEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<SecurityEventType, number>);

    const eventsBySeverity = relevantEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userEventCounts = relevantEvents.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userEventCounts)
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const anomaliesDetected = relevantEvents.filter(e =>
      e.type === 'suspicious_activity' || e.severity === 'high' || e.severity === 'critical'
    ).length;

    return {
      totalEvents: relevantEvents.length,
      eventsByType,
      eventsBySeverity,
      topUsers,
      anomaliesDetected
    };
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  async performSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{ name: string; status: 'ok' | 'warning' | 'error'; details?: string }>;
  }> {
    if (!this.supabase) {
      return {
        status: 'critical',
        checks: [{
          name: 'Supabase configuration',
          status: 'error',
          details: 'Supabase client not configured'
        }]
      };
    }

    const checks = [];

    // 1. Vérifier connectivité base de données
    try {
      const { error } = await this.supabase.from('profiles').select('count').limit(1);
      checks.push({
        name: 'Database connectivity',
        status: error ? 'error' : 'ok',
        details: error?.message
      });
    } catch (error) {
      checks.push({
        name: 'Database connectivity',
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Vérifier événements récents (pas de silence radio)
    const recentEvents = this.events.filter(e =>
      new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Dernière heure
    );

    checks.push({
      name: 'Event monitoring',
      status: recentEvents.length > 0 ? 'ok' : 'warning',
      details: `${recentEvents.length} events in last hour`
    });

    // 3. Vérifier seuils d'anomalies
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical');
    checks.push({
      name: 'Critical events',
      status: criticalEvents.length === 0 ? 'ok' : 'error',
      details: `${criticalEvents.length} critical events in last hour`
    });

    // 4. Vérifier mémoire événements
    checks.push({
      name: 'Memory usage',
      status: this.events.length < 1000 ? 'ok' : 'warning',
      details: `${this.events.length} events in memory`
    });

    // Déterminer statut global
    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');

    const status = hasErrors ? 'critical' : hasWarnings ? 'warning' : 'healthy';

    return { status, checks };
  }
}

// ============================================
// INSTANCE GLOBALE
// ============================================

export const securityMonitor = new SecurityMonitor();

// ============================================
// UTILITAIRES POUR INTÉGRATION
// ============================================

export const securityUtils = {
  // Wrapper pour logging automatique des accès outil
  async withSecurityMonitoring<T>(
    userId: string,
    toolId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await operation();

      // Monitorer l'accès si c'est un résultat d'accès
      if (result && typeof result === 'object' && 'allowed' in result) {
        await securityMonitor.monitorToolAccess(userId, toolId, result);
      }

      return result;
    } catch (error) {
      await securityMonitor.logSecurityEvent({
        type: 'validation_error',
        severity: 'medium',
        userId,
        details: {
          tool: toolId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
      throw error;
    }
  },

  // Validation IP (optionnel - pour détection géographique)
  validateRequestOrigin(request: Request): { valid: boolean; risk: 'low' | 'medium' | 'high' } {
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');

    // Liste des origines autorisées (à configurer)
    const allowedOrigins = [
      'https://your-domain.com',
      'https://staging.your-domain.com',
      'http://localhost:3000', // Dev only
    ];

    const isValidOrigin = !origin || allowedOrigins.some(allowed =>
      origin.startsWith(allowed)
    );

    const isValidReferer = !referer || allowedOrigins.some(allowed =>
      referer.startsWith(allowed)
    );

    if (!isValidOrigin || !isValidReferer) {
      return { valid: false, risk: 'high' };
    }

    return { valid: true, risk: 'low' };
  }
};
