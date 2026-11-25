"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";

interface WatchlistButtonProps {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string;
  label: string;
}

export function WatchlistButton({
  id,
  mediaType,
  title,
  poster,
  label,
}: WatchlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWatchlist(mediaType, id));
  }, [mediaType, id]);

  function handleClick() {
    const next = toggleWatchlist({ id, mediaType, title, poster, label });
    setSaved(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
        saved
          ? "border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8]"
          : "border-[#222938] bg-[#12161f] text-[#f4f7fb] hover:bg-[#191f2b]"
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-[#38bdf8]" : ""}`} />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
