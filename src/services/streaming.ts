import type { StreamingSource } from "@/types/streaming";

/**
 * Streaming source provider.
 * Replace `getSources` with a real fetch to your backend:
 *   GET /api/player/:tmdbId  ->  StreamingSource[]
 * UI is fully decoupled from the source list.
 */
export async function getSources(tmdbId: number): Promise<StreamingSource[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [
    { id: "alpha-1080", name: "Alpha", embedUrl: `about:blank#alpha/${tmdbId}`, language: "EN", quality: "1080p" },
    { id: "alpha-4k", name: "Alpha", embedUrl: `about:blank#alpha-4k/${tmdbId}`, language: "EN", quality: "4K" },
    { id: "nova-1080", name: "Nova", embedUrl: `about:blank#nova/${tmdbId}`, language: "EN", quality: "1080p" },
    { id: "orion-720", name: "Orion", embedUrl: `about:blank#orion/${tmdbId}`, language: "EN", quality: "720p" },
    { id: "lumen-1080-jp", name: "Lumen", embedUrl: `about:blank#lumen/${tmdbId}`, language: "JP", quality: "1080p" },
  ];
}
