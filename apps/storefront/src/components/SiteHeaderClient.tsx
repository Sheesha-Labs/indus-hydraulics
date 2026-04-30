'use client'

import { useTranslations } from 'next-intl'
import { useState, useRef, useCallback } from 'react'
import type React from 'react'
import Link from 'next/link'
import type { CategoryNav } from './SiteHeader'

interface NavItem {
  label: string
  href: string
  hasMegamenu: boolean
}

interface Props {
  locale: string
  navItems: NavItem[]
  navCategories: CategoryNav[]
  isSignedIn: boolean
  userName: string | null
  notificationBell?: React.ReactNode
  activeSkuCount?: number
}

type Sub = { id: string; name: string; count: number; leaves: string[] }
type TaxonomyEntry = { slug: string; name: string; fallbackCount: number; subs: Sub[] }

const TAXONOMY: TaxonomyEntry[] = [
  {
    slug: 'hydraulic-pumps',
    name: 'Hydraulic Pumps',
    fallbackCount: 184,
    subs: [
      { id: 'gear', name: 'Gear Pumps', count: 42, leaves: ['External Gear', 'Internal Gear', 'Gerotor', 'Twin-Flow'] },
      { id: 'vane', name: 'Vane Pumps', count: 28, leaves: ['Fixed Displacement', 'Variable Displacement', 'Cartridge Type'] },
      { id: 'piston', name: 'Piston Pumps', count: 56, leaves: ['Axial Piston', 'Radial Piston', 'Bent Axis', 'Swashplate Variable'] },
      { id: 'hand', name: 'Hand & Foot Pumps', count: 18, leaves: ['Single-Acting', 'Double-Acting', 'Air-Driven'] },
      { id: 'power', name: 'Power Packs', count: 40, leaves: ['Mini Power Packs', 'AC Power Units', 'DC Power Units', '3-Phase'] },
    ],
  },
  {
    slug: 'hydraulic-cylinders',
    name: 'Hydraulic Cylinders',
    fallbackCount: 226,
    subs: [
      { id: 'tie-rod', name: 'Tie-Rod Cylinders', count: 64, leaves: ['NFPA Standard', 'ISO 6020', 'ISO 6022', 'Mill-Type'] },
      { id: 'welded', name: 'Welded Cylinders', count: 58, leaves: ['Cross-Tube Mount', 'Clevis Mount', 'Trunnion Mount'] },
      { id: 'telescopic', name: 'Telescopic Cylinders', count: 32, leaves: ['Single-Acting', 'Double-Acting', 'Tipper Trailer'] },
      { id: 'compact', name: 'Compact & Block', count: 40, leaves: ['Block Cylinders', 'Pancake', 'Hollow Plunger'] },
      { id: 'custom', name: 'Custom Builds', count: 32, leaves: ['Made-to-Order', 'Repair & Reseal', 'Plating Service'] },
    ],
  },
  {
    slug: 'valves-manifolds',
    name: 'Valves & Manifolds',
    fallbackCount: 412,
    subs: [
      { id: 'directional', name: 'Directional Control', count: 124, leaves: ['Solenoid Operated', 'Manual Lever', 'Pilot Operated', 'Cetop 3 / NG6', 'Cetop 5 / NG10'] },
      { id: 'pressure', name: 'Pressure Control', count: 86, leaves: ['Relief', 'Reducing', 'Sequence', 'Counterbalance'] },
      { id: 'flow', name: 'Flow Control', count: 64, leaves: ['Throttle', 'Pressure Compensated', 'Proportional'] },
      { id: 'check', name: 'Check & Logic', count: 70, leaves: ['Inline Check', 'Pilot Check', 'Logic Elements'] },
      { id: 'manifolds', name: 'Manifolds', count: 68, leaves: ['Standard Bar', 'Custom Block', 'Subplates'] },
    ],
  },
  {
    slug: 'hoses-fittings',
    name: 'Hoses & Fittings',
    fallbackCount: 540,
    subs: [
      { id: 'hose', name: 'Hydraulic Hose', count: 180, leaves: ['1-Wire Braid', '2-Wire Braid', '4-Spiral', '6-Spiral', 'Thermoplastic'] },
      { id: 'fittings', name: 'Hose Fittings', count: 220, leaves: ['BSP', 'JIC 37°', 'ORFS', 'Metric DIN', 'NPT'] },
      { id: 'adapters', name: 'Adapters', count: 90, leaves: ['Straight', 'Elbow 45°', 'Elbow 90°', 'Tee', 'Cross'] },
      { id: 'couplers', name: 'Quick Couplers', count: 50, leaves: ['ISO 7241-A', 'ISO 7241-B', 'Flat Face', 'Screw-to-Connect'] },
    ],
  },
  {
    slug: 'seals-components',
    name: 'Seals & Components',
    fallbackCount: 320,
    subs: [
      { id: 'rod-seals', name: 'Rod Seals', count: 90, leaves: ['U-Cup', 'Step Seal', 'Stepped Cap', 'Buffer Seal'] },
      { id: 'piston-seals', name: 'Piston Seals', count: 80, leaves: ['Twin-Lip', 'Glyd Ring', 'Compact'] },
      { id: 'wipers', name: 'Wipers & Scrapers', count: 50, leaves: ['Single-Lip', 'Double-Lip', 'Metallic'] },
      { id: 'orings', name: 'O-Rings & Back-up', count: 100, leaves: ['NBR', 'FKM (Viton)', 'EPDM', 'PTFE Back-up'] },
    ],
  },
  {
    slug: 'accessories-instrumentation',
    name: 'Accessories & Instrumentation',
    fallbackCount: 188,
    subs: [
      { id: 'filters', name: 'Filters', count: 60, leaves: ['Suction', 'Pressure-Line', 'Return-Line', 'Tank Breather'] },
      { id: 'gauges', name: 'Gauges & Sensors', count: 48, leaves: ['Bourdon Gauge', 'Glycerin-Filled', 'Digital', 'Pressure Transducer'] },
      { id: 'accumulators', name: 'Accumulators', count: 30, leaves: ['Bladder', 'Diaphragm', 'Piston'] },
      { id: 'coolers', name: 'Coolers', count: 28, leaves: ['Air-Oil', 'Water-Oil', 'With Bypass'] },
      { id: 'reservoirs', name: 'Reservoirs', count: 22, leaves: ['Steel Tanks', 'Aluminum', 'Custom Fab'] },
    ],
  },
]

