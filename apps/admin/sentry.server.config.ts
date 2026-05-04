import * as Sentry from '@sentry/nextjs'

// Server runtime — captures errors from server actions, RSC, route handlers,
// middleware, and Prisma exceptions on the admin app.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'admin', runtime: 'server' } },
})
