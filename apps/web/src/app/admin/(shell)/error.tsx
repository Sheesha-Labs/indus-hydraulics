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
      <div className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] p-5 max-w-[680px]">
        <h2 className="text-[16px] font-semibold mb-1">This page failed to load</h2>
        <p className="text-[13px] text-ih-ink-2 mb-3">
          The rest of the admin app is still working — just this section ran into an error.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-ih-muted-2 mb-3">
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
