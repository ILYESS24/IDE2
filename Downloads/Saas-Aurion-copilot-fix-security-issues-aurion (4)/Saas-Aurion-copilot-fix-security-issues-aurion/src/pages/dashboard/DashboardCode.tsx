/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  FileCode, 
  Bug, 
  Terminal, 
  Braces, 
  Server, 
  Database,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Copy,
  Check
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const CodeToolCard = ({ icon: Icon, title, desc, status, onClick }: any) => (
  <div onClick={onClick} className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
      status === 'Experimental' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600 group-hover:bg-[#A56868] group-hover:text-white"
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

const SnippetItem = ({ title, lang, date }: any) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
        {lang}
      </div>
      <div>
        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#A56868] transition-colors">{title}</h4>
        <p className="text-[10px] text-gray-400">{date}</p>
      </div>
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
        <Copy size={12} />
      </button>
    </div>
  </div>
);

export default function DashboardCode() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    toast({
      title: "Génération lancée",
      description: "Votre code est en cours d'écriture..."
    });
  };

  const codeTools = [
    { icon: FileCode, title: "Génération de Code", desc: "Fonctions, classes, composants", status: "Stable" },
    { icon: Bug, title: "Débogage Intelligent", desc: "Trouver et corriger les erreurs", status: "" },
    { icon: Terminal, title: "Explication", desc: "Comprendre un code complexe", status: "" },
    { icon: Braces, title: "Refactoring", desc: "Optimiser et nettoyer", status: "" },
    { icon: Server, title: "API Builder", desc: "Endpoints et documentation", status: "Beta" },
    { icon: Database, title: "Requêtes SQL", desc: "Génération de requêtes complexes", status: "" },
  ];

  return (
    <PageLayout 
      title="Génération de Code" 
      breadcrumbs={["Studio", "Code"]}
      rightPanel={
        <RightWidget title="Snippets Récents" action>
          <div className="space-y-3">
            <SnippetItem title="Auth Middleware" lang="TS" date="Il y a 1h" />
            <SnippetItem title="User Schema" lang="SQL" date="Il y a 3h" />
            <SnippetItem title="Animation Hook" lang="JS" date="Hier" />
            <SnippetItem title="Docker Config" lang="YML" date="Il y a 2j" />
          </div>
          <button className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            Bibliothèque de code
          </button>
        </RightWidget>
      }
    >
      {/* Quick Create Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#A56868]" />
          <h2 className="text-lg font-bold text-gray-900">Décrivez votre fonction</h2>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Une fonction React qui gère un formulaire avec validation Zod..."
            className="w-full h-32 bg-gray-50 rounded-xl border-none p-4 text-sm focus:ring-2 focus:ring-[#A56868]/20 transition-all resize-none placeholder:text-gray-400 font-mono"
          />
          <button 
            onClick={handleGenerate}
            className="absolute bottom-3 right-3 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            Coder
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Outils Développeur</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Voir tout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {codeTools.map((tool, index) => (
          <CodeToolCard key={index} {...tool} onClick={handleGenerate} />
        ))}
      </div>
    </PageLayout>
  );
}
