// Next.js instrumentation hook: check the environment once at boot (names only,
// never values), then register Sentry for the current runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertBootEnv } = await import('./lib/env')
    assertBootEnv()
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs'
