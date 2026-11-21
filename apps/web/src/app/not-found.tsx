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
    <div className="mx-auto max-w-[680px] px-8 py-20 pb-32 text-center">
      <NotFoundLogger />
      <div className="text-ih-border-strong mb-6 font-mono text-[80px] leading-none tabular-nums">
        404
      </div>
      <h1 className="mb-3 text-[28px] font-semibold tracking-tight">Page not found</h1>
      <p className="text-ih-muted mb-8 text-[14px] leading-[1.6]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <form method="GET" action="/search" className="mb-8">
        <div className="border-ih-border bg-ih-surface mx-auto flex max-w-[400px] border">
          <input
            name="q"
            type="text"
            placeholder="Search products…"
            className="text-ih-ink placeholder:text-ih-muted-2 flex-1 bg-transparent px-4 py-2.5 text-[13px] focus:outline-none"
          />
          <button
            type="submit"
            className="border-ih-border bg-ih-accent border-l px-4 font-mono text-[12px] text-white hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {categories.length > 0 && (
        <div>
          <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
            Browse Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/c/${cat.slug}`}
                className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-ink border px-4 py-2 font-mono text-[12px] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-ih-accent font-mono text-[12px] hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
