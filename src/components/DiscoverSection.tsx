"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import type { MediaItem, WatchCategory } from "@/lib/types";

export function DiscoverSection({
  category,
  genre,
}: {
  category: WatchCategory;
  genre: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);

    const params = new URLSearchParams({
      cat: category === "all" ? "movie" : category,
      page: "1",
    });
    if (genre) params.set("genre", genre);

    fetch(`/api/discover?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { items: [], hasMore: false }))
      .then((data: { items?: MediaItem[]; hasMore?: boolean }) => {
        if (cancelled) return;
        setItems(data.items || []);
        setPage(1);
        setHasMore(Boolean(data.hasMore));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, genre]);

  async function loadMore() {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        cat: category === "all" ? "movie" : category,
        page: String(nextPage),
      });
      if (genre) params.set("genre", genre);

      const res = await fetch(`/api/discover?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as {
          items?: MediaItem[];
          hasMore?: boolean;
        };
        setItems((prev) => {
          const seen = new Set(prev.map((x) => `${x.mediaType}-${x.id}`));
          const added = (data.items || []).filter(
            (x) => !seen.has(`${x.mediaType}-${x.id}`)
          );
          return [...prev, ...added];
        });
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={genre ? "mt-2" : "mt-10"}>
      <h2 className="mb-4 text-base font-semibold text-[#f4f7fb]">
        {genre ? "Filtered results" : "Explore more"}
      </h2>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[2/3] w-full rounded-lg skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#8f9bb0]">No titles found for this filter</p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={loadMore}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#222938] bg-[#12161f] px-6 text-sm font-medium text-[#f4f7fb] transition-colors hover:border-[#38bdf8]/50 hover:bg-[#191f2b] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[#38bdf8]" />}
            <span>{loading ? "Loading" : "Load more"}</span>
          </button>
        </div>
      )}
    </section>
  );
}
