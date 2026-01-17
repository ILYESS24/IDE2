import React from "react";
import { GrainGradient } from "@paper-design/shaders-react";

export default function AIPage() {
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
            AURION AI
          </h1>

          {/* Primary statement */}
          <p className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Advanced artificial intelligence for enterprise applications.
          </p>

          {/* Secondary content */}
          <div className="space-y-8 max-w-3xl mx-auto">
            <p className="text-lg font-light text-white/80 leading-relaxed">
              Our AI models are trained on diverse datasets and fine-tuned for enterprise use cases,
              ensuring accurate and reliable performance across various domains and industries.
            </p>
            <p className="text-lg font-light text-white/80 leading-relaxed">
              From natural language processing to computer vision, our APIs provide seamless integration
              with existing systems, enabling rapid deployment of AI capabilities without extensive development resources.
            </p>
            <p className="text-lg font-light text-white/80 leading-relaxed">
              We maintain strict ethical AI practices, ensuring transparency, fairness, and accountability
              in all our artificial intelligence solutions and deployments.
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
                <p className="text-white text-lg font-light mb-2">Processing billions of requests</p>
                <p className="text-white/60 text-sm font-light">Daily</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-light mb-2">Available in 50+ languages</p>
                <p className="text-white/60 text-sm font-light">Global coverage</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
