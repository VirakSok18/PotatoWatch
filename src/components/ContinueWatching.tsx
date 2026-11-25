"use client";

import Link from "next/link";
import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getWatchHistory,
  removeWatchHistory,
  type WatchHistoryEntry,
} from "@/lib/storage";

export function ContinueWatching() {
  const [items, setItems] = useState<WatchHistoryEntry[]>([]);

  useEffect(() => {
    setItems(getWatchHistory().slice(0, 8));
  }, []);

  if (items.length === 0) return null;

  function handleRemove(
    e: React.MouseEvent,
    mediaType: "movie" | "tv",
    id: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    setItems(removeWatchHistory(mediaType, id).slice(0, 8));
  }

  return (
    <section className="mb-10">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#f4f7fb]">
          Continue watching
        </h2>
        <Link
          href="/library"
          className="text-xs font-medium text-[#8f9bb0] hover:text-[#38bdf8]"
        >
          View all
        </Link>
      </div>

      <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-1">
        {items.map((entry) => {
          const href =
            entry.mediaType === "movie"
              ? `/watch/movie/${entry.id}`
              : `/watch/tv/${entry.id}/${entry.season || 1}/${
                  entry.episode || 1
                }`;

          return (
            <Link
              key={`${entry.mediaType}-${entry.id}`}
              href={href}
              className="group relative aspect-video w-60 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#12161f] transition-all duration-200 hover:border-[#38bdf8]/50 sm:w-64"
            >
              {entry.poster && (
                <img
                  src={entry.poster}
                  alt={entry.title}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
                />
              )}

              {/* Smooth bottom dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080c] via-[#06080c]/45 to-transparent" />

              {/* Top-left episode/movie pill */}
              <span className="absolute left-2.5 top-2.5 rounded-md bg-[#080b10]/80 px-2 py-0.5 text-[10px] font-semibold text-[#38bdf8] backdrop-blur-md">
                {entry.mediaType === "movie"
                  ? "Movie"
                  : `S${entry.season || 1} E${entry.episode || 1}`}
              </span>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => handleRemove(e, entry.mediaType, entry.id)}
                aria-label={`Remove ${entry.title}`}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#080b10]/75 text-[#9aa6bc] opacity-80 backdrop-blur-md transition-opacity hover:bg-[#080b10] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Center subtle play pill on hover */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8]/90 text-[#07131a] opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </div>
              </div>

              {/* Bottom title */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="truncate text-sm font-semibold text-white group-hover:text-[#38bdf8]">
                  {entry.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
