'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ResolvedNavItem } from '@indus/domain'
import BrandLockup from './BrandLockup'
import type { LogoStyle } from '../lib/brand-identity'
import SearchAutocomplete from './SearchAutocomplete'
import NavListDropdown from './NavListDropdown'
import NotificationBell from './NotificationBell'
import { useViewer } from './useViewer'

type NavListEntry = { slug: string; name: string }
type DropdownKind = 'mega' | 'brands' | 'industries' | null

interface Props {
  headerItems: ResolvedNavItem[]
  megamenuItems: ResolvedNavItem[]
  brands: NavListEntry[]
  industries: NavListEntry[]
  contactPhone: string | null
  contactHours: string | null
  /** Store name — the typeset wordmark, and the logo's alt text when it stands alone. */
  brandName: string
  /** CMS-uploaded header logo, already resolved to a URL. Null uses LogoMark. */
  logoUrl: string | null
  logoStyle: LogoStyle
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

/**
 * True once the document has scrolled past `offset` px.
 *
 * rAF-coalesced so a fling doesn't queue one setState per scroll event, and
 * seeded on mount so a restored scroll position — back/forward navigation, an
 * anchor link, a reload partway down a category page — starts in the right
 * state instead of flashing the top-of-page treatment for a frame.
 */
function useScrolled(offset: number): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      setScrolled(window.scrollY > offset)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [offset])

  return scrolled
}

