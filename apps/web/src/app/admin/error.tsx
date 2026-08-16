'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Error boundary for the signed-OUT admin pages: /admin/sign-in,
 * /admin/activate and /admin/forgot-password.
 *
 * Without it these three fall all the way through to app/global-error.tsx,
 * which replaces the whole document with an unstyled white page — no logo, no
 * way back, nothing that looks like the product. That is exactly what a
 * visitor saw when the password-reset action threw. (/admin/(shell) has its
 * own nearer boundary, so signed-in pages never reach this one.)
 */
export default function AdminPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin][public-error]', error)
  }, [error])

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-ih-navy)] p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-sm bg-[#ffffff] font-mono text-[14px] font-semibold text-[#111]">
            IH
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-ih-accent" />
          </div>
          <div>
            <div className="font-semibold leading-tight text-white">Indus Hydraulics</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[oklch(0.68_0.03_250)]">
              Admin Portal
            </div>
          </div>
        </div>

        <div className="border border-[var(--color-ih-navy-2)] bg-[var(--color-ih-navy-2)] p-8">
          <h1 className="mb-1 text-[22px] font-semibold text-white">That didn&apos;t work</h1>
          <p className="mb-6 text-[13px] leading-relaxed text-[oklch(0.75_0.02_250)]">
            Something went wrong on our side. Nothing you entered was lost — try again, and if it
            keeps happening tell us the reference below.
          </p>

          <button
            type="button"
            onClick={reset}
            className="h-11 w-full bg-ih-accent text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>

          <Link
            href="/admin/sign-in"
            className="mt-5 block text-center text-[13px] text-[oklch(0.68_0.03_250)] transition-colors hover:text-[oklch(0.75_0.02_250)]"
          >
            Back to sign in
          </Link>

          {error.digest && (
            <p className="mt-6 border-t border-[var(--color-ih-navy)] pt-4 text-center font-mono text-[11px] text-[oklch(0.62_0.03_250)]">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
