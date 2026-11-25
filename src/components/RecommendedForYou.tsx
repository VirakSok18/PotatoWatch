"use client";

import { useEffect, useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import { getWatchHistory, getWatchlist } from "@/lib/storage";
import type { MediaItem } from "@/lib/types";

export function RecommendedForYou() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const history = getWatchHistory();
    const saved = getWatchlist();

    const seedKeys: string[] = [];
    const seen = new Set<string>();

    for (const h of history) {
      const key = `${h.mediaType}:${h.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        seedKeys.push(key);
      }
      if (seedKeys.length >= 3) break;
    }

    if (seedKeys.length < 3) {
      for (const s of saved) {
        const key = `${s.mediaType}:${s.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          seedKeys.push(key);
        }
        if (seedKeys.length >= 3) break;
      }
    }

    if (seedKeys.length === 0) return;

    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/recommendations?seeds=${encodeURIComponent(seedKeys.join(","))}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: MediaItem[] }) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {
        // Ignore aborted or failed requests
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-base font-semibold text-[#f4f7fb]">
        Recommended for you
      </h2>
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[2/3] w-full rounded-lg skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
