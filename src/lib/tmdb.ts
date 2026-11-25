import type {
  EpisodeItem,
  MediaDetail,
  MediaItem,
  SeasonSummary,
  WatchCategory,
} from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing TMDB_API_KEY environment variable.");
  }
  return key;
}

export function posterUrl(path?: string | null, size = "w500"): string {
  return path ? `${IMG_BASE}/${size}${path}` : "";
}

export function backdropUrl(path?: string | null, size = "w1280"): string {
  return path ? `${IMG_BASE}/${size}${path}` : "";
}

interface TmdbRawItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  original_language?: string;
  genre_ids?: number[];
}

function detectLabel(
  raw: TmdbRawItem,
  mediaType: "movie" | "tv"
): string {
  if (mediaType === "movie") return "Movie";
  if (raw.original_language === "ko") return "K-Drama";
  if (
    raw.original_language === "ja" &&
    Array.isArray(raw.genre_ids) &&
    raw.genre_ids.includes(16)
  ) {
    return "Anime";
  }
  return "TV";
}

function mapRaw(
  raw: TmdbRawItem,
  forcedType?: "movie" | "tv"
): MediaItem | null {
  const type =
    forcedType ||
    (raw.media_type === "movie"
      ? "movie"
      : raw.media_type === "tv"
      ? "tv"
      : null);
  if (!type) return null;

  const title = (raw.title || raw.name || "").trim();
  if (!title) return null;

  const date = raw.release_date || raw.first_air_date || "";
  const year = date ? date.slice(0, 4) : "";
  const rating =
    typeof raw.vote_average === "number" && raw.vote_average > 0
      ? raw.vote_average.toFixed(1)
      : "";

  return {
    id: raw.id,
    mediaType: type,
    title,
    poster: posterUrl(raw.poster_path, "w500"),
    backdrop: backdropUrl(raw.backdrop_path, "w1280"),
    year,
    rating,
    overview: raw.overview || "",
    label: detectLabel(raw, type),
  };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 600
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function getHomeSections(category: WatchCategory = "all"): Promise<
  { title: string; items: MediaItem[] }[]
> {
  if (category === "movie") {
    const [trending, nowPlaying] = await Promise.all([
      tmdbFetch<{ results: TmdbRawItem[] }>("/trending/movie/week"),
      tmdbFetch<{ results: TmdbRawItem[] }>("/movie/now_playing"),
    ]);
    return [
      {
        title: "Trending movies",
        items: trending.results
          .map((r) => mapRaw(r, "movie"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
      {
        title: "Now playing",
        items: nowPlaying.results
          .map((r) => mapRaw(r, "movie"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
    ];
  }

  if (category === "tv") {
    const [trending, onAir] = await Promise.all([
      tmdbFetch<{ results: TmdbRawItem[] }>("/trending/tv/week"),
      tmdbFetch<{ results: TmdbRawItem[] }>("/tv/on_the_air"),
    ]);
    return [
      {
        title: "Trending TV shows",
        items: trending.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
      {
        title: "Currently airing",
        items: onAir.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
    ];
  }

  if (category === "kdrama") {
    const [popular, airing] = await Promise.all([
      tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
        with_original_language: "ko",
        sort_by: "popularity.desc",
      }),
      tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
        with_original_language: "ko",
        sort_by: "first_air_date.desc",
        "vote_count.gte": "5",
      }),
    ]);
    return [
      {
        title: "Popular K-Dramas",
        items: popular.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
      {
        title: "Latest K-Dramas",
        items: airing.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
    ];
  }

  if (category === "anime") {
    const [popular, latest] = await Promise.all([
      tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
        with_genres: "16",
        with_original_language: "ja",
        sort_by: "popularity.desc",
      }),
      tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
        with_genres: "16",
        with_original_language: "ja",
        sort_by: "first_air_date.desc",
        "vote_count.gte": "10",
      }),
    ]);
    return [
      {
        title: "Popular anime",
        items: popular.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
      {
        title: "Latest anime",
        items: latest.results
          .map((r) => mapRaw(r, "tv"))
          .filter((x): x is MediaItem => x !== null)
          .slice(0, 18),
      },
    ];
  }

  // Default "all"
  const [trendingAll, kdramas, anime] = await Promise.all([
    tmdbFetch<{ results: TmdbRawItem[] }>("/trending/all/week"),
    tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
      with_original_language: "ko",
      sort_by: "popularity.desc",
    }),
    tmdbFetch<{ results: TmdbRawItem[] }>("/discover/tv", {
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "popularity.desc",
    }),
  ]);

  return [
    {
      title: "Trending now",
      items: trendingAll.results
        .map((r) => mapRaw(r))
        .filter((x): x is MediaItem => x !== null)
        .slice(0, 18),
    },
    {
      title: "Popular K-Dramas",
      items: kdramas.results
        .map((r) => mapRaw(r, "tv"))
        .filter((x): x is MediaItem => x !== null)
        .slice(0, 12),
    },
    {
      title: "Popular anime",
      items: anime.results
        .map((r) => mapRaw(r, "tv"))
        .filter((x): x is MediaItem => x !== null)
        .slice(0, 12),
    },
  ];
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  const q = query.trim();
  if (!q) return [];

  const data = await tmdbFetch<{ results: TmdbRawItem[] }>(
    "/search/multi",
    { query: q, include_adult: "false" },
    120
  );

  return (data.results || [])
    .map((r) => mapRaw(r))
    .filter((x): x is MediaItem => x !== null && Boolean(x.poster))
    .slice(0, 24);
}

export async function getMediaDetail(
  mediaType: "movie" | "tv",
  id: number
): Promise<MediaDetail> {
  const data = await tmdbFetch<{
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    overview?: string;
    original_language?: string;
    genres?: { id: number; name: string }[];
    runtime?: number | null;
    episode_run_time?: number[];
    status?: string;
    next_episode_to_air?: {
      season_number: number;
      episode_number: number;
      name?: string;
      air_date?: string;
    } | null;
    seasons?: {
      season_number: number;
      name: string;
      episode_count: number;
      air_date?: string;
    }[];
    credits?: {
      cast?: { name: string }[];
    };
    videos?: {
      results?: {
        key: string;
        site: string;
        type: string;
        official?: boolean;
      }[];
    };
    recommendations?: {
      results?: TmdbRawItem[];
    };
    external_ids?: {
      imdb_id?: string | null;
    };
  }>(`/${mediaType}/${id}`, { append_to_response: "credits,videos,recommendations,external_ids" }, 600);

  const date = data.release_date || data.first_air_date || "";
  const year = date ? date.slice(0, 4) : "";
  const rating =
    typeof data.vote_average === "number" && data.vote_average > 0
      ? data.vote_average.toFixed(1)
      : "";

  const genres = (data.genres || []).map((g) => g.name);
  const genreIds = (data.genres || []).map((g) => g.id);

  const label =
    mediaType === "movie"
      ? "Movie"
      : data.original_language === "ko"
      ? "K-Drama"
      : data.original_language === "ja" && genreIds.includes(16)
      ? "Anime"
      : "TV";

  const seasons: SeasonSummary[] = (data.seasons || [])
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .map((s) => ({
      seasonNumber: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count,
      airDate: s.air_date || "",
    }));

  const runtime =
    mediaType === "movie"
      ? data.runtime ?? null
      : data.episode_run_time?.[0] ?? null;

  const ytVideos = (data.videos?.results || []).filter(
    (v) => v.site === "YouTube"
  );
  const trailer =
    ytVideos.find((v) => v.type === "Trailer" && v.official) ||
    ytVideos.find((v) => v.type === "Trailer") ||
    ytVideos.find((v) => v.type === "Teaser") ||
    ytVideos[0] ||
    null;

  const recommendations = (data.recommendations?.results || [])
    .map((r) => mapRaw(r, mediaType))
    .filter((x): x is MediaItem => x !== null && Boolean(x.poster))
    .slice(0, 12);

  return {
    id: data.id,
    imdbId: data.external_ids?.imdb_id || null,
    mediaType,
    title: data.title || data.name || "Untitled",
    poster: posterUrl(data.poster_path, "w500"),
    backdrop: backdropUrl(data.backdrop_path, "w1280"),
    year,
    rating,
    overview: data.overview || "",
    label,
    genres,
    runtime,
    status: data.status || "",
    seasons,
    cast: (data.credits?.cast || []).slice(0, 6).map((c) => c.name),
    trailerKey: trailer?.key || null,
    recommendations,
    nextEpisodeToAir: data.next_episode_to_air
      ? {
          seasonNumber: data.next_episode_to_air.season_number,
          episodeNumber: data.next_episode_to_air.episode_number,
          name: data.next_episode_to_air.name || "",
          airDate: data.next_episode_to_air.air_date || "",
        }
      : null,
  };
}

export async function getSeasonEpisodes(
  tvId: number,
  seasonNumber: number
): Promise<EpisodeItem[]> {
  const data = await tmdbFetch<{
    episodes?: {
      episode_number: number;
      season_number: number;
      name?: string;
      overview?: string;
      still_path?: string | null;
      air_date?: string;
      runtime?: number | null;
    }[];
  }>(`/tv/${tvId}/season/${seasonNumber}`, {}, 300);

  return (data.episodes || []).map((ep) => ({
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season_number,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || "",
    still: posterUrl(ep.still_path, "w500"),
    airDate: ep.air_date || "",
    runtime: ep.runtime ?? null,
  }));
}

export async function discoverByCategory(
  category: WatchCategory,
  genreId?: string,
  page = 1
): Promise<{ items: MediaItem[]; hasMore: boolean }> {
  const isMovie = category === "movie";
  const path = isMovie ? "/discover/movie" : "/discover/tv";
  const params: Record<string, string> = {
    sort_by: "popularity.desc",
    page: String(page),
  };

  if (category === "kdrama") {
    params.with_original_language = "ko";
  } else if (category === "anime") {
    params.with_original_language = "ja";
    params.with_genres = genreId ? `16,${genreId}` : "16";
  }

  if (genreId && category !== "anime") {
    params.with_genres = genreId;
  }

  const data = await tmdbFetch<{
    results: TmdbRawItem[];
    total_pages?: number;
  }>(path, params, 300);

  const items = (data.results || [])
    .map((r) => mapRaw(r, isMovie ? "movie" : "tv"))
    .filter((x): x is MediaItem => x !== null && Boolean(x.poster));

  return {
    items,
    hasMore: page < (data.total_pages || 1),
  };
}

export async function lookupAnimeIds(
  title: string
): Promise<{ malId: number | null; anilistId: number | null }> {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query:
          "query ($search: String) { Media(search: $search, type: ANIME) { id idMal } }",
        variables: { search: title },
      }),
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { malId: null, anilistId: null };
    const data = (await res.json()) as {
      data?: { Media?: { id?: number | null; idMal?: number | null } };
    };
    return {
      malId: data.data?.Media?.idMal ?? null,
      anilistId: data.data?.Media?.id ?? null,
    };
  } catch {
    return { malId: null, anilistId: null };
  }
}
