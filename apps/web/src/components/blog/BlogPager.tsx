import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '../designed/icons'
import { blogPageHref, pagerPages } from './blog-pager-pages'

type Props = {
  page: number
  totalPages: number
}

const DIR =
  'inline-flex h-10 items-center gap-2 rounded-md border px-3 text-[13.5px] font-medium min-[761px]:px-3.5'
const DIR_ON = `${DIR} border-ih-border-strong text-ih-ink transition-colors duration-150 hover:border-ih-accent hover:bg-ih-surface-2 motion-reduce:transition-none`
const DIR_OFF = `${DIR} border-ih-border text-ih-muted-2`

/**
 * Numbered pager for /blog and /blog/page/[n]. Every entry is a real link —
 * these pages are the only internal links most older articles have, so a
 * crawler must be able to walk them without script.
 *
 * Two runs render and CSS picks one: the wide run (2 back, 4 ahead) beside
 * Newer/Older, and on a phone a short run (1 either side) on its own centred
 * row above them.
 */
export default function BlogPager({ page, totalPages }: Props) {
  if (totalPages < 2) return null

  return (
    <nav
      aria-label="Article pages"
      className="mt-8 flex flex-wrap items-center justify-between gap-x-2 gap-y-4 border-t border-ih-border pt-5 min-[761px]:mt-14 min-[761px]:flex-nowrap min-[761px]:gap-4"
    >
      {page > 1 ? (
        <Link href={blogPageHref(page - 1)} rel="prev" className={DIR_ON}>
          <ArrowLeftIcon />
          Newer
        </Link>
      ) : (
        <span className={DIR_OFF}>
          <ArrowLeftIcon />
          Newer
        </span>
      )}

      <PageRun page={page} totalPages={totalPages} back={2} ahead={4} className="hidden min-[761px]:flex" />
      <PageRun
        page={page}
        totalPages={totalPages}
        back={1}
        ahead={1}
        className="order-first flex basis-full justify-center min-[761px]:hidden"
      />

      {page < totalPages ? (
        <Link href={blogPageHref(page + 1)} rel="next" className={DIR_ON}>
          Older
          <ArrowRightIcon />
        </Link>
      ) : (
        <span className={DIR_OFF}>
          Older
          <ArrowRightIcon />
        </span>
      )}
    </nav>
  )
}

function PageRun({
  page,
  totalPages,
  back,
  ahead,
  className,
}: Props & { back: number; ahead: number; className: string }) {
  const items = pagerPages(page, totalPages, back, ahead)
  return (
    <ol className={`m-0 list-none items-center gap-1 p-0 ${className}`}>
      {items.map((n, i) =>
        n === 'gap' ? (
          <li
            key={`gap-${i}`}
            aria-hidden="true"
            className="grid h-10 min-w-10 place-items-center px-1.5 font-mono text-[13px] text-ih-muted"
          >
            …
          </li>
        ) : (
          <li key={n}>
            <Link
              href={blogPageHref(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              className={`grid h-10 min-w-10 place-items-center rounded-md border px-1.5 font-mono text-[13px] transition-colors duration-150 motion-reduce:transition-none ${
                n === page
                  ? 'border-ih-accent bg-ih-accent-soft text-ih-accent'
                  : 'border-transparent text-ih-ink-2 hover:bg-ih-surface-2'
              }`}
            >
              {n}
            </Link>
          </li>
        ),
      )}
    </ol>
  )
}
