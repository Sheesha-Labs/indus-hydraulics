import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from './src/lib/sentry-scrub'

// Indus Operations, browser. No Session Replay: it would record mail and prices.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  debug: false,
  initialScope: { tags: { app: 'ops', runtime: 'client' } },
  beforeSend: (event) => scrubEvent(event),
})
