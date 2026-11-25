import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@consumet/extensions", "got-scraping"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
