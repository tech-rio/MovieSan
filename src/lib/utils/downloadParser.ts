import type { DownloadLink } from "@/types/streaming";

export interface ParsedDownload extends DownloadLink {
  seasonNumber: number | null;
  isBatch: boolean;
  baseQuality: string;
  tags: string[];
  cleanProvider: string;
}

export function parseDownloadLink(link: DownloadLink): ParsedDownload {
  const raw = String(link.quality || "").trim();

  // 1. Extract Season
  const seasonMatch = raw.match(/Season\s*(\d+)/i);
  const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : null;

  // 2. Extract Base Quality
  let baseQuality = "Unknown";
  if (/2160p|4k/i.test(raw)) baseQuality = "2160p (4K)";
  else if (/1080p/i.test(raw)) baseQuality = "1080p";
  else if (/720p/i.test(raw)) baseQuality = "720p";
  else if (/480p/i.test(raw)) baseQuality = "480p";

  // 3. Extract Tags
  const tags: string[] = [];
  if (/WEB-?DL/i.test(raw)) tags.push("WEB-DL");
  if (/WEB-?Rip/i.test(raw)) tags.push("WEBRip");
  if (/Blu-?Ray/i.test(raw)) tags.push("BluRay");
  if (/x264|h264/i.test(raw)) tags.push("x264");
  if (/x265|h265|HEVC/i.test(raw)) tags.push("x265");
  if (/10-?bit/i.test(raw)) tags.push("10bit");
  if (/Atmos/i.test(raw)) tags.push("Atmos");
  if (/DD5\.1/i.test(raw)) tags.push("DD5.1");
  if (/DDP5\.1/i.test(raw)) tags.push("DDP5.1");
  if (/Dual Audio/i.test(raw)) tags.push("Dual Audio");

  // 4. Extract Clean Provider & Batch Type
  let cleanProvider = "Download";
  let isBatch = /batch|zip|complete/i.test(raw);

  const providerMatch = raw.match(/\[(.*)\]$/);
  if (providerMatch) {
    // Remove nested brackets (e.g. [Instant]) and emojis
    cleanProvider = providerMatch[1].replace(/\[.*?\]/g, "").replace(/[\u26A1\uD83D\uDC49\u2705\u2B50]/g, "").trim();
    if (/batch|zip/i.test(providerMatch[1])) {
      cleanProvider = "Batch / Zip";
      isBatch = true;
    }
  }

  // Cleanup edge cases
  if (!cleanProvider || cleanProvider.toLowerCase().includes("download now")) {
    cleanProvider = "Direct Link";
  }

  if (raw.toLowerCase().includes("episode links")) {
    isBatch = false;
  }

  return {
    ...link,
    seasonNumber,
    isBatch,
    baseQuality,
    tags,
    cleanProvider,
  };
}
