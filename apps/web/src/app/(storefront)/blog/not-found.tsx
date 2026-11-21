import Link from 'next/link'

/**
 * Blog-segment 404. Covers a missing post, category hub or author profile —
 * every one of which is a slug that used to work or was mistyped, so the
 * useful thing to offer is a route back into the index rather than the
 * generic site-wide not-found.
 */
export default function BlogNotFound() {
  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)] py-24 text-center">
      <p className="mono text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase">
        404
      </p>
      <h1 className="mb-3 font-serif text-[32px] font-normal tracking-[-0.02em]">
        We couldn&rsquo;t find that page.
      </h1>
      <p className="text-ih-muted mx-auto mb-6 max-w-[440px]">
        The article, topic or author you were looking for may have been renamed or unpublished.
      </p>
      <Link
        href="/blog"
        className="mono bg-ih-accent text-ih-accent-fg inline-flex h-10 items-center rounded-md px-5 text-[12px] tracking-[0.08em] uppercase hover:opacity-90"
      >
        Back to the blog
      </Link>
    </main>
  )
}
