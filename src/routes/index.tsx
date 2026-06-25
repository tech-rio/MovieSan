import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdb";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ContentRow } from "@/components/home/ContentRow";
import { MovieCard } from "@/components/cards/MovieCard";
import { ContinueWatchingCard } from "@/components/cards/ContinueWatchingCard";
import { HeroSkeleton, RowSkeleton } from "@/components/common/Skeletons";
import { getHistory } from "@/services/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MovieSan — Stream the universe" },
      { name: "description", content: "Trending movies, TV shows, anime and more in cinematic 4K." },
    ],
  }),
  component: Home,
});

function useTmdb(category: "trending" | "popular" | "top_rated" | "upcoming", mediaType: "movie" | "tv" = "movie") {
  return useQuery({
    queryKey: ["tmdb", category, mediaType],
    queryFn: () => tmdbApi.list({ data: { category, mediaType, page: 1 } }),
    staleTime: 5 * 60_000,
  });
}

function Home() {
  const trending = useTmdb("trending");
  const popular = useTmdb("popular");
  const topRated = useTmdb("top_rated");
  const upcoming = useTmdb("upcoming");
  const tvPopular = useTmdb("popular", "tv");
  const tvTopRated = useTmdb("top_rated", "tv");

  const history = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  return (
    <div className="pb-20">
      {trending.isLoading || !trending.data ? (
        <HeroSkeleton />
      ) : (
        <HeroCarousel items={trending.data.results} />
      )}

      {history.data && history.data.length > 0 && (
        <ContentRow title="Continue Watching">
          {history.data.map((h) => (
            <ContinueWatchingCard key={h.tmdbId} item={h} />
          ))}
        </ContentRow>
      )}

      <ContentRow title="Trending Now">
        {trending.isLoading ? <RowSkeleton /> :
          trending.data?.results.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </ContentRow>

      <ContentRow title="Popular Movies">
        {popular.isLoading ? <RowSkeleton /> :
          popular.data?.results.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </ContentRow>

      <ContentRow title="Top Rated">
        {topRated.isLoading ? <RowSkeleton /> :
          topRated.data?.results.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </ContentRow>

      <ContentRow title="Upcoming Releases">
        {upcoming.isLoading ? <RowSkeleton /> :
          upcoming.data?.results.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </ContentRow>

      <ContentRow title="Trending TV Shows">
        {tvPopular.isLoading ? <RowSkeleton /> :
          tvPopular.data?.results.map((m, i) => <MovieCard key={m.id} movie={{ ...m, media_type: "tv" }} index={i} />)}
      </ContentRow>

      <ContentRow title="Critically Acclaimed Series">
        {tvTopRated.isLoading ? <RowSkeleton /> :
          tvTopRated.data?.results.map((m, i) => <MovieCard key={m.id} movie={{ ...m, media_type: "tv" }} index={i} />)}
      </ContentRow>
    </div>
  );
}
