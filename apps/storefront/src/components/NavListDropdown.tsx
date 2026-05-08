'use client'

import Link from 'next/link'

interface NavListItem {
  slug: string
  name: string
}

interface Props {
  items: NavListItem[]
  hrefPrefix: string
  viewAllHref: string
  viewAllLabel: string
  sectionLabel: string
  onMouseEnter: () => void
  onMouseLeave: () => void
  onItemClick: () => void
}

// Note: this dropdown previously truncated to a hard-coded DESKTOP_LIMIT
// of 8 entries, which silently dropped 5 brands once the catalogue grew
// past 8 published brands (the section header still showed the true count,
// producing a visible mismatch — `BRANDS · 13` rendered above only 8
// visible items). The 2-column grid handles arbitrary counts cleanly, and
// the `View all` CTA at the bottom of the dropdown remains the canonical
// "go to brands page" link. Limit removed.
export default function NavListDropdown({
  items,
  hrefPrefix,
  viewAllHref,
  viewAllLabel,
  sectionLabel,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}: Props) {
  if (items.length === 0) return null

  return (
    <div
      className="absolute left-0 right-0 bg-[var(--color-elevated)] border-t border-[var(--color-border)]"
      style={{ top: '100%', boxShadow: '0 24px 64px rgba(33,28,16,0.12)', zIndex: 50 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
    >
      <div className="max-w-[1360px] mx-auto px-8 py-7">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-4 flex justify-between items-center">
          <span>{sectionLabel}</span>
          <span className="font-normal">{items.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-w-[720px]">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`${hrefPrefix}${item.slug}`}
              role="menuitem"
              className="flex justify-between items-center px-3 py-2.5 border-l-2 border-transparent text-[14px] text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
              onClick={onItemClick}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[11px] text-[var(--color-caption)]">›</span>
            </Link>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--color-border-2)] max-w-[720px]">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-between gap-2 h-10 px-4 border border-[var(--color-border)] text-[13px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
            onClick={onItemClick}
          >
            <span>{viewAllLabel}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
