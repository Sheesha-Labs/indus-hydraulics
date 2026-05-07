// Next.js instrumentation hook — Sentry uses this to register the right
// SDK build for the current runtime (Node.js for server actions / RSC /
// route handlers, Edge for middleware).
//
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Forward unhandled request errors to Sentry — Next 15+ pattern. Next looks
// for an `onRequestError` export here; @sentry/nextjs ships the equivalent
// as `captureRequestError`.
export { captureRequestError as onRequestError } from '@sentry/nextjs'
