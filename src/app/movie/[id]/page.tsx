import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MediaCard } from "@/components/MediaCard";
import { Navbar } from "@/components/Navbar";
import { TrailerButton } from "@/components/TrailerButton";
import { WatchlistButton } from "@/components/WatchlistButton";
import { getMediaDetail } from "@/lib/tmdb";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  let movie: Awaited<ReturnType<typeof getMediaDetail>> | null = null;
  let errorMessage = "";

  try {
    movie = await getMediaDetail("movie", movieId);
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Could not load this movie.";
  }

  if (errorMessage || !movie) {
    return (
      <div className="min-h-screen bg-[#080b10]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#8f9bb0] hover:text-[#f4f7fb]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to browse</span>
          </Link>
          <div className="rounded-lg border border-[#3a2224] bg-[#1b1213] p-4 text-sm text-[#f2a6a6]">
            {errorMessage || "Movie not found"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />

      {/* Cinematic backdrop hero with muted looping trailer */}
      <div className="relative">
        <HeroBackdrop backdrop={movie.backdrop} trailerKey={movie.trailerKey} />

        <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#c5d0e0] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to browse</span>
          </Link>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
            <div className="mx-auto w-52 shrink-0 sm:mx-0 sm:w-64">
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/15 bg-[#12161f] shadow-2xl">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs text-[#c5d0e0]">
                <span className="rounded bg-white/10 px-2 py-0.5 font-medium text-white backdrop-blur-sm">
                  {movie.label}
                </span>
                {movie.year && <span>{movie.year}</span>}
                {movie.runtime && <span>{movie.runtime} min</span>}
                {movie.rating && (
                  <span className="font-semibold text-[#38bdf8]">
                    {movie.rating} / 10
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {movie.title}
              </h1>

              {movie.cast.length > 0 && (
                <p className="mt-2 text-sm text-[#a6b3c8]">
                  {movie.cast.join(", ")}
                </p>
              )}

              {movie.genres.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-[#c5d0e0]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href={`/watch/movie/${movie.id}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#38bdf8] px-7 text-sm font-semibold text-[#07131a] hover:bg-[#56ccf9] sm:w-auto"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Watch movie</span>
                </Link>
                {movie.trailerKey && (
                  <TrailerButton
                    trailerKey={movie.trailerKey}
                    title={movie.title}
                  />
                )}
                <WatchlistButton
                  id={movie.id}
                  mediaType="movie"
                  title={movie.title}
                  poster={movie.poster}
                  label={movie.label}
                />
              </div>

              {movie.overview && (
                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#c5d0e0] sm:text-base">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>

          {movie.recommendations.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-4 text-base font-semibold text-[#f4f7fb]">
                More like this
              </h2>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {movie.recommendations.map((item) => (
                  <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
