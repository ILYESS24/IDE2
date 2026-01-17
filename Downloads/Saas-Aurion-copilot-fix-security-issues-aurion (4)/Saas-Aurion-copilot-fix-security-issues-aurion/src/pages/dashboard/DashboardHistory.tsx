/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/static-components */
import React, { useState } from "react";
import { 
  Clock, 
  MessageSquare, 
  Image, 
  Code, 
  Trash2, 
  MoreVertical,
  Calendar,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  type: "chat" | "image" | "code";
  title: string;
  preview: string;
  timestamp: Date;
}

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "chat",
    title: "Discussion sur React Hooks",
    preview: "Comment utiliser useEffect correctement...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
  },
  {
    id: "2",
    type: "image",
    title: "Logo futuriste",
    preview: "Création d'un logo pour startup tech...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: "3",
    type: "code",
    title: "API REST Node.js",
    preview: "Génération d'un serveur Express...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    id: "4",
    type: "chat",
    title: "Stratégie marketing",
    preview: "Plan de lancement produit SaaS...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: "5",
    type: "image",
    title: "Illustration de site web",
    preview: "Hero section avec gradients...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
  },
  {
    id: "6",
    type: "code",
    title: "Dashboard React",
    preview: "Composant tableau de bord avec charts...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "chat": return MessageSquare;
    case "image": return Image;
    case "code": return Code;
    default: return MessageSquare;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "chat": return "text-blue-500 bg-blue-50";
    case "image": return "text-purple-500 bg-purple-50";
    case "code": return "text-green-500 bg-green-50";
    default: return "text-gray-500 bg-gray-50";
  }
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const HistoryCard = ({ item, index, onDelete }: { item: HistoryItem; index: number; onDelete: (id: string) => void }) => {
  const [showMenu, setShowMenu] = useState(false);
  const IconComponent = getTypeIcon(item.type);
  const colorClass = getTypeColor(item.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
          <IconComponent size={22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium mb-1 truncate group-hover:text-orange-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-500 text-sm truncate">{item.preview}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <Clock size={12} />
            <span>{formatDate(item.timestamp)}</span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[150px] z-10"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardHistory() {
  const [history, setHistory] = useState(mockHistory);
  const [filter, setFilter] = useState<"all" | "chat" | "image" | "code">("all");

  const filteredHistory = filter === "all" 
    ? history 
    : history.filter(item => item.type === filter);

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full px-10 py-8 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">Historique</h1>
            <p className="text-gray-500">Retrouvez toutes vos conversations et créations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">{history.length} éléments</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6"
      >
        <Filter size={16} className="text-gray-400" />
        {[
          { value: "all", label: "Tout" },
          { value: "chat", label: "Conversations" },
          { value: "image", label: "Images" },
          { value: "code", label: "Code" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === f.value 
                ? "bg-[#1A1A1A] text-white shadow-lg" 
                : "bg-white/60 text-gray-600 hover:bg-white border border-gray-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* History List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, index) => (
              <HistoryCard 
                key={item.id} 
                item={item} 
                index={index} 
                onDelete={handleDelete}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Clock size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">Aucun élément dans l'historique</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

