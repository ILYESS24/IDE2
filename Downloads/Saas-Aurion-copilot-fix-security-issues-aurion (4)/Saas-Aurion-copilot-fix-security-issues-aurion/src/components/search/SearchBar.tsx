/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearch, SearchResult } from '@/hooks/use-search';
import { SearchResults } from './SearchResults';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: 'desktop' | 'mobile';
}

export function SearchBar({
  className,
  placeholder = "Search tools, projects, features...",
  variant = 'desktop'
}: SearchBarProps) {
  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults: _hasResults,
    selectedIndex,
    clearSearch,
    executeSearch,
    selectNext,
    selectPrevious,
    resetSelection: _resetSelection
  } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas interférer avec d'autres inputs
      if (!isOpen && !inputRef.current?.matches(':focus')) return;

      switch (e.key) {
        case 'Escape':
          clearSearch();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        case '/':
          if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
        case 'Enter':
          if (results.length > 0 && isOpen) {
            e.preventDefault();
            executeSearch();
          }
          break;
        case 'ArrowDown':
          if (isOpen && results.length > 0) {
            e.preventDefault();
            selectNext();
          }
          break;
        case 'ArrowUp':
          if (isOpen && results.length > 0) {
            e.preventDefault();
            selectPrevious();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, isOpen, clearSearch, executeSearch, selectNext, selectPrevious]);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSelect = (result: SearchResult) => {
    executeSearch(result);
    setIsOpen(false);
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative group">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
            variant === 'desktop'
              ? "text-gray-400 group-focus-within:text-black"
              : "text-gray-400",
            "w-4 h-4"
          )}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "w-full bg-white border border-gray-200/50 rounded-full text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all",
            variant === 'desktop'
              ? "py-2.5 pl-12 pr-10"
              : "py-3 pl-12 pr-10"
          )}
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Indicateur de raccourci */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-medium opacity-0 group-focus-within:opacity-100 transition-opacity">
          /
        </div>
      </div>

      {/* Résultats de recherche */}
      {isOpen && (
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={query}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
