/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, Suspense, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Loader2,
  X,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";

// Hook mock pour le mode démo
const useUserMock = () => ({
  user: {
    id: 'demo-user-123',
    fullName: 'Utilisateur Démo',
    firstName: 'Utilisateur',
    lastName: 'Démo',
    imageUrl: 'https://via.placeholder.com/40x40?text=Demo',
    primaryEmailAddress: {
      emailAddress: 'demo@example.com'
    }
  },
  isSignedIn: true,
  isLoaded: true
});

// Détecter si Clerk est disponible
const CLERK_AVAILABLE = !!(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
  !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
  !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('demo'));

// Version unifiée qui gère les deux cas
export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Données utilisateur mock (toujours utilisées pour éviter les erreurs)
  const user = {
    id: 'demo-user-123',
    fullName: 'Utilisateur Démo',
    firstName: 'Utilisateur',
    lastName: 'Démo',
    imageUrl: 'https://via.placeholder.com/40x40?text=Demo',
    primaryEmailAddress: {
      emailAddress: 'demo@example.com'
    }
  };
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#F8F9FB] font-body flex flex-col overflow-hidden relative">
      
      {/* ==================== HEADER ==================== */}
      <header className="h-[60px] md:h-[80px] px-4 md:px-8 flex items-center justify-between flex-shrink-0 bg-[#F8F9FB] z-20">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-lg md:text-2xl font-bold font-display text-gray-900 tracking-tight hidden sm:block cursor-pointer"
          >
            AURION
          </button>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar
            variant="desktop"
            placeholder="Rechercher outils, projets, fonctionnalités..."
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Icon (Mobile) */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white border border-gray-200/50 flex items-center justify-center text-gray-500 shadow-sm"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer">
            {user?.firstName?.[0] || "U"}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[60px] left-0 right-0 bg-white p-4 shadow-lg z-30 md:hidden"
          >
            <SearchBar
              variant="mobile"
              placeholder="Rechercher outils, projets..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-28 md:pb-32 no-scrollbar">
        <div className="max-w-[1600px] mx-auto h-full">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </main>


    </div>
  );
}
