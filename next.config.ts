import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { hostname: "api.dicebear.com" },
      { hostname: "picsum.photos" },
      { hostname: "fastly.picsum.photos" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
