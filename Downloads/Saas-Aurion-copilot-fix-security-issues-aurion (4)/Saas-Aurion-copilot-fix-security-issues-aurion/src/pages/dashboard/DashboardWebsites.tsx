/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  Globe, 
  Layout, 
  ShoppingCart, 
  FileText, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  BarChart,
  Eye
} from "lucide-react";
import PageLayout, { RightWidget } from "@/components/ui/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const WebsiteCard = ({ icon: Icon, name, url, status, visitors, onClick }: any) => (
  <div onClick={onClick} className="group flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        status === 'Published' ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"
      )}>
        <Icon size={24} />
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
        status === 'Published' ? "bg-indigo-100 text-indigo-700" : "bg-yellow-100 text-yellow-700"
      )}>
        {status}
      </span>
    </div>
    
    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#A56868] transition-colors">{name}</h4>
    <a href={`https://${url}`} className="text-xs text-gray-500 mb-4 hover:text-[#A56868] flex items-center gap-1" onClick={e => e.stopPropagation()}>
      {url} <ExternalLink size={10} />
    </a>
    
    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        <Eye size={12} />
        {visitors} vues
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#A56868] transition-colors" />
    </div>
  </div>
);

export default function DashboardWebsites() {
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: "Nouveau Site",
      description: "Lancement de l'éditeur de site..."
    });
  };

  const websites = [
    { icon: Globe, name: "Portfolio 2025", url: "alex.design", status: "Published", visitors: "2.4k" },
    { icon: ShoppingCart, name: "E-shop Merch", url: "shop.brand.com", status: "Draft", visitors: "0" },
    { icon: FileText, name: "Blog Tech", url: "blog.tech.io", status: "Published", visitors: "15k" },
    { icon: Layout, name: "Landing Page SaaS", url: "saas.io", status: "Published", visitors: "8.2k" },
  ];

  return (
    <PageLayout 
      title="Sites Web" 
      breadcrumbs={["Studio", "Sites"]}
      rightPanel={
        <RightWidget title="Analytics" action>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Visiteurs Totaux</span>
              <span className="text-sm font-bold text-gray-900">25.6k</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#A56868] h-1.5 rounded-full" style={{ width: '70%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Taux de Rebond</span>
              <span className="text-sm font-bold text-gray-900">42%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
        </RightWidget>
      }
    >
      {/* Quick Create Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#A56868]" />
          <h2 className="text-lg font-bold text-gray-900">Générer un site</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={handleCreate} className="p-4 border border-gray-200 rounded-xl text-left hover:border-[#A56868] hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A56868] group-hover:text-white transition-colors text-indigo-600">
              <Layout size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Landing Page</h3>
            <p className="text-xs text-gray-500">Conversion optimisée</p>
          </button>
          
          <button onClick={handleCreate} className="p-4 border border-gray-200 rounded-xl text-left hover:border-[#A56868] hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A56868] group-hover:text-white transition-colors text-pink-600">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Portfolio</h3>
            <p className="text-xs text-gray-500">Présentation visuelle</p>
          </button>
          
          <button onClick={handleCreate} className="p-4 border border-gray-200 rounded-xl text-left hover:border-[#A56868] hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A56868] group-hover:text-white transition-colors text-green-600">
              <ShoppingCart size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">E-commerce</h3>
            <p className="text-xs text-gray-500">Boutique complète</p>
          </button>
        </div>
      </div>

      {/* Websites Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mes Sites</h2>
        <button className="text-xs font-bold text-[#A56868] hover:underline">Gérer tout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {websites.map((site, index) => (
          <WebsiteCard key={index} {...site} onClick={() => {}} />
        ))}
      </div>
    </PageLayout>
  );
}
