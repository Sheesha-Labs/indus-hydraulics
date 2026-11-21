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
      <p className="mono text-ih-danger mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase">
        Something went wrong
      </p>
      <h1 className="mb-3 font-serif text-[32px] font-normal tracking-[-0.02em]">
        This article didn&rsquo;t load.
      </h1>
      <p className="text-ih-muted mx-auto mb-6 max-w-[440px]">
        Try again — if it keeps happening, our engineers can look it up by the reference below.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="mono bg-ih-accent text-ih-accent-fg inline-flex h-10 items-center rounded-md px-5 text-[12px] tracking-[0.08em] uppercase hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/blog"
          className="mono border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-10 items-center rounded-md border px-5 text-[12px] tracking-[0.08em] uppercase"
        >
          Back to the blog
        </Link>
      </div>
      {error.digest && (
        <p className="mono text-ih-muted-2 mt-6 text-[11px]">Reference: {error.digest}</p>
      )}
    </main>
  )
}
