import Link from 'next/link'
import { db } from '@indus/db'
import NotFoundLogger from '../components/NotFoundLogger'

export default async function NotFound() {
  const categories = await db.category
    .findMany({
      where: { isPublished: true, parentId: null },
      take: 6,
      orderBy: { position: 'asc' },
      select: { slug: true, name: true },
    })
    .catch(() => [])

  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 pb-32 text-center">
      <NotFoundLogger />
      <div className="font-mono text-[80px] font-semibold text-[var(--color-border)] leading-none mb-6">
        404
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">Page not found</h1>
      <p className="text-[14px] text-ih-muted mb-8 leading-[1.6]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <form method="GET" action="/search" className="mb-8">
        <div className="flex border border-ih-border bg-ih-surface max-w-[400px] mx-auto">
          <input
            name="q"
            type="text"
            placeholder="Search products…"
            className="flex-1 px-4 py-2.5 bg-transparent text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 border-l border-ih-border bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {categories.length > 0 && (
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
            Browse Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/c/${cat.slug}`}
                className="px-4 py-2 border border-ih-border bg-ih-surface font-mono text-[12px] text-ih-ink-2 hover:border-ih-accent hover:text-ih-ink transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="font-mono text-[12px] text-ih-accent hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
