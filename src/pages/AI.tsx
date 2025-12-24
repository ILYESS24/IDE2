import React from "react";
import { DitheringShader } from "@/components/dithering-shader";

const AI = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond animé avec effet de vagues */}
      <div className="absolute inset-0">
        <DitheringShader
          width={window.innerWidth}
          height={window.innerHeight}
          colorBack="#333300"
          colorFront="#ffaa00"
          shape="wave"
          type="8x8"
          pxSize={4}
          speed={1}
          className="w-full h-full"
        />
      </div>

      {/* Contenu superposé */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            AI
          </h1>

          <div className="space-y-4 text-lg text-white leading-relaxed">
            <p>AI removes friction from professional workflows.</p>
          </div>

          <div className="space-y-4 text-white text-base">
            <p>Text generation that understands context</p>
            <p>Image creation with precise control</p>
            <p>Code assistance that accelerates development</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;