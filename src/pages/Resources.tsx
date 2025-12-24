import React from "react";
import { DitheringShader } from "@/components/dithering-shader";

const Resources = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond animé avec effet de vagues */}
      <div className="absolute inset-0">
        <DitheringShader
          width={window.innerWidth}
          height={window.innerHeight}
          colorBack="#001133"
          colorFront="#4488ff"
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
            Resources
          </h1>

          <div className="space-y-4 text-lg text-white leading-relaxed">
            <p>Practical guides for AI implementation.</p>
          </div>

          <div className="space-y-4 text-white text-base">
            <p>Tutorials for workflow optimization</p>
            <p>Case studies from professional teams</p>
            <p>Technical deep dives on AI capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;