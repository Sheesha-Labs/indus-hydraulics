import Link from 'next/link'

export default function ServiceCaseNotFound() {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-20">
      <span className="eyebrow">CASE STUDY · 404</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">That case isn&rsquo;t here.</h1>
      <p className="mt-3 max-w-[640px] text-ih-muted">
        It may have been retired or renamed. The full case-study index is one click away.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/services"
          className="inline-flex items-center rounded-sm border border-ih-border bg-ih-surface px-5 py-2.5 text-sm font-medium hover:border-ih-accent"
        >
          All case studies
        </Link>
        <Link
          href="/quote"
          className="inline-flex items-center rounded-sm bg-ih-navy px-5 py-2.5 text-sm font-medium text-white"
        >
          Open a service ticket
        </Link>
      </div>
    </main>
  )
}
