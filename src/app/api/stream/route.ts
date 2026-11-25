import { NextRequest, NextResponse } from "next/server";

function getConsumetBase(): string | null {
  const raw = process.env.CONSUMET_API_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : null;
}

export async function GET(request: NextRequest) {
  const base = getConsumetBase();
  if (!base) {
    return NextResponse.json(
      { available: false, error: "CONSUMET_API_URL not configured" },
      { status: 200 }
    );
  }

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
      // Search HiAnime / Zoro via Consumet
      const searchRes = await fetch(
        `${base}/anime/hianime/${encodeURIComponent(title)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!searchRes.ok) {
        return NextResponse.json({ available: false, error: "Anime search failed" });
      }
      const searchData = (await searchRes.json()) as {
        results?: { id: string; title: string }[];
      };
      const match = searchData.results?.[0];
      if (!match) {
        return NextResponse.json({ available: false, error: "Anime not found" });
      }

      const infoRes = await fetch(
        `${base}/anime/hianime/info?id=${encodeURIComponent(match.id)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!infoRes.ok) {
        return NextResponse.json({ available: false, error: "Anime info failed" });
      }
      const info = (await infoRes.json()) as {
        episodes?: { id: string; number: number }[];
      };
      const ep =
        info.episodes?.find((e) => e.number === episode) || info.episodes?.[0];
      if (!ep) {
        return NextResponse.json({ available: false, error: "Episode not found" });
      }

      const watchRes = await fetch(
        `${base}/anime/hianime/watch/${encodeURIComponent(ep.id)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!watchRes.ok) {
        return NextResponse.json({ available: false, error: "Stream fetch failed" });
      }
      const watchData = (await watchRes.json()) as {
        sources?: { url: string; quality?: string; isM3U8?: boolean }[];
        subtitles?: { url: string; lang: string }[];
      };
      const source =
        watchData.sources?.find((s) => s.isM3U8) || watchData.sources?.[0];
      if (!source?.url) {
        return NextResponse.json({ available: false, error: "No stream URL" });
      }

      return NextResponse.json({
        available: true,
        streamUrl: source.url,
        subtitles: watchData.subtitles || [],
      });
    }

    // Movies & TV via FlixHQ on Consumet
    const searchRes = await fetch(
      `${base}/movies/flixhq/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!searchRes.ok) {
      return NextResponse.json({ available: false, error: "Media search failed" });
    }
    const searchData = (await searchRes.json()) as {
      results?: { id: string; type?: string }[];
    };
    const match =
      searchData.results?.find((r) =>
        type === "movie"
          ? r.type?.toLowerCase().includes("movie")
          : r.type?.toLowerCase().includes("tv")
      ) || searchData.results?.[0];

    if (!match) {
      return NextResponse.json({ available: false, error: "Title not found" });
    }

    const infoRes = await fetch(
      `${base}/movies/flixhq/info?id=${encodeURIComponent(match.id)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!infoRes.ok) {
      return NextResponse.json({ available: false, error: "Media info failed" });
    }
    const info = (await infoRes.json()) as {
      episodes?: { id: string; number?: number; season?: number }[];
    };

    const ep =
      type === "movie"
        ? info.episodes?.[0]
        : info.episodes?.find(
            (e) => e.season === season && e.number === episode
          ) || info.episodes?.[0];

    if (!ep) {
      return NextResponse.json({ available: false, error: "Episode not found" });
    }

    const watchRes = await fetch(
      `${base}/movies/flixhq/watch?episodeId=${encodeURIComponent(
        ep.id
      )}&mediaId=${encodeURIComponent(match.id)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!watchRes.ok) {
      return NextResponse.json({ available: false, error: "Stream fetch failed" });
    }
    const watchData = (await watchRes.json()) as {
      sources?: { url: string; quality?: string; isM3U8?: boolean }[];
      subtitles?: { url: string; lang: string }[];
    };
    const source =
      watchData.sources?.find((s) => s.isM3U8) || watchData.sources?.[0];
    if (!source?.url) {
      return NextResponse.json({ available: false, error: "No stream URL" });
    }

    return NextResponse.json({
      available: true,
      streamUrl: source.url,
      subtitles: watchData.subtitles || [],
    });
  } catch {
    return NextResponse.json({ available: false, error: "Stream lookup failed" });
  }
}
