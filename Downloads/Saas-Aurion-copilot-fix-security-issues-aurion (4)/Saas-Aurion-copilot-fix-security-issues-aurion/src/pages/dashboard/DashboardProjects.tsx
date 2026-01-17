/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  FolderOpen, 
  Video, 
  Image, 
  Code2, 
  Globe, 
  Bot, 
  Smartphone, 
  MoreHorizontal,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useProjects } from "@/hooks/use-extended-data";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const projectTypeIcons: Record<string, React.ElementType> = {
  video: Video,
  image: Image,
  code: Code2,
  website: Globe,
  agent: Bot,
  app: Smartphone
};

const ProjectListItem = ({ title, type, desc, status, date, onClick }: any) => {
  const Icon = projectTypeIcons[type] || FolderOpen;
  
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#A56868] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#A56868] transition-colors truncate">{title}</h4>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
            status === 'completed' ? "bg-green-100 text-green-700" : 
            status === 'in_progress' ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
          )}>
            {status === 'completed' ? 'Terminé' : status === 'in_progress' ? 'En cours' : 'Attente'}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{desc || "Aucune description"}</p>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
        <Clock size={12} />
        <span>{date}</span>
      </div>

      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
};

export default function DashboardProjects() {
  const navigate = useNavigate();
  const { data: projects } = useProjects();

  return (
    <PageLayout 
      title="Tous les Projets" 
      breadcrumbs={["Studio", "Projets"]}
      rightPanel={
        <RightWidget title="Statistiques" action>
          <div className="space-y-4">
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Total Projets</span>
              <div className="flex items-end justify-between mt-1">
                <span className="text-2xl font-bold text-gray-900">{projects?.length || 0}</span>
                <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full">0%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide">En cours</span>
                <span className="block text-xl font-bold text-gray-900 mt-1">
                  {projects?.filter(p => p.status === 'in_progress').length || 0}
                </span>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Terminés</span>
                <span className="block text-xl font-bold text-gray-900 mt-1">
                  {projects?.filter(p => p.status === 'completed').length || 0}
                </span>
              </div>
            </div>
          </div>
        </RightWidget>
      }
    >
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl shadow-lg shadow-black/10 hover:bg-gray-800 transition-all">
            Tous
          </button>
          <button className="px-4 py-2 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            En cours
          </button>
          <button className="px-4 py-2 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            Archivés
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-xs font-bold text-[#A56868] hover:underline"
        >
          <Plus size={14} />
          Nouveau Projet
        </button>
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-2">Aucun projet créé</p>
          <p className="text-sm text-gray-400 mb-4">Créez votre premier projet pour commencer</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 px-6 py-3 bg-[#A56868] text-white text-sm font-bold rounded-xl hover:bg-[#8d5555] transition-all"
          >
            <Plus size={16} />
            Nouveau Projet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectListItem 
              key={project.id}
              title={project.title}
              type={project.type}
              desc={project.description}
              status={project.status}
              date={project.updated_at}
              onClick={() => navigate(`/dashboard/project/${project.id}`)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
