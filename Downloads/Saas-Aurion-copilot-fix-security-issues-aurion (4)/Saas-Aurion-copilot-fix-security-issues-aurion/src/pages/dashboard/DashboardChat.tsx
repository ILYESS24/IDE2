/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { memo, useEffect, useCallback } from "react";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { 
  MoreVertical, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Clock,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Laptop,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  MessageSquare,
  Plus,
  Loader2,
  type LucideIcon
} from "lucide-react";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useTimerStore, useTasksStore, useEventsStore, useStatsStore } from "@/stores/app-store";
import { useTasks, useUpdateTask, useEvents, useStats, useWorkData, useProfile } from "@/hooks/use-data";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "@/types/database";

interface ChartData {
  day: string;
  value: number;
  active?: boolean;
}

// ============================================
// STAT PILL COMPONENT
// ============================================
interface StatPillProps {
  label: string;
  value: string | number;
  type?: "dark" | "yellow" | "outline";
  isLoading?: boolean;
}

const StatPill = memo(function StatPill({ label, value, type = "outline", isLoading }: StatPillProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <span className="text-xs text-gray-500 font-medium ml-1">{label}</span>
      <div className={cn(
        "px-6 py-3 rounded-full text-sm font-medium text-center transition-all",
        type === "dark" && "bg-crextio-dark text-white",
        type === "yellow" && "bg-crextio-primary text-crextio-dark",
        type === "outline" && "border border-gray-300 text-gray-600 bg-transparent"
      )}>
        {isLoading ? (
          <Loader2 size={14} className="animate-spin mx-auto" />
        ) : (
          `${value}%`
        )}
      </div>
    </div>
  );
});

// ============================================
// BIG STAT COMPONENT
// ============================================
interface BigStatProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  isLoading?: boolean;
}

const BigStat = memo(function BigStat({ icon: Icon, value, label, isLoading }: BigStatProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-white/60 rounded-xl shadow-sm">
          <Icon size={16} className="text-gray-600" />
        </div>
      </div>
      <span className="text-5xl font-light text-gray-900 tracking-tight">
        {isLoading ? <Loader2 size={32} className="animate-spin" /> : value}
      </span>
      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">{label}</span>
    </div>
  );
});

// ============================================
// TASK ITEM COMPONENT (Interactive)
// ============================================
interface TaskItemProps {
  task: Task;
  icon: LucideIcon;
  onToggle: () => void;
  isUpdating?: boolean;
}

