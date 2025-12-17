// API client pour Aurora AI Studio
import { config } from './config';

export interface AgentRequest {
  prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
}

export interface WorkflowRequest {
  yaml_config: string;
  inputs: string[];
}

export interface SimpleWorkflowRequest {
  task: string;
  agents_config?: Record<string, any>;
}

export interface StudioAIWorkflowRequest {
  prompt: string;
}

export interface APIResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

class FloAIAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { status: 'success', data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Chat avec un agent
  async chatWithAgent(request: AgentRequest) {
    return this.request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Workflow simple
  async runSimpleWorkflow(request: SimpleWorkflowRequest) {
    return this.request('/workflow/simple', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Workflow YAML
  async runYamlWorkflow(request: WorkflowRequest) {
    return this.request('/workflow/yaml', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Generate workflow YAML from natural language prompt
  async generateStudioWorkflow(request: StudioAIWorkflowRequest) {
    return this.request('/studio/ai-workflow', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.status === 'success';
    } catch {
      return false;
    }
  }
}

// Instance globale
export const floAIAPI = new FloAIAPI();
export default floAIAPI;
