import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Force new build to bypass Vercel cache
  generateBuildId: async () => {
    return `dec25-design-${Date.now()}`;
  },
};

export default nextConfig;
