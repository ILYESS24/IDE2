import React from "react";
import { Link } from "react-router-dom";
import { LegalLayout } from "../components/layout/LegalLayout";
import { 
  Video, 
  Image as ImageIcon, 
  Code2, 
  Bot, 
  Globe, 
  Smartphone,
  ArrowRight,
  Zap
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all group">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-500 leading-relaxed mb-6">{description}</p>
    <Link to="/signup" className="flex items-center gap-2 text-sm font-bold text-black hover:gap-3 transition-all">
      Try it now <ArrowRight size={16} />
    </Link>
  </div>
);

export default function Features() {
  return (
    <LegalLayout 
      title="Features" 
      subtitle="Discover the power of AI-driven productivity tools."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-8 mb-16">
        <FeatureCard 
          icon={Video}
          title="Video Studio"
          description="Transform text into cinematic videos. Create marketing ads, social media content, and storytelling sequences with physics-aware AI generation."
        />
        <FeatureCard 
          icon={ImageIcon}
          title="Image Generation"
          description="Generate photorealistic images, digital art, and sketches. Use advanced controls for composition, lighting, and style transfer."
        />
        <FeatureCard 
          icon={Code2}
          title="Code Assistant"
          description="Build full-stack applications, debug complex issues, and refactor codebases with an AI that understands context and architecture."
        />
        <FeatureCard 
          icon={Bot}
          title="AI Agents"
          description="Deploy autonomous agents to handle customer support, data analysis, and workflow automation 24/7 without supervision."
        />
        <FeatureCard 
          icon={Smartphone}
          title="App Builder"
          description="Turn ideas into functional mobile and web applications. From UI design to backend logic, automate the entire development lifecycle."
        />
        <FeatureCard 
          icon={Globe}
          title="Website Creator"
          description="Design, build, and deploy stunning websites in minutes. SEO-optimized, responsive, and fully customizable."
        />
      </div>

      <div className="bg-black rounded-[40px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Zap size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start creating?</h2>
          <p className="text-white/60 mb-8 text-lg">
            Join thousands of creators who are already using AURION to bring their ideas to life.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors"
          >
            Get Started for Free <ArrowRight size={20} />
          </Link>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-[100px]" />
      </div>
    </LegalLayout>
  );
}

