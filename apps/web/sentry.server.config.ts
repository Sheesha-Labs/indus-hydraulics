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
  initialScope: { tags: { app: 'storefront', runtime: 'server' } },
})
