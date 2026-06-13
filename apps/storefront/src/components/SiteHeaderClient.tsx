'use client'

import { useState, useRef, useCallback } from 'react'
import type React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ResolvedNavItem } from '@indus/domain'
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
    <header className="sticky top-0 z-50 bg-[var(--color-elevated)]/65 backdrop-blur-lg backdrop-saturate-150 border-b border-[var(--color-border)]">
      {/* Utility bar */}
      <div className="bg-[var(--color-primary)] text-[var(--color-surface)]">
        <div className="max-w-[1360px] mx-auto px-8 h-9 flex items-center justify-between font-mono text-[11px] tracking-[0.04em]">
          <div className="flex gap-6 opacity-85">
            {contactPhone && <span>{contactPhone}</span>}
            {contactHours && <span>{contactHours}</span>}
          </div>
          <div className="flex gap-4 opacity-85">
            {isSignedIn ? (
              <Link href={`/account`} className="hover:text-[var(--color-accent)]">
                My account
              </Link>
            ) : (
              <Link href={`/sign-in`} className="hover:text-[var(--color-accent)]">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="max-w-[1360px] mx-auto px-8 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href={`/`} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[var(--color-primary)] grid place-items-center shrink-0">
            <span className="text-white font-bold text-sm font-mono">IH</span>
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Indus Hydraulics</div>
            <div className="font-mono text-[9px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
              Industrial Components Co.
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center flex-1">
          {headerItems.map((item) => {
            const href = item.href ?? '#'
            const kind = getDropdownKind(item, megamenuItems, brands, industries)
            if (kind !== null) {
              const isOpen = activeDropdown === kind
              return (
                <div key={item.id} onMouseEnter={() => openDropdown(kind)} onMouseLeave={closeDropdown}>
                  <Link
                    href={href}
                    className={`flex items-center gap-1 px-3 h-16 text-[14px] font-medium transition-colors ${
                      isOpen
                        ? 'text-[var(--color-primary)] bg-[var(--color-deep)]'
                        : 'text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-deep)]'
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
                className="px-3 h-16 flex items-center text-[14px] text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
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
            className="relative flex items-center justify-center h-9 w-9 border border-[var(--color-border)] hover:bg-[var(--color-deep)] transition-colors"
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
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 bg-[var(--color-primary)] text-[var(--color-elevated)] text-[13px] font-medium hover:bg-[var(--color-body)] transition-colors"
            >
              <div className="w-5 h-5 bg-[var(--color-accent)] grid place-items-center text-white text-[9px] font-bold shrink-0">
                {(userName ?? 'U').charAt(0).toUpperCase()}
              </div>
              My account
            </Link>
          ) : (
            <Link
              href={`/sign-in`}
              className="hidden sm:flex h-9 px-4 items-center border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-deep)] hover:text-[var(--color-primary)] transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center h-9 w-9 border border-[var(--color-border)]"
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
          className="absolute left-0 right-0 bg-[var(--color-elevated)] border-t border-[var(--color-border)]"
          style={{ top: '100%', boxShadow: '0 24px 64px rgba(33,28,16,0.12)', zIndex: 50 }}
          onMouseEnter={() => openDropdown('mega')}
          onMouseLeave={closeDropdown}
          role="menu"
        >
          <div className="max-w-[1360px] mx-auto px-8">
            <div className="grid grid-cols-[360px_420px_1fr] min-h-[420px]">
              {/* ── Column 1: Top-level categories ── */}
              <div className="py-7 pr-0 border-r border-[var(--color-border-2)]">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
                  Categories
                </div>
                <div className="flex flex-col">
                  {megamenuItems.map((cat, i) => (
                    <Link
                      key={cat.id}
                      href={cat.href ?? '#'}
                      role="menuitem"
                      className={`flex justify-between items-center px-3 py-2.5 border-l-2 transition-colors text-[14px] ${
                        i === activeCatIdx
                          ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-primary)] font-medium'
                          : 'border-transparent text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
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
              <div className="py-7 px-6 border-r border-[var(--color-border-2)]">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3 whitespace-nowrap">
                  {activeCat?.label}
                </div>
                <div className="flex flex-col">
                  {(activeCat?.children ?? []).map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={sub.href ?? '#'}
                      role="menuitem"
                      className={`flex justify-between items-center px-3 py-2.5 border-l-2 transition-colors text-[14px] ${
                        i === activeSubIdx
                          ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-primary)] font-medium'
                          : 'border-transparent text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                      onMouseEnter={() => handleSubHover(i)}
                      onClick={closeDropdownImmediate}
                    >
                      <span>{sub.label}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)]">›</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 3: Leaf items ── */}
              <div className="py-7 px-6 flex flex-col">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
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
                      className="flex justify-between items-center px-3 py-2.5 border-l-2 border-transparent text-[14px] text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
                      onClick={closeDropdownImmediate}
                    >
                      <span>{leaf.label}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)]">›</span>
                    </Link>
                  ))}
                </div>

                {/* Promo tile (if column has one) */}
                {activeCat?.promoImageUrl ? (
                  <Link
                    href={activeCat.promoLinkUrl ?? browseAllHref}
                    onClick={closeDropdownImmediate}
                    className="mt-4 block bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
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
                        <div className="text-[13px] font-medium text-[var(--color-primary)]">
                          {activeCat.promoHeading}
                        </div>
                      ) : null}
                      {activeCat.promoBody ? (
                        <div className="text-[12px] text-[var(--color-muted)] mt-1">{activeCat.promoBody}</div>
                      ) : null}
                    </div>
                  </Link>
                ) : null}

                {/* Browse all CTA */}
                <div className="mt-auto pt-4">
                  <Link
                    href={browseAllHref}
                    className="flex items-center justify-between gap-2 h-10 px-4 border border-[var(--color-border)] text-[13px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
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
        <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-elevated)]">
          {headerItems.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? '#'}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
              className="flex items-center px-8 h-12 text-[14px] text-[var(--color-body)] border-b border-[var(--color-border)] hover:bg-[var(--color-deep)]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {megamenuItems.length > 0 ? (
            <div className="px-8 py-4 border-b border-[var(--color-border)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-3">Categories</p>
              <div className="flex flex-col gap-0.5">
                {megamenuItems.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href ?? '#'}
                    className="flex justify-between items-center py-2 text-[13px] text-[var(--color-body)] hover:text-[var(--color-accent)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {brands.length > 0 ? (
            <div className="px-8 py-4 border-b border-[var(--color-border)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-3">Brands</p>
              <div className="flex flex-col gap-0.5">
                {brands.slice(0, MOBILE_LIST_LIMIT).map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="flex justify-between items-center py-2 text-[13px] text-[var(--color-body)] hover:text-[var(--color-accent)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{b.name}</span>
                    <span className="font-mono text-[10px] text-[var(--color-caption)]">›</span>
                  </Link>
                ))}
                <Link
                  href="/brands"
                  className="flex justify-between items-center py-2 text-[13px] font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all brands</span>
                  <span className="font-mono text-[10px] text-[var(--color-caption)]">→</span>
                </Link>
              </div>
            </div>
          ) : null}

          {industries.length > 0 ? (
            <div className="px-8 py-4 border-b border-[var(--color-border)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-3">Industries</p>
              <div className="flex flex-col gap-0.5">
                {industries.slice(0, MOBILE_LIST_LIMIT).map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/industries/${ind.slug}`}
                    className="flex justify-between items-center py-2 text-[13px] text-[var(--color-body)] hover:text-[var(--color-accent)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{ind.name}</span>
                    <span className="font-mono text-[10px] text-[var(--color-caption)]">›</span>
                  </Link>
                ))}
                <Link
                  href="/industries"
                  className="flex justify-between items-center py-2 text-[13px] font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>View all industries</span>
                  <span className="font-mono text-[10px] text-[var(--color-caption)]">→</span>
                </Link>
              </div>
            </div>
          ) : null}

          <div className="px-8 py-4 flex gap-3">
            <Link
              href={`/sign-in`}
              className="flex-1 h-10 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium"
            >
              Sign in
            </Link>
            <Link
              href={`/quote`}
              className="flex-1 h-10 flex items-center justify-center bg-[var(--color-accent)] text-white text-[13px] font-medium"
            >
              Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
