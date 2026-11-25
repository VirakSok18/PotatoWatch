import { NextRequest, NextResponse } from "next/server";
import { ANIME, MOVIES } from "@consumet/extensions";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const title = sp.get("title")?.trim() || "";
  const type = sp.get("type") === "tv" ? "tv" : "movie";
  const isAnime = sp.get("anime") === "1";
  const season = Number(sp.get("season")) || 1;
  const episode = Number(sp.get("episode")) || 1;

  if (!title) {
    return NextResponse.json({ available: false, error: "Missing title" });
  }

  try {
    if (isAnime) {
      const provider = new ANIME.Hianime();
      const search = await provider.search(title);
      const match = search.results?.[0];
      if (!match?.id) {
        return NextResponse.json({ available: false, error: "Anime not found" });
      }

      const info = await provider.fetchAnimeInfo(match.id);
      const ep =
        info.episodes?.find((e) => e.number === episode) || info.episodes?.[0];
      if (!ep?.id) {
        return NextResponse.json({ available: false, error: "Episode not found" });
      }

      const watch = await provider.fetchEpisodeSources(ep.id);
      const source =
        watch.sources?.find((s) => s.isM3U8) || watch.sources?.[0];
      if (!source?.url) {
        return NextResponse.json({ available: false, error: "No stream URL" });
      }

      return NextResponse.json({
        available: true,
        streamUrl: source.url,
        subtitles: (watch.subtitles || []).map((s) => ({
          url: s.url,
          lang: s.lang || "English",
        })),
      });
    }

    const provider = new MOVIES.FlixHQ();
    const search = await provider.search(title);
    const match =
      search.results?.find((r) =>
        type === "movie"
          ? String(r.type || "").toLowerCase().includes("movie")
          : String(r.type || "").toLowerCase().includes("tv")
      ) || search.results?.[0];

    if (!match?.id) {
      return NextResponse.json({ available: false, error: "Title not found" });
    }

    const info = await provider.fetchMediaInfo(match.id);
    const ep =
      type === "movie"
        ? info.episodes?.[0]
        : info.episodes?.find(
            (e) => e.season === season && e.number === episode
          ) || info.episodes?.[0];

    if (!ep?.id) {
      return NextResponse.json({ available: false, error: "Episode not found" });
    }

    const watch = await provider.fetchEpisodeSources(ep.id, match.id);
    const source =
      watch.sources?.find((s) => s.isM3U8) || watch.sources?.[0];
    if (!source?.url) {
      return NextResponse.json({ available: false, error: "No stream URL" });
    }

    return NextResponse.json({
      available: true,
      streamUrl: source.url,
      subtitles: (watch.subtitles || []).map((s) => ({
        url: s.url,
        lang: s.lang || "English",
      })),
    });
  } catch {
    return NextResponse.json({ available: false, error: "Stream lookup failed" });
  }
}
