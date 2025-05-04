import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://m.media-amazon.com/**"),
      new URL("https://images.justwatch.com/**"),
    ],
  },
};

export default nextConfig;
