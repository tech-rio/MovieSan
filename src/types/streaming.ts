export interface StreamingSource {
  id: string;
  name: string;
  embedUrl: string;
  language?: string;
  quality?: string;
}

export interface DownloadLink {
  id: string;
  quality: string;
  size: string;
  provider: string;
  url: string;
  hdr?: boolean;
}

export interface WatchProgress {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  watchedSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  addedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
