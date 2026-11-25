"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";

export function MediaCard({ item }: { item: MediaItem }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [item.poster]);

  return (
    <Link
      href={`/${item.mediaType}/${item.id}`}
      prefetch={true}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-[#222938] bg-[#12161f]">
        {!loaded && (
          <div className="absolute inset-0 skeleton" aria-hidden="true" />
        )}

        {item.poster ? (
          <img
            ref={imgRef}
            src={item.poster}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6f7a8f]">
            No poster
          </div>
        )}

        <span className="absolute left-2 top-2 rounded bg-[#080b10]/85 px-1.5 py-0.5 text-[10px] font-medium text-[#f4f7fb] backdrop-blur-sm">
          {item.label}
        </span>

        {item.rating && (
          <span className="absolute right-2 top-2 rounded bg-[#080b10]/85 px-1.5 py-0.5 text-[10px] font-medium text-[#38bdf8] backdrop-blur-sm">
            {item.rating}
          </span>
        )}

        {item.year && (
          <span className="absolute bottom-2 right-2 rounded bg-[#080b10]/85 px-1.5 py-0.5 text-[10px] font-medium text-[#c5d0e0] backdrop-blur-sm">
            {item.year}
          </span>
        )}
      </div>

      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#f4f7fb] group-hover:text-[#38bdf8]">
        {item.title}
      </h3>
    </Link>
  );
}
