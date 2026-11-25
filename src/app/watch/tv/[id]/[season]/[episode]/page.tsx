import Link from "next/link";
import { WatchPlayer } from "@/components/WatchPlayer";
import { getMediaDetail, getSeasonEpisodes, lookupAnimeIds } from "@/lib/tmdb";

export default async function WatchTvPage({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id, season, episode } = await params;
  const tvId = Number(id);
  const seasonNum = Number(season) || 1;
  const episodeNum = Number(episode) || 1;

  try {
    const [show, episodes] = await Promise.all([
      getMediaDetail("tv", tvId),
      getSeasonEpisodes(tvId, seasonNum),
    ]);

    const animeIds =
      show.label === "Anime"
        ? await lookupAnimeIds(show.title)
        : { malId: null, anilistId: null };

    return (
      <WatchPlayer
        mediaType="tv"
        id={show.id}
        imdbId={show.imdbId}
        title={show.title}
        poster={show.poster}
        season={seasonNum}
        episode={episodeNum}
        seasons={show.seasons}
        episodes={episodes}
        malId={animeIds.malId}
        anilistId={animeIds.anilistId}
      />
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not load episode.";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b10] px-4 text-center">
        <p className="mb-4 text-sm text-[#f2a6a6]">{msg}</p>
        <Link
          href={`/tv/${tvId}`}
          className="rounded-lg bg-[#38bdf8] px-4 py-2 text-sm font-semibold text-[#07131a]"
        >
          Back to show
        </Link>
      </div>
    );
  }
}
