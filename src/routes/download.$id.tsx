import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download as DownloadIcon, HardDrive, AlertCircle } from "lucide-react";
import { tmdbApi } from "@/services/tmdb";
import { getDownloads } from "@/services/downloads";
import type { DownloadLink } from "@/types/streaming";
import { parseDownloadLink, type ParsedDownload } from "@/lib/utils/downloadParser";

import { z } from "zod";

const search = z.object({
  media: z.enum(["movie", "tv"]).default("movie"),
});

export const Route = createFileRoute("/download/$id")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Download — MovieSan" }] }),
  component: DownloadPage,
});

function DownloadPage() {
  const { id } = Route.useParams();
  const { media } = Route.useSearch();
  const tmdbId = Number(id);
  const details = useQuery({
    queryKey: ["details", tmdbId, media],
    queryFn: () => tmdbApi.details({ data: { id: tmdbId, mediaType: media } }),
  });

  // Extract title + year from TMDB details (already loaded)
  const movieTitle = details.data?.title || details.data?.name || "";
  const releaseYear = (
    details.data?.release_date || details.data?.first_air_date || ""
  ).slice(0, 4);

  const downloads = useQuery({
    queryKey: ["downloads", tmdbId, movieTitle, releaseYear, media],
    queryFn: () => getDownloads(tmdbId, media, movieTitle, releaseYear),
    // Only fetch when we have the title (avoids hitting TMDB on the backend)
    enabled: !!movieTitle,
  });

  const parsedLinks = (downloads.data ?? []).map(parseDownloadLink);
  const hasLinks = parsedLinks.length > 0;

  // Quality sort weights
  const qualityWeight: Record<string, number> = {
    "2160p (4K)": 4,
    "1080p": 3,
    "720p": 2,
    "480p": 1,
    "Unknown": 0
  };

  const sortSections = (sections: Record<string, ParsedDownload[]>) => {
    return Object.entries(sections)
      .map(([quality, items]) => ({ quality, items }))
      .sort((a, b) => (qualityWeight[b.quality] ?? 0) - (qualityWeight[a.quality] ?? 0));
  };

  const renderSections = (sections: { quality: string; items: ParsedDownload[] }[], title?: string) => {
    if (sections.length === 0) return null;
    return (
      <div className="space-y-4">
        {title && (
          <h3 className="text-xl font-medium text-foreground mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            {title}
          </h3>
        )}
        {sections.map((sec) => (
          <section key={sec.quality} className="glass rounded-2xl p-5 border border-white/5 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{sec.quality}</h4>
              <span className="text-xs text-muted-foreground">{sec.items.length} link{sec.items.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sec.items.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2 p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <HardDrive className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{d.cleanProvider}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{d.size || "— SDR"}</div>
                    </div>
                    <DownloadIcon className="size-4 text-muted-foreground group-hover:text-primary-glow transition shrink-0" />
                  </div>
                  {d.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {d.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  let content = null;
  if (hasLinks) {
    if (media === "movie") {
      const sections: Record<string, ParsedDownload[]> = {};
      parsedLinks.forEach(d => {
        (sections[d.baseQuality] ??= []).push(d);
      });
      content = renderSections(sortSections(sections));
    } else {
      const seasons: Record<string, { batch: Record<string, ParsedDownload[]>, single: Record<string, ParsedDownload[]> }> = {};
      
      parsedLinks.forEach(d => {
        const key = d.seasonNumber ? `Season ${d.seasonNumber}` : "Other Links";
        seasons[key] ??= { batch: {}, single: {} };
        if (d.isBatch) {
          (seasons[key].batch[d.baseQuality] ??= []).push(d);
        } else {
          (seasons[key].single[d.baseQuality] ??= []).push(d);
        }
      });

      const sortedSeasonKeys = Object.keys(seasons).sort((a, b) => {
        if (a === "Other Links") return 1;
        if (b === "Other Links") return -1;
        const numA = parseInt(a.replace("Season ", "")) || 0;
        const numB = parseInt(b.replace("Season ", "")) || 0;
        return numA - numB;
      });

      content = (
        <div className="space-y-12">
          {sortedSeasonKeys.map(seasonKey => {
             const seasonData = seasons[seasonKey];
             const batchSections = sortSections(seasonData.batch);
             const singleSections = sortSections(seasonData.single);
             
             return (
               <div key={seasonKey} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gradient inline-block border-b-2 border-primary pb-1">{seasonKey}</h2>
                  {batchSections.length > 0 && (
                    <div className="pl-2 lg:pl-6 border-l border-white/10 space-y-4">
                      {renderSections(batchSections, "Batch / Zip")}
                    </div>
                  )}
                  {singleSections.length > 0 && (
                    <div className="pl-2 lg:pl-6 border-l border-white/10 space-y-4">
                      {renderSections(singleSections, "Single Episodes")}
                    </div>
                  )}
               </div>
             );
          })}
        </div>
      );
    }
  }

  return (
    <div className="pt-24 pb-20 mx-auto max-w-[1100px] px-6 lg:px-10">
      <Link 
        to="/movie/$id" params={{ id }} search={{ media }} 
        onClick={(e) => { e.preventDefault(); window.history.back(); }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="size-4" /> Back to details
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-gradient">
        Download {movieTitle}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        {hasLinks
          ? "Select a quality tier and provider below. File sizes are approximate."
          : downloads.isLoading
            ? "Searching for download sources…"
            : ""}
      </p>

      <div className="mt-8 space-y-6">
        {downloads.isLoading && (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Resolving download sources…
            </div>
          </div>
        )}

        {!downloads.isLoading && !hasLinks && (
          <div className="glass rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="size-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              No download links found for <strong>{movieTitle}</strong>.
            </p>
            <p className="text-xs text-muted-foreground/70">
              This movie may not have been scraped yet. Links are updated automatically every 24 hours.
            </p>
          </div>
        )}

        {content}
      </div>
    </div>
  );
}
