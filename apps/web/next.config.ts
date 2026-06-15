import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@psl-one/ui', '@psl-one/shared', '@psl-one/shared-types'],
};

export default nextConfig;
