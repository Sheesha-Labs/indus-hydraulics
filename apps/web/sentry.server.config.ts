import * as Sentry from '@sentry/nextjs'

// Server runtime — captures errors from server actions, RSC, route handlers,
// middleware, and Prisma exceptions.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Sample 10% of transactions for performance traces. Free tier handles this.
  // Bump down to 0.05 if event volume strains the quota.
  tracesSampleRate: 0.1,
  // Do not capture PII (cookies, IP, etc.) — this is a B2B catalogue and
  // we'd rather opt in deliberately if we ever need it.
  sendDefaultPii: false,
  // Quieter logs unless explicitly debugging.
  debug: false,
  // Tag every event with the app name so storefront and admin events are
  // distinguishable when both feed into the same Sentry organisation.
  initialScope: { tags: { runtime: 'server' } },
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
