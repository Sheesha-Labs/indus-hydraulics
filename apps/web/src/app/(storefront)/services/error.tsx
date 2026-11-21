'use client'

import Link from 'next/link'

export default function ServicesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-20">
      <span className="eyebrow">SERVICES · ERROR</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
        Something went sideways loading services.
      </h1>
      <p className="text-ih-muted mt-3 max-w-[640px]">
        Try again, or jump straight to a quote — an applications engineer will pick it up
        regardless.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="border-ih-border bg-ih-surface hover:border-ih-accent inline-flex items-center rounded-sm border px-5 py-2.5 text-sm font-medium"
        >
          Try again
        </button>
        <Link
          href="/contact"
          className="bg-ih-navy inline-flex items-center rounded-sm px-5 py-2.5 text-sm font-medium text-white"
        >
          Open a service ticket
        </Link>
      </div>
    </main>
  )
}
