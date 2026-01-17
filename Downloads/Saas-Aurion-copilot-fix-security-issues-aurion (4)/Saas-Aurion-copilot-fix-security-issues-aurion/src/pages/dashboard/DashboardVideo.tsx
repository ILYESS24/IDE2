/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wand2, 
  Film, 
  Scissors, 
  Type, 
  Music, 
  Upload, 
  Sparkles, 
  ArrowRight,
  MoreHorizontal,
  Plus,
  Play,
  Clock
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const VideoToolCard = ({ icon: Icon, title, desc, tag, status, onClick }: any) => (
  <div onClick={onClick} className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
      status === 'beta' ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600 group-hover:bg-[#A56868] group-hover:text-white"
    )}>
      <Icon size={20} />
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#A56868] transition-colors truncate">{title}</h4>
        {status && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
            {status}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const VideoProjectItem = ({ title, time, status, thumbnail }: any) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all cursor-pointer group">
    <div className="w-16 h-10 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
        <Play size={12} className="text-white fill-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <Clock size={10} />
        <span>{time}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className={cn(
          "font-medium",
          status === 'Ready' ? "text-green-600" : "text-orange-600"
        )}>{status}</span>
      </div>
    </div>
    <MoreHorizontal size={14} className="text-gray-300 hover:text-gray-600" />
  </div>
);

export default function DashboardVideo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    // Redirection vers l'outil de création supprimé - fonctionnalité retirée
  };

  const videoTools = [
    { icon: Wand2, title: "Texte → Vidéo", desc: "Générez une vidéo complète", status: "New" },
    { icon: Film, title: "Image → Vidéo", desc: "Animez vos images", status: "Popular" },
    { icon: Scissors, title: "Montage IA", desc: "Montage automatique intelligent", status: "Beta" },
    { icon: Type, title: "Sous-titres", desc: "Transcription et sous-titrage", status: "" },
    { icon: Music, title: "Audio Sync", desc: "Synchronisation musicale", status: "" },
    { icon: Upload, title: "Upscale", desc: "Amélioration 4K", status: "" },
  ];

  return (
    <PageLayout 
      title="Création Vidéo" 
      breadcrumbs={["Studio", "Vidéo"]}
      rightPanel={
        <RightWidget title="Vidéos Récentes" action>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-1">Aucune vidéo générée</p>
            <p className="text-xs text-gray-400">Vos créations apparaîtront ici</p>
          </div>
        </RightWidget>
      }
    >
      {/* Quick Create Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#A56868]" />
          <h2 className="text-lg font-bold text-gray-900">Génération Rapide</h2>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez la vidéo que vous imaginez..."
            className="w-full h-32 bg-gray-50 rounded-xl border-none p-4 text-sm focus:ring-2 focus:ring-[#A56868]/20 transition-all resize-none placeholder:text-gray-400"
          />
          <button 
            onClick={handleGenerate}
            className="absolute bottom-3 right-3 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            Générer
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Outils Vidéo</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Voir tout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videoTools.map((tool, index) => (
          <VideoToolCard key={index} {...tool} onClick={handleGenerate} />
        ))}
      </div>
    </PageLayout>
  );
}
