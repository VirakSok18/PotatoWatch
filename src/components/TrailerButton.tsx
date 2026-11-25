"use client";

import { Film, X } from "lucide-react";
import { useState } from "react";

export function TrailerButton({
  trailerKey,
  title,
}: {
  trailerKey: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/15 bg-white/[0.06] px-4 text-sm font-medium text-[#f4f7fb] backdrop-blur-md transition-colors hover:bg-white/[0.12]"
      >
        <Film className="h-4 w-4 text-[#38bdf8]" />
        <span>Trailer</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#0c0f16] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="truncate text-sm font-medium text-[#f4f7fb]">
                {title} — Official trailer
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close trailer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8f9bb0] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&playsinline=1&rel=0`}
                title={`${title} trailer`}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
