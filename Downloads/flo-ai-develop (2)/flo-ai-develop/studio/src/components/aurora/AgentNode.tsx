import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, Settings, Play, Square, Trash2 } from 'lucide-react';
import { AgentNodeData } from '@/types/reactflow';
import { useDesignerStore } from '@/store/designerStore';
import { cn } from '@/lib/utils';

const AgentNode: React.FC<NodeProps<AgentNodeData>> = ({ data, selected, id }) => {
  const { 
    deleteNode, 
    startNodeId, 
    endNodeIds,
    openAgentEditor,
  } = useDesignerStore();
  
  const { agent } = data;
  
  const isStart = startNodeId === id;
  const isEnd = endNodeIds.includes(id);

  const handleEdit = () => {
    openAgentEditor({
      id,
      type: 'agent',
      position: { x: 0, y: 0 },
      data,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      className={cn(
        "relative bg-white border-2 rounded-xl shadow-lg min-w-[220px] max-w-[280px] transition-all duration-200",
        selected ? "border-blue-500 shadow-blue-200" : "border-gray-200",
        isStart && "border-green-500 shadow-green-100",
        isEnd && "border-orange-500 shadow-orange-100"
      )}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-md"
        style={{ left: -6 }}
      />

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-xl",
        isStart ? "bg-gradient-to-r from-green-50 to-green-100" :
        isEnd ? "bg-gradient-to-r from-orange-50 to-orange-100" :
        "bg-gradient-to-r from-blue-50 to-indigo-50"
      )}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn(
            "p-1.5 rounded-lg",
            isStart ? "bg-green-100" : isEnd ? "bg-orange-100" : "bg-blue-100"
          )}>
            <Bot className={cn(
              "w-4 h-4",
              isStart ? "text-green-600" : isEnd ? "text-orange-600" : "text-blue-600"
            )} />
          </div>
          <h3 className="font-semibold text-sm text-gray-800 truncate">
            {agent.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 ml-2">
          {isStart && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Play className="w-2.5 h-2.5" />
              Start
            </span>
          )}
          {isEnd && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Square className="w-2.5 h-2.5" />
              End
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        {agent.role && (
          <div className="text-xs text-gray-600">
            <span className="font-medium text-gray-700">Role:</span> {agent.role}
          </div>
        )}
        
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-700">LLM:</span>{' '}
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
            {agent.model?.provider || 'openai'}/{agent.model?.name || 'gpt-4o-mini'}
          </span>
        </div>

        {agent.tools && agent.tools.length > 0 && (
          <div className="text-xs text-gray-600">
            <span className="font-medium text-gray-700">Tools:</span>{' '}
            {agent.tools.slice(0, 2).join(', ')}
            {agent.tools.length > 2 && ` +${agent.tools.length - 2}`}
          </div>
        )}

        <div className="text-xs text-gray-500 line-clamp-2 italic">
          "{agent.job}"
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Configure
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-md"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default AgentNode;
