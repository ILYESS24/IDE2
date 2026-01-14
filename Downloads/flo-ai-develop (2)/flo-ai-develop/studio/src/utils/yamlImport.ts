import { load } from 'js-yaml';
import { Agent, AriumWorkflow } from '@/types/agent';
import { CustomNode, CustomEdge } from '@/types/reactflow';

export interface ImportResult {
  nodes: CustomNode[];
  edges: CustomEdge[];
  workflowName: string;
  workflowDescription: string;
  workflowVersion: string;
}

/**
 * Clean YAML content from markdown code blocks
 */
function cleanYamlContent(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code blocks (```yaml or ```)
  if (cleaned.startsWith('```yaml')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return cleaned.trim();
}

export function parseAriumYAML(yamlContent: string): ImportResult {
  try {
    // Clean the YAML content first
    const cleanedContent = cleanYamlContent(yamlContent);
    const workflow = load(cleanedContent) as AriumWorkflow;
    
    if (!workflow || !workflow.arium) {
      throw new Error('Invalid Arium workflow format: missing arium section');
    }

    const nodes: CustomNode[] = [];
    const edges: CustomEdge[] = [];
    
    // Calculate grid positions for visual layout
    const gridWidth = 350;
    const gridHeight = 200;
    const startX = 100;
    const startY = 100;
    
    // Create agent nodes with smart positioning
    if (workflow.arium.agents) {
      workflow.arium.agents.forEach((agentData, index) => {
        // Position agents in a flow layout
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const agentNode: CustomNode = {
          id: agentData.name,
          type: 'agent',
          position: { 
            x: startX + col * gridWidth, 
            y: startY + row * gridHeight 
          },
          data: {
            agent: {
              id: agentData.name,
              name: agentData.name,
              role: agentData.role || '',
              job: agentData.job,
              model: {
                provider: agentData.model?.provider || 'openai',
                name: agentData.model?.name || 'gpt-4o-mini',
                temperature: agentData.model?.temperature,
              },
              settings: agentData.settings,
              tools: agentData.tools,
              parser: agentData.parser,
            } as Agent,
          },
        };
        nodes.push(agentNode);
      });
    }

    // Create router nodes if defined
    if (workflow.arium.routers) {
      workflow.arium.routers.forEach((routerData, index) => {
        const row = Math.floor((workflow.arium.agents.length + index) / 3);
        const col = (workflow.arium.agents.length + index) % 3;
        
        const routerNode: CustomNode = {
          id: `router_${routerData.name}`,
          type: 'router',
          position: { 
            x: startX + col * gridWidth, 
            y: startY + row * gridHeight 
          },
          data: {
            router: {
              id: routerData.name,
              name: routerData.name,
              type: routerData.type as any || 'smart',
              config: routerData.routing_options,
            },
          },
        };
        nodes.push(routerNode);
      });
    }

    // Create tool nodes if tools are defined
    if (workflow.arium.tools) {
      workflow.arium.tools.forEach((tool, index) => {
        const row = Math.floor((workflow.arium.agents.length + (workflow.arium.routers?.length || 0) + index) / 3);
        const col = (workflow.arium.agents.length + (workflow.arium.routers?.length || 0) + index) % 3;
        
        const toolNode: CustomNode = {
          id: `tool_${tool.name}`,
          type: 'tool',
          position: { 
            x: startX + col * gridWidth, 
            y: startY + row * gridHeight 
          },
          data: {
            tool: {
              name: tool.name,
              description: tool.description || '',
            },
          },
        };
        nodes.push(toolNode);
      });
    }

    // Create edges from workflow definition
    if (workflow.arium.workflow && workflow.arium.workflow.edges) {
      workflow.arium.workflow.edges.forEach((edge, index) => {
        if (edge.to && Array.isArray(edge.to)) {
          edge.to.forEach((target, targetIndex) => {
            const edgeId = `edge_${edge.from}_${target}_${index}_${targetIndex}`;
            const workflowEdge: CustomEdge = {
              id: edgeId,
              source: edge.from,
              target: target,
              type: 'custom',
              data: {
                router: edge.router,
              },
            };
            edges.push(workflowEdge);
          });
        }
      });
    }

    console.log('📦 Parsed workflow:', {
      agents: workflow.arium.agents?.length || 0,
      routers: workflow.arium.routers?.length || 0,
      tools: workflow.arium.tools?.length || 0,
      edges: edges.length,
    });

    return {
      nodes,
      edges,
      workflowName: workflow.metadata?.name || 'Imported Workflow',
      workflowDescription: workflow.metadata?.description || '',
      workflowVersion: workflow.metadata?.version || '1.0.0',
    };
  } catch (error) {
    console.error('Error parsing YAML:', error);
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateAriumYAML(yamlContent: string): { isValid: boolean; error?: string } {
  try {
    const cleanedContent = cleanYamlContent(yamlContent);
    const workflow = load(cleanedContent) as any;
    
    if (!workflow) {
      return { isValid: false, error: 'Empty or invalid YAML content' };
    }

    if (!workflow.arium) {
      return { isValid: false, error: 'Missing "arium" section in YAML' };
    }

    if (!workflow.arium.agents || !Array.isArray(workflow.arium.agents)) {
      return { isValid: false, error: 'Missing or invalid "agents" array in arium section' };
    }

    // Validate each agent has required fields
    for (const agent of workflow.arium.agents) {
      if (!agent.name) {
        return { isValid: false, error: 'Agent missing required "name" field' };
      }
      if (!agent.job) {
        return { isValid: false, error: `Agent "${agent.name}" missing required "job" field` };
      }
      if (!agent.model || !agent.model.provider || !agent.model.name) {
        return { isValid: false, error: `Agent "${agent.name}" missing required model configuration` };
      }
    }

    // Validate workflow structure if present
    if (workflow.arium.workflow) {
      if (!workflow.arium.workflow.start) {
        return { isValid: false, error: 'Workflow missing "start" node' };
      }
      if (!workflow.arium.workflow.end || !Array.isArray(workflow.arium.workflow.end)) {
        return { isValid: false, error: 'Workflow missing "end" nodes array' };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function importFromYAML(yamlContent: string): Promise<{
  nodes: CustomNode[];
  edges: CustomEdge[];
  startNodeId: string | null;
  endNodeIds: string[];
  metadata: { name: string; version: string; description: string };
}> {
  try {
    console.log('🔄 Processing YAML import...');
    console.log('📄 YAML content length:', yamlContent.length);
    
    const result = parseAriumYAML(yamlContent);

    // Enhanced workflow structure extraction
    let startNodeId: string | null = null;
    let endNodeIds: string[] = [];

    // Parse workflow structure from YAML
    const cleanedContent = cleanYamlContent(yamlContent);
    const workflow = load(cleanedContent) as any;
    
    if (workflow?.arium?.workflow) {
      startNodeId = workflow.arium.workflow.start || null;
      
      if (Array.isArray(workflow.arium.workflow.end)) {
        endNodeIds = workflow.arium.workflow.end;
      } else if (workflow.arium.workflow.end) {
        endNodeIds = [workflow.arium.workflow.end];
      }
    }

    // If no workflow structure defined, use defaults based on parsed nodes
    if (!startNodeId && result.nodes.length > 0) {
      startNodeId = result.nodes[0].id;
    }
    if (endNodeIds.length === 0 && result.nodes.length > 0) {
      endNodeIds = [result.nodes[result.nodes.length - 1].id];
    }

    console.log('🎯 Workflow imported successfully:', {
      nodesCount: result.nodes.length,
      edgesCount: result.edges.length,
      startNode: startNodeId,
      endNodes: endNodeIds
    });

    return {
      nodes: result.nodes,
      edges: result.edges,
      startNodeId,
      endNodeIds,
      metadata: {
        name: result.workflowName || 'Generated Workflow',
        version: result.workflowVersion || '1.0.0',
        description: result.workflowDescription || 'AI-generated workflow',
      },
    };
  } catch (error) {
    console.error('❌ Failed to import YAML workflow:', error);
    throw new Error(`Workflow import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}
