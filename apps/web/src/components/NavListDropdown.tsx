'use client'

import Link from 'next/link'
import Image from 'next/image'

interface NavListItem {
  slug: string
  name: string
}

interface Props {
  /**
   * Closed. The dropdown stays mounted and is hidden rather than unmounted, so
   * its links are in the server-rendered HTML for crawlers — see the megamenu
   * note in SiteHeaderClient.
   */
  hidden?: boolean
  items: NavListItem[]
  hrefPrefix: string
  viewAllHref: string
  viewAllLabel: string
  sectionLabel: string
  promoImageUrl?: string | null
  promoHeading?: string | null
  promoBody?: string | null
  promoLinkUrl?: string | null
  onMouseEnter: () => void
  onMouseLeave: () => void
  onItemClick: () => void
}

// Note: this dropdown previously truncated to a hard-coded DESKTOP_LIMIT
// of 8 entries, which silently dropped 5 brands once the catalogue grew
// past 8 published brands (the section header still showed the true count,
// producing a visible mismatch — `BRANDS · 13` rendered above only 8
// visible items). The grid handles arbitrary counts cleanly, and
// the `View all` CTA at the bottom of the dropdown remains the canonical
// "go to brands page" link. Limit removed.
export default function NavListDropdown({
  hidden = false,
  items,
  hrefPrefix,
  viewAllHref,
  viewAllLabel,
  sectionLabel,
  promoImageUrl,
  promoHeading,
  promoBody,
  promoLinkUrl,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}: Props) {
  if (items.length === 0) return null

  const hasPromo = Boolean(promoImageUrl)

  return (
    <div
      hidden={hidden}
      className="bg-ih-surface border-ih-border absolute right-0 left-0 border-t"
      style={{ top: '100%', boxShadow: '0 24px 64px rgba(33,28,16,0.12)', zIndex: 50 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 xl:px-12">
        <div
          className="grid gap-10"
          style={hasPromo ? { gridTemplateColumns: '1fr 360px' } : undefined}
        >
          {/* List section */}
          <div>
            <div className="text-ih-muted mb-4 flex items-center justify-between font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
              <span>{sectionLabel}</span>
              <span className="font-normal">{items.length}</span>
            </div>
            <div className={`grid gap-x-8 gap-y-1 ${hasPromo ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`${hrefPrefix}${item.slug}`}
                  role="menuitem"
                  className="text-ih-ink-2 hover:bg-ih-bg hover:border-ih-accent hover:text-ih-ink flex items-center justify-between border-l-2 border-transparent px-3 py-2.5 text-[14px] transition-colors"
                  onClick={onItemClick}
                >
                  <span>{item.name}</span>
                  <span className="text-ih-muted-2 font-mono text-[11px]">›</span>
                </Link>
              ))}
            </div>
            <div className="border-ih-border mt-5 border-t pt-4">
              <Link
                href={viewAllHref}
                className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 inline-flex h-10 items-center justify-between gap-2 border px-4 text-[13px] transition-colors"
                onClick={onItemClick}
              >
                <span>{viewAllLabel}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Promo tile */}
          {hasPromo && promoImageUrl ? (
            <Link
              href={promoLinkUrl ?? viewAllHref}
              onClick={onItemClick}
              className="bg-ih-bg border-ih-border block self-start overflow-hidden border"
            >
              <div className="relative h-40 w-full">
                <Image src={promoImageUrl} alt="" fill className="object-cover" sizes="360px" />
              </div>
              <div className="px-4 py-3">
                {promoHeading ? (
                  <div className="text-ih-ink text-[13px] font-medium">{promoHeading}</div>
                ) : null}
                {promoBody ? (
                  <div className="text-ih-muted mt-1 text-[12px]">{promoBody}</div>
                ) : null}
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
