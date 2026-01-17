// ============================================
// REALTIME CONNECTION MANAGER
// Gestion centralisée des connexions temps réel
// avec reconnexion automatique et backpressure
// ============================================

import { logger } from '@/services/logger';

export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'suspended';

interface RealtimeConfig {
  maxReconnectAttempts: number;
  baseReconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  suspendAfterErrors: number;
  suspendDuration: number;
}

const DEFAULT_CONFIG: RealtimeConfig = {
  maxReconnectAttempts: 10,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 60000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  suspendAfterErrors: 5,
  suspendDuration: 300000, // 5 minutes
};

interface ConnectionMetrics {
  connectTime: number | null;
  disconnectTime: number | null;
  reconnectAttempts: number;
  totalReconnects: number;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
  lastError: string | null;
}

type MessageHandler = (data: unknown) => void;
type StateChangeHandler = (state: ConnectionState, previousState: ConnectionState) => void;

export class RealtimeConnection {
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private consecutiveErrors = 0;
  private suspendedUntil: number | null = null;
  private config: RealtimeConfig;
  private metrics: ConnectionMetrics;
  private messageHandlers: Set<MessageHandler> = new Set();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: unknown[] = [];
  private maxQueueSize = 100;

  constructor(
    private channelId: string,
    private connectFn: () => Promise<void>,
    private disconnectFn: () => Promise<void>,
    private sendFn: (data: unknown) => Promise<void>,
    config: Partial<RealtimeConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initMetrics();
  }

  private initMetrics(): ConnectionMetrics {
    return {
      connectTime: null,
      disconnectTime: null,
      reconnectAttempts: 0,
      totalReconnects: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      lastError: null,
    };
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    // Vérifier suspension
    if (this.suspendedUntil && Date.now() < this.suspendedUntil) {
      logger.warn(`[Realtime:${this.channelId}] Connection suspended until ${new Date(this.suspendedUntil).toISOString()}`);
      return;
    }

    this.setState('connecting');

    try {
      await this.connectFn();
      this.onConnected();
    } catch (error) {
      this.onError(error);
    }
  }

  async disconnect(): Promise<void> {
    this.clearTimers();
    this.setState('disconnected');

    try {
      await this.disconnectFn();
    } catch (error) {
      logger.error(`[Realtime:${this.channelId}] Disconnect error:`, error);
    }

    this.metrics.disconnectTime = Date.now();
  }

  async send(data: unknown): Promise<boolean> {
    if (this.state !== 'connected') {
      // Queue message for later
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push(data);
        return false;
      }
      logger.warn(`[Realtime:${this.channelId}] Message queue full, dropping message`);
      return false;
    }

    try {
      await this.sendFn(data);
      this.metrics.messagesSent++;
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    return () => this.stateChangeHandlers.delete(handler);
  }

  handleIncomingMessage(data: unknown): void {
    this.metrics.messagesReceived++;
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        logger.error(`[Realtime:${this.channelId}] Message handler error:`, error);
      }
    });
  }

  // ============================================
  // INTERNAL STATE MANAGEMENT
  // ============================================

  private onConnected(): void {
    this.setState('connected');
    this.reconnectAttempts = 0;
    this.consecutiveErrors = 0;
    this.suspendedUntil = null;
    this.metrics.connectTime = Date.now();
    this.metrics.totalReconnects++;

    // Start heartbeat
    this.startHeartbeat();

    // Flush queued messages
    this.flushMessageQueue();

    logger.info(`[Realtime:${this.channelId}] Connected`);
  }

  private onError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.metrics.errors++;
    this.metrics.lastError = errorMessage;
    this.consecutiveErrors++;

    logger.error(`[Realtime:${this.channelId}] Error:`, errorMessage);

    // Check if we should suspend
    if (this.consecutiveErrors >= this.config.suspendAfterErrors) {
      this.suspend();
      return;
    }

    // Attempt reconnection
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setState('error');
      logger.error(`[Realtime:${this.channelId}] Max reconnect attempts reached`);
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;
    this.metrics.reconnectAttempts++;

    // Exponential backoff with jitter
    const delay = Math.min(
      this.config.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000,
      this.config.maxReconnectDelay
    );

    logger.info(`[Realtime:${this.channelId}] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private suspend(): void {
    this.suspendedUntil = Date.now() + this.config.suspendDuration;
    this.setState('suspended');
    this.clearTimers();

    logger.warn(`[Realtime:${this.channelId}] Suspended until ${new Date(this.suspendedUntil).toISOString()}`);

    // Schedule unsuspend
    setTimeout(() => {
      this.suspendedUntil = null;
      this.consecutiveErrors = 0;
      this.reconnectAttempts = 0;
      this.connect();
    }, this.config.suspendDuration);
  }

  private setState(newState: ConnectionState): void {
    const previousState = this.state;
    if (previousState === newState) return;

    this.state = newState;
    this.stateChangeHandlers.forEach(handler => {
      try {
        handler(newState, previousState);
      } catch (error) {
        logger.error(`[Realtime:${this.channelId}] State change handler error:`, error);
      }
    });
  }

  // ============================================
  // HEARTBEAT
  // ============================================

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async sendHeartbeat(): Promise<void> {
    const startTime = Date.now();

    try {
      await this.send({ type: 'HEARTBEAT', timestamp: startTime });

      const latency = Date.now() - startTime;
      if (latency > this.config.heartbeatTimeout) {
        logger.warn(`[Realtime:${this.channelId}] High latency detected: ${latency}ms`);
      }
    } catch (error) {
      logger.error(`[Realtime:${this.channelId}] Heartbeat failed:`, error);
    }
  }

  // ============================================
  // MESSAGE QUEUE
  // ============================================

  private async flushMessageQueue(): Promise<void> {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      try {
        await this.send(message);
      } catch (error) {
        logger.error(`[Realtime:${this.channelId}] Failed to flush message:`, error);
      }
    }
  }

  // ============================================
  // CLEANUP
  // ============================================

  private clearTimers(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ============================================
  // PUBLIC GETTERS
  // ============================================

  getState(): ConnectionState {
    return this.state;
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  isSuspended(): boolean {
    return this.state === 'suspended';
  }
}

// ============================================
// CONNECTION MANAGER
// ============================================

class RealtimeManager {
  private connections: Map<string, RealtimeConnection> = new Map();

  register(connection: RealtimeConnection, id: string): void {
    this.connections.set(id, connection);
  }

  unregister(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.disconnect();
      this.connections.delete(id);
    }
  }

  get(id: string): RealtimeConnection | undefined {
    return this.connections.get(id);
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.values()).map(c => c.disconnect());
    await Promise.all(disconnectPromises);
    this.connections.clear();
  }

  getStats(): Record<string, { state: ConnectionState; metrics: ConnectionMetrics }> {
    const stats: Record<string, { state: ConnectionState; metrics: ConnectionMetrics }> = {};
    this.connections.forEach((connection, id) => {
      stats[id] = {
        state: connection.getState(),
        metrics: connection.getMetrics(),
      };
    });
    return stats;
  }
}

export const realtimeManager = new RealtimeManager();
