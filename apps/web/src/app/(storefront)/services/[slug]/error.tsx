'use client'

import Link from 'next/link'

export default function ServiceCaseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-20">
      <span className="eyebrow">CASE STUDY · ERROR</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">Couldn&rsquo;t load this case study.</h1>
      <p className="mt-3 max-w-[640px] text-[var(--color-muted)]">
        Try again, or browse the full case-study index. An applications engineer can pull the source
        file from the workshop on request.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] px-5 py-2.5 text-sm font-medium hover:border-[var(--color-muted)]"
        >
          Try again
        </button>
        <Link
          href="/services"
          className="inline-flex items-center rounded-sm bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-elevated)]"
        >
          All case studies
        </Link>
      </div>
    </main>
  )
}
