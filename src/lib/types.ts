export type WatchCategory = "all" | "movie" | "tv" | "kdrama" | "anime";

export interface MediaItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string;
  backdrop: string;
  year: string;
  rating: string;
  overview: string;
  label: string;
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string;
}

export interface EpisodeItem {
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview: string;
  still: string;
  airDate: string;
  runtime: number | null;
}

export interface NextEpisodeInfo {
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  airDate: string;
}

export interface MediaDetail extends MediaItem {
  imdbId: string | null;
  genres: string[];
  runtime: number | null;
  status: string;
  seasons: SeasonSummary[];
  cast: string[];
  trailerKey: string | null;
  recommendations: MediaItem[];
  nextEpisodeToAir: NextEpisodeInfo | null;
}
