 
import { ReactNode } from "react";
import { ArrowRight, Zap, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  breadcrumbs: string[];
  children: ReactNode;
  rightPanel?: ReactNode;
}

interface RightWidgetProps {
  title: string;
  children: ReactNode;
  action?: boolean;
}

export const RightWidget = ({ title, children, action }: RightWidgetProps) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4 px-2">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {action && (
        <button className="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center transition-all">
           <ArrowRight size={16} className="text-gray-400 cursor-pointer hover:text-gray-900 transform rotate-[-45deg]" />
        </button>
      )}
    </div>
    {children}
  </div>
);

export const NotificationsWidget = () => (
  <div className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow mb-8 relative overflow-hidden group">
    <div className="flex items-center justify-between mb-6">
       <h3 className="font-bold text-gray-900">Activité</h3>
       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
    </div>

    <div className="space-y-3 relative z-10">
      <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[24px] border border-transparent hover:border-gray-200 transition-all cursor-pointer group/item">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10 group-hover/item:scale-110 transition-transform">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">PRO Mode</h4>
            <p className="text-[10px] text-gray-500 font-medium">Activé</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[24px] hover:shadow-md transition-all cursor-pointer group/item">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F2F3F5] flex items-center justify-center group-hover/item:scale-110 transition-transform">
            <UserPlus size={16} className="text-gray-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">New Member</h4>
            <p className="text-[10px] text-gray-500 font-medium">Alex joined</p>
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <button className="w-full py-3 bg-black text-white rounded-[20px] text-xs font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
          Voir tout
        </button>
      </div>
    </div>
  </div>
);

export default function PageLayout({ title, breadcrumbs, children, rightPanel }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Title & Actions Bubble */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">
            <span>Dashboard</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-gray-300">/</span>
                <span className={cn(i === breadcrumbs.length - 1 ? "text-[#A56868]" : "")}>{crumb}</span>
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {children}
        </div>

        {/* Right Column (Widgets) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <NotificationsWidget />
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