const TaskItem = memo(function TaskItem({ task, icon: Icon, onToggle, isUpdating }: TaskItemProps) {
  const isChecked = task.status === 'completed';
  
  return (
    <button
      onClick={onToggle}
      disabled={isUpdating}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all group text-left",
        isChecked && "opacity-60 bg-gray-50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          isChecked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 group-hover:bg-crextio-dark group-hover:text-white"
        )}>
          {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
        </div>
        <div>
          <h4 className={cn(
            "font-semibold text-gray-900 transition-colors",
            isChecked && "line-through text-gray-500"
          )}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {task.priority || 'medium'}
            </span>
            {task.due_date && (
              <span className="text-xs text-gray-400">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
        isChecked ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-crextio-dark"
      )}>
        {isChecked && <CheckCircle2 size={14} className="text-white" />}
      </div>
    </button>
  );
});

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function DashboardChat() {
  const { data: statsData } = useStats();
  const { data: rawWorkData } = useWorkData();
  const { user } = useClerkSafe();
  const { tasks: localTasks } = useTasksStore();
  const { data: serverTasks } = useTasks();
  const updateTask = useUpdateTask();
  const { data: events } = useEvents();
  const { data: profile } = useProfile();
  
  const { isRunning, elapsedSeconds, startTime, start, pause } = useTimerStore();
  
  // Combine local and server tasks
  const tasks = serverTasks || localTasks;
  const recentTasks = tasks.slice(0, 3);

  // Cast work data
  const workData = (rawWorkData || []).map((d: any) => ({
    ...d,
    day: d.name, // Map name to day for chart
    active: d.value > 500 // Mock active state
  })) as ChartData[];

  // Format timer
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        useTimerStore.getState().tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) pause();
    else start();
  };

  const handleToggleTask = useCallback((task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ 
      id: task.id, 
      updates: { 
        completed: !task.completed,
        status: newStatus 
      } 
    });
  }, [updateTask]);

  // Use stats from hook or fallbacks
  const stats = statsData || {
    revenue: "0",
    users: "0",
    bounceRate: "0",
    interviews: 0,
    hired: 0,
    onboardingProgress: 0,
    output: 0,
    employees: 0,
    hirings: 0,
    projects: 0,
    weeklyHours: 0
  };

  return (
    <div className="h-full flex flex-col gap-8 pb-8">
      {/* 1. Header with Stats Pills */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Good Morning, {user?.firstName || 'Creator'}
          </h1>
          <p className="text-gray-500 font-medium">Here's your daily overview</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <StatPill label="Interviews" value={stats.interviews || 12} type="outline" />
          <StatPill label="Hired" value={stats.hired || 3} type="outline" />
          <StatPill label="Onboarding" value={stats.onboardingProgress || 68} type="yellow" />
          <StatPill label="Output" value={stats.output || 45} type="dark" />
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN (Profile & Timer) - Span 3 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-[#EAEaea] rounded-[32px] p-6 flex flex-col items-center text-center shadow-sm border border-white/50 h-full max-h-[400px]">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full p-1 border-2 border-gray-300 group-hover:border-crextio-dark transition-colors">
                <img 
                  src={profile?.avatar_url || user?.imageUrl || "https://i.pravatar.cc/150?img=32"} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-[#EAEaea] rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || user?.fullName}</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Product Designer</p>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Employees</span>
                <span className="font-bold text-gray-900">{stats.employees || 24}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Hiring</span>
                <span className="font-bold text-gray-900">{stats.hirings || 5}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Projects</span>
                <span className="font-bold text-gray-900">{stats.projects || 8}</span>
              </div>
            </div>
          </div>

          {/* Timer Card */}
          <div className="bg-black text-white rounded-[32px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crextio-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Tracking</p>
                <h3 className="text-lg font-bold">Design System</h3>
              </div>
              <div className="p-2 bg-white/10 rounded-full">
                <Clock size={16} />
              </div>
            </div>

            <div className="text-center z-10 my-4">
              <span className="text-4xl font-mono font-light tracking-wider tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <button 
              onClick={toggleTimer}
              className={cn(
                "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all z-10",
                isRunning ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-crextio-primary text-black hover:bg-crextio-primary/90"
              )}
            >
              {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isRunning ? "Pause Timer" : "Start Timer"}
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN (Stats & Chart) - Span 6 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          {/* Big Numbers Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex justify-center">
              <BigStat icon={Briefcase} value={stats.projects || 8} label="Active" />
            </div>
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex justify-center">
              <BigStat icon={CheckCircle2} value={stats.hired || 142} label="Completed" />
            </div>
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex justify-center">
              <BigStat icon={Clock} value={`${stats.weeklyHours || 32}h`} label="Hours" />
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Activity</h3>
                <p className="text-sm text-gray-400">Weekly productivity</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100">
                This Week <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workData}>
                  <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                    {workData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.active ? '#FFD550' : '#E4E4E7'} 
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-4 px-2">
              {workData.map((d, i) => (
                <span key={i} className={cn(
                  "text-xs font-medium",
                  d.active ? "text-black" : "text-gray-300"
                )}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Tasks & Calendar) - Span 3 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {/* Tasks List */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Tasks</h3>
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {recentTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  icon={LinkIcon} 
                  onToggle={() => handleToggleTask(task)}
                  isUpdating={updateTask.isPending}
                />
              ))}
              
              {recentTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks for today
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              View all tasks <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Mini Calendar / Next Meeting */}
          <div className="bg-[#1A1A1A] rounded-[32px] p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users size={20} className="text-crextio-primary" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Up Next</p>
                <h3 className="font-bold text-sm">Team Meeting</h3>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Clock size={14} />
                <span>10:00 - 11:00 AM</span>
              </div>
              
              <div className="flex -space-x-2 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-gray-600">
                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-crextio-primary text-black flex items-center justify-center text-xs font-bold">
                  +2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
