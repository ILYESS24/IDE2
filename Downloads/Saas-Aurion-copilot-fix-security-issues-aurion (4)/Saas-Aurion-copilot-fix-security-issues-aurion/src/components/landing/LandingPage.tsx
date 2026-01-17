 
import React, { useRef, useMemo, createContext, useContext, useEffect, useState, useCallback, memo } from "react";
import { useClerkSafe } from '@/hooks/use-clerk-safe';
import { GrainGradient } from "@paper-design/shaders-react";
import { Component } from "@/components/ui/animated-menu";
import { ButtonGetStarted } from "@/components/ui/button-get-started";
import { TOOL_URLS } from "@/types/plans";
import { MarketingBadges } from "@/components/marketing-badges";
import { PremiumToggle } from "@/components/bouncy-toggle";
import { TextRotate } from "@/components/ui/text-rotate";
import { Testimonials } from "@/components/unique-testimonial";
import { Plus } from "lucide-react";
import { ChatGPTInput } from "@/components/ui/chatgpt-input";
import MorphPanel from "@/components/ai-input";
import { logger } from "@/services/logger";
// Icons imported but not used in this component

// Performance utilities
const throttle = (func: (...args: unknown[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function(this: unknown, ...args: unknown[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};


// Force cache bust - v3 - MAX PERFORMANCE OPTIMIZATIONS
// - Intersection Observer for lazy shader loading
// - Multi-level shader quality based on distance
// - RequestAnimationFrame for smooth animations
// - CSS containment for isolated performance
// - Throttled scroll events at 60fps
// - Static backgrounds for distant sections

// Color scheme for the main section
const sectionColors = [
  ["hsl(14, 100%, 57%)", "hsl(45, 100%, 51%)", "hsl(340, 82%, 52%)"], // Orange/Yellow/Pink - AI Creation Platform
];

// Main section content
const sectionContent = [
  {
    title: "",
    subtitle: "",
    description: "",
    toolId: null, // Home section, no tool
  },
];

interface SectionProps {
  id?: string;
  index: number;
  colors: string[];
  content: (typeof sectionContent)[0];
  isActive: boolean;
  activeSection: number;
}

const Section = React.memo(function Section({ id, index, colors, content, isActive, activeSection }: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const performanceLevel = 'high'; // Always high for single section

  // Ultra-optimized shader props based on performance level
  const shaderProps = useMemo(() => {
    const baseProps = {
      style: { height: "100%", width: "100%" },
      colorBack: "hsl(0, 0%, 5%)",
      softness: 0.76,
      shape: "corners" as const,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      rotation: index * 45,
      colors,
    };

    // Always return high performance props for single section
    return { ...baseProps, intensity: 0.3, noise: 0.02, speed: 0.3 };
  }, [index, colors, performanceLevel]);

  // Always render shader for single section
  const shouldRenderShader = true;

  // Special Services section with detailed content
  if (index === 3) {
    return (
      <div
        id={id}
        ref={sectionRef}
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          zIndex: index,
          transform: isActive ? "translateY(0)" : "translateY(100%)",
          willChange: "transform",
          contain: "layout style paint",
        }}
      >
        <div
          className="absolute inset-0 bg-black"
        />

        {/* Services Content */}
        <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto py-6 md:py-12 w-full">
          {/* Header Section */}
          <div className="text-center mb-6 md:mb-12">
            <span className={`text-white/60 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium block transition-all duration-500 delay-300 mb-3 md:mb-8 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}>
              <Component>{content.subtitle}</Component>
            </span>
            <h1 className={`text-white text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-8 transition-all duration-600 delay-400 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              {content.title}
            </h1>
            <div className={`text-white/80 text-sm md:text-lg lg:text-xl font-light max-w-4xl mx-auto transition-all duration-500 delay-500 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}>
              <Component>{content.description}</Component>
            </div>
          </div>

          {/* Services Grid - Explains what each tool solves */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12 mb-6 md:mb-16 transition-all duration-700 delay-600 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            {/* Column 1 */}
            <div className="space-y-4 md:space-y-8">
              {/* Service 1 - Website Builder */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Créateur de Sites Web
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Construisez des sites web professionnels en quelques minutes</p>
              </div>

              {/* Service 2 - Text Editor */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Éditeur de Texte IA
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Éditeur de texte enrichi avec assistance IA</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4 md:space-y-8">
              {/* Service 3 - App Builder */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Créateur d'Applications
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Créez des applications mobiles et web sans coder</p>
              </div>

              {/* Service 4 - Code Editor */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Éditeur de Code IA
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Éditeur de code avec assistance IA avancée</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4 md:space-y-8">
              {/* Service 5 - Content Generator */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Générateur de Contenu
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Générez automatiquement du contenu créatif</p>
              </div>

              {/* Service 6 - AI Agents */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  Agents IA
                </h2>
                <p className="text-white/60 text-xs md:text-sm mb-2">Créez et déployez des agents IA personnalisables</p>
              </div>
            </div>
          </div>

          {/* How It Works - Explains the process clearly */}
          <div className={`text-center mb-8 md:mb-24 transition-all duration-700 delay-700 hidden md:block ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <h2 className="text-white text-xl md:text-3xl lg:text-5xl font-bold mb-6 md:mb-16">
              Comment ça fonctionne
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-white/40 mb-2 md:mb-4">01</div>
                <h3 className="text-white text-sm md:text-xl font-bold mb-1 md:mb-3">Vous décrivez</h3>
                <p className="text-white/60 leading-relaxed text-xs md:text-sm">
                  Expliquez simplement ce que vous voulez créer.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-white/40 mb-2 md:mb-4">02</div>
                <h3 className="text-white text-sm md:text-xl font-bold mb-1 md:mb-3">L'IA travaille</h3>
                <p className="text-white/60 leading-relaxed text-xs md:text-sm">
                  L'intelligence artificielle génère votre contenu automatiquement.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-white/40 mb-2 md:mb-4">03</div>
                <h3 className="text-white text-sm md:text-xl font-bold mb-1 md:mb-3">Vous ajustez</h3>
                <p className="text-white/60 leading-relaxed text-xs md:text-sm">
                  Modifiez les détails selon vos préférences.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-white/40 mb-2 md:mb-4">04</div>
                <h3 className="text-white text-sm md:text-xl font-bold mb-1 md:mb-3">Vous utilisez</h3>
                <p className="text-white/60 leading-relaxed text-xs md:text-sm">
                  Téléchargez et utilisez votre création immédiatement.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps - Clear call to action */}
          <div className={`text-center px-4 transition-all duration-700 delay-800 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <h2 className="text-white text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-6">
              Prêt à essayer ?
            </h2>
            <p className="text-white/70 text-xs md:text-base lg:text-xl mb-4 md:mb-8 max-w-2xl mx-auto">
              Commencez par explorer nos outils. Vous pouvez créer gratuitement pour découvrir comment l'IA peut vous aider.
            </p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 border border-white/20 text-sm md:text-base">
              Explorer les outils
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }


  // All other sections use the default rendering
  return (
    <div
      id={id}
      ref={sectionRef}
      className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
      style={{
        zIndex: index,
        transform: isActive ? "translateY(0)" : "translateY(100%)",
        willChange: "transform",
        contain: "layout style paint", // CSS containment for better performance
      }}
    >

      {shouldRenderShader && (
        <div className="absolute inset-0">
          <GrainGradient {...shaderProps} />
        </div>
      )}
      {/* Render a static background for non-visible sections */}
      {!shouldRenderShader && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
            opacity: 0.1,
          }}
        />
      )}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl">
        <span
          className={`text-white/60 text-[10px] md:text-sm uppercase tracking-[0.15em] md:tracking-[0.3em] font-medium block transition-all duration-500 delay-300 mb-3 md:mb-8 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Component>{content.subtitle}</Component>
        </span>
        <h1
          className={`text-white text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-8 transition-all duration-600 delay-400 leading-tight ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {content.title}
        </h1>
        <div
          className={`text-white/80 text-xs sm:text-sm md:text-lg lg:text-xl font-light transition-all duration-500 delay-500 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Component>{content.description}</Component>
        </div>
      </div>
    </div>
  );
});

export default function LandingPage() {
  const { openSignIn } = useClerkSafe();


          const handleAppBuilderClick = () => {
            window.location.href = 'https://aurion-app-v2.pages.dev/';
          };

  // Single section only
  const section = (
    <Section
      key={0}
      id="home"
      index={0}
      colors={sectionColors[0]}
      content={sectionContent[0]}
      isActive={true}
      activeSection={0}
    />
  );

  return (
    <div
      id="home"
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Main container */}
      <div
        className="relative overflow-hidden w-[calc(100vw-16px)] h-[calc(100vh-16px)] md:w-[calc(100vw-16px)] md:h-[calc(100vh-16px)] rounded-3xl md:rounded-[48px] border-[16px] md:border-[25px] border-black"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "transform",
          contain: "layout style paint size",
          isolation: "isolate",
        }}
      >
        {/* Single Section */}
        {section}

        {/* ChatGPT Input - Above the title */}
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 translate-x-[20px] translate-y-[40px] z-20">
          <ChatGPTInput
            placeholder="Ask Qlaus anything..."
            onSubmit={(value) => {
              // Open AI text editor in same window
              logger.debug('Opening AI Text Editor', { value });
              window.location.href = 'https://1bf06947.aieditor.pages.dev';
            }}
            glowIntensity={0.4}
            expandOnFocus={true}
            animationDuration={500}
            textColor="#0A1217"
            backgroundOpacity={0.15}
            showEffects={true}
          />
        </div>

        {/* Main Content - Positioned 100px Higher */}
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ transform: 'translateY(-100px)' }}>
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight">
              If you can describe it, you can build it.
            </h1>

            {/* Text Rotate Animation */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center items-center gap-2">
                <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">
                  Create
                </span>
                <div
                  onClick={handleAppBuilderClick}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <TextRotate
                  texts={[
                    "apps",
                    "websites",
                    "image",
                    "games",
                    "tools",
                    "video"
                  ]}
                    rotationInterval={2000}
                    staggerDuration={0.025}
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    mainClassName="text-white px-2 sm:px-2 md:px-3 bg-[#ff5941] overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    elementLevelClassName="inline-block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section - Tout en bas */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          <Testimonials />
        </div>

        {/* Header Actions */}

                {/* AURION Title */}
                <div className="absolute top-3 md:top-8 left-[244px] md:left-[308px] z-50">
          <h1 className="text-white text-xl md:text-3xl font-black uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
            AURION
          </h1>
        </div>

        {/* Navigation Links - centered at the top */}
        <div className="absolute top-3 md:top-8 left-1/2 transform -translate-x-1/2 z-50">
          <nav className="flex items-center space-x-4 md:space-x-8">
            <a href="/entreprise" className="text-white text-sm md:text-base font-medium hover:text-gray-300 transition-colors">
              Entreprise
            </a>
            <a href="/docs" className="text-white text-sm md:text-base font-medium hover:text-gray-300 transition-colors">
              Docs
            </a>
            <a href="/ai" className="text-white text-sm md:text-base font-medium hover:text-gray-300 transition-colors">
              AI
            </a>
            <a href="/ressources" className="text-white text-sm md:text-base font-medium hover:text-gray-300 transition-colors">
              Ressources
            </a>
          </nav>
        </div>

                {/* Premium Toggle - positioned on the right, near Sign In */}
                <div className="absolute top-3 right-[180px] md:top-8 md:right-[280px] z-50">
                  <PremiumToggle
                    label="Agent IA"
                    onChange={(checked) => {
                      if (checked) {
                        // Open AI Agents in same window
                        window.location.href = 'https://flo-1-2ba8.onrender.com';
                      }
                    }}
                  />
                </div>

        {/* Sign In button - positioned on the right (opposite side) */}
        <div className="absolute top-3 right-3 md:top-8 md:right-8 z-50">
          <ButtonGetStarted
            className="h-8 md:h-9 text-xs md:text-sm px-3 md:px-4"
            onClick={() => openSignIn()}
          />
        </div>

        {/* AI Chat Bubble - positioned at bottom right */}
        <div className="fixed bottom-4 right-4 z-50">
          <MorphPanel />
        </div>

      </div>
    </div>
  );
}
