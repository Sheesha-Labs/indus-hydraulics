'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[storefront][compare-error]', error)
  }, [error])

  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 text-center">
      <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-ih-muted mb-3">
        Compare unavailable
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">We couldn&apos;t load the comparison</h1>
      <p className="text-[14px] text-ih-muted mb-8 leading-[1.6]">
        One of the products in the URL may have been removed or renamed. Try again, clear your tray, or browse the catalogue to start over.
      </p>
      {error.digest && (
        <p className="font-mono text-[11px] text-ih-muted-2 mb-6">
          Reference: {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-10 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href={`/c`}
          className="h-10 px-5 inline-flex items-center font-mono text-[12px] border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2"
        >
          Browse catalogue
        </Link>
      </div>
    </div>
  )
}
