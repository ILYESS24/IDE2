import React from "react";
import { GrainGradient } from "@paper-design/shaders-react";

export default function Docs() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <GrainGradient
          style={{ height: "100%", width: "100%" }}
          colorBack="hsl(25, 15%, 12%)"
          softness={0.8}
          shape="blob"
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={0}
          colors={["hsl(25, 20%, 15%)", "hsl(35, 25%, 20%)", "hsl(45, 15%, 18%)", "hsl(55, 10%, 16%)"]}
          intensity={0.15}
          noise={0.03}
          speed={0.1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        <div className="max-w-4xl w-full text-center space-y-24">

          {/* Product name */}
          <h1 className="text-6xl md:text-8xl font-serif font-light text-white leading-tight">
            Documentation
          </h1>

          {/* Primary statement */}
          <p className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Complete guides for implementing AURION solutions.
          </p>

          {/* Secondary content */}
          <div className="space-y-8 max-w-3xl mx-auto">
            <p className="text-lg font-light text-white/80 leading-relaxed">
              Our documentation covers everything from basic setup to advanced configurations,
              with step-by-step tutorials, API references, and best practices for optimal performance.
            </p>
            <p className="text-lg font-light text-white/80 leading-relaxed">
              Whether you're a developer integrating our APIs or an administrator deploying enterprise solutions,
              you'll find clear, comprehensive instructions tailored to your specific use case.
            </p>
            <p className="text-lg font-light text-white/80 leading-relaxed">
              Regular updates ensure our documentation stays current with the latest features and improvements,
              providing you with reliable guidance as you build with AURION.
            </p>
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-light hover:bg-white/90 transition-colors">
              Talk to our team
            </button>
          </div>

          {/* Social proof */}
          <div className="pt-24 space-y-16">
            <div className="flex flex-col md:flex-row justify-center items-center gap-16">
              <div className="text-center">
                <p className="text-white text-lg font-light mb-2">Updated daily</p>
                <p className="text-white/60 text-sm font-light">Latest information</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-light mb-2">1000+ pages</p>
                <p className="text-white/60 text-sm font-light">Comprehensive coverage</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}