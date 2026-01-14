import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  ConnectionLineType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useDesignerStore } from '@/store/designerStore';
import AgentNode from './AgentNode';
import ToolNode from './ToolNode';
import RouterNode from './RouterNode';
import CustomEdge from './CustomEdge';
import { FileText, Sparkles } from 'lucide-react';

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  router: RouterNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const AuroraCanvas: React.FC = () => {
  const storeNodes = useDesignerStore((state) => state.nodes);
  const storeEdges = useDesignerStore((state) => state.edges);
  const setNodes = useDesignerStore((state) => state.setNodes);
  const setEdges = useDesignerStore((state) => state.setEdges);
  const setSelectedNode = useDesignerStore((state) => state.setSelectedNode);
  const setSelectedEdge = useDesignerStore((state) => state.setSelectedEdge);

  const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState(storeNodes);
  const [localEdges, setLocalEdges, onLocalEdgesChange] = useEdgesState(storeEdges);

  // Sync store state with local state
  useEffect(() => {
    console.log('🔄 Syncing nodes from store:', storeNodes.length);
    setLocalNodes(storeNodes);
  }, [storeNodes, setLocalNodes]);

  useEffect(() => {
    console.log('🔄 Syncing edges from store:', storeEdges.length);
    setLocalEdges(storeEdges.map(edge => ({ ...edge, type: 'custom' })));
  }, [storeEdges, setLocalEdges]);

  const handleNodesChange = useCallback((changes: any) => {
    onLocalNodesChange(changes);
  }, [onLocalNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onLocalEdgesChange(changes);
  }, [onLocalEdgesChange]);

  const handleConnect = useCallback((connection: Connection) => {
    const newEdge = { ...connection, type: 'custom', data: {} };
    setLocalEdges((eds) => addEdge(newEdge, eds));
    // Also update the store
    const edge = {
      id: `edge_${connection.source}_${connection.target}`,
      source: connection.source || '',
      target: connection.target || '',
      type: 'custom',
      data: {},
    };
    setEdges([...storeEdges, edge]);
  }, [setLocalEdges, setEdges, storeEdges]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: any) => {
    setSelectedEdge(edge);
  }, [setSelectedEdge]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  // Show empty state if no nodes
  if (localNodes.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500 px-4 max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Your Workflow Canvas</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Describe what you want to build in the prompt, and we'll create a visual workflow 
            with connected AI agents for you. You can then customize each agent and their connections.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Agent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>End Node</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={proOptions}
        className="bg-gray-50"
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
      >
        <Controls className="bg-white shadow-lg rounded-lg border border-gray-200" />
        <Background 
          variant={BackgroundVariant.Dots}
          color="#d1d5db" 
          gap={20} 
          size={1}
        />
      </ReactFlow>
    </div>
  );
};

export default AuroraCanvas;
