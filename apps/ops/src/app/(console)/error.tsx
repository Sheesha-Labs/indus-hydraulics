'use client'

import { ErrorState } from '@indus/ops-ui/states'

/**
 * The console's error boundary (05 §6.4): ErrorState with "Try again" (reset) and the digest as the error
 * id. The message and stack are never shown or copied; the server logged the error under the same digest.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="px-io-page-x py-6">
      <ErrorState error={error} onRetry={reset} />
    </div>
  )
}
