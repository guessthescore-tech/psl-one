import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['picsum.photos'],
  },
};

export default nextConfig;
