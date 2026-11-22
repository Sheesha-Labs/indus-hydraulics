'use client'

import { ErrorState } from '@indus/ops-ui/states'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * error.tsx for pages outside the console shell, which own their `<main>`: the client pages (website look:
 * a white page, nothing about the document or the token) and first-run setup. The digest is the only
 * detail; the message and stack are never shown.
 */
export default function StandaloneError({ error, reset }: ErrorProps) {
  return (
    <main
      id="content"
      data-boundary="error"
      className="bg-io-card flex min-h-screen w-full items-start justify-center px-4 py-16"
    >
      <ErrorState error={error} onRetry={reset} />
    </main>
  )
}

/** error.tsx inside the T11 sign-in card ((auth) pages): the card is already the page's main. */
export function CardError({ error, reset }: ErrorProps) {
  return (
    <div data-boundary="error">
      <ErrorState error={error} onRetry={reset} bare />
    </div>
  )
}
