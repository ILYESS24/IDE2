/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Code2,
  Bot,
  Smartphone,
  FileText,
  LayoutDashboard,
  Box,
  MessageSquare,
  Crown,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchResult } from '@/hooks/use-search';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  query: string;
  selectedIndex?: number;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

// Icônes par type
const typeIcons = {
  tool: Sparkles,
  section: LayoutDashboard,
  feature: Settings,
  plan: Crown
};

// Icônes spécifiques pour les éléments
const specificIcons = {
  image_generation: ImageIcon,
  video_generation: Video,
  code_generation: Code2,
  ai_chat: MessageSquare,
  agent_builder: Bot,
  app_builder: Smartphone,
  website_builder: Box,
  text_editor: FileText,
  dashboard_home: LayoutDashboard,
  dashboard_projects: Box,
  dashboard_ai: Bot,
  dashboard_apps: Smartphone,
  dashboard_images: ImageIcon,
  dashboard_video: Video
};

export function SearchResults({ results, isSearching, query, selectedIndex = -1, onSelect, onClose: _onClose }: SearchResultsProps) {
  if (!query.trim()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      >
        {isSearching ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">
              <Sparkles size={24} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-500">
              No results for "{query}"
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try other terms like "image", "video", "code"...
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, index) => {
              const Icon = specificIcons[result.id as keyof typeof specificIcons] ||
                          typeIcons[result.type] ||
                          Sparkles;

              return (
                <motion.button
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(result)}
                  className={cn(
                    "w-full px-4 py-3 transition-colors flex items-center gap-3 text-left border-b border-gray-50 last:border-b-0 group",
                    index === selectedIndex
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <Icon size={16} className="text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {result.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          result.type === 'tool' && "bg-blue-100 text-blue-700",
                          result.type === 'section' && "bg-green-100 text-green-700",
                          result.type === 'feature' && "bg-purple-100 text-purple-700",
                          result.type === 'plan' && "bg-amber-100 text-amber-700"
                        )}>
                          {result.category}
                        </span>
                        <ArrowRight size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {result.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {results.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Press Enter to select • Esc to close
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
