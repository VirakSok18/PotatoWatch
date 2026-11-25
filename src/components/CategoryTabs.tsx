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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Desktop: glisse Liquid Glass TabBar */}
      <div className="hidden py-3 sm:block">
        <TabBar
          items={ITEMS}
          value={active}
          onValueChange={(v) => setActive(v as WatchCategory)}
          link={Link}
          aria-label="Filter by category"
        />
      </div>

      {/* Phone: compact 5-column fit-to-screen glass pill bar */}
      <div className="grid w-full grid-cols-5 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md sm:hidden">
        {ITEMS.map((item) => {
          const isCurrent = item.value === active;
          return (
            <Link
              key={item.value}
              href={item.href}
              prefetch={true}
              onClick={() => setActive(item.value as WatchCategory)}
              className={`flex h-8 items-center justify-center rounded-full px-1 text-[11px] font-medium transition-colors ${
                isCurrent
                  ? "bg-white/15 text-white"
                  : "text-[#9aa6bc] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
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
