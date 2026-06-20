import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // No external image CDN required — placeholder images use branded SVG data URIs.
    // Add domains here when licensed football photography is integrated.
    remotePatterns: [],
  },
};

export default nextConfig;
