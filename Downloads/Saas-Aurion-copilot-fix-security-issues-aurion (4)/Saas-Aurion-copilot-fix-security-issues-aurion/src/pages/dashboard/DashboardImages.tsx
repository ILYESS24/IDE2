/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Image as ImageIcon, 
  PenTool, 
  Layers, 
  Palette, 
  ImagePlus, 
  Eraser,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Clock,
  Download
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const ImageToolCard = ({ icon: Icon, title, desc, tag, status, onClick }: any) => (
  <div onClick={onClick} className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
      status === 'beta' ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-600 group-hover:bg-[#A56868] group-hover:text-white"
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

const GalleryItem = ({ src, prompt, date }: any) => (
  <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100">
    <img src={src} alt={prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <button className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700 shadow-sm backdrop-blur-sm">
        <Download size={12} />
      </button>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <p className="text-[10px] text-white/90 line-clamp-1">{prompt}</p>
    </div>
  </div>
);

export default function DashboardImages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    // Redirection vers l'outil de création supprimé - fonctionnalité retirée
  };

  const imageTools = [
    { icon: ImageIcon, title: "Texte → Image", desc: "Descriptions en visuels", status: "V2.5" },
    { icon: PenTool, title: "Croquis → Image", desc: "Esquisses en chefs-d'œuvre", status: "" },
    { icon: Layers, title: "Image → Image", desc: "Variations et styles", status: "" },
    { icon: Palette, title: "Style Transfer", desc: "Appliquer un style artistique", status: "" },
    { icon: ImagePlus, title: "Upscale", desc: "Agrandissement x4", status: "" },
    { icon: Eraser, title: "Retouche Magique", desc: "Supprimer/Remplacer", status: "Beta" },
  ];

  return (
    <PageLayout 
      title="Génération d'Images" 
      breadcrumbs={["Studio", "Images"]}
      rightPanel={
        <RightWidget title="Galerie Récente" action>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-1">Aucune image générée</p>
            <p className="text-xs text-gray-400">Vos créations apparaîtront ici</p>
          </div>
        </RightWidget>
      }
    >
      {/* Quick Create Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#A56868]" />
          <h2 className="text-lg font-bold text-gray-900">Imaginez une image</h2>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Un chat astronaute flottant dans une nébuleuse colorée, style digital art..."
            className="w-full h-32 bg-gray-50 rounded-xl border-none p-4 text-sm focus:ring-2 focus:ring-[#A56868]/20 transition-all resize-none placeholder:text-gray-400"
          />
          <button 
            onClick={handleGenerate}
            className="absolute bottom-3 right-3 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            Générer 4 variantes
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Outils de Création</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Voir tout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageTools.map((tool, index) => (
          <ImageToolCard key={index} {...tool} onClick={handleGenerate} />
        ))}
      </div>
    </PageLayout>
  );
}
