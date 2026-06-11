import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@psl-one/ui', '@psl-one/shared', '@psl-one/shared-types'],
};

export default nextConfig;
