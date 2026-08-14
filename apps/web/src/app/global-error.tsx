'use client'

// Top-level error boundary. Catches errors that escape every route segment's
// own error.tsx — typically failures in the root layout. Required for Sentry
// to capture those rare-but-loud errors.
//
// Keep the visual minimal here: by the time a user sees this, the app shell
// itself has failed to render.

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          maxWidth: 480,
          margin: '80px auto',
          padding: '0 24px',
          textAlign: 'center',
          color: '#1a1a1a',
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#6b6b6b', lineHeight: 1.6, marginBottom: 24 }}>
          The page failed to load. Our team has been notified. Please try again
          in a moment.
        </p>
        {error.digest ? (
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11,
              color: '#9b9b9b',
            }}
          >
            Reference: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  )
}
