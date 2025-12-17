import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { Agent, Workflow, WorkflowMetadata } from '@/types/agent';
import { importFromYAML as yamlImportUtil } from '@/utils/yamlImport';

interface DesignerState {
  // Workflow metadata
  workflowName: string;
  workflowDescription: string;
  workflowVersion: string;

  // Nodes and edges
  nodes: Node[];
  edges: Edge[];

  // Workflow structure
  startNodeId: string | null;
  endNodeIds: string[];

  // Selection
  selectedNode: Node | null;
  selectedEdge: Edge | null;

  // UI state
  showValidationPanel: boolean;

  // Actions
  setWorkflowMetadata: (metadata: Partial<WorkflowMetadata>) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setStartNodeId: (nodeId: string | null) => void;
  setEndNodeIds: (nodeIds: string[]) => void;

  // YAML operations
  importFromYAML: (yamlContent: string) => Promise<void>;
  exportToYAML: () => string;

  // Template operations
  loadTemplate: (templateName: string) => void;

  // Router operations
  openRouterEditor: (edgeId: string) => void;

  // Reset
  resetWorkflow: () => void;
}

const initialState = {
  workflowName: 'New Workflow',
  workflowDescription: 'A new Aurora AI workflow',
  workflowVersion: '1.0.0',
  nodes: [],
  edges: [],
  startNodeId: null,
  endNodeIds: [],
  selectedNode: null,
  selectedEdge: null,
  showValidationPanel: false,
};

export const useDesignerStore = create<DesignerState>((set, get) => ({
  ...initialState,

  setWorkflowMetadata: (metadata) =>
    set((state) => ({
      workflowName: metadata.name ?? state.workflowName,
      workflowDescription: metadata.description ?? state.workflowDescription,
      workflowVersion: metadata.version ?? state.workflowVersion,
    })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    })),

  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      startNodeId: state.startNodeId === nodeId ? null : state.startNodeId,
      endNodeIds: state.endNodeIds.filter((id) => id !== nodeId),
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  updateEdge: (edgeId, updates) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, ...updates } : edge
      ),
    })),

  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
    })),

  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
  setStartNodeId: (startNodeId) => set({ startNodeId }),
  setEndNodeIds: (endNodeIds) => set({ endNodeIds }),

  importFromYAML: async (yamlContent: string) => {
    try {
      const workflow = await yamlImportUtil(yamlContent);
      set({
        workflowName: workflow.metadata.name,
        workflowDescription: workflow.metadata.description,
        workflowVersion: workflow.metadata.version,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        startNodeId: workflow.startNodeId,
        endNodeIds: workflow.endNodeIds,
      });
    } catch (error) {
      console.error('Failed to import YAML:', error);
      throw error;
    }
  },

  exportToYAML: () => {
    const state = get();
    // This would convert the current state back to YAML format
    // Implementation would depend on the YAML structure needed
    return '';
  },

  loadTemplate: (templateName) => {
    // Load predefined templates
    console.log('Loading template:', templateName);
  },

  openRouterEditor: (edgeId) => {
    // Open router configuration editor for the edge
    console.log('Opening router editor for edge:', edgeId);
  },

  resetWorkflow: () => set(initialState),
}));
