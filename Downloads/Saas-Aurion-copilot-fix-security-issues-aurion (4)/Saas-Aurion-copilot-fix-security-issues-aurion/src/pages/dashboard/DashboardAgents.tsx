/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Activity, 
  Plus, 
  Play, 
  Pause, 
  Settings,
  Sparkles,
  ArrowRight
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const AgentCard = ({ icon: Icon, name, desc, status, tasks, onClick }: any) => (
  <div onClick={onClick} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        status === 'active' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
      )}>
        <Icon size={24} />
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#A56868] transition-colors">{name}</h4>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
            status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          )}>
            {status}
          </span>
        </div>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="text-right hidden sm:block">
        <span className="text-lg font-bold text-gray-900 block">{tasks}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Tâches</span>
      </div>
      <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors">
        <Settings size={14} />
      </button>
    </div>
  </div>
);

const ActivityItem = ({ agent, action, time }: any) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
    <div className="mt-1 w-2 h-2 rounded-full bg-[#A56868]" />
    <div>
      <p className="text-xs font-medium text-gray-900">
        <span className="font-bold">{agent}</span> {action}
      </p>
      <p className="text-[10px] text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

export default function DashboardAgents() {
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: "Nouvel Agent",
      description: "Configuration d'un nouvel agent..."
    });
  };

  const agents = [
    { icon: MessageSquare, name: "Assistant Commercial", desc: "Répond aux leads entrants", status: "active", tasks: 1240 },
    { icon: Zap, name: "Automatisation Email", desc: "Newsletter et relances", status: "active", tasks: 856 },
    { icon: Activity, name: "Veille Concurrentielle", desc: "Analyse du marché", status: "paused", tasks: 42 },
    { icon: Bot, name: "Support N1", desc: "FAQ et tickets simples", status: "active", tasks: 3102 },
  ];

  return (
    <PageLayout 
      title="Agents IA" 
      breadcrumbs={["Studio", "Agents"]}
      rightPanel={
        <RightWidget title="Activité Récente">
          <div className="space-y-3">
            <ActivityItem agent="Commercial" action="a qualifié un lead" time="Il y a 2m" />
            <ActivityItem agent="Support" action="a résolu le ticket #482" time="Il y a 15m" />
            <ActivityItem agent="Email" action="a envoyé la campagne Hebdo" time="Il y a 1h" />
            <ActivityItem agent="Veille" action="a détecté une tendance" time="Il y a 3h" />
          </div>
        </RightWidget>
      }
    >
      {/* Create Agent Banner */}
      <div className="bg-[#A56868] rounded-2xl p-6 shadow-lg mb-8 text-white relative overflow-hidden group cursor-pointer" onClick={handleCreate}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 transform translate-x-10 group-hover:translate-x-5 transition-transform" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300" />
              Créer un Agent Autonome
            </h2>
            <p className="text-white/80 text-sm max-w-md">
              Configurez un nouvel agent pour automatiser vos tâches répétitives.
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Plus size={24} />
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mes Agents</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Gérer tout</button>
      </div>

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <AgentCard key={index} {...agent} onClick={() => {}} />
        ))}
      </div>
    </PageLayout>
  );
}
