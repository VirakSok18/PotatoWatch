"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { TabBar } from "glisse";
import { useEffect, useState } from "react";
import { GlassSelect } from "@/components/GlassSelect";
import { EMBED_SERVERS } from "@/lib/servers";
import {
  getWatchedEpisodes,
  markEpisodeWatched,
  recordWatchHistory,
} from "@/lib/storage";
import type { EpisodeItem, SeasonSummary } from "@/lib/types";

interface WatchPlayerProps {
  mediaType: "movie" | "tv";
  id: number;
  imdbId?: string | null;
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  seasons?: SeasonSummary[];
  episodes?: EpisodeItem[];
  malId?: number | null;
  anilistId?: number | null;
}

export function WatchPlayer({
  mediaType,
  id,
  title,
  poster,
  season = 1,
  episode = 1,
  seasons = [],
  episodes = [],
  malId = null,
  anilistId = null,
}: WatchPlayerProps) {
  const router = useRouter();

  const serverList = anilistId
    ? [
        {
          id: "anime-sub",
          name: "Anime Sub",
          url: `https://vidnest.fun/anime/${anilistId}/${episode}/sub`,
        },
        {
          id: "anime-dub",
          name: "Anime Dub",
          url: `https://vidnest.fun/anime/${anilistId}/${episode}/dub`,
        },
      ]
    : EMBED_SERVERS.map((s) => ({
        id: s.id,
        name: s.name,
        url:
          mediaType === "movie"
            ? s.movieUrl(id)
            : s.tvUrl(id, season, episode),
      }));

  const serverTabs = serverList.map((s) => ({ value: s.id, label: s.name }));

  const [serverId, setServerId] = useState(serverList[0].id);
  const [forcePlay, setForcePlay] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [watchedEps, setWatchedEps] = useState<number[]>([]);

  useEffect(() => {
    if (malId) {
      setServerId("anime-sub");
      return;
    }
    try {
      const saved = window.localStorage.getItem("potatowatch_server_v2");
      if (saved && EMBED_SERVERS.some((s) => s.id === saved)) {
        setServerId(saved);
      }
    } catch {
      // ignore
    }
  }, [malId]);

  function selectServer(nextId: string) {
    setServerId(nextId);
    if (!malId) {
      try {
        window.localStorage.setItem("potatowatch_server_v2", nextId);
      } catch {
        // ignore
      }
    }
  }

  const activeServer =
    serverList.find((s) => s.id === serverId) || serverList[0];

  const embedUrl = activeServer.url;

  const currentIdx = episodes.findIndex((e) => e.episodeNumber === episode);
  const currentEp = currentIdx >= 0 ? episodes[currentIdx] : null;
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp =
    currentIdx >= 0 && currentIdx < episodes.length - 1
      ? episodes[currentIdx + 1]
      : null;

  const airTargetMs =
    mediaType === "tv" && currentEp?.airDate
      ? new Date(`${currentEp.airDate}T23:59:59`).getTime()
      : null;

  const isTba =
    !forcePlay &&
    mediaType === "tv" &&
    currentEp !== null &&
    !currentEp.airDate;

  const isUpcoming =
    !forcePlay &&
    (isTba || (airTargetMs !== null && nowMs !== null && airTargetMs > nowMs));

  useEffect(() => {
    setForcePlay(false);
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [id, season, episode]);

  const diffSec =
    isUpcoming && airTargetMs && nowMs
      ? Math.max(0, Math.floor((airTargetMs - nowMs) / 1000))
      : 0;
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;

  useEffect(() => {
    recordWatchHistory({
      id,
      mediaType,
      title,
      poster,
      season: mediaType === "tv" ? season : undefined,
      episode: mediaType === "tv" ? episode : undefined,
    });
    if (mediaType === "tv") {
      markEpisodeWatched(id, season, episode);
      setWatchedEps(getWatchedEpisodes(id, season));
    }
  }, [id, mediaType, title, poster, season, episode]);

  useEffect(() => {
    if (mediaType === "tv" && nextEp) {
      router.prefetch(`/watch/tv/${id}/${season}/${nextEp.episodeNumber}`);
    }
  }, [mediaType, id, season, nextEp, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#06080c] text-[#f4f7fb] sm:justify-center">
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6">
        {/* Centered theater header */}
        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center">
            <Link
              href={`/${mediaType}/${id}`}
              aria-label="Back to details"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9aa6bc] transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
              {title}
            </h1>
            <p className="text-xs text-[#8f9bb0]">
              {mediaType === "movie"
                ? "Movie"
                : `Season ${season} Episode ${episode}`}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            {mediaType === "tv" && (
              <>
                {prevEp && (
                  <Link
                    href={`/watch/tv/${id}/${season}/${prevEp.episodeNumber}`}
                    className="inline-flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-[#f4f7fb] transition-colors hover:bg-white/[0.1]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">E{prevEp.episodeNumber}</span>
                  </Link>
                )}
                {nextEp && (
                  <Link
                    href={`/watch/tv/${id}/${season}/${nextEp.episodeNumber}`}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-[#38bdf8] px-3 text-xs font-semibold text-[#07131a] transition-colors hover:bg-[#56ccf9] sm:px-3.5"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span>E{nextEp.episodeNumber}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Centered cinema player stage */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
          {isUpcoming ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#0a0e16] px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#38bdf8]">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-[#8f9bb0]">
                Season {season} Episode {episode} has not aired yet
              </p>
              {isTba ? (
                <p className="mt-3 text-base font-semibold text-[#38bdf8]">
                  Release date TBA
                </p>
              ) : (
                <div className="mt-4 flex items-center gap-3 sm:gap-5">
                  {[
                    { label: "Days", value: days },
                    { label: "Hours", value: hours },
                    { label: "Min", value: mins },
                    { label: "Sec", value: secs },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="flex min-w-[56px] flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:min-w-[68px]"
                    >
                      <span className="text-xl font-bold tabular-nums text-[#38bdf8] sm:text-2xl">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#8f9bb0]">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {currentEp?.airDate && (
                <p className="mt-4 text-xs text-[#6f7a8f]">
                  Scheduled air date: {currentEp.airDate}
                </p>
              )}
              <button
                type="button"
                onClick={() => setForcePlay(true)}
                className="mt-5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-medium text-[#c5d0e0] hover:bg-white/[0.1] hover:text-white"
              >
                Try player anyway
              </button>
            </div>
          ) : (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={title}
              allowFullScreen
              allow="autoplay; fullscreen *; picture-in-picture; encrypted-media"
              referrerPolicy="origin"
              className="h-full w-full border-0"
            />
          )}
        </div>

        {/* Dead-center Liquid Glass server bar */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="no-scrollbar flex max-w-full overflow-x-auto py-2">
            <TabBar
              items={serverTabs}
              value={serverId}
              onValueChange={(val) => selectServer(val)}
              aria-label="Video servers"
              className="max-sm:[&_button]:px-2 max-sm:[&_button]:text-xs"
            />
          </div>
          <p className="text-center text-xs text-[#6f7a8f]">
            If subtitles are off, switch to another server
          </p>
        </div>

        {/* Episode quick grid + season picker for TV / K-Drama / Anime */}
        {mediaType === "tv" && episodes.length > 0 && (
          <section className="mt-8 border-t border-white/[0.06] pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#f4f7fb]">
                Season {season} episodes
              </h2>
              {seasons.length > 1 && (
                <GlassSelect
                  options={seasons.map((s) => ({
                    value: String(s.seasonNumber),
                    label: s.name,
                    meta: `${s.episodeCount} ep`,
                  }))}
                  value={String(season)}
                  onChange={(val) =>
                    router.push(`/watch/tv/${id}/${Number(val)}/1`)
                  }
                  ariaLabel="Switch season"
                  align="right"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {episodes.map((ep) => {
                const isCurrent = ep.episodeNumber === episode;
                const isWatched = watchedEps.includes(ep.episodeNumber);
                return (
                  <Link
                    key={ep.episodeNumber}
                    href={`/watch/tv/${id}/${season}/${ep.episodeNumber}`}
                    className={`flex h-10 items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                      isCurrent
                        ? "border-[#38bdf8] bg-[#38bdf8] text-[#07131a]"
                        : isWatched
                        ? "border-[#38bdf8]/25 bg-[#38bdf8]/10 text-[#7dd3fc] hover:border-[#38bdf8]/50"
                        : "border-white/10 bg-white/[0.03] text-[#f4f7fb] hover:border-[#38bdf8]/50 hover:bg-white/[0.08]"
                    }`}
                  >
                    Ep {ep.episodeNumber}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
