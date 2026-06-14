import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, Download, Play, Plus, Share2, Star, Trophy } from "lucide-react";
import { z } from "zod";
import { tmdbApi, backdropUrl, posterUrl } from "@/services/tmdb";
import { ContentRow } from "@/components/home/ContentRow";
import { MovieCard } from "@/components/cards/MovieCard";
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from "@/services/watchlist";
import { toast } from "sonner";

const search = z.object({
  media: z.enum(["movie", "tv"]).default("movie"),
});

export const Route = createFileRoute("/movie/$id")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "Details — MoviesAlert" }],
  }),
  component: MovieDetails,
});

function MovieDetails() {
  const { id } = Route.useParams();
  const { media } = Route.useSearch();
  const qc = useQueryClient();

  const tmdbId = Number(id);
  const { data, isLoading } = useQuery({
    queryKey: ["details", tmdbId, media],
    queryFn: () => tmdbApi.details({ data: { id: tmdbId, mediaType: media } }),
    enabled: !!tmdbId,
  });

  const watchlist = useQuery({
    queryKey: ["watchlist", "has", tmdbId],
    queryFn: () => isInWatchlist(tmdbId),
  });

  const toggleWatchlist = useMutation({
    mutationFn: async () => {
      if (!data) return;
      if (watchlist.data) {
        await removeFromWatchlist(`wl_${tmdbId}`);
        toast("Removed from watchlist");
      } else {
        await addToWatchlist({
          tmdbId,
          title: data.title || data.name || "",
          posterPath: data.poster_path,
        });
        toast.success("Added to watchlist");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  if (isLoading || !data) {
    return <div className="pt-24 px-10 text-muted-foreground">Loading details…</div>;
  }

  const title = data.title || data.name || "";
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : "";
  const trailer = data.videos?.results.find((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const director = data.credits?.crew.find((c) => c.job === "Director");
  const languages = data.spoken_languages?.map(l => l.english_name).slice(0, 1).join(", ") || "—";

  return (
    <div className="pb-20">
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {data.backdrop_path && (
          <img src={backdropUrl(data.backdrop_path, "original") ?? ""} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="relative h-full mx-auto max-w-[1600px] px-6 lg:px-10 pt-24 pb-12 flex flex-col md:flex-row gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="shrink-0"
          >
            <div className="relative w-[180px] md:w-[240px] aspect-[2/3] rounded-2xl overflow-hidden shadow-card border border-border">
              {data.poster_path && (
                <img src={posterUrl(data.poster_path, "w500") ?? ""} alt={title} className="w-full h-full object-cover" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <div className="text-sm font-medium text-primary-glow mb-2 uppercase tracking-wider">{media === "tv" ? "TV Series" : "Movie"}</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
            {data.tagline && <p className="mt-2 italic text-muted-foreground">{data.tagline}</p>}

            <p className="mt-5 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">{data.overview}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {trailer && (
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary/50 bg-primary/10 text-primary-glow font-medium hover:bg-primary/20 transition"
                >
                  ▶ Watch Trailer
                </button>
              )}
              <Link
                to="/watch/$id"
                params={{ id }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-105 transition-transform"
              >
                <Play className="size-4 fill-current" /> Watch Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-10 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <InfoGrid label="IMDb Rating" value={`${data.vote_average?.toFixed(1)}/10`} icon={<Star className="size-4 fill-yellow-400 text-yellow-400" />} />
          <InfoGrid label="Release" value={year || "—"} icon={<Calendar className="size-4" />} />
          <InfoGrid label="Runtime" value={runtime || "—"} icon={<Clock className="size-4" />} />
          <InfoGrid label="Quality" value="4K UHD" icon={<span className="text-xs font-bold">4K</span>} />
          <InfoGrid label="Genre" value={data.genres?.length ? data.genres[0].name : "—"} icon={<Trophy className="size-4" />} />
          <InfoGrid label="Language" value={languages} icon={<span className="text-xs">🌐</span>} />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-10 mt-10 space-y-8">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => toggleWatchlist.mutate()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg glass-strong font-medium hover:bg-secondary transition"
          >
            <Plus className="size-4" /> {watchlist.data ? "In My List" : "My List"}
          </button>
          <Link
            to="/download/$id"
            params={{ id }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg glass-strong font-medium hover:bg-secondary transition"
          >
            <Download className="size-4" /> Download
          </Link>
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("Link copied"); }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg glass-strong font-medium hover:bg-secondary transition"
          >
            <Share2 className="size-4" /> Share
          </button>
        </div>

        {trailer && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Trailer</h2>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Stat label="Director" value={director?.name ?? "—"} />
            <Stat label="Status" value={data.status ?? "—"} />
          </div>
        </div>
      </section>

      {data.credits && data.credits.cast.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 mt-10">
          <h2 className="text-xl font-semibold mb-6">Cast</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.credits.cast.slice(0, 12).map((c) => (
              <div key={c.id} className="text-center">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-surface shadow-md border border-border mx-auto">
                  {c.profile_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${c.profile_path}`}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-3 text-sm font-medium truncate">{c.name}</div>
                <div className="text-xs text-primary-glow truncate">{c.character}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.similar && data.similar.results.length > 0 && (
        <ContentRow title="More Like This">
          {data.similar.results.slice(0, 18).map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </ContentRow>
      )}

      {data.recommendations && data.recommendations.results.length > 0 && (
        <ContentRow title="Recommended For You">
          {data.recommendations.results.slice(0, 18).map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </ContentRow>
      )}
    </div>
  );
}

function InfoGrid({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center gap-2 text-center">
      {icon && <div className="text-primary-glow text-lg">{icon}</div>}
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3">
      {icon && <div className="text-primary-glow mt-0.5">{icon}</div>}
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
