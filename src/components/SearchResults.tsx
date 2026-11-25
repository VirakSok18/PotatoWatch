"use client";

import { useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import type { MediaItem } from "@/lib/types";

type TypeFilter = "all" | "movie" | "tv";

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

export function SearchResults({
  query,
  items,
}: {
  query: string;
  items: MediaItem[];
}) {
  const [filter, setFilter] = useState<TypeFilter>("all");

  const filtered =
    filter === "all"
      ? items
      : items.filter((item) => item.mediaType === filter);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#f4f7fb]">
          Results for &quot;{query}&quot;
        </h1>

        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {FILTERS.map((f) => {
            const active = f.value === filter;
            const count =
              f.value === "all"
                ? items.length
                : items.filter((i) => i.mediaType === f.value).length;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#38bdf8] text-[#07131a]"
                    : "text-[#9aa6bc] hover:text-white"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[#8f9bb0]">
          No {filter === "movie" ? "movies" : "series"} matched &quot;{query}
          &quot;
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
