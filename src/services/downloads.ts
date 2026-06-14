import type { DownloadLink } from "@/types/streaming";

/**
 * Replace with: GET /api/downloads/:tmdbId
 */
export async function getDownloads(tmdbId: number): Promise<DownloadLink[]> {
  await new Promise((r) => setTimeout(r, 350));
  const base = `https://cdn.moviesalert.example/dl/${tmdbId}`;
  return [
    { id: "480p-mirror", quality: "480p", size: "480 MB", provider: "Mirror",    url: `${base}/480p.mp4` },
    { id: "720p-mirror", quality: "720p", size: "1.1 GB", provider: "Mirror",    url: `${base}/720p.mp4` },
    { id: "1080p-mirror", quality: "1080p", size: "2.4 GB", provider: "Mirror",  url: `${base}/1080p.mp4` },
    { id: "1080p-aurora", quality: "1080p", size: "2.6 GB", provider: "Aurora",  url: `${base}/aurora-1080p.mp4` },
    { id: "2160p-aurora", quality: "2160p", size: "8.1 GB", provider: "Aurora",  url: `${base}/2160p.mkv` },
    { id: "2160p-hdr-helix", quality: "2160p HDR", size: "12.3 GB", provider: "Helix", url: `${base}/2160p-hdr.mkv`, hdr: true },
    { id: "2160p-dv-helix", quality: "2160p Dolby Vision", size: "14.7 GB", provider: "Helix", url: `${base}/2160p-dv.mkv`, hdr: true },
  ];
}
