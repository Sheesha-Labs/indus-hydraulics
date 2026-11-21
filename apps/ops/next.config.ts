import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  // The generated Ops Prisma client is loaded by path, so the trace must include it.
  outputFileTracingIncludes: {
    '/**': ['../../packages/ops-db/generated/client/**'],
  },
  // Type checking is CI's job (`checks`), not the build's, as in apps/web.
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  images: { unoptimized: true },
  serverExternalPackages: ['@prisma/client', '.prisma/client', '@indus/ops-db'],
  transpilePackages: ['@indus/ops-core', '@indus/ops-ui', '@indus/intake'],
  experimental: {
    serverActions: {
      allowedOrigins: ['operations.indushydraulics.com'],
      bodySizeLimit: '4mb',
    },
  },
  typedRoutes: true,
}

export default nextConfig
