import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from './src/lib/sentry-scrub'

// Indus Operations, edge runtime. Project indus-operations; never the website's.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'ops', runtime: 'edge' } },
  beforeSend: (event) => scrubEvent(event),
})
