// Types pour les agents Aurora AI

export interface AgentModel {
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'vertexai';
  name: string;
  temperature?: number;
  apiKey?: string;
}

export interface Agent {
  id: string;
  name: string;
  job: string;
  model: AgentModel;
  systemPrompt?: string;
  tools?: string[];
  memory?: boolean;
}

export interface Router {
  id: string;
  name: string;
  type: 'linear' | 'conditional' | 'reflection' | 'custom';
  config?: Record<string, any>;
}

export interface WorkflowMetadata {
  name: string;
  version: string;
  description: string;
}

export interface Workflow {
  metadata: WorkflowMetadata;
  arium: {
    agents: Agent[];
    routers?: Router[];
    workflow: {
      start: string;
      edges: Array<{
        from: string;
        to: string[];
        router?: string;
      }>;
      end: string[];
    };
  };
}
