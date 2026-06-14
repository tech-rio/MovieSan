import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import type { TmdbMovie } from "@/types/tmdb";
import { posterUrl } from "@/services/tmdb";

interface Props {
  movie: TmdbMovie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: Props) {
  const title = movie.title || movie.name || "";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const poster = posterUrl(movie.poster_path, "w500");
  const mediaType = movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      className="group relative shrink-0 w-[180px] md:w-[200px]"
    >
      <Link
        to="/movie/$id"
        params={{ id: String(movie.id) }}
        search={{ media: mediaType }}
        className="block"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-card">
          {poster ? (
            <img
              src={poster}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-black/60 backdrop-blur-sm border border-white/10">
            {(movie.vote_average ?? 0) >= 7.5 ? "HD+" : "HD"}
          </div>
          <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
            <div className="size-12 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
              <Play className="size-5 fill-primary-foreground text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="mt-3 px-1">
          <div className="font-medium text-sm truncate">{title}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{year || "—"}</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              {movie.vote_average?.toFixed(1) ?? "—"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