export default function SiteHeaderClient({
  headerItems,
  megamenuItems,
  brands,
  industries,
  contactPhone,
  contactHours,
  brandName,
  logoUrl,
  logoStyle,
}: Props) {
  // Who is looking at this page. Resolved client-side, because reading the
  // session on the server here made every storefront route dynamic — see
  // SiteHeader and app/api/me.
  const viewer = useViewer()
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

  const scrolled = useScrolled(8)

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

  /*
    Opaque whenever a solid surface is docked to the bar. The megamenu, the two
    list dropdowns and the mobile drawer all paint `bg-ih-surface`, so a
    see-through bar sitting on top of them reads as a seam, not as an effect.
  */
  const solid = activeDropdown !== null || mobileOpen

  return (
    /*
      Translucent bar. The frosted pane is a sibling layer rather than a
      `backdrop-blur` class on the bar itself, because `backdrop-filter`
      establishes a containing block for positioned descendants — and the
      notification panel's click-away scrim (NotificationBell) is
      `fixed inset-0`, which would then be trapped inside the 72px bar
      instead of covering the viewport. Painting the blur in a layer nothing
      is nested inside keeps that escape hatch intact.

      Both bars keep their solid colour as the base class and only add the
      alpha under `supports-[backdrop-filter]`, so a browser without the
      filter gets the old fully-opaque header rather than a washed-out one
      it cannot blur.
    */
    <header
      className={`sticky top-0 z-50 border-b transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${
        scrolled || solid ? 'border-ih-border' : 'border-transparent'
      } ${
        scrolled && !solid
          ? 'shadow-[0_1px_20px_-10px_color-mix(in_oklab,var(--color-ih-ink)_45%,transparent)]'
          : ''
      }`}
    >
      {/*
        Utility bar — deliberately NOT translucent. Its 11px mono text is
        oklch(0.82 0.02 250) on navy: solid that is 12:1, but at even 80%
        alpha over a white section scrolling underneath it drops to ~3.4:1,
        which is below AA for text this small. The frosted treatment is worth
        having on the main bar and is not worth an unreadable contact strip.
      */}
      <div className="bg-ih-navy text-[oklch(0.82_0.02_250)]">
        <div className="mx-auto flex h-[34px] max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-12 font-mono text-[11px] tracking-[0.04em]">
          <div className="flex gap-6">
            {contactPhone && <span>{contactPhone}</span>}
            {/* 03 §6: below 768 the utility bar drops to the phone number
                only — at 375 the hours string wraps the bar to two lines. */}
            {contactHours && <span className="hidden sm:inline">{contactHours}</span>}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="relative">
        {/*
          The pane is full-bleed while the bar's content is capped at 1440px,
          so it cannot live on the content row itself — above that width the
          frost would stop at the container edge and the gutters would show
          bare page. `-z-10` puts it behind the row: the row's children are
          in flow and unpositioned, so without it an absolutely-positioned
          sibling paints over the whole nav.

          85% is the alpha, not the 72% the reference implementation uses.
          Indus has full-width `bg-ih-navy` bands and dark hero art that pass
          under this bar; at 72% the active nav item (`text-ih-accent`) falls
          to 3.3:1 over them. At 85% the worst case across navy, ih-ink and
          pure black is 4.69:1 — still visibly frosted, still AA.

          The blur stays mounted in both states and only the alpha animates.
          Transitioning `backdrop-filter` itself is janky, and at full opacity
          the blur is invisible anyway.
        */}
        <div
          aria-hidden
          className={`bg-ih-surface pointer-events-none absolute inset-0 -z-10 transition-colors duration-200 ease-out supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 motion-reduce:transition-none ${
            solid ? '' : 'supports-[backdrop-filter]:bg-ih-surface/85'
          }`}
        />

        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-5 sm:px-8 xl:px-12">
          {/* Logo */}
          <Link href={`/`} className="flex shrink-0 items-center gap-[11px]">
            <BrandLockup
              logoUrl={logoUrl}
              logoStyle={logoStyle}
              name={brandName}
              sublabel="Industrial Components Co."
              surface="header"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-[26px] lg:flex">
            {headerItems.map((item) => {
              const href = item.href ?? '#'
              const kind = getDropdownKind(item, megamenuItems, brands, industries)
              if (kind !== null) {
                const isOpen = activeDropdown === kind
                return (
                  /*
                  The panel opened on hover ONLY, so there was no keyboard
                  path to the mega menu at all — and it carries 175 category
                  links. Focusing the trigger now opens it and Escape closes
                  it and returns focus to the trigger.

                  Note there is deliberately no blur-close: the panel renders
                  as a SIBLING of this element, not a child, so a blur handler
                  here would fire the instant focus moved into the panel and
                  slam it shut. Dismissal is Escape, clicking away, or
                  focusing a different top-level item (which just replaces the
                  open kind).

                  Still missing, and larger than this fix: arrow-key roving
                  within the three panes.
                */
                  <div
                    key={item.id}
                    onMouseEnter={() => openDropdown(kind)}
                    onMouseLeave={closeDropdown}
                    onFocus={() => openDropdown(kind)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && isOpen) {
                        e.preventDefault()
                        closeDropdownImmediate()
                        ;(e.currentTarget.querySelector('a') as HTMLElement | null)?.focus()
                      }
                    }}
                  >
                    <Link
                      href={href}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className={`flex items-center gap-1 border-b-[1.5px] py-1.5 text-[13.5px] transition-colors ${
                        isActive(href) || isOpen
                          ? 'border-ih-accent text-ih-accent'
                          : 'text-ih-ink-2 hover:text-ih-ink border-transparent'
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
                        <path
                          d="M2 4l3 3 3-3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
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
                      : 'text-ih-ink-2 hover:text-ih-ink border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {/*
            The search box used to carry an inline `minWidth: 320px`. An inline
            style beats every responsive class, so between the nav appearing and
            the viewport being wide enough for both, the header was 235px wider
            than the window — every page on the site scrolled sideways at ~1024px.
            (Inline style is also banned outside packages/pdf and packages/email;
            this is the third time that exact pattern has caused a layout bug in
            this migration.)

            Now it shrinks: a plain width instead of a min-width, min-w-0 so flex
            is allowed to shrink it below that, and it only appears at xl where
            there is actually room alongside the nav — at lg the logo, nav,
            search and three action buttons still did not fit.

            It is also the only shrinkable item in this row: the icon buttons and
            the account button are all shrink-0, so the squeeze lands here and
            nowhere else. Widening it to 400 needed the nav to stop being flex-1
            (see above) — with the nav growing, this box never reached its width.
          */}
            <div className="hidden w-[400px] min-w-0 xl:block">
              <SearchAutocomplete className="relative w-full" />
            </div>

            {/* Notification bell */}
            {viewer.signedIn ? (
              <NotificationBell unreadCount={viewer.unreadCount} notifications={viewer.notifications} />
            ) : null}

            {/* Quote basket */}
            <Link
              href={`/quote`}
              className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors"
              aria-label="Quote"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="4" y="3" width="12" height="14" rx="1" />
                <path d="M7 7h6M7 10h6M7 13h4" />
              </svg>
            </Link>

            {/* Account */}
            {viewer.signedIn ? (
              <Link
                href={`/account`}
                className="bg-ih-navy hover:bg-ih-ink hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-[18px] text-[13.5px] font-medium text-white transition-colors sm:flex"
              >
                <span className="bg-ih-accent grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-medium text-white">
                  {(viewer.name ?? 'U').charAt(0).toUpperCase()}
                </span>
                My account
              </Link>
            ) : (
              <Link
                href={`/sign-in`}
                className="border-ih-border-strong text-ih-ink hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent hidden h-10 shrink-0 items-center whitespace-nowrap rounded-md border px-[18px] text-[13.5px] font-medium transition-colors sm:flex"
              >
                Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="border-ih-border text-ih-ink-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M2 4h12M2 8h12M2 12h12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Megamenu ───────────────────────────────────────── */}
      {megamenuOpen && megamenuItems.length > 0 && (
        <div
          className="border-ih-border bg-ih-surface absolute left-0 right-0 border-t shadow-[0_4px_12px_rgba(20,28,45,.07),0_18px_48px_rgba(20,28,45,.09)]"
          style={{ top: '100%', zIndex: 50 }}
          onMouseEnter={() => openDropdown('mega')}
          onMouseLeave={closeDropdown}
          role="menu"
        >
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
            <div className="grid min-h-[420px] grid-cols-[360px_420px_1fr]">
              {/* ── Column 1: Top-level categories ── */}
              <div className="border-ih-border border-r py-7 pr-0">
                <div className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
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
                          ? 'border-ih-accent bg-ih-accent-soft text-ih-accent font-medium'
                          : 'text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2 border-transparent'
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
              <div className="border-ih-border border-r px-6 py-7">
                <div className="text-ih-muted mb-3 whitespace-nowrap font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
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
                          ? 'border-ih-accent bg-ih-accent-soft text-ih-accent font-medium'
                          : 'text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2 border-transparent'
                      }`}
                      onMouseEnter={() => handleSubHover(i)}
                      onClick={closeDropdownImmediate}
                    >
                      <span>{sub.label}</span>
                      <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[11px]">
                        ›
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 3: Leaf items ── */}
              <div className="flex flex-col px-6 py-7">
                <div className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                  {activeSub?.label}
                </div>
                <div className="flex flex-1 flex-col">
                  {(activeSub?.children ?? []).map((leaf) => (
                    <Link
                      key={leaf.id}
                      href={leaf.href ?? '#'}
                      role="menuitem"
                      target={leaf.openInNewTab ? '_blank' : undefined}
                      rel={leaf.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2 flex items-center justify-between rounded-sm border-l-2 border-transparent px-3 py-2.5 text-[13.5px] transition-colors"
                      onClick={closeDropdownImmediate}
                    >
                      <span>{leaf.label}</span>
                      <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[11px]">
                        ›
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Promo tile (if column has one) */}
                {activeCat?.promoImageUrl ? (
                  <Link
                    href={activeCat.promoLinkUrl ?? browseAllHref}
                    onClick={closeDropdownImmediate}
                    className="border-ih-border bg-ih-surface mt-4 block overflow-hidden rounded-lg border"
                  >
                    <div className="relative h-32 w-full">
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
                        <div className="text-ih-ink text-[14px] font-medium leading-[1.35]">
                          {activeCat.promoHeading}
                        </div>
                      ) : null}
                      {activeCat.promoBody ? (
                        <div className="text-ih-muted mt-1.5 text-[12.5px] leading-relaxed">
                          {activeCat.promoBody}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ) : null}

                {/* Browse all CTA */}
                <div className="mt-auto pt-4">
                  <Link
                    href={browseAllHref}
                    className="border-ih-border-strong text-ih-ink hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent flex h-10 items-center justify-between gap-2 rounded-md border px-4 text-[13.5px] transition-colors"
                    onClick={closeDropdownImmediate}
                  >
                    <span>Browse all {activeCat?.label}</span>
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
            </div>
          </div>

          {/*
            Quick-links rail. New in v2 — the artboard puts a cross-reference
            prompt in the last column of the mega menu, which is the one place
            a customer holding a dead part number is already looking. Kept as a
            full-width rail rather than a column so it survives the drill-down
            layout this menu has to keep (see the note on the grid above).
          */}
          <div className="border-ih-border bg-ih-surface-2 border-t">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-[26px] gap-y-2 px-5 py-3.5 sm:px-8 xl:px-12">
              <span className="text-ih-muted font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                Quick links
              </span>
              <Link
                href="/replacement"
                onClick={closeDropdownImmediate}
                className="text-ih-accent text-[12.5px] hover:underline"
              >
                Obsolete part lookup
              </Link>
              <Link
                href="/compare"
                onClick={closeDropdownImmediate}
                className="text-ih-accent text-[12.5px] hover:underline"
              >
                Compare specifications
              </Link>
              <Link
                href="/quote"
                onClick={closeDropdownImmediate}
                className="text-ih-accent text-[12.5px] hover:underline"
              >
                Your quote list
              </Link>
              <span className="text-ih-muted ml-auto text-[12.5px]">
                Can&rsquo;t find the part? Send a photo of the nameplate — we cross-reference
                obsolete numbers daily.
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
        <div className="border-ih-border bg-ih-surface border-t lg:hidden">
          {headerItems.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? '#'}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
              className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-12 items-center border-b px-5 text-[13.5px]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {megamenuItems.length > 0 ? (
            <div className="border-ih-border border-b px-5 py-4">
              <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                Categories
              </p>
              <div className="flex flex-col gap-0.5">
                {megamenuItems.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href ?? '#'}
                    className="text-ih-ink-2 hover:text-ih-accent flex items-center justify-between py-2 text-[13px]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {brands.length > 0 ? (
            <div className="border-ih-border border-b px-5 py-4">
              <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                Brands
              </p>
              <div className="flex flex-col gap-0.5">
                {brands.slice(0, MOBILE_LIST_LIMIT).map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="text-ih-ink-2 hover:text-ih-accent flex items-center justify-between py-2 text-[13px]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{b.name}</span>
                    <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[10px]">
                      ›
                    </span>
                  </Link>
                ))}
                <Link
                  href="/brands"
                  className="text-ih-ink hover:text-ih-accent flex items-center justify-between py-2 text-[13px] font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all brands</span>
                  <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[10px]">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ) : null}

          {industries.length > 0 ? (
            <div className="border-ih-border border-b px-5 py-4">
              <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                Industries
              </p>
              <div className="flex flex-col gap-0.5">
                {industries.slice(0, MOBILE_LIST_LIMIT).map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/industries/${ind.slug}`}
                    className="text-ih-ink-2 hover:text-ih-accent flex items-center justify-between py-2 text-[13px]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{ind.name}</span>
                    <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[10px]">
                      ›
                    </span>
                  </Link>
                ))}
                <Link
                  href="/industries"
                  className="text-ih-ink hover:text-ih-accent flex items-center justify-between py-2 text-[13px] font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all industries</span>
                  <span aria-hidden="true" className="text-ih-muted-2 font-mono text-[10px]">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ) : null}

          <div className="flex gap-3 px-5 py-4">
            <Link
              href={`/sign-in`}
              className="border-ih-border-strong text-ih-ink flex h-10 flex-1 items-center justify-center rounded-md border text-[13.5px] font-medium"
            >
              Sign in
            </Link>
            <Link
              href={`/quote`}
              className="bg-ih-accent text-ih-accent-fg flex h-10 flex-1 items-center justify-center rounded-md text-[13.5px] font-medium"
            >
              Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
