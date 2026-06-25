import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { tmdbApi } from "@/services/tmdb";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { posterUrl } from "@/services/tmdb";

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export function GlobalSearch() {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const debounced = useDebounced(input, 350);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close when navigating
  useEffect(() => {
    setExpanded(false);
    setInput("");
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => tmdbApi.search({ data: { query: debounced, page: 1 } }),
    enabled: debounced.trim().length > 1,
    staleTime: 60_000,
  });

  const items = useMemo(() => results.data?.results.filter((r) => r.media_type !== "person") ?? [], [results.data]);

  return (
    <div ref={containerRef} className="relative z-50">
      <motion.div
        animate={{ width: expanded ? (window.innerWidth < 1024 ? 280 : 400) : 48 }}
        className={`glass flex items-center gap-2 rounded-full overflow-hidden transition-colors ${expanded ? "bg-secondary/50 border-white/20" : "hover:bg-secondary/40"}`}
      >
        <button 
          onClick={() => {
            setExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="size-12 flex-shrink-0 grid place-items-center text-muted-foreground hover:text-foreground transition outline-none"
        >
          <Search className="size-5" />
        </button>
        
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Movies, shows..."
          className={`flex-1 bg-transparent py-2 outline-none text-sm placeholder:text-muted-foreground ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />
        
        {expanded && (
          <div className="flex items-center gap-2 pr-3 flex-shrink-0">
            {results.isFetching ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : input.length > 0 ? (
              <button onClick={() => setInput("")} className="text-muted-foreground hover:text-foreground p-1">
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">⌘K</kbd>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {expanded && input.trim().length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[120%] right-0 w-[90vw] max-w-[400px] lg:max-w-[500px] search-glass rounded-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            <div className="p-3 border-b border-white/10 bg-background/50 backdrop-blur-xl">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Results for "{debounced}"
              </h3>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar">
              {results.isLoading && (
                <div className="py-12 flex justify-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!results.isLoading && items.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              )}

              {!results.isLoading && items.length > 0 && (
                <div className="flex flex-col p-2">
                  {items.map((item) => {
                    const title = item.title || item.name || "";
                    const year = (item.release_date || item.first_air_date || "").slice(0, 4);
                    const poster = posterUrl(item.poster_path, "w185");
                    const mediaType = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
                    
                    return (
                      <Link
                        key={`${mediaType}-${item.id}`}
                        to={`/movie/$id`}
                        params={{ id: item.id.toString() }}
                        search={{ media: mediaType }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        {poster ? (
                          <img src={poster} alt={title} className="w-12 h-16 object-cover rounded-md bg-secondary" />
                        ) : (
                          <div className="w-12 h-16 rounded-md bg-secondary flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No img</span>
                          </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{title}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                            {year}
                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded-sm bg-white/10">{mediaType}</span>
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
