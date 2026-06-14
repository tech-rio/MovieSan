import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TmdbDetails, TmdbMovie, TmdbPaged } from "@/types/tmdb";

const listInput = z.object({
  category: z.enum(["trending", "popular", "top_rated", "upcoming", "now_playing"]),
  mediaType: z.enum(["movie", "tv"]).default("movie"),
  page: z.number().int().min(1).max(500).default(1),
});

export const tmdbList = createServerFn({ method: "GET" })
  .inputValidator(listInput)
  .handler(async ({ data }) => {
    const { tmdbFetch } = await import("./tmdb.server");
    let path: string;
    if (data.category === "trending") {
      path = `/trending/${data.mediaType}/week`;
    } else {
      path = `/${data.mediaType}/${data.category}`;
    }
    return tmdbFetch<TmdbPaged<TmdbMovie>>(path, { page: data.page });
  });

export const tmdbDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    id: z.number().int(),
    mediaType: z.enum(["movie", "tv"]).default("movie"),
  }))
  .handler(async ({ data }) => {
    const { tmdbFetch } = await import("./tmdb.server");
    return tmdbFetch<TmdbDetails>(`/${data.mediaType}/${data.id}`, {
      append_to_response: "credits,videos,similar,recommendations",
    });
  });

export const tmdbSearch = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    query: z.string().min(1),
    page: z.number().int().min(1).default(1),
  }))
  .handler(async ({ data }) => {
    const { tmdbFetch } = await import("./tmdb.server");
    return tmdbFetch<TmdbPaged<TmdbMovie>>("/search/multi", {
      query: data.query,
      page: data.page,
      include_adult: "false",
    });
  });

export const tmdbDiscover = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    mediaType: z.enum(["movie", "tv"]).default("movie"),
    genre: z.number().int().optional(),
    year: z.number().int().optional(),
    minRating: z.number().optional(),
    page: z.number().int().min(1).default(1),
  }))
  .handler(async ({ data }) => {
    const { tmdbFetch } = await import("./tmdb.server");
    return tmdbFetch<TmdbPaged<TmdbMovie>>(`/discover/${data.mediaType}`, {
      with_genres: data.genre,
      primary_release_year: data.mediaType === "movie" ? data.year : undefined,
      first_air_date_year: data.mediaType === "tv" ? data.year : undefined,
      "vote_average.gte": data.minRating,
      page: data.page,
      sort_by: "popularity.desc",
    });
  });
