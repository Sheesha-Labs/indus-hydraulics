'use client'

import { useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ResolvedNavItem } from '@indus/domain'
import LogoMark from './LogoMark'
import SearchAutocomplete from './SearchAutocomplete'
import NavListDropdown from './NavListDropdown'

type NavListEntry = { slug: string; name: string }
type DropdownKind = 'mega' | 'brands' | 'industries' | null

interface Props {
  headerItems: ResolvedNavItem[]
  megamenuItems: ResolvedNavItem[]
  brands: NavListEntry[]
  industries: NavListEntry[]
  contactPhone: string | null
  contactHours: string | null
  isSignedIn: boolean
  userName: string | null
  notificationBell?: React.ReactNode
}

const MOBILE_LIST_LIMIT = 5

function getDropdownKind(
  item: ResolvedNavItem,
  megamenuItems: ResolvedNavItem[],
  brands: NavListEntry[],
  industries: NavListEntry[],
): DropdownKind {
  if (item.href === '/c' || item.href === '/c/') {
    return megamenuItems.length > 0 ? 'mega' : null
  }
  if (item.href === '/brands' || item.href === '/brands/') {
    return brands.length > 0 ? 'brands' : null
  }
  if (item.href === '/industries' || item.href === '/industries/') {
    return industries.length > 0 ? 'industries' : null
  }
  return null
}

/**
 * Nav active state.
 *
 * 01-design-language.md §5 is emphatic about this: screens belonging to no
 * top-level section — account, policy, 404 — must highlight NOTHING, and the
 * design passes an explicit sentinel so they cannot fall through to a default.
 * "A falsely-lit nav item is a wayfinding bug."
 *
 * Deriving it from the pathname gives the same guarantee without threading a
 * prop through every page, provided `/` is matched exactly. Prefix-matching
 * the root would light Home on every route in the product, which is precisely
 * the bug the rule exists to prevent. Anything with no matching header item —
 * /account, /shipping, a 404 — simply matches nothing.
 */
function matchesPath(href: string, pathname: string): boolean {
  const clean = href.endsWith('/') && href.length > 1 ? href.slice(0, -1) : href
  if (clean === '/') return pathname === '/'
  return pathname === clean || pathname.startsWith(`${clean}/`)
}

