import Link from 'next/link'

export default function ServicesNotFound() {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-20">
      <span className="eyebrow">SERVICES · 404</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">That case isn’t here.</h1>
      <p className="mt-3 max-w-[640px] text-[var(--color-muted)]">
        It may have been retired or renamed. Browse the full case-study index, or open a service ticket
        and an engineer will route you to the right job.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/services"
          className="inline-flex items-center rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] px-5 py-2.5 text-sm font-medium hover:border-[var(--color-muted)]"
        >
          All case studies
        </Link>
        <Link
          href="/quote"
          className="inline-flex items-center rounded-sm bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-elevated)]"
        >
          Open a service ticket
        </Link>
      </div>
    </main>
  )
}
