/* eslint-disable react-hooks/refs */
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useClerkSafe } from '@/hooks/use-clerk-safe';
import { GrainGradient } from "@paper-design/shaders-react";
import { Component } from "@/components/ui/animated-menu";
import { ButtonGetStarted } from "@/components/ui/button-get-started";
import { CreationMenu } from "@/components/ui/creation-menu";
import { TOOL_URLS } from "@/types/plans";
import { PromptInput } from "@/components/ui/prompt-input";
import { MarketingBadges } from "@/components/marketing-badges";
import { Testimonials } from "@/components/unique-testimonial";
import {
  Code2,
  Palette,
  Bot,
  FileText,
  Settings,
  Wrench,
  ExternalLink
} from "lucide-react";
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

const useIntersectionObserver = (ref: React.RefObject<Element>, options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
};

// Force cache bust - v3 - MAX PERFORMANCE OPTIMIZATIONS
// - Intersection Observer for lazy shader loading
// - Multi-level shader quality based on distance
// - RequestAnimationFrame for smooth animations
// - CSS containment for isolated performance
// - Throttled scroll events at 60fps
// - Static backgrounds for distant sections

// Color schemes for each section - ONLY FIRST SECTION
const sectionColors = [
  ["hsl(14, 100%, 57%)", "hsl(45, 100%, 51%)", "hsl(340, 82%, 52%)"], // Orange/Yellow/Pink - AI Creation Platform
];

