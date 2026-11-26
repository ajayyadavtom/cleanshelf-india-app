import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Gemini vision calls can take 20-40s on a phone photo; the route itself
  // runs on the Node runtime and streams nothing, so give it headroom.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
