import * as Sentry from '@sentry/nextjs'

// Edge runtime — middleware (apps/storefront/src/proxy.ts) and any route
// handlers configured with `runtime = 'edge'`.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'storefront', runtime: 'edge' } },
})
