import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";

interface SearchItem {
  id: string;
  title: string;
  content: string;
  category: string;
  description: string;
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  category: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchIndex: SearchItem[];
}

export function SearchModal({ isOpen, onClose, searchIndex }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredResults = searchIndex
      .map((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = item.description.toLowerCase().includes(searchTerm);
        const contentMatch = item.content.toLowerCase().includes(searchTerm);

        if (titleMatch || descriptionMatch || contentMatch) {
          let snippet = "";
          if (contentMatch) {
            const index = item.content.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 40);
            const end = Math.min(item.content.length, index + searchTerm.length + 60);
            snippet = item.content.slice(start, end).replace(/\n/g, " ").trim();
            if (start > 0) snippet = "..." + snippet;
            if (end < item.content.length) snippet = snippet + "...";
          } else {
            snippet = item.description || item.content.slice(0, 100).replace(/\n/g, " ").trim() + "...";
          }

          return {
            id: item.id,
            title: item.title,
            snippet,
            category: item.category,
          };
        }
        return null;
      })
      .filter((r): r is SearchResult => r !== null);

    setResults(filteredResults);
  }, [query, searchIndex]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="relative flex items-center">
            <svg 
              className="absolute left-4 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章内容..."
              className="w-full pl-12 pr-4 py-4 bg-gray-100/50 dark:bg-white/5 border-none rounded-2xl text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 pb-6">
          {results.length > 0 ? (
            <div className="grid gap-2 px-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  to={`/articles/${result.id}`}
                  onClick={onClose}
                  className="group block p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {result.title}
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {result.snippet}
                  </p>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">未找到相关内容</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500 text-sm">输入关键词开始搜索...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/50 dark:bg-white/5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-sans">ESC</kbd> 退出
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-sans">↵</kbd> 选择
            </span>
          </div>
          <span>Butterfly Search</span>
        </div>
      </div>
    </div>
  );
}
