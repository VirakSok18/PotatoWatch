export interface EmbedServer {
  id: string;
  name: string;
  movieUrl: (tmdbId: number) => string;
  tvUrl: (tmdbId: number, season: number, episode: number) => string;
}

export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: "vidlink",
    name: "Server 1",
    movieUrl: (id) =>
      `https://vidlink.pro/movie/${id}?primaryColor=38bdf8&autoplay=true&muted=false&sub=en`,
    tvUrl: (id, s, e) =>
      `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=38bdf8&autoplay=true&muted=false&sub=en`,
  },
  {
    id: "vidfast",
    name: "Server 2",
    movieUrl: (id) =>
      `https://vidfast.pro/movie/${id}?autoPlay=true&theme=38bdf8&sub=en`,
    tvUrl: (id, s, e) =>
      `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true&theme=38bdf8&sub=en`,
  },
  {
    id: "vidsrcxyz",
    name: "Server 3",
    movieUrl: (id) =>
      `https://vidsrc.xyz/embed/movie/${id}?ds_lang=en&autoplay=1`,
    tvUrl: (id, s, e) =>
      `https://vidsrc.xyz/embed/tv/${id}/${s}-${e}?ds_lang=en&autoplay=1`,
  },
  {
    id: "embedsu",
    name: "Server 4",
    movieUrl: (id) => `https://embed.su/embed/movie/${id}?sub=en`,
    tvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}?sub=en`,
  },
  {
    id: "autoembed",
    name: "Server 5",
    movieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}?sub=en`,
    tvUrl: (id, s, e) =>
      `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}?sub=en`,
  },
];
