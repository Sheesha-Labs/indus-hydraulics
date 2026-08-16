'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
     
    console.error('[storefront][error]', error)
  }, [error])

  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 pb-32 text-center">
      <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-ih-muted mb-3">
        Something went wrong
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">We hit a snag</h1>
      <p className="text-[14px] text-ih-muted mb-8 leading-[1.6]">
        Our team has been notified. You can retry the page, or head back to the home page.
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
          href="/"
          className="h-10 px-5 inline-flex items-center font-mono text-[12px] border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
