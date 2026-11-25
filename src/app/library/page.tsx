"use client";

import Link from "next/link";
import { ArrowLeft, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  getWatchHistory,
  getWatchlist,
  removeWatchHistory,
  type SavedMedia,
  type WatchHistoryEntry,
} from "@/lib/storage";

export default function LibraryPage() {
  const [saved, setSaved] = useState<SavedMedia[]>([]);
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);

  useEffect(() => {
    setSaved(getWatchlist());
    setHistory(getWatchHistory());
  }, []);

  function handleRemoveHistory(
    e: React.MouseEvent,
    mediaType: "movie" | "tv",
    id: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    setHistory(removeWatchHistory(mediaType, id));
  }

  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#8f9bb0] hover:text-[#f4f7fb]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to browse</span>
        </Link>

        <section className="mb-12">
          <h1 className="mb-4 text-lg font-semibold text-[#f4f7fb]">
            Saved titles
          </h1>
          {saved.length === 0 ? (
            <p className="text-sm text-[#8f9bb0]">
              You have not saved any titles yet. Open a movie or show and tap Save.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {saved.map((item) => (
                <Link
                  key={`${item.mediaType}-${item.id}`}
                  href={`/${item.mediaType}/${item.id}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-[#222938] bg-[#12161f]">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : null}
                    <span className="absolute left-2 top-2 rounded bg-[#080b10]/85 px-1.5 py-0.5 text-[10px] font-medium text-[#f4f7fb]">
                      {item.label}
                    </span>
                  </div>
                  <span className="line-clamp-2 text-sm font-medium text-[#f4f7fb] group-hover:text-[#38bdf8]">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#f4f7fb]">
            Watch history
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-[#8f9bb0]">Nothing watched yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {history.map((entry) => {
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
                    className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#12161f] transition-all duration-200 hover:border-[#38bdf8]/50"
                  >
                    {entry.poster && (
                      <img
                        src={entry.poster}
                        alt={entry.title}
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06080c] via-[#06080c]/45 to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-[#080b10]/80 px-2 py-0.5 text-[10px] font-semibold text-[#38bdf8] backdrop-blur-md">
                      {entry.mediaType === "movie"
                        ? "Movie"
                        : `S${entry.season || 1} E${entry.episode || 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleRemoveHistory(e, entry.mediaType, entry.id)
                      }
                      aria-label={`Remove ${entry.title}`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#080b10]/75 text-[#9aa6bc] opacity-80 backdrop-blur-md transition-opacity hover:bg-[#080b10] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8]/90 text-[#07131a] opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="truncate text-sm font-semibold text-white group-hover:text-[#38bdf8]">
                        {entry.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
