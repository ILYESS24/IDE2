import React from "react";
import { DitheringShader } from "@/components/dithering-shader";

const Enterprise = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond animé avec effet de vagues */}
      <div className="absolute inset-0">
        <DitheringShader
          width={window.innerWidth}
          height={window.innerHeight}
          colorBack="#330000"
          colorFront="#ff4444"
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
            Enterprise
          </h1>

          <div className="space-y-4 text-lg text-white leading-relaxed">
            <p>Enterprise-grade security and compliance.</p>
          </div>

          <div className="space-y-4 text-white text-base">
            <p>SOC 2 Type II certified infrastructure</p>
            <p>Dedicated support and custom integrations</p>
            <p>Priority feature requests and SLAs</p>
          </div>

          <div className="mt-8">
            <p className="text-white/80 text-sm">Contact sales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;