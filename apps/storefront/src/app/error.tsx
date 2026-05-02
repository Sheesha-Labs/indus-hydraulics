'use client'

import { useEffect } from 'react'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[storefront][locale-error]', error)
  }, [error])

  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 pb-32 text-center">
      <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
        Something went wrong
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">We hit a snag</h1>
      <p className="text-[14px] text-[var(--color-muted)] mb-8 leading-[1.6]">
        Our team has been notified. You can retry the page, or head back to the home page.
      </p>
      {error.digest && (
        <p className="font-mono text-[11px] text-[var(--color-caption)] mb-6">
          Reference: {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-10 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/en"
          className="h-10 px-5 inline-flex items-center font-mono text-[12px] border border-[var(--color-border)] text-[var(--color-body)] hover:bg-[var(--color-deep)]"
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
