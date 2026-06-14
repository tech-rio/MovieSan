import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { getWatchlist, removeFromWatchlist } from "@/services/watchlist";
import { posterUrl } from "@/services/tmdb";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "My Watchlist — MoviesAlert" }] }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["watchlist"], queryFn: getWatchlist });
  const remove = useMutation({
    mutationFn: (id: string) => removeFromWatchlist(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["watchlist"] });
      const prev = qc.getQueryData<typeof data>(["watchlist"]);
      qc.setQueryData(["watchlist"], (prev ?? []).filter((i) => i.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(["watchlist"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  return (
    <div className="pt-28 pb-20 mx-auto max-w-[1400px] px-6 lg:px-10">
      <h1 className="text-3xl md:text-5xl font-bold text-gradient">My Watchlist</h1>
      <p className="mt-2 text-muted-foreground">Everything you've saved, ready to play.</p>

      <div className="mt-10">
        {isLoading && <div className="text-muted-foreground">Loading…</div>}
        {data && data.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-lg font-medium">Your list is empty</div>
            <p className="mt-1 text-muted-foreground">Browse the catalog and tap “My List” on any title.</p>
            <Link to="/" className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-gradient-primary text-primary-foreground font-medium">
              Browse home
            </Link>
          </div>
        )}
        {data && data.length > 0 && (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {data.map((item) => (
              <div key={item.id} className="group relative">
                <Link to="/movie/$id" params={{ id: String(item.tmdbId) }} className="block">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-card">
                    {item.posterPath && (
                      <img src={posterUrl(item.posterPath, "w500") ?? ""} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    )}
                  </div>
                  <div className="mt-2 font-medium truncate">{item.title}</div>
                </Link>
                <button
                  onClick={() => remove.mutate(item.id)}
                  className="absolute top-2 right-2 size-9 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 transition hover:bg-destructive/30"
                  title="Remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
