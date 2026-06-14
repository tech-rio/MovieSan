export interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  media_type?: "movie" | "tv" | "person";
  runtime?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  status?: string;
}

export interface TmdbPaged<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
}

export interface TmdbDetails extends TmdbMovie {
  credits?: TmdbCredits;
  videos?: { results: TmdbVideo[] };
  similar?: TmdbPaged<TmdbMovie>;
  recommendations?: TmdbPaged<TmdbMovie>;
}
