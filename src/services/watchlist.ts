import type { WatchlistItem } from "@/types/streaming";

/**
 * Watchlist service — local mock backed by localStorage.
 * Endpoints to replace:
 *   GET    /api/watchlist
 *   POST   /api/watchlist
 *   DELETE /api/watchlist/:id
 */
const KEY = "MovieSan:watchlist:v1";

function read(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  await new Promise((r) => setTimeout(r, 100));
  return read();
}

export async function addToWatchlist(input: Omit<WatchlistItem, "id" | "addedAt">): Promise<WatchlistItem> {
  const items = read();
  const existing = items.find((i) => i.tmdbId === input.tmdbId);
  if (existing) return existing;
  const item: WatchlistItem = {
    ...input,
    id: `wl_${input.tmdbId}`,
    addedAt: new Date().toISOString(),
  };
  write([item, ...items]);
  return item;
}

export async function removeFromWatchlist(id: string): Promise<void> {
  write(read().filter((i) => i.id !== id));
}

export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  return read().some((i) => i.tmdbId === tmdbId);
}
