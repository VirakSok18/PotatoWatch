import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/SearchResults";
import { searchMedia } from "@/lib/tmdb";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let items: Awaited<ReturnType<typeof searchMedia>> = [];
  let errorMessage = "";

  if (query) {
    try {
      items = await searchMedia(query);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : "Search request failed.";
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar initialQuery={query} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        {errorMessage ? (
          <div className="rounded-lg border border-[#3a2224] bg-[#1b1213] p-4 text-sm text-[#f2a6a6]">
            {errorMessage}
          </div>
        ) : !query ? (
          <>
            <h1 className="mb-5 text-lg font-semibold text-[#f4f7fb]">
              Search
            </h1>
            <p className="text-sm text-[#8f9bb0]">
              Enter a title in the search bar to find movies, shows, K-Dramas, or anime.
            </p>
          </>
        ) : (
          <SearchResults query={query} items={items} />
        )}
      </main>
    </div>
  );
}
