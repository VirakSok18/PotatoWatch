import Link from "next/link";
import { WatchPlayer } from "@/components/WatchPlayer";
import { getMediaDetail } from "@/lib/tmdb";

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  try {
    const movie = await getMediaDetail("movie", movieId);
    return (
      <WatchPlayer
        mediaType="movie"
        id={movie.id}
        imdbId={movie.imdbId}
        title={movie.title}
        poster={movie.poster}
      />
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not load movie.";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b10] px-4 text-center">
        <p className="mb-4 text-sm text-[#f2a6a6]">{msg}</p>
        <Link
          href="/"
          className="rounded-lg bg-[#38bdf8] px-4 py-2 text-sm font-semibold text-[#07131a]"
        >
          Back to browse
        </Link>
      </div>
    );
  }
}
