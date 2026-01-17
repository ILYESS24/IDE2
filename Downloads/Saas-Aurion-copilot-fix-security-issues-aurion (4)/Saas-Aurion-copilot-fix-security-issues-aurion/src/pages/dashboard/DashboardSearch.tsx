/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const recentSearches = [
  "Comment créer une application mobile",
  "Meilleures pratiques React",
  "Intégration API REST",
  "Design système moderne"
];

const trendingTopics = [
  { title: "Intelligence Artificielle", count: "2.4k recherches" },
  { title: "Développement Web", count: "1.8k recherches" },
  { title: "Machine Learning", count: "1.2k recherches" },
  { title: "UI/UX Design", count: "980 recherches" },
  { title: "Cloud Computing", count: "750 recherches" },
  { title: "Cybersécurité", count: "620 recherches" },
];

export default function DashboardSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [recentList, setRecentList] = useState(recentSearches);

  const removeRecent = (index: number) => {
    setRecentList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    // Add to recent searches
    setRecentList(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    setSearchValue("");
    // Here you would trigger actual search
  };

  return (
    <div className="flex-1 flex flex-col h-full px-10 py-8">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Rechercher</h1>
        <p className="text-gray-500">Trouvez des conversations, des fichiers et plus encore.</p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-10"
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchValue)}
          placeholder="Rechercher..."
          className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl py-4 pl-14 pr-6 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all shadow-lg"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Recent Searches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-lg font-medium text-gray-800">Recherches récentes</h2>
          </div>
          
          <AnimatePresence>
            {recentList.length > 0 ? (
              <ul className="space-y-3">
                {recentList.map((search, index) => (
                  <motion.li
                    key={search}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors"
                    onClick={() => setSearchValue(search)}
                  >
                    <div className="flex items-center gap-3">
                      <Search size={16} className="text-gray-300" />
                      <span className="text-gray-600 text-sm">{search}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeRecent(index); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={14} className="text-gray-400" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Aucune recherche récente</p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-orange-500" />
            <h2 className="text-lg font-medium text-gray-800">Tendances</h2>
          </div>
          
          <ul className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <motion.li
                key={topic.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors group"
                onClick={() => setSearchValue(topic.title)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 text-sm font-medium group-hover:text-orange-600 transition-colors">{topic.title}</span>
                </div>
                <span className="text-gray-400 text-xs">{topic.count}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

