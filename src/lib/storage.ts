export interface SavedMedia {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string;
  label: string;
  savedAt: number;
}

export interface WatchHistoryEntry {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  updatedAt: number;
}

const WATCHLIST_KEY = "potatowatch_watchlist_v1";
const HISTORY_KEY = "potatowatch_history_v1";
const WATCHED_EPS_KEY = "potatowatch_watched_eps_v1";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export function getWatchlist(): SavedMedia[] {
  return safeRead<SavedMedia[]>(WATCHLIST_KEY, []);
}

export function isInWatchlist(mediaType: "movie" | "tv", id: number): boolean {
  return getWatchlist().some((x) => x.mediaType === mediaType && x.id === id);
}

export function toggleWatchlist(item: Omit<SavedMedia, "savedAt">): boolean {
  const list = getWatchlist();
  const exists = list.some(
    (x) => x.mediaType === item.mediaType && x.id === item.id
  );
  const next = exists
    ? list.filter((x) => !(x.mediaType === item.mediaType && x.id === item.id))
    : [{ ...item, savedAt: Date.now() }, ...list];
  safeWrite(WATCHLIST_KEY, next);
  return !exists;
}

export function getWatchHistory(): WatchHistoryEntry[] {
  return safeRead<WatchHistoryEntry[]>(HISTORY_KEY, []);
}

export function recordWatchHistory(
  entry: Omit<WatchHistoryEntry, "updatedAt">
): void {
  const list = getWatchHistory().filter(
    (x) => !(x.mediaType === entry.mediaType && x.id === entry.id)
  );
  const next = [{ ...entry, updatedAt: Date.now() }, ...list].slice(0, 30);
  safeWrite(HISTORY_KEY, next);
}

export function removeWatchHistory(
  mediaType: "movie" | "tv",
  id: number
): WatchHistoryEntry[] {
  const next = getWatchHistory().filter(
    (x) => !(x.mediaType === mediaType && x.id === id)
  );
  safeWrite(HISTORY_KEY, next);
  return next;
}

export function markEpisodeWatched(
  tvId: number,
  season: number,
  episode: number
): void {
  const map = safeRead<Record<string, number[]>>(WATCHED_EPS_KEY, {});
  const key = `${tvId}:${season}`;
  const list = map[key] || [];
  if (!list.includes(episode)) {
    map[key] = [...list, episode];
    safeWrite(WATCHED_EPS_KEY, map);
  }
}

export function getWatchedEpisodes(tvId: number, season: number): number[] {
  const map = safeRead<Record<string, number[]>>(WATCHED_EPS_KEY, {});
  return map[`${tvId}:${season}`] || [];
}
