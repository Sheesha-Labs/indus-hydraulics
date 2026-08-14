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
  initialScope: { tags: { runtime: 'client' } },
  // The storefront and admin used to be separate Sentry-tagged apps. One
  // deployment now serves both, so derive the tag from the request URL
  // instead of hardcoding it — otherwise the two surfaces become
  // indistinguishable in Sentry.
  beforeSend(event) {
    const url = event.request?.url
    if (url) {
      try {
        event.tags = { ...event.tags, app: new URL(url).pathname.startsWith('/admin') ? 'admin' : 'storefront' }
      } catch {
        // non-URL value; leave the tag unset rather than guessing
      }
    }
    return event
  },
})
