import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  transpilePackages: ['@indus/ui', '@indus/domain'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      // Legacy metallic-ptfe-hoses category was split into the new
      // metallic-hoses parent + 7 sub-categories during the Metallic
      // Hoses initiative (Batch 0, PR #93). The old slug remains in DB
      // (now empty) so direct links don't 404, but inbound traffic /
      // SEO is best served by 301-ing to the new parent landing page.
      {
        source: '/c/metallic-ptfe-hoses',
        destination: '/c/metallic-hoses',
        permanent: true,
      },
    ]
  },
}

// Sentry build-time wrapper. Source-map upload only runs when SENTRY_AUTH_TOKEN
// is set (in CI / Vercel); locally the build still succeeds without it.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Quiet build output unless we're in CI where logs are useful.
  silent: !process.env.CI,
  // Upload all client bundles' source maps for cleaner stack traces.
  widenClientFileUpload: true,
  // Source maps are generated for upload to Sentry, then removed from the
  // build output so they aren't shipped to the browser.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  // Strip Sentry's own logger from the prod bundle.
  disableLogger: true,
})
