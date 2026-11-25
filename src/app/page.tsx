import { CategoryTabs } from "@/components/CategoryTabs";
import { ContinueWatching } from "@/components/ContinueWatching";
import { DiscoverSection } from "@/components/DiscoverSection";
import { MediaCard } from "@/components/MediaCard";
import { Navbar } from "@/components/Navbar";
import { RecommendedForYou } from "@/components/RecommendedForYou";
import { getHomeSections } from "@/lib/tmdb";
import type { WatchCategory } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const raw = params.cat as WatchCategory | undefined;
  const category: WatchCategory =
    raw && ["all", "movie", "tv", "kdrama", "anime"].includes(raw)
      ? raw
      : "all";
  const genre = params.genre?.trim() || "";

  let sections: Awaited<ReturnType<typeof getHomeSections>> = [];
  let errorMessage = "";

  if (!genre) {
    try {
      sections = await getHomeSections(category);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : "Could not load catalog.";
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
        <CategoryTabs category={category} genre={genre} />

        {genre ? (
          <DiscoverSection category={category} genre={genre} />
        ) : (
          <>
            <ContinueWatching />
            {category === "all" && <RecommendedForYou />}

            {errorMessage ? (
              <div className="rounded-lg border border-[#3a2224] bg-[#1b1213] p-4 text-sm text-[#f2a6a6]">
                {errorMessage}
              </div>
            ) : (
              <>
                {sections.map((section) => (
                  <section key={section.title} className="mb-10">
                    <h2 className="mb-4 text-base font-semibold text-[#f4f7fb]">
                      {section.title}
                    </h2>
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {section.items.map((item) => (
                        <MediaCard
                          key={`${item.mediaType}-${item.id}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </section>
                ))}
                <DiscoverSection category={category} genre="" />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
