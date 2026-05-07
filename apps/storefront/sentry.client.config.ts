import * as Sentry from '@sentry/nextjs'

// Client runtime — captures errors from React client components and the
// browser console.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session Replay disabled by default to keep costs predictable and avoid
  // recording PII without explicit decision. Enable per-error replays later
  // if customer support needs them.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'storefront', runtime: 'client' } },
})
