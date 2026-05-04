import * as Sentry from '@sentry/nextjs'

// Edge runtime — admin middleware (apps/admin/src/proxy.ts) and any route
// handlers configured with `runtime = 'edge'`.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'admin', runtime: 'edge' } },
})
