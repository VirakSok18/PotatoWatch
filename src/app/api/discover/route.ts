import { NextRequest, NextResponse } from "next/server";
import { discoverByCategory } from "@/lib/tmdb";
import type { WatchCategory } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const rawCat = sp.get("cat") as WatchCategory | null;
  const cat: WatchCategory =
    rawCat && ["all", "movie", "tv", "kdrama", "anime"].includes(rawCat)
      ? rawCat
      : "movie";
  const genre = sp.get("genre") || undefined;
  const page = Math.max(1, Number(sp.get("page")) || 1);

  try {
    const data = await discoverByCategory(cat, genre, page);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch {
    return NextResponse.json({ items: [], hasMore: false });
  }
}
