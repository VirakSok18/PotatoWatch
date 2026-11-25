"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

interface CustomHlsPlayerProps {
  streamUrl: string;
  subtitles?: { url: string; lang: string }[];
}

export function CustomHlsPlayer({
  streamUrl,
  subtitles = [],
}: CustomHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS on iOS Safari
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl]);

  const englishSub = subtitles.find((s) =>
    s.lang.toLowerCase().includes("english")
  );

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      crossOrigin="anonymous"
      className="potato-video h-full w-full bg-black"
    >
      {englishSub && (
        <track
          kind="subtitles"
          src={englishSub.url}
          srcLang="en"
          label="English"
          default
        />
      )}
    </video>
  );
}
