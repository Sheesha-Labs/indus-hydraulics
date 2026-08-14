import * as Sentry from '@sentry/nextjs'

// Edge runtime — middleware (apps/web/src/proxy.ts) and any route
// handlers configured with `runtime = 'edge'`.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { runtime: 'edge' } },
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
