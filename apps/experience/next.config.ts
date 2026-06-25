import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // No external image CDN required — placeholder images use branded SVG data URIs.
    // Add domains here when licensed football photography is integrated.
    remotePatterns: [],
  },
  async redirects() {
    return [
      // Legacy alias — smoke script and old links
      { source: '/predictions', destination: '/guess-the-score', permanent: false },
    ];
  },
};

export default nextConfig;
