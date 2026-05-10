import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Security headers (CSP, X-Content-Type-Options, Referrer-Policy, etc.)
// are set in src/proxy.ts middleware so they apply uniformly across
// Turbopack dev, build, edge, and node runtimes.

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

// Sentry build-time wrapper. Source-map upload only runs when SENTRY_AUTH_TOKEN
// is set (in CI / Vercel); locally the build still succeeds without it.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
})
