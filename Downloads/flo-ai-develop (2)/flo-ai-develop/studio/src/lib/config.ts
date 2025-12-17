// Configuration pour Aurora AI Studio
export const config = {
  // URL de base de l'API - peut être configurée via variable d'environnement
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',

  // Outils disponibles dans la sidebar
  availableTools: [
    { name: 'web_search', label: 'Web Search', description: 'Search the web for information' },
    { name: 'file_reader', label: 'File Reader', description: 'Read and analyze files' },
    { name: 'calculator', label: 'Calculator', description: 'Perform mathematical calculations' },
    { name: 'code_executor', label: 'Code Executor', description: 'Execute code snippets' },
  ],

  // Routeurs disponibles
  availableRouters: [
    { name: 'linear', label: 'Linear Router', description: 'Execute agents in sequence' },
    { name: 'conditional', label: 'Conditional Router', description: 'Route based on conditions' },
    { name: 'reflection', label: 'Reflection Router', description: 'Include critic and reflection steps' },
  ],

  // Templates de workflows prédéfinis
  workflowTemplates: {
    simple: {
      name: 'Simple Workflow',
      description: 'Basic agent workflow',
      agents: [
        { id: 'agent1', name: 'Main Agent', job: 'Process requests', model: { provider: 'openai', name: 'gpt-4o-mini' } }
      ]
    }
  }
};
