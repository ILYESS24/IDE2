import React from "react";

const Changelog: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-background flex items-center justify-center relative overflow-hidden"
      style={{
        zIndex: 9999,
        width: "calc(100vw - 16px)",
        height: "calc(100vh - 16px)",
        borderRadius: "32px",
        border: "16px solid black",
        margin: "8px"
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Content */}
      <div className="relative z-10 px-8 max-w-4xl">
        <span className="text-white/60 text-sm md:text-base uppercase tracking-[0.3em] font-medium block mb-8">
          Product Updates
        </span>
        <h1 className="text-foreground text-4xl md:text-6xl lg:text-8xl font-bold mb-8">
          Changelog
        </h1>
        <p className="text-white/80 text-lg md:text-xl lg:text-2xl font-light">
          Stay updated with the latest features and improvements.
        </p>

        {/* Changelog entries */}
        <div className="mt-12 space-y-8">
          <div className="border-l-4 border-purple-500 pl-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-purple-400 font-bold">v2.1.0</span>
              <span className="text-white/60 text-sm">December 2024</span>
              <span className="bg-green-500 text-black px-2 py-1 rounded-full text-xs font-bold">NEW</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">AI Productivity Platform Launch</h3>
            <ul className="text-white/70 space-y-1">
              <li>• Complete AI-powered productivity suite</li>
              <li>• Advanced workflow automation features</li>
              <li>• Enhanced project management tools</li>
              <li>• Dashboard and analytics improvements</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-blue-400 font-bold">v2.0.0</span>
              <span className="text-white/60 text-sm">November 2024</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">MAJOR</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Enterprise Solutions</h3>
            <ul className="text-white/70 space-y-1">
              <li>• Enterprise-grade security and compliance</li>
              <li>• Advanced team collaboration tools</li>
              <li>• Custom integrations and APIs</li>
              <li>• Dedicated success management</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-green-400 font-bold">v1.5.0</span>
              <span className="text-white/60 text-sm">October 2024</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">FEATURE</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Workflow Automation</h3>
            <ul className="text-white/70 space-y-1">
              <li>• Intelligent workflow automation</li>
              <li>• Advanced AI agent configuration</li>
              <li>• Process optimization tools</li>
              <li>• Real-time collaboration</li>
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 pl-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-orange-400 font-bold">v1.0.0</span>
              <span className="text-white/60 text-sm">September 2024</span>
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">LAUNCH</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">AURION Platform Launch</h3>
            <ul className="text-white/70 space-y-1">
              <li>• Initial AI productivity platform</li>
              <li>• Core AI tools and features</li>
              <li>• Modern web interface</li>
              <li>• PWA capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
