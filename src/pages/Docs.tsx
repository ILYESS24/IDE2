import React from "react";
import { DitheringShader } from "@/components/dithering-shader";

const Docs = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond animé avec effet de vagues */}
      <div className="absolute inset-0">
        <DitheringShader
          width={window.innerWidth}
          height={window.innerHeight}
          colorBack="#330011"
          colorFront="#ff6699"
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
            Docs
          </h1>

          <div className="space-y-4 text-lg text-white leading-relaxed">
            <p>Clear, structured documentation for developers and teams.</p>
          </div>

          <div className="space-y-4 text-white text-base">
            <p>API references with working examples</p>
            <p>Integration guides for popular platforms</p>
            <p>Best practices for enterprise deployment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;