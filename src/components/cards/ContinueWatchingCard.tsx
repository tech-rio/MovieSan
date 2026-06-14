import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { WatchProgress } from "@/types/streaming";
import { backdropUrl, posterUrl } from "@/services/tmdb";

export function ContinueWatchingCard({ item }: { item: WatchProgress }) {
  const img = backdropUrl(item.backdropPath, "w780") ?? posterUrl(item.posterPath, "w500");
  const remaining = Math.max(0, item.durationSeconds - item.watchedSeconds);
  const mins = Math.floor(remaining / 60);
  return (
    <Link
      to="/watch/$id"
      params={{ id: String(item.tmdbId) }}
      className="group relative shrink-0 w-[300px] aspect-video rounded-xl overflow-hidden shadow-card"
    >
      {img ? (
        <img src={img} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full bg-surface" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="font-medium text-sm truncate">{item.title}</div>
        <div className="text-xs text-muted-foreground">{mins}m left</div>
        <div className="mt-2 h-1 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-primary"
            style={{ width: `${item.progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="absolute top-1/2 right-3 -translate-y-1/2 size-10 rounded-full bg-black/60 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition">
        <Play className="size-4 fill-white text-white" />
      </div>
    </Link>
  );
}
