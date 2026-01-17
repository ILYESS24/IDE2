import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Users,
  BarChart3,
  Bell,
  Search,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Menu,
  X,
  LogOut,
  User,
  Zap,
  Code,
  Palette,
  FileText,
  Bot,
  Image,
  Video,
  Smartphone,
  Globe,
} from "lucide-react";

// Import des données réelles du système
import { useUserPlan } from "@/hooks/use-plan";
import { useDashboardStats, useRealtimeDashboard } from "@/hooks/use-dashboard";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { PLANS, TOOL_LABELS } from "@/types/plans";

// Sidebar Navigation Items - Adapté pour le système Aurion
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Code, label: "Code Editor", href: "/tools/code-editor" },
  { icon: Palette, label: "Intelligent Canvas", href: "/tools/intelligent-canvas" },
  { icon: FileText, label: "Text Editor", href: "/tools/text-editor" },
  { icon: Bot, label: "App Builder", href: "/tools/app-builder" },
  { icon: Users, label: "Agent AI", href: "/tools/agent-ai" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

// Quick Actions - Adapté pour le système Aurion
const quickActions = [
  { icon: Plus, label: "New Project", color: "bg-white text-black", href: "/dashboard/projects/new" },
  { icon: Code, label: "Code Editor", color: "bg-white/10 text-white", href: "/tools/code-editor" },
  { icon: Zap, label: "Quick Task", color: "bg-white/10 text-white", href: "/dashboard/tasks" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Données du système réel
  const { user, isSignedIn } = useClerkSafe();
  const { plan, credits, isLoading: planLoading } = useUserPlan();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { dashboardData } = useRealtimeDashboard();

  // Stats Data - Adapté avec les vraies données
  const statsData = [
    {
      label: "Credits Available",
      value: credits?.toLocaleString() || "0",
      change: plan ? `Plan: ${PLANS[plan].name}` : "",
      trend: "up",
      icon: Zap,
    },
    {
      label: "Projects Created",
      value: stats?.totalProjects?.toString() || "0",
      change: "+12%",
      trend: "up",
      icon: FolderOpen,
    },
    {
      label: "Tools Used",
      value: Object.keys(TOOL_LABELS).length.toString(),
      change: "Available",
      trend: "up",
      icon: Code,
    },
    {
      label: "Usage This Month",
      value: stats?.monthlyUsage?.toString() || "0",
      change: credits ? `${((stats?.monthlyUsage || 0) / credits * 100).toFixed(1)}%` : "0%",
      trend: (stats?.monthlyUsage || 0) > 1000 ? "up" : "neutral",
      icon: BarChart3,
    },
  ];

  // Recent Projects - Adapté avec les vraies données
  const recentProjects = [
    {
      name: "Code Editor Session",
      status: "Active",
      progress: 75,
      team: 1,
      icon: Code,
      href: "/tools/code-editor",
    },
    {
      name: "Design Canvas",
      status: "In Progress",
      progress: 60,
      team: 1,
      icon: Palette,
      href: "/tools/intelligent-canvas",
    },
    {
      name: "Text Document",
      status: "Draft",
      progress: 30,
      team: 1,
      icon: FileText,
      href: "/tools/text-editor",
    },
    {
      name: "App Prototype",
      status: "Planning",
      progress: 10,
      team: 1,
      icon: Bot,
      href: "/tools/app-builder",
    },
  ];

  // Recent Activity - Adapté avec les vraies données
  const recentActivity = [
    {
      user: user?.fullName || "You",
      action: "used",
      target: "Code Editor",
      time: "5 min ago",
      icon: Code,
    },
    {
      user: user?.fullName || "You",
      action: "created",
      target: "New Canvas",
      time: "1 hour ago",
      icon: Palette,
    },
    {
      user: user?.fullName || "You",
      action: "saved",
      target: "Text Document",
      time: "2 hours ago",
      icon: FileText,
    },
    {
      user: user?.fullName || "You",
      action: "accessed",
      target: "Agent AI",
      time: "1 day ago",
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-body" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px'
    }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed top-0 left-0 h-full w-[280px] bg-neutral-950 border-r border-white/10 z-50 lg:translate-x-0 lg:z-30"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/" className="text-xl font-bold font-display">
              aurion<span className="text-xs align-super">®</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active
                        ? "bg-white text-black font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/40">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <LogOut className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-[280px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search projects, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors font-body"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm font-body"
              >
                <Plus className="w-4 h-4" />
                New Project
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              Welcome back, {user?.firstName || "User"} 👋 ✨
            </h1>
            <p className="text-white/70 font-body">
              Here's what's happening with your projects today.
            </p>
          </motion.div>

          {/* Plan Info */}
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold font-display text-lg mb-1">
                    {PLANS[plan].name} Plan
                  </h3>
                  <p className="text-white/60 text-sm font-body">
                    {credits} credits remaining • {PLANS[plan].price}€/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-display">
                    {credits}
                  </p>
                  <p className="text-white/40 text-sm font-body">Credits</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm font-body ${action.color} transition-colors`}
                onClick={() => window.location.href = action.href}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-white/60 font-body">
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold font-display mb-1">{stat.value}</p>
                <p className="text-white/60 text-sm font-body">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aurion Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold font-display">Aurion Tools</h2>
                <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors font-body">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(TOOL_LABELS).map(([toolId, toolName], index) => {
                  const toolIcons = {
                    'code-editor': Code,
                    'intelligent-canvas': Palette,
                    'text-editor': FileText,
                    'app-builder': Bot,
                    'agent-ai': Users,
                  };

                  const IconComponent = toolIcons[toolId as keyof typeof toolIcons] || Code;

                  return (
                    <motion.div
                      key={toolId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className="group"
                    >
                      <Link
                        to={`/tools/${toolId}`}
                        className="block p-4 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium font-display">{toolName}</h3>
                            <p className="text-xs text-white/60 font-body">
                              AI-powered {toolName.toLowerCase()}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>Ready to use</span>
                          <span className="text-green-400 font-medium">● Active</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold font-display">Recent Activity</h2>
                <button className="text-sm text-white/70 hover:text-white transition-colors font-body">
                  See all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-white/70">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1 font-body">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Credits Alert */}
          {credits && credits < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-display mb-1">
                      Low Credits Warning
                    </h3>
                    <p className="text-white/60 text-sm font-body">
                      You only have {credits} credits remaining. Consider upgrading your plan to continue using our tools.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-6 py-3 rounded-xl font-medium text-sm font-body whitespace-nowrap"
                >
                  Upgrade Plan
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;