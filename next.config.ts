import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: [
    '172.20.10.4',
    'localhost',
  ],
};

export default nextConfig;
