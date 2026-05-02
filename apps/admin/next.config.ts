import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
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
