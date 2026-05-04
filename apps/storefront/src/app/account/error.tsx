'use client'

import { useEffect } from 'react'

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
     
    console.error('[storefront][account-error]', error)
  }, [error])

  return (
    <div className="px-6 py-12">
      <div className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] p-5 max-w-[640px]">
        <h2 className="text-[16px] font-semibold mb-1">Something went wrong</h2>
        <p className="text-[13px] text-[var(--color-body)] mb-4">
          We couldn&apos;t load your account section. Try again or sign in if your session has expired.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-[var(--color-caption)] mb-3">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}
