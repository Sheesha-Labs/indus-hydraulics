import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from './src/lib/sentry-scrub'

// Indus Operations, server runtime. Project indus-operations; never the website's.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'ops', runtime: 'server' } },
  beforeSend: (event) => scrubEvent(event),
})