export default function SiteHeaderClient({
  headerItems,
  megamenuItems,
  brands,
  industries,
  contactPhone,
  contactHours,
  isSignedIn,
  userName,
  notificationBell,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownKind>(null)
  const [activeCatIdx, setActiveCatIdx] = useState(0)
  const [activeSubIdx, setActiveSubIdx] = useState(0)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const isActive = useCallback((href: string) => matchesPath(href, pathname), [pathname])

  const openDropdown = useCallback((kind: Exclude<DropdownKind, null>) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setActiveDropdown(kind)
  }, [])

  const closeDropdown = useCallback(() => {
    megaTimeout.current = setTimeout(() => setActiveDropdown(null), 120)
  }, [])

  const closeDropdownImmediate = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setActiveDropdown(null)
  }, [])

  const handleCatHover = useCallback((idx: number) => {
    setActiveCatIdx(idx)
    setActiveSubIdx(0)
  }, [])

  const handleSubHover = useCallback((idx: number) => {
    setActiveSubIdx(idx)
  }, [])

  const megamenuOpen = activeDropdown === 'mega'
  const brandsOpen = activeDropdown === 'brands'
  const industriesOpen = activeDropdown === 'industries'

  const activeCat = megamenuItems[activeCatIdx] ?? megamenuItems[0]
  const activeSub = activeCat?.children[activeSubIdx] ?? activeCat?.children[0]
  const browseAllHref = activeCat?.href ?? '/c'

  const brandsHeaderItem = headerItems.find(
    (item) => item.href === '/brands' || item.href === '/brands/',
  )
  const industriesHeaderItem = headerItems.find(
    (item) => item.href === '/industries' || item.href === '/industries/',
  )

  return (
    <header className="sticky top-0 z-50 border-b border-ih-border bg-ih-surface">
      {/* Utility bar */}
      <div className="bg-ih-navy text-[oklch(0.82_0.02_250)]">
        <div className="mx-auto flex h-[34px] max-w-[1440px] items-center justify-between px-12 font-mono text-[11px] tracking-[0.04em]">
          <div className="flex gap-6">
            {contactPhone && <span>{contactPhone}</span>}
            {contactHours && <span>{contactHours}</span>}
          </div>
          <div className="flex gap-4">
            {isSignedIn ? (
              <Link href={`/account`} className="hover:text-white">
                My account
              </Link>
            ) : (
              <Link href={`/sign-in`} className="hover:text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-8 px-12">
        {/* Logo */}
        <Link href={`/`} className="flex shrink-0 items-center gap-[11px]">
          <LogoMark />
          <span className="font-serif text-[21px] leading-none tracking-[-0.01em]">
            Indus Hydraulics
            <small className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-ih-muted">
              Industrial Components Co.
            </small>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-[26px] lg:flex">
          {headerItems.map((item) => {
            const href = item.href ?? '#'
            const kind = getDropdownKind(item, megamenuItems, brands, industries)
            if (kind !== null) {
              const isOpen = activeDropdown === kind
              return (
                <div key={item.id} onMouseEnter={() => openDropdown(kind)} onMouseLeave={closeDropdown}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={`flex items-center gap-1 border-b-[1.5px] py-1.5 text-[13.5px] transition-colors ${
                      isActive(href) || isOpen
                        ? 'border-ih-accent text-ih-accent'
                        : 'border-transparent text-ih-ink-2 hover:text-ih-ink'
                    }`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                  >
                    {item.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </Link>
                </div>
              )
            }
            return (
              <Link
                key={item.id}
                href={href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`flex items-center border-b-[1.5px] py-1.5 text-[13.5px] transition-colors ${
                  isActive(href)
                    ? 'border-ih-accent text-ih-accent'
                    : 'border-transparent text-ih-ink-2 hover:text-ih-ink'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search bar */}
          <div className="hidden sm:block" style={{ minWidth: '320px' }}>
            <SearchAutocomplete className="relative w-full" />
          </div>

          {/* Notification bell */}
          {notificationBell}

          {/* Quote basket */}
          <Link
            href={`/quote`}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-ih-border text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
            aria-label="Quote"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="4" y="3" width="12" height="14" rx="1" />
              <path d="M7 7h6M7 10h6M7 13h4" />
            </svg>
          </Link>

          {/* Account */}
          {isSignedIn ? (
            <Link
              href={`/account`}
              className="hidden h-10 items-center gap-2 rounded-md bg-ih-navy px-[18px] text-[13.5px] font-medium text-white transition-colors hover:bg-ih-ink sm:flex"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ih-accent text-[9px] font-medium text-white">
                {(userName ?? 'U').charAt(0).toUpperCase()}
              </span>
              My account
            </Link>
          ) : (
            <Link
              href={`/sign-in`}
              className="hidden h-10 items-center rounded-md border border-ih-border-strong px-[18px] text-[13.5px] font-medium text-ih-ink transition-colors hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent sm:flex"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ih-border text-ih-ink-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Megamenu ───────────────────────────────────────── */}
      {megamenuOpen && megamenuItems.length > 0 && (
        <div
          className="absolute left-0 right-0 border-t border-ih-border bg-ih-surface shadow-[0_4px_12px_rgba(20,28,45,.07),0_18px_48px_rgba(20,28,45,.09)]"
          style={{ top: '100%', zIndex: 50 }}
          onMouseEnter={() => openDropdown('mega')}
          onMouseLeave={closeDropdown}
          role="menu"
        >
          <div className="mx-auto max-w-[1440px] px-12">
            <div className="grid grid-cols-[360px_420px_1fr] min-h-[420px]">
              {/* ── Column 1: Top-level categories ── */}
              <div className="border-r border-ih-border py-7 pr-0">
                <div className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  Categories
                </div>
                <div className="flex flex-col">
                  {megamenuItems.map((cat, i) => (
                    <Link
                      key={cat.id}
                      href={cat.href ?? '#'}
                      role="menuitem"
                      className={`flex items-center justify-between rounded-sm border-l-2 px-3 py-2.5 text-[13.5px] transition-colors ${
                        i === activeCatIdx
                          ? 'border-ih-accent bg-ih-accent-soft font-medium text-ih-accent'
                          : 'border-transparent text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2'
                      }`}
                      onMouseEnter={() => handleCatHover(i)}
                      onClick={closeDropdownImmediate}
                    >
                      <span className="whitespace-nowrap">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 2: Sub-categories ── */}
              <div className="border-r border-ih-border px-6 py-7">
                <div className="mb-3 whitespace-nowrap font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  {activeCat?.label}
                </div>
                <div className="flex flex-col">
                  {(activeCat?.children ?? []).map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={sub.href ?? '#'}
                      role="menuitem"
                      className={`flex items-center justify-between rounded-sm border-l-2 px-3 py-2.5 text-[13.5px] transition-colors ${
                        i === activeSubIdx
                          ? 'border-ih-accent bg-ih-accent-soft font-medium text-ih-accent'
                          : 'border-transparent text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2'
                      }`}
                      onMouseEnter={() => handleSubHover(i)}
                      onClick={closeDropdownImmediate}
                    >
                      <span>{sub.label}</span>
                      <span aria-hidden="true" className="font-mono text-[11px] text-ih-muted-2">›</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 3: Leaf items ── */}
              <div className="flex flex-col px-6 py-7">
                <div className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  {activeSub?.label}
                </div>
                <div className="flex flex-col flex-1">
                  {(activeSub?.children ?? []).map((leaf) => (
                    <Link
                      key={leaf.id}
                      href={leaf.href ?? '#'}
                      role="menuitem"
                      target={leaf.openInNewTab ? '_blank' : undefined}
                      rel={leaf.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between rounded-sm border-l-2 border-transparent px-3 py-2.5 text-[13.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:bg-ih-surface-2"
                      onClick={closeDropdownImmediate}
                    >
                      <span>{leaf.label}</span>
                      <span aria-hidden="true" className="font-mono text-[11px] text-ih-muted-2">›</span>
                    </Link>
                  ))}
                </div>

                {/* Promo tile (if column has one) */}
                {activeCat?.promoImageUrl ? (
                  <Link
                    href={activeCat.promoLinkUrl ?? browseAllHref}
                    onClick={closeDropdownImmediate}
                    className="mt-4 block overflow-hidden rounded-lg border border-ih-border bg-ih-surface"
                  >
                    <div className="relative w-full h-32">
                      <Image
                        src={activeCat.promoImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 1360px) 33vw, 440px"
                      />
                    </div>
                    <div className="px-4 py-3">
                      {activeCat.promoHeading ? (
                        <div className="text-[14px] font-medium leading-[1.35] text-ih-ink">
                          {activeCat.promoHeading}
                        </div>
                      ) : null}
                      {activeCat.promoBody ? (
                        <div className="mt-1.5 text-[12.5px] leading-relaxed text-ih-muted">{activeCat.promoBody}</div>
                      ) : null}
                    </div>
                  </Link>
                ) : null}

                {/* Browse all CTA */}
                <div className="mt-auto pt-4">
                  <Link
                    href={browseAllHref}
                    className="flex h-10 items-center justify-between gap-2 rounded-md border border-ih-border-strong px-4 text-[13.5px] text-ih-ink transition-colors hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent"
                    onClick={closeDropdownImmediate}
                  >
                    <span>Browse all {activeCat?.label}</span>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/*
            Quick-links rail. New in v2 — the artboard puts a cross-reference
            prompt in the last column of the mega menu, which is the one place
            a customer holding a dead part number is already looking. Kept as a
            full-width rail rather than a column so it survives the drill-down
            layout this menu has to keep (see the note on the grid above).
          */}
          <div className="border-t border-ih-border bg-ih-surface-2">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-[26px] gap-y-2 px-12 py-3.5">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                Quick links
              </span>
              <Link
                href="/replacement"
                onClick={closeDropdownImmediate}
                className="text-[12.5px] text-ih-accent hover:underline"
              >
                Obsolete part lookup
              </Link>
              <Link
                href="/compare"
                onClick={closeDropdownImmediate}
                className="text-[12.5px] text-ih-accent hover:underline"
              >
                Compare specifications
              </Link>
              <Link
                href="/quote"
                onClick={closeDropdownImmediate}
                className="text-[12.5px] text-ih-accent hover:underline"
              >
                Your quote list
              </Link>
              <span className="ml-auto text-[12.5px] text-ih-muted">
                Can&rsquo;t find the part? Send a photo of the nameplate — we cross-reference obsolete numbers daily.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Brands dropdown ───────────────────────────────── */}
      {brandsOpen && (
        <NavListDropdown
          items={brands}
          hrefPrefix="/brands/"
          viewAllHref="/brands"
          viewAllLabel="View all brands"
          sectionLabel="Brands"
          promoImageUrl={brandsHeaderItem?.promoImageUrl}
          promoHeading={brandsHeaderItem?.promoHeading}
          promoBody={brandsHeaderItem?.promoBody}
          promoLinkUrl={brandsHeaderItem?.promoLinkUrl}
          onMouseEnter={() => openDropdown('brands')}
          onMouseLeave={closeDropdown}
          onItemClick={closeDropdownImmediate}
        />
      )}

      {/* ── Industries dropdown ───────────────────────────── */}
      {industriesOpen && (
        <NavListDropdown
          items={industries}
          hrefPrefix="/industries/"
          viewAllHref="/industries"
          viewAllLabel="View all industries"
          sectionLabel="Industries"
          promoImageUrl={industriesHeaderItem?.promoImageUrl}
          promoHeading={industriesHeaderItem?.promoHeading}
          promoBody={industriesHeaderItem?.promoBody}
          promoLinkUrl={industriesHeaderItem?.promoLinkUrl}
          onMouseEnter={() => openDropdown('industries')}
          onMouseLeave={closeDropdown}
          onItemClick={closeDropdownImmediate}
        />
      )}

      {/* ── Mobile nav ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-ih-border bg-ih-surface lg:hidden">
          {headerItems.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? '#'}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
              className="flex h-12 items-center border-b border-ih-border px-5 text-[13.5px] text-ih-ink-2 hover:bg-ih-surface-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {megamenuItems.length > 0 ? (
            <div className="border-b border-ih-border px-5 py-4">
              <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">Categories</p>
              <div className="flex flex-col gap-0.5">
                {megamenuItems.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href ?? '#'}
                    className="flex items-center justify-between py-2 text-[13px] text-ih-ink-2 hover:text-ih-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {brands.length > 0 ? (
            <div className="border-b border-ih-border px-5 py-4">
              <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">Brands</p>
              <div className="flex flex-col gap-0.5">
                {brands.slice(0, MOBILE_LIST_LIMIT).map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="flex items-center justify-between py-2 text-[13px] text-ih-ink-2 hover:text-ih-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{b.name}</span>
                    <span aria-hidden="true" className="font-mono text-[10px] text-ih-muted-2">›</span>
                  </Link>
                ))}
                <Link
                  href="/brands"
                  className="flex items-center justify-between py-2 text-[13px] font-medium text-ih-ink hover:text-ih-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all brands</span>
                  <span aria-hidden="true" className="font-mono text-[10px] text-ih-muted-2">→</span>
                </Link>
              </div>
            </div>
          ) : null}

          {industries.length > 0 ? (
            <div className="border-b border-ih-border px-5 py-4">
              <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">Industries</p>
              <div className="flex flex-col gap-0.5">
                {industries.slice(0, MOBILE_LIST_LIMIT).map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/industries/${ind.slug}`}
                    className="flex items-center justify-between py-2 text-[13px] text-ih-ink-2 hover:text-ih-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{ind.name}</span>
                    <span aria-hidden="true" className="font-mono text-[10px] text-ih-muted-2">›</span>
                  </Link>
                ))}
                <Link
                  href="/industries"
                  className="flex items-center justify-between py-2 text-[13px] font-medium text-ih-ink hover:text-ih-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all industries</span>
                  <span aria-hidden="true" className="font-mono text-[10px] text-ih-muted-2">→</span>
                </Link>
              </div>
            </div>
          ) : null}

          <div className="flex gap-3 px-5 py-4">
            <Link
              href={`/sign-in`}
              className="flex h-10 flex-1 items-center justify-center rounded-md border border-ih-border-strong text-[13.5px] font-medium text-ih-ink"
            >
              Sign in
            </Link>
            <Link
              href={`/quote`}
              className="flex h-10 flex-1 items-center justify-center rounded-md bg-ih-accent text-[13.5px] font-medium text-ih-accent-fg"
            >
              Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
