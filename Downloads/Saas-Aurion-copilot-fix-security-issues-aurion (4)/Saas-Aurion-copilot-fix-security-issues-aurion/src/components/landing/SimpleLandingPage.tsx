import React from "react";

const SimpleLandingPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">AURION - Outils IA</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-blue-600/30">
            🏗️ Créateur d'Apps
          </div>

          <div className="bg-green-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-green-600/30">
            🌐 Créateur de Sites Web
          </div>

          <div className="bg-purple-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-purple-600/30">
            🤖 Agents IA
          </div>

          <div className="bg-red-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-red-600/30">
            ✏️ Éditeur de Texte
          </div>

          <div className="bg-yellow-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-yellow-600/30">
            💻 Éditeur de Code
          </div>

          <div className="bg-pink-600/20 text-white font-semibold py-4 px-6 rounded-lg border border-pink-600/30">
            🎨 Générateur de Contenu
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;
