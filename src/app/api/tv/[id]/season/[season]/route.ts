import { NextResponse } from "next/server";
import { getSeasonEpisodes } from "@/lib/tmdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  const { id, season } = await params;
  const tvId = Number(id);
  const seasonNum = Number(season);
  if (Number.isNaN(tvId) || Number.isNaN(seasonNum)) {
    return NextResponse.json({ episodes: [] }, { status: 400 });
  }

  try {
    const episodes = await getSeasonEpisodes(tvId, seasonNum);
    return NextResponse.json(
      { episodes },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
    );
  } catch {
    return NextResponse.json({ episodes: [] });
  }
}
