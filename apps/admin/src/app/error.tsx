'use client'

import { useEffect } from 'react'

export default function AdminLocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[admin][locale-error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-surface)]">
      <div className="max-w-[480px] text-center">
        <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
          Admin error
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6 leading-[1.6]">
          The page failed to load. This has been logged. You can retry, or sign out and back in if
          the issue persists.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-[var(--color-caption)] mb-5">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-10 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="h-10 px-5 inline-flex items-center font-mono text-[12px] border border-[var(--color-border)] text-[var(--color-body)] hover:bg-[var(--color-deep)]"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
