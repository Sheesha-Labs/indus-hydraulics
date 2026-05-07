import * as Sentry from '@sentry/nextjs'

// Client runtime — captures errors from React client components and the
// browser console on the admin app.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session Replay disabled by default to keep costs predictable.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'admin', runtime: 'client' } },
})
