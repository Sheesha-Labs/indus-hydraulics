'use client'

import { useEffect } from 'react'

export default function AdminShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin][shell-error]', error)
  }, [error])

  return (
    <div className="px-8 py-12">
      <div className="bg-ih-danger-soft max-w-[680px] rounded-lg border border-[oklch(0.4_0.18_25)] p-5">
        <h2 className="mb-1 text-[15px] font-medium">This page failed to load</h2>
        <p className="text-ih-ink-2 mb-3 text-[13px]">
          The rest of the admin app is still working — just this section ran into an error.
        </p>
        {error.digest && (
          <p className="text-ih-muted-2 mb-3 text-[11px] tabular-nums">Reference: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-4 text-[12px] tabular-nums"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
