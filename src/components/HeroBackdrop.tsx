"use client";

import { useState } from "react";

interface HeroBackdropProps {
  backdrop?: string;
  trailerKey?: string | null;
}

export function HeroBackdrop({ backdrop, trailerKey }: HeroBackdropProps) {
  const [videoReady, setVideoReady] = useState(false);

  if (!backdrop && !trailerKey) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] overflow-hidden bg-[#080b10] sm:h-[580px]">
      {/* Static backdrop fades out completely once the trailer is playing */}
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-0" : "opacity-35"
          }`}
        />
      )}

      {/* Edge-to-edge 16:9 cover YouTube trailer (starts at 6s, fades in after controls hide) */}
      {trailerKey && (
        <div
          className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ${
            videoReady ? "opacity-50" : "opacity-0"
          }`}
        >
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&start=6&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`}
            title="Background trailer"
            allow="autoplay; encrypted-media"
            onLoad={() => setVideoReady(true)}
            className="absolute left-1/2 top-1/2 aspect-video min-h-full w-[max(100vw,178vh)] -translate-x-1/2 -translate-y-1/2 border-0"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-[#080b10]/65 to-[#080b10]/20" />
    </div>
  );
}
