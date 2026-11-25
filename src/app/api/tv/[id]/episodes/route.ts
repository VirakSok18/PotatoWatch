import { NextResponse } from "next/server";
import { getMediaDetail, getSeasonEpisodes } from "@/lib/tmdb";
import type { EpisodeItem } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tvId = Number(id);
  if (Number.isNaN(tvId)) {
    return NextResponse.json({ episodes: [] }, { status: 400 });
  }

  try {
    const show = await getMediaDetail("tv", tvId);
    const results = await Promise.allSettled(
      show.seasons.map((s) => getSeasonEpisodes(tvId, s.seasonNumber))
    );

    const all: EpisodeItem[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        all.push(...r.value);
      }
    }

    return NextResponse.json(
      { episodes: all },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch {
    return NextResponse.json({ episodes: [] });
  }
}
