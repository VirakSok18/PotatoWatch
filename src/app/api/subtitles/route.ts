import { NextRequest, NextResponse } from "next/server";

const ANIME_VTT_STYLE = `WEBVTT

STYLE
::cue {
  font-family: "Trebuchet MS", "Open Sans", sans-serif;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
  text-shadow:
    -2px -2px 0 #000000,
     2px -2px 0 #000000,
    -2px  2px 0 #000000,
     2px  2px 0 #000000,
     0px  2px 4px rgba(0, 0, 0, 0.9);
}

`;

function srtToStyledVtt(srt: string): string {
  const normalized = srt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const body = normalized
    .replace(/^WEBVTT\s*/i, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `${ANIME_VTT_STYLE}${body}\n`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const imdbId = sp.get("imdbId")?.trim();
  const type = sp.get("type") === "tv" ? "series" : "movie";
  const season = sp.get("season");
  const episode = sp.get("episode");

  if (!imdbId) {
    return new NextResponse("Missing imdbId", { status: 400 });
  }

  const subId =
    type === "series" && season && episode
      ? `${imdbId}:${season}:${episode}`
      : imdbId;

  try {
    const listRes = await fetch(
      `https://opensubtitles-v3.strem.io/subtitles/${type}/${encodeURIComponent(
        subId
      )}.json`,
      { next: { revalidate: 3600 } }
    );
    if (!listRes.ok) {
      return new NextResponse("No subtitles found", { status: 404 });
    }

    const data = (await listRes.json()) as {
      subtitles?: { lang?: string; url?: string }[];
    };

    const enSub = (data.subtitles || []).find(
      (s) => s.lang === "eng" && s.url
    );
    if (!enSub?.url) {
      return new NextResponse("No English subtitle found", { status: 404 });
    }

    const srtRes = await fetch(enSub.url, { next: { revalidate: 3600 } });
    if (!srtRes.ok) {
      return new NextResponse("Failed to download subtitle", { status: 502 });
    }

    const srtText = await srtRes.text();
    const vtt = srtToStyledVtt(srtText);

    return new NextResponse(vtt, {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse("Subtitle fetch error", { status: 502 });
  }
}
