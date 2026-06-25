import type { WatchProgress } from "@/types/streaming";

/**
 * Watch history / resume system. Local mock with the exact shape a backend
 * would return. Replace with:
 *   GET    /api/history
 *   POST   /api/history/update
 *   DELETE /api/history/:id
 */
const KEY = "MovieSan:history:v1";

function read(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(items: WatchProgress[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getHistory(): Promise<WatchProgress[]> {
  await new Promise((r) => setTimeout(r, 80));
  return read().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export async function getProgress(tmdbId: number): Promise<WatchProgress | null> {
  return read().find((h) => h.tmdbId === tmdbId) ?? null;
}

export async function updateProgress(input: Omit<WatchProgress, "progressPercentage" | "updatedAt">): Promise<WatchProgress> {
  const items = read().filter((h) => h.tmdbId !== input.tmdbId);
  const entry: WatchProgress = {
    ...input,
    progressPercentage: input.durationSeconds > 0
      ? Math.min(100, (input.watchedSeconds / input.durationSeconds) * 100)
      : 0,
    updatedAt: new Date().toISOString(),
  };
  write([entry, ...items].slice(0, 50));
  return entry;
}

export async function removeFromHistory(tmdbId: number): Promise<void> {
  write(read().filter((h) => h.tmdbId !== tmdbId));
}
