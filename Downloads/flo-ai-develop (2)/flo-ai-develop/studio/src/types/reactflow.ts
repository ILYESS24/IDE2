import { Node, Edge } from 'reactflow';
import { Agent, Tool, Router } from './agent';

export interface AgentNodeData {
  agent: Agent;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface ToolNodeData {
  tool: Tool;
  isEnd?: boolean;
}

export interface RouterNodeData {
  router: Router;
  isEnd?: boolean;
}

export type CustomNodeData = AgentNodeData | ToolNodeData | RouterNodeData;

export type CustomNode = Node<CustomNodeData>;

export interface CustomEdgeData {
  router?: string;
  label?: string;
  description?: string;
}

export type CustomEdge = Edge<CustomEdgeData>;

export type NodeType = 'agent' | 'tool' | 'router';

export interface FlowState {
  nodes: CustomNode[];
  edges: CustomEdge[];
  selectedNode?: CustomNode;
  selectedEdge?: CustomEdge;
}

// Helper type guards
export function isAgentNode(node: CustomNode): node is Node<AgentNodeData> {
  return node.type === 'agent';
}

export function isToolNode(node: CustomNode): node is Node<ToolNodeData> {
  return node.type === 'tool';
}

export function isRouterNode(node: CustomNode): node is Node<RouterNodeData> {
  return node.type === 'router';
}
