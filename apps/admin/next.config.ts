import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@indus/ui', '@indus/domain'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
}

export default nextConfig
