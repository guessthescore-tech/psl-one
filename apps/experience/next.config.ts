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
      // Compatibility aliases for staging smoke script and legacy links
      { source: '/predictions', destination: '/guess-the-score', permanent: false },
      { source: '/social-challenges', destination: '/predict/challenge', permanent: false },
    ];
  },
};

export default nextConfig;
