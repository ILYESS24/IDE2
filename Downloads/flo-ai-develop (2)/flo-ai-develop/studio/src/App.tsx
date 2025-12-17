import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AuroraCanvas from '@/components/aurora/auroraCanvas';
import Sidebar from '@/components/sidebar/Sidebar';
import YamlPreviewDrawer from '@/components/drawer/YamlPreviewDrawer';
import ValidationPanel from '@/components/panels/ValidationPanel';
import { useDesignerStore } from '@/store/designerStore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');
  const { nodes, edges } = useDesignerStore();

  const handleStartDesigning = () => {
    setCurrentView('studio');
  };

  if (currentView === 'landing') {
    return <LandingPage onStartDesigning={handleStartDesigning} />;
  }

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-lg font-semibold text-gray-900">Aurora AI Studio</h1>
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('landing')}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              ← Back to Prompt
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <AuroraCanvas />
        </div>
      </div>

      {/* Right Panel - YAML Preview */}
      <div className="w-80 bg-white border-l border-gray-200">
        <YamlPreviewDrawer />
      </div>

      {/* Validation Panel - peut être affiché conditionnellement */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 right-4">
          <ValidationPanel />
        </div>
      )}
    </div>
  );
};

export default App;