export default function SiteHeaderClient({
  locale,
  navItems,
  navCategories,
  isSignedIn,
  userName,
  notificationBell,
  activeSkuCount,
}: Props) {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megamenuOpen, setMegamenuOpen] = useState(false)
  const [activeCatIdx, setActiveCatIdx] = useState(0)
  const [activeSubIdx, setActiveSubIdx] = useState(0)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const altLocale = locale === 'en' ? 'ar' : 'en'

  const openMega = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setMegamenuOpen(true)
  }, [])

  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegamenuOpen(false), 120)
  }, [])

  const closeMegaImmediate = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setMegamenuOpen(false)
  }, [])

  const handleCatHover = useCallback((idx: number) => {
    setActiveCatIdx(idx)
    setActiveSubIdx(0)
  }, [])

  const handleSubHover = useCallback((idx: number) => {
    setActiveSubIdx(idx)
  }, [])

  // Merge live DB counts into TAXONOMY
  const taxonomy = TAXONOMY.map((entry) => {
    const dbCat = navCategories.find(
      (c) => c.slug === entry.slug || c.name.toLowerCase() === entry.name.toLowerCase()
    )
    return { ...entry, count: dbCat?.productCount ?? entry.fallbackCount, dbSlug: dbCat?.slug ?? entry.slug }
  })

  const activeCat = taxonomy[activeCatIdx] ?? taxonomy[0]
  const activeSub = activeCat?.subs[activeSubIdx] ?? activeCat?.subs[0]

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-elevated)] border-b border-[var(--color-border)]">
      {/* Utility bar */}
      <div className="bg-[var(--color-primary)] text-[var(--color-surface)]">
        <div className="max-w-[1360px] mx-auto px-8 h-9 flex items-center justify-between font-mono text-[11px] tracking-[0.04em]">
          <div className="flex gap-6 opacity-85">
            <span>+91 22 6614 0200</span>
            <span>Mon–Sat 09:00–19:00 IST</span>
          </div>
          <div className="flex gap-4 opacity-85">
            <Link href={`/${altLocale}`} className="hover:text-[var(--color-accent)]">
              {altLocale === 'ar' ? 'العربية' : 'English'}
            </Link>
            {isSignedIn ? (
              <Link href={`/${locale}/account`} className="hover:text-[var(--color-accent)]">
                {t('myAccount')}
              </Link>
            ) : (
              <Link href={`/${locale}/sign-in`} className="hover:text-[var(--color-accent)]">
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="max-w-[1360px] mx-auto px-8 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
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
          {navItems.map((item) =>
            item.hasMegamenu ? (
              <div
                key={item.href}
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3 h-16 text-[14px] font-medium transition-colors ${
                    megamenuOpen
                      ? 'text-[var(--color-primary)] bg-[var(--color-deep)]'
                      : 'text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-deep)]'
                  }`}
                  aria-haspopup="true"
                  aria-expanded={megamenuOpen}
                >
                  {item.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transition-transform duration-150 ${megamenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Link>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 h-16 flex items-center text-[14px] text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search bar */}
          <Link
            href={`/${locale}/search`}
            className="hidden sm:flex items-center gap-2 h-9 px-3 border border-[var(--color-border)] text-[13px] text-[var(--color-muted)] hover:border-[var(--color-body)] transition-colors"
            style={{ minWidth: '240px' }}
            aria-label={t('search')}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" />
            </svg>
            <span className="flex-1 text-[var(--color-caption)] truncate">
              {activeSkuCount ? `Search ${activeSkuCount.toLocaleString()}+ SKUs, brands, datasheets…` : 'Search SKUs, brands, datasheets…'}
            </span>
            <span className="font-mono text-[10px] text-[var(--color-caption)] border border-[var(--color-border)] px-1 shrink-0">⌘K</span>
          </Link>

          {/* Notification bell */}
          {notificationBell}

          {/* Quote basket */}
          <Link
            href={`/${locale}/quote`}
            className="relative flex items-center justify-center h-9 w-9 border border-[var(--color-border)] hover:bg-[var(--color-deep)] transition-colors"
            aria-label={t('quote')}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="4" y="3" width="12" height="14" rx="1" />
              <path d="M7 7h6M7 10h6M7 13h4" />
            </svg>
          </Link>

          {/* Account */}
          {isSignedIn ? (
            <Link
              href={`/${locale}/account`}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 bg-[var(--color-primary)] text-[var(--color-elevated)] text-[13px] font-medium hover:bg-[var(--color-body)] transition-colors"
            >
              <div className="w-5 h-5 bg-[var(--color-accent)] grid place-items-center text-white text-[9px] font-bold shrink-0">
                {(userName ?? 'U').charAt(0).toUpperCase()}
              </div>
              {t('myAccount')}
            </Link>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="hidden sm:flex h-9 px-4 items-center bg-[var(--color-primary)] text-[var(--color-elevated)] text-[13px] font-medium hover:bg-[var(--color-body)] transition-colors"
            >
              {t('signIn')}
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
      {megamenuOpen && (
        <div
          className="absolute left-0 right-0 bg-[var(--color-elevated)] border-t border-[var(--color-border)]"
          style={{ top: '100%', boxShadow: '0 24px 64px rgba(33,28,16,0.12)', zIndex: 50 }}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          role="menu"
        >
          <div className="max-w-[1360px] mx-auto px-8">
            <div
              className="grid"
              style={{ gridTemplateColumns: '280px 320px 1fr', minHeight: '420px' }}
            >
              {/* ── Column 1: Top-level categories ── */}
              <div className="py-7 pr-0 border-r border-[var(--color-border-2)]">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3 flex justify-between items-center">
                  <span>Categories</span>
                  <span className="font-normal">{taxonomy.length}</span>
                </div>
                <div className="flex flex-col">
                  {taxonomy.map((cat, i) => (
                    <Link
                      key={cat.slug}
                      href={`/${locale}/c/${cat.dbSlug}`}
                      role="menuitem"
                      className={`flex justify-between items-center px-3 py-2.5 border-l-2 transition-colors text-[14px] ${
                        i === activeCatIdx
                          ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-primary)] font-medium'
                          : 'border-transparent text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                      onMouseEnter={() => handleCatHover(i)}
                      onClick={closeMegaImmediate}
                    >
                      <span>{cat.name}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)]">{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 2: Sub-categories ── */}
              <div className="py-7 px-6 border-r border-[var(--color-border-2)]">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
                  {activeCat?.name}
                </div>
                <div className="flex flex-col">
                  {(activeCat?.subs ?? []).map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={`/${locale}/c/${activeCat?.dbSlug}?sub=${sub.id}`}
                      role="menuitem"
                      className={`flex justify-between items-center px-3 py-2.5 border-l-2 transition-colors text-[14px] ${
                        i === activeSubIdx
                          ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-primary)] font-medium'
                          : 'border-transparent text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                      onMouseEnter={() => handleSubHover(i)}
                      onClick={closeMegaImmediate}
                    >
                      <span>{sub.name}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)]">›</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Column 3: Leaf items ── */}
              <div className="py-7 px-6 flex flex-col">
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3">
                  {activeSub?.name}
                </div>
                <div className="flex flex-col flex-1">
                  {(activeSub?.leaves ?? []).map((leaf) => (
                    <Link
                      key={leaf}
                      href={`/${locale}/c/${activeCat?.dbSlug}?sub=${activeSub?.id}&type=${encodeURIComponent(leaf)}`}
                      role="menuitem"
                      className="flex justify-between items-center px-3 py-2.5 border-l-2 border-transparent text-[14px] text-[var(--color-body)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
                      onClick={closeMegaImmediate}
                    >
                      <span>{leaf}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)]">›</span>
                    </Link>
                  ))}
                </div>

                {/* Browse all CTA */}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/${locale}/c/${activeCat?.dbSlug}`}
                    className="flex items-center justify-between gap-2 h-10 px-4 border border-[var(--color-border)] text-[13px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                    onClick={closeMegaImmediate}
                  >
                    <span>Browse all {activeCat?.name}</span>
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

      {/* ── Mobile nav ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-elevated)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-8 h-12 text-[14px] text-[var(--color-body)] border-b border-[var(--color-border)] hover:bg-[var(--color-deep)]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile category accordion */}
          <div className="px-8 py-4 border-b border-[var(--color-border)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-3">Categories</p>
            <div className="flex flex-col gap-0.5">
              {taxonomy.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/c/${cat.dbSlug}`}
                  className="flex justify-between items-center py-2 text-[13px] text-[var(--color-body)] hover:text-[var(--color-accent)]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{cat.name}</span>
                  <span className="font-mono text-[10px] text-[var(--color-caption)]">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="px-8 py-4 flex gap-3">
            <Link
              href={`/${locale}/sign-in`}
              className="flex-1 h-10 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium"
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/quote`}
              className="flex-1 h-10 flex items-center justify-center bg-[var(--color-accent)] text-white text-[13px] font-medium"
            >
              {t('quote')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
