"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, SlidersHorizontal } from "lucide-react";
import { TabBar } from "glisse";
import { useEffect, useState } from "react";
import { GlassSelect } from "@/components/GlassSelect";
import type { WatchCategory } from "@/lib/types";

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

const ITEMS = [
  { value: "all", label: "All", href: "/" },
  { value: "movie", label: "Movies", href: "/?cat=movie" },
  { value: "tv", label: "TV", href: "/?cat=tv" },
  { value: "kdrama", label: "K-Drama", href: "/?cat=kdrama" },
  { value: "anime", label: "Anime", href: "/?cat=anime" },
];

const MOVIE_GENRES = [
  { value: "", label: "All genres" },
  { value: "28", label: "Action" },
  { value: "35", label: "Comedy" },
  { value: "18", label: "Drama" },
  { value: "10749", label: "Romance" },
  { value: "27", label: "Horror" },
  { value: "878", label: "Sci-Fi" },
  { value: "53", label: "Thriller" },
  { value: "14", label: "Fantasy" },
];

const TV_GENRES = [
  { value: "", label: "All genres" },
  { value: "10759", label: "Action & Adventure" },
  { value: "35", label: "Comedy" },
  { value: "18", label: "Drama" },
  { value: "9648", label: "Mystery" },
  { value: "10765", label: "Sci-Fi & Fantasy" },
  { value: "80", label: "Crime" },
];

export function CategoryTabs({
  category,
  genre = "",
}: {
  category: WatchCategory;
  genre?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<WatchCategory>(category);

  useEffect(() => {
    setActive(category);
  }, [category]);

  const genreOptions =
    category === "movie" || category === "all" ? MOVIE_GENRES : TV_GENRES;

  function handleGenreChange(nextGenre: string) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("cat", category);
    if (nextGenre) params.set("genre", nextGenre);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function handleTypeChange(nextType: string) {
    const params = new URLSearchParams();
    if (nextType !== "all") params.set("cat", nextType);
    if (genre) params.set("genre", genre);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  const typeValue =
    category === "movie" ? "movie" : category === "tv" ? "tv" : "all";

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="no-scrollbar flex max-w-full overflow-x-auto py-3">
        <TabBar
          items={ITEMS}
          value={active}
          onValueChange={(v) => setActive(v as WatchCategory)}
          link={Link}
          aria-label="Filter by category"
          className="max-sm:[&_a]:px-2.5 max-sm:[&_a]:text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <GlassSelect
          options={TYPE_OPTIONS}
          value={typeValue}
          onChange={handleTypeChange}
          ariaLabel="Filter by Movies or Series"
          align="left"
          icon={<Film className="h-3.5 w-3.5 text-[#38bdf8]" />}
        />
        <GlassSelect
          options={genreOptions}
          value={genre}
          onChange={handleGenreChange}
          ariaLabel="Filter by genre"
          align="right"
          icon={<SlidersHorizontal className="h-3.5 w-3.5 text-[#38bdf8]" />}
        />
      </div>
    </div>
  );
}
