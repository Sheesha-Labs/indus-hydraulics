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
    <div className="mx-auto max-w-[680px] px-8 py-20 text-center">
      <div className="text-ih-muted mb-3 font-mono text-[12px] tracking-[0.14em] uppercase">
        Compare unavailable
      </div>
      <h1 className="mb-3 text-[28px] font-semibold tracking-tight">
        We couldn&apos;t load the comparison
      </h1>
      <p className="text-ih-muted mb-8 text-[14px] leading-[1.6]">
        One of the products in the URL may have been removed or renamed. Try again, clear your tray,
        or browse the catalogue to start over.
      </p>
      {error.digest && (
        <p className="text-ih-muted-2 mb-6 font-mono text-[11px]">Reference: {error.digest}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-ih-accent h-10 px-5 font-mono text-[12px] text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href={`/c`}
          className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 inline-flex h-10 items-center border px-5 font-mono text-[12px]"
        >
          Browse catalogue
        </Link>
      </div>
    </div>
  )
}
