'use client'

import { ErrorState } from '@indus/ops-ui/states'

/**
 * Every console segment's error.tsx (05 §6.4) re-exports this: ErrorState with "Try again" (reset) and the
 * digest as the error id. The message and stack are never shown or copied; the server logged the error
 * under the same digest. Inside a record it fills the tab body, so the header and tabs stay usable.
 */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div data-boundary="error" className="px-io-page-x py-6">
      <ErrorState error={error} onRetry={reset} />
    </div>
  )
}
