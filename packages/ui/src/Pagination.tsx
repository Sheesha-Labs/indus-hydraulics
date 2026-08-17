import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Design language v2 — pagination.
 *
 * Promoted from the private copy in
 * `apps/web/src/app/admin/(shell)/products/page.tsx`, which was the only
 * paginated admin surface in the tree. Behaviour is unchanged; three things
 * were fixed on the way across:
 *
 *  - The active page now carries `aria-current='page'`. Without it the control
 *    announces as an undifferentiated list of numbered links.
 *  - The ellipsis is `aria-hidden`; it is a typographic gap, not content.
 *  - Buttons pick up the v2 4px radius. The old square corners were the v1
 *    flat-industrial aesthetic the client rejected (CLAUDE.md §2.3).
 *
 * `packages/ui` carries no Next dependency on purpose, so this cannot import
 * `next/link`. It renders a plain anchor by default — which triggers a full
 * document navigation — and accepts `linkComponent` so App Router callers get
 * client-side transitions. Admin lists should always pass it:
 *
 *   import Link from 'next/link'
 *   <Pagination … linkComponent={Link} />
 *
 * ⚠ NO `'use client'`, deliberately, and it must stay that way.
 *
 * This component has no state, no effects and no event handlers — it is links.
 * Marking it a Client Component makes its props cross the RSC boundary, and
 * both `buildUrl` and `linkComponent` are functions. Functions are not
 * serializable, so every Server Component page rendering it throws at request
 * time — while the build, typecheck and unit tests all still pass, because
 * none of them exercises that boundary. That is exactly what happened: it
 * shipped with `'use client'` and took down /admin/products and /admin/media.
 * `pagination-is-server.test.ts` guards it.
 */

/**
 * The shape Pagination needs from a link. `next/link` satisfies it.
 *
 * Every optional member spells `| undefined` explicitly because this workspace
 * runs `exactOptionalPropertyTypes`: without it, passing a computed
 * `aria-current={active ? 'page' : undefined}` fails to typecheck.
 */
export type PaginationLinkComponent = React.ComponentType<{
  href: string
  className?: string | undefined
  children?: React.ReactNode | undefined
  'aria-current'?: 'page' | undefined
}>

export interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Maps a page number to its href. Omit `?page=1` so page one stays canonical. */
  buildUrl: (page: number) => string
  /** Pass `next/link` in App Router surfaces. Defaults to a plain anchor. */
  linkComponent?: PaginationLinkComponent | undefined
  /** Accessible name for the nav landmark. Distinguish it if a page has two. */
  label?: string | undefined
  className?: string | undefined
}

export function Pagination({
  currentPage,
  totalPages,
  buildUrl,
  linkComponent,
  label = 'Pagination',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageRange(currentPage, totalPages)

  return (
    <nav
      className={cn('mt-6 flex items-center justify-center gap-1 font-mono text-[12px]', className)}
      aria-label={label}
    >
      <PageBtn
        href={buildUrl(currentPage - 1)}
        disabled={currentPage <= 1}
        linkComponent={linkComponent}
      >
        ← Prev
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-2 text-ih-muted">
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            href={buildUrl(p)}
            active={p === currentPage}
            linkComponent={linkComponent}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        href={buildUrl(currentPage + 1)}
        disabled={currentPage >= totalPages}
        linkComponent={linkComponent}
      >
        Next →
      </PageBtn>
    </nav>
  )
}

function PageBtn({
  href,
  children,
  active = false,
  disabled = false,
  linkComponent,
}: {
  href: string
  children: React.ReactNode
  active?: boolean | undefined
  disabled?: boolean | undefined
  linkComponent?: PaginationLinkComponent | undefined
}) {
  const classes = cn(
    'inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-3 transition-colors',
    'outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
    active
      ? 'border-ih-ink bg-ih-navy text-white'
      : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent'
  )

  if (disabled) {
    // A span, not a disabled anchor: `disabled` is not a valid anchor
    // attribute, and keeping it out of the tab order is the point.
    return (
      <span aria-disabled="true" className={cn(classes, 'pointer-events-none opacity-40')}>
        {children}
      </span>
    )
  }

  const Link = linkComponent ?? 'a'
  return (
    <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}

/**
 * Window of page numbers with ellipses. Always shows first, last and current
 * ±2 — e.g. `[1, '…', 5, 6, 7, 8, 9, '…', 42]` for page 7 of 42.
 *
 * Exported for its unit test: the boundary cases (a total at the 7-page
 * threshold, a current page adjacent to either end) are where an off-by-one
 * produces a duplicated or missing page number.
 */
export function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}
