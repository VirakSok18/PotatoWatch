"use client";

import Link from "next/link";
import { ArrowDownUp, Check, Loader2, Play, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassSelect } from "@/components/GlassSelect";
import { getWatchedEpisodes } from "@/lib/storage";
import type { EpisodeItem, SeasonSummary } from "@/lib/types";

interface EpisodeBrowserProps {
  tvId: number;
  seasons: SeasonSummary[];
  initialSeason: number;
  initialEpisodes: EpisodeItem[];
}

export function EpisodeBrowser({
  tvId,
  seasons,
  initialSeason,
  initialEpisodes,
}: EpisodeBrowserProps) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(initialEpisodes);
  const [allEpisodes, setAllEpisodes] = useState<EpisodeItem[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [watchedEps, setWatchedEps] = useState<number[]>([]);

  useEffect(() => {
    setWatchedEps(getWatchedEpisodes(tvId, selectedSeason));
  }, [tvId, selectedSeason]);

  // Lazily load all seasons once when the user types in Jump to episode
  useEffect(() => {
    if (!filter.trim() || seasons.length <= 1 || allEpisodes !== null) return;
    let cancelled = false;
    setLoadingAll(true);
    fetch(`/api/tv/${tvId}/episodes`)
      .then((r) => (r.ok ? r.json() : { episodes: [] }))
      .then((data: { episodes?: EpisodeItem[] }) => {
        if (!cancelled) {
          setAllEpisodes(data.episodes || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAll(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, seasons.length, allEpisodes, tvId]);

  async function handleSeasonChange(seasonNum: number) {
    setSelectedSeason(seasonNum);
    setFilter("");
    setLoading(true);
    try {
      const res = await fetch(`/api/tv/${tvId}/season/${seasonNum}`);
      if (res.ok) {
        const data = (await res.json()) as { episodes?: EpisodeItem[] };
        setEpisodes(data.episodes || []);
      }
    } finally {
      setLoading(false);
    }
  }

  const visibleEpisodes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) {
      return order === "asc" ? episodes : [...episodes].reverse();
    }

    const pool = allEpisodes && allEpisodes.length > 0 ? allEpisodes : episodes;
    const matched = pool.filter(
      (ep) =>
        String(ep.episodeNumber).includes(q) ||
        ep.name.toLowerCase().includes(q)
    );

    return matched.sort((a, b) => {
      const aNum = String(a.episodeNumber);
      const bNum = String(b.episodeNumber);

      const aRank = aNum === q ? 0 : aNum.startsWith(q) ? 1 : 2;
      const bRank = bNum === q ? 0 : bNum.startsWith(q) ? 1 : 2;
      if (aRank !== bRank) return aRank - bRank;

      if (a.episodeNumber !== b.episodeNumber) {
        return a.episodeNumber - b.episodeNumber;
      }
      return a.seasonNumber - b.seasonNumber;
    });
  }, [episodes, allEpisodes, order, filter]);

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[#f4f7fb]">
          Episodes ({episodes.length})
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-44 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f9bb0]" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Jump to episode"
              aria-label="Filter episodes"
              className="h-9 w-full rounded-lg border border-[#222938] bg-[#12161f] pl-8 pr-3 text-xs text-[#f4f7fb] placeholder:text-[#6f7a8f] focus:border-[#38bdf8] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#222938] bg-[#12161f] px-3 text-xs font-medium text-[#f4f7fb] hover:bg-[#191f2b]"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>{order === "asc" ? "Oldest" : "Newest"}</span>
          </button>

          {seasons.length > 1 && (
            <GlassSelect
              options={seasons.map((s) => ({
                value: String(s.seasonNumber),
                label: s.name,
                meta: `${s.episodeCount} ep`,
              }))}
              value={String(selectedSeason)}
              onChange={(val) => handleSeasonChange(Number(val))}
              ariaLabel="Select season"
              align="right"
            />
          )}
        </div>
      </div>

      {loading || (loadingAll && filter.trim().length > 0) ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#8f9bb0]">
          <Loader2 className="h-4 w-4 animate-spin text-[#38bdf8]" />
          <span>
            {loadingAll ? "Searching all seasons" : "Loading episodes"}
          </span>
        </div>
      ) : visibleEpisodes.length === 0 ? (
        <p className="text-sm text-[#8f9bb0]">No matching episodes found</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEpisodes.map((ep) => {
            const isWatched =
              ep.seasonNumber === selectedSeason &&
              watchedEps.includes(ep.episodeNumber);
            return (
              <Link
                key={`${ep.seasonNumber}-${ep.episodeNumber}`}
                href={`/watch/tv/${tvId}/${ep.seasonNumber}/${ep.episodeNumber}`}
                className={`group flex gap-3 overflow-hidden rounded-xl border p-2.5 transition-colors hover:border-[#38bdf8]/50 hover:bg-[#171d29] ${
                  isWatched
                    ? "border-[#38bdf8]/20 bg-[#12161f]/60 opacity-80 hover:opacity-100"
                    : "border-[#1f2634] bg-[#12161f]"
                }`}
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-[#080b10]">
                  {ep.still ? (
                    <img
                      src={ep.still}
                      alt={ep.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Play className="h-5 w-5 text-[#38bdf8]" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 rounded bg-[#080b10]/85 px-1.5 py-0.5 text-[10px] font-medium text-[#38bdf8]">
                    {filter.trim()
                      ? `S${ep.seasonNumber} E${ep.episodeNumber}`
                      : `E${ep.episodeNumber}`}
                  </span>
                  {isWatched && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#38bdf8] text-[#07131a]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-[#f4f7fb] group-hover:text-[#38bdf8]">
                    {ep.name}
                  </p>
                  {ep.overview && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8f9bb0]">
                      {ep.overview}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
