/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  Smartphone, 
  Layout, 
  Box, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Plus,
  Rocket,
  Users
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const AppCard = ({ icon: Icon, name, platform, status, users, onClick }: any) => (
  <div onClick={onClick} className="group flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        status === 'Live' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
      )}>
        <Icon size={24} />
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
        status === 'Live' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
      )}>
        {status}
      </span>
    </div>
    
    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#A56868] transition-colors">{name}</h4>
    <p className="text-xs text-gray-500 mb-4">{platform}</p>
    
    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        <Users size={12} />
        {users}
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#A56868] transition-colors" />
    </div>
  </div>
);

export default function DashboardApps() {
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: "Nouvelle App",
      description: "Lancement du builder d'application..."
    });
  };

  const apps: any[] = [];

  return (
    <PageLayout 
      title="Mes Applications" 
      breadcrumbs={["Studio", "Apps"]}
      rightPanel={
        <RightWidget title="Métriques" action>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <span className="block text-xl font-bold text-gray-900">0</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Utilisateurs</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <span className="block text-xl font-bold text-gray-900">0%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Uptime</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <span className="block text-xl font-bold text-gray-900">0</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Note</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <span className="block text-xl font-bold text-gray-900">0</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Versions</span>
            </div>
          </div>
        </RightWidget>
      }
    >
      {/* Quick Create Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#A56868]" />
          <h2 className="text-lg font-bold text-gray-900">Créer une application</h2>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleCreate} className="flex-1 py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#A56868] hover:text-[#A56868] hover:bg-[#A56868]/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#A56868] group-hover:text-white transition-colors">
              <Smartphone size={20} />
            </div>
            <span className="text-sm font-medium">App Mobile</span>
          </button>
          
          <button onClick={handleCreate} className="flex-1 py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#A56868] hover:text-[#A56868] hover:bg-[#A56868]/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#A56868] group-hover:text-white transition-colors">
              <Layout size={20} />
            </div>
            <span className="text-sm font-medium">Web App</span>
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Projets en cours</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Voir tout</button>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-2">Aucune application créée</p>
          <p className="text-sm text-gray-400">Créez votre première application ci-dessus</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((app, index) => (
            <AppCard key={index} {...app} onClick={() => {}} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
