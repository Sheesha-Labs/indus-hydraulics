'use client'

import Link from 'next/link'

/**
 * Blog-segment error boundary, required by CLAUDE.md §6.1.
 *
 * The article body is assembled from validated blocks and two resolver
 * queries; if any of that throws, this keeps the failure inside the segment
 * rather than taking down the storefront shell. The digest is surfaced
 * because it is the only handle support has on a server-side stack trace.
 */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-24 text-center">
      <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-danger">
        Something went wrong
      </p>
      <h1 className="mb-3 font-serif text-[32px] font-normal tracking-[-0.02em]">
        This article didn&rsquo;t load.
      </h1>
      <p className="mx-auto mb-6 max-w-[440px] text-ih-muted">
        Try again — if it keeps happening, our engineers can look it up by the reference below.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="mono inline-flex h-10 items-center rounded-md bg-ih-accent px-5 text-[12px] uppercase tracking-[0.08em] text-ih-accent-fg hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/blog"
          className="mono inline-flex h-10 items-center rounded-md border border-ih-border px-5 text-[12px] uppercase tracking-[0.08em] text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent"
        >
          Back to the blog
        </Link>
      </div>
      {error.digest && (
        <p className="mono mt-6 text-[11px] text-ih-muted-2">Reference: {error.digest}</p>
      )}
    </main>
  )
}