// Section content - ONLY FIRST SECTION
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
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1, rootMargin: '100px' });

  // Calculate performance level based on distance from active section
  const distanceFromActive = Math.abs(index - activeSection);
  const performanceLevel = useMemo(() => {
    if (distanceFromActive === 0) return 'high'; // Active section
    if (distanceFromActive === 1) return 'medium'; // Adjacent sections
    if (distanceFromActive <= 2) return 'low'; // Nearby sections
    return 'minimal'; // Distant sections
  }, [distanceFromActive]);

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

    switch (performanceLevel) {
      case 'high':
        return { ...baseProps, intensity: 0.3, noise: 0.02, speed: 0.3 };
      case 'medium':
        return { ...baseProps, intensity: 0.15, noise: 0.01, speed: 0.1 };
      case 'low':
        return { ...baseProps, intensity: 0.05, noise: 0, speed: 0 };
      case 'minimal':
      default:
        return { ...baseProps, intensity: 0, noise: 0, speed: 0 };
    }
  }, [index, colors, performanceLevel]);

  // Only render shader if section is visible or high performance level
  const shouldRenderShader = isVisible || performanceLevel === 'high' || performanceLevel === 'medium';

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

          {/* Marketing Badges */}
          <div className="mb-8 md:mb-12 transition-all duration-700 delay-600">
            <MarketingBadges />
          </div>

          {/* Testimonials */}
          <div className="mb-8 md:mb-12 transition-all duration-700 delay-700">
            <Testimonials />
          </div>

          {/* Espace de Prompt Central */}
          <div className="mb-6 md:mb-16 transition-all duration-700 delay-500 flex justify-center">
            <div className="max-w-2xl w-full">
              <PromptInput
                placeholder="Décrivez votre projet..."
                onSubmit={(prompt) => {
                  console.log("Prompt submitted:", prompt);
                }}
                onToolsClick={() => {
                  console.log("Tools clicked");
                }}
                onImportClick={() => {
                  console.log("Import clicked");
                }}
              />
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
      {/* AURION Branding */}
      <div className="absolute top-3 md:top-8 left-4 md:left-1/2 md:transform md:-translate-x-1/2 z-20">
        <h1
          className="text-white text-lg md:text-2xl lg:text-3xl font-bold tracking-wider cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          AURION
        </h1>
      </div>

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
  const navigate = useNavigate();
  const { openSignIn } = useClerkSafe();
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  const handleScroll = useCallback((direction: "up" | "down") => {
    if (isScrolling.current) return;

    isScrolling.current = true;

    requestAnimationFrame(() => {
    if (direction === "down" && activeSection < sectionColors.length - 1) {
      setActiveSection((prev) => prev + 1);
    } else if (direction === "up" && activeSection > 0) {
      setActiveSection((prev) => prev - 1);
    }

    setTimeout(() => {
      isScrolling.current = false;
      }, 800); // Reduced from 1000ms for snappier response
    });
  }, [activeSection]);

  // Throttled scroll handlers for better performance
  const throttledWheelHandler = useMemo(
    () => throttle((e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 5) { // Lower threshold for more responsive scrolling
        handleScroll(e.deltaY > 0 ? "down" : "up");
      }
    }, 16), // ~60fps throttling
    [handleScroll]
  );

  const throttledTouchHandler = useMemo(
    () => throttle((diff: number) => {
      if (Math.abs(diff) > 30) { // Lower threshold for mobile
        handleScroll(diff > 0 ? "down" : "up");
      }
    }, 16),
    [handleScroll]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      throttledTouchHandler(diff);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        handleScroll("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScroll("up");
      }
    };

    // Use throttled wheel handler
    container.addEventListener("wheel", throttledWheelHandler, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", throttledWheelHandler);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, handleScroll, throttledWheelHandler, throttledTouchHandler]);


  // Memoize sections to prevent unnecessary re-renders
  const sections = useMemo(() =>
    sectionColors.map((colors, index) => (
      <Section
        key={index}
        id={index === 0 ? 'home' : index === 1 ? 'code-gen' : index === 2 ? 'workflow' : index === 3 ? 'app-builder' : index === 4 ? 'website-builder' : `section-${index}`}
        index={index}
        colors={colors}
        content={sectionContent[index]}
        isActive={index <= activeSection}
        activeSection={activeSection}
      />
    )), [activeSection]);

  return (
    <div
      id="home"
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Main container with MASSIVE 100px rounded border - MAX PERFORMANCE */}
      <div
        ref={containerRef}
        className="relative overflow-hidden w-[calc(100vw-16px)] h-[calc(100vh-16px)] md:w-[calc(100vw-16px)] md:h-[calc(100vh-16px)] rounded-3xl md:rounded-[48px] border-[16px] md:border-[25px] border-black"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "transform",
          contain: "layout style paint size",
          isolation: "isolate",
        }}
      >
        {/* Sections */}
        {sections}

        {/* Header Actions */}
        {/* Creation button - positioned on the left */}
        <div className="absolute top-3 left-3 md:top-8 md:left-8 z-50">
          <CreationMenu />
        </div>

        {/* Sign In button - positioned on the right (opposite side) */}
        <div className="absolute top-3 right-3 md:top-8 md:right-8 z-50">
          <ButtonGetStarted
            className="h-8 md:h-9 text-xs md:text-sm px-3 md:px-4"
            onClick={() => openSignIn()}
          />
        </div>

        {/* Header Navigation */}
        <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center w-full max-w-screen-xl px-4">
          <div className="flex items-center space-x-3 md:space-x-6 text-white text-xs md:text-sm font-medium">
            <a href="#enterprise" className="hover:text-white/80 transition-colors duration-200">Enterprise</a>
            <a href="#careers" className="hover:text-white/80 transition-colors duration-200">Careers</a>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-3 md:space-x-6 text-white text-xs md:text-sm font-medium">
            <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors duration-200">Docs</a>
            <a href="#pricing" className="hover:text-white/80 transition-colors duration-200">Pricing</a>
          </div>
        </div>


        {/* Tools Bar - Bottom floating buttons */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {/* Website & App Builder */}
            <button
              onClick={() => window.location.href = TOOL_URLS['website-builder']}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-black/80 hover:bg-black border border-white/20 hover:border-white/40 rounded-full text-white text-xs md:text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              title="Créateur de Sites Web et Applications"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Site Web & App</span>
              <ExternalLink className="w-2 h-2 md:w-3 md:h-3 opacity-60" />
            </button>

            {/* AI Agents */}
            <button
              onClick={() => window.location.href = TOOL_URLS['ai-agents']}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-black/80 hover:bg-black border border-white/20 hover:border-white/40 rounded-full text-white text-xs md:text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              title="Agents IA"
            >
              <Bot className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Agents IA</span>
              <ExternalLink className="w-2 h-2 md:w-3 md:h-3 opacity-60" />
            </button>

            {/* Text Editor */}
            <button
              onClick={() => window.location.href = TOOL_URLS['text-editor']}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-black/80 hover:bg-black border border-white/20 hover:border-white/40 rounded-full text-white text-xs md:text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              title="Éditeur de Texte IA"
            >
              <FileText className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Texte</span>
              <ExternalLink className="w-2 h-2 md:w-3 md:h-3 opacity-60" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
