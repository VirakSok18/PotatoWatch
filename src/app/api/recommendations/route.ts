import { NextRequest, NextResponse } from "next/server";
import { getMediaDetail } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  const seedsParam = request.nextUrl.searchParams.get("seeds") || "";
  const rawSeeds = seedsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (rawSeeds.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const parsedSeeds = rawSeeds
    .map((s) => {
      const [type, idStr] = s.split(":");
      const id = Number(idStr);
      if ((type === "movie" || type === "tv") && !Number.isNaN(id)) {
        return { type: type as "movie" | "tv", id };
      }
      return null;
    })
    .filter((x): x is { type: "movie" | "tv"; id: number } => x !== null);

  if (parsedSeeds.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const watchedKeys = new Set(parsedSeeds.map((s) => `${s.type}:${s.id}`));
  const seen = new Set<string>();
  const combined: MediaItem[] = [];

  const results = await Promise.allSettled(
    parsedSeeds.map((s) => getMediaDetail(s.type, s.id))
  );

  for (const res of results) {
    if (res.status !== "fulfilled") continue;
    for (const rec of res.value.recommendations) {
      const key = `${rec.mediaType}:${rec.id}`;
      if (watchedKeys.has(key) || seen.has(key)) continue;
      seen.add(key);
      combined.push(rec);
    }
  }

  return NextResponse.json(
    { items: combined.slice(0, 12) },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
