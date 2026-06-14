import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { tmdbApi } from "@/services/tmdb";
import { MovieCard } from "@/components/cards/MovieCard";

const search = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Search — MoviesAlert" }] }),
  component: SearchPage,
});

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [input, setInput] = useState(q ?? "");
  const debounced = useDebounced(input, 350);

  useEffect(() => {
    navigate({ search: { q: debounced || undefined }, replace: true });
  }, [debounced, navigate]);

  const results = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => tmdbApi.search({ data: { query: debounced, page: 1 } }),
    enabled: debounced.trim().length > 1,
    staleTime: 60_000,
  });

  const items = useMemo(() => results.data?.results.filter((r) => r.media_type !== "person") ?? [], [results.data]);

  return (
    <div className="pt-28 pb-20 mx-auto max-w-[1400px] px-6 lg:px-10">
      <h1 className="text-3xl md:text-5xl font-bold text-gradient">Search the universe</h1>
      <p className="mt-2 text-muted-foreground">Movies, series, anime — anything with a title.</p>

      <div className="mt-8 glass rounded-2xl p-2 flex items-center gap-3">
        <SearchIcon className="size-5 ml-3 text-muted-foreground" />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try ‘Interstellar’, ‘Severance’, ‘Spirited Away’…"
          className="flex-1 bg-transparent py-3 outline-none text-base"
        />
      </div>

      <div className="mt-10">
        {debounced.length <= 1 && (
          <div className="text-muted-foreground text-sm">Start typing to discover titles.</div>
        )}
        {results.isLoading && <div className="text-muted-foreground text-sm">Searching…</div>}
        {items.length > 0 && (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((m, i) => (
              <MovieCard key={`${m.media_type}-${m.id}`} movie={m} index={i} />
            ))}
          </div>
        )}
        {debounced.length > 1 && !results.isLoading && items.length === 0 && (
          <div className="text-muted-foreground">No results for “{debounced}”.</div>
        )}
      </div>
    </div>
  );
}
