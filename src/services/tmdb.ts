import { tmdbDetails, tmdbDiscover, tmdbList, tmdbSearch } from "@/lib/tmdb.functions";

export const TMDB_IMG = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function backdropUrl(path: string | null | undefined, size: "w780" | "w1280" | "original" = "original") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export const tmdbApi = {
  list: tmdbList,
  details: tmdbDetails,
  search: tmdbSearch,
  discover: tmdbDiscover,
};
