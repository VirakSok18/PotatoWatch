import { NextRequest, NextResponse } from "next/server";
import { searchMedia } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchMedia(q);
    return NextResponse.json(
      { items: items.slice(0, 6) },
      {
        headers: {
          "Cache-Control": "public, max-age=120, s-maxage=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
