import Link from 'next/link'
import { headers } from 'next/headers'
import { db } from '@indus/db'
import { getTranslations } from 'next-intl/server'
import { routing } from '../../lib/i18n'

function detectLocale(pathname: string | null): 'en' | 'ar' {
  const seg = (pathname ?? '').split('/').filter(Boolean)[0]
  return seg === 'ar' ? 'ar' : 'en'
}

export default async function NotFound() {
  // next-intl `useLocale()` is unsafe in not-found because params aren't
  // available; sniff the URL via headers. Defaults to en.
  const h = await headers()
  const referer = h.get('x-invoke-path') ?? h.get('next-url') ?? h.get('referer')
  const locale = detectLocale(referer)

  const [t, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'notFound' }).catch(() => null),
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      take: 6,
      orderBy: { position: 'asc' },
      select: { slug: true, name: true },
    }),
  ])

  // Fallback strings if translation namespace missing.
  const tx = (k: string, fallback: string) => {
    try {
      return t ? t(k) : fallback
    } catch {
      return fallback
    }
  }

  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 pb-32 text-center">
      <div className="font-mono text-[80px] font-semibold text-[var(--color-border)] leading-none mb-6">
        404
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">
        {tx('title', 'Page not found')}
      </h1>
      <p className="text-[14px] text-[var(--color-muted)] mb-8 leading-[1.6]">
        {tx('description', "The page you're looking for doesn't exist or may have been moved.")}
      </p>

      <form method="GET" action={`/${locale}/search`} className="mb-8">
        <div className="flex border border-[var(--color-border)] bg-[var(--color-elevated)] max-w-[400px] mx-auto">
          <input
            name="q"
            type="text"
            placeholder={tx('searchPlaceholder', 'Search products…')}
            className="flex-1 px-4 py-2.5 bg-transparent text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 border-l border-[var(--color-border)] bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
          >
            {tx('search', 'Search')}
          </button>
        </div>
      </form>

      {categories.length > 0 && (
        <div>
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">
            {tx('browseCategories', 'Browse Categories')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/c/${cat.slug}`}
                className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] text-[var(--color-body)] hover:border-[var(--color-body)] hover:text-[var(--color-primary)] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href={`/${locale}`}
          className="font-mono text-[12px] text-[var(--color-accent)] hover:underline"
        >
          {tx('backHome', '← Back to home')}
        </Link>
      </div>
    </div>
  )
}
