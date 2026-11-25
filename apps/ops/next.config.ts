import path from 'node:path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

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
  // S08: the intake parsers load native or worker code that must not be bundled (pdfjs legacy build, SheetJS
  // in a worker thread, sharp's native binary, exceljs and mammoth's zip readers).
  serverExternalPackages: [
    '@prisma/client',
    '.prisma/client',
    '@indus/ops-db',
    'pdfjs-dist',
    'xlsx',
    'sharp',
    'exceljs',
    'mammoth',
  ],
  transpilePackages: ['@indus/ops-core', '@indus/ops-ui', '@indus/intake'],
  experimental: {
    serverActions: {
      allowedOrigins: ['operations.indushydraulics.com'],
      bodySizeLimit: '4mb',
    },
  },
  typedRoutes: true,
}

// Source-map upload and releases need SENTRY_AUTH_TOKEN, which exists only on
// Vercel; without it the upload half is switched off so builds stay quiet. Runtime
// error reporting needs only the DSN (sentry.*.config.ts).
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: 'indus-operations',
  authToken: sentryAuthToken,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: sentryAuthToken ? { deleteSourcemapsAfterUpload: true } : { disable: true },
  release: sentryAuthToken ? { create: true } : { create: false, name: '' },
  webpack: { treeshake: { removeDebugLogging: true } },
})
