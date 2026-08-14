import Link from 'next/link'
import type { ResolvedNavItem } from '@indus/domain'
import { getNavMenu } from '../lib/navigation'
import { getStoreSettings, type ResolvedStoreSettings } from '../lib/store-settings'

export default async function SiteFooter() {
  const [main, legal, settings] = await Promise.all([
    getNavMenu('footer_main'),
    getNavMenu('footer_legal'),
    getStoreSettings(),
  ])

  const cmsColumns = main?.items ?? []
  const legalLinks = legal?.items ?? []
  const year = new Date().getFullYear()

  // Adaptive grid: Brand + N CMS columns + Contact. The number of CMS columns is
  // editor-controlled, so we compute gridTemplateColumns at render time. This is
  // the single inline-style exception in this file (CLAUDE.md §2.1) — Tailwind
  // can't express a runtime-N column template in pure utilities.
  const gridStyle = {
    gridTemplateColumns: `auto repeat(${cmsColumns.length}, minmax(0,1fr)) auto`,
  } as const

  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-surface)] mt-auto">
      <div className="max-w-[1360px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 md:grid gap-10" style={gridStyle}>
          <BrandBlock settings={settings} />
          {cmsColumns.map((column) => (
            <FooterColumn key={column.id} column={column} />
          ))}
          <ContactBlock settings={settings} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-10 pt-8 border-t border-[oklch(0.25_0_0)]">
          <p className="font-mono text-[11px] text-[oklch(0.45_0_0)]">
            © {year} {settings.name} Pvt. Ltd. All rights reserved.
          </p>
          {legalLinks.length > 0 && (
            <div className="flex gap-6 font-mono text-[11px] text-[oklch(0.5_0_0)]">
              {legalLinks.map((link) =>
                link.href ? (
                  <Link
                    key={link.id}
                    href={link.href}
                    target={link.openInNewTab ? '_blank' : undefined}
                    rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

function BrandBlock({ settings }: { settings: ResolvedStoreSettings }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {settings.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logoUrl} alt={`${settings.name} logo`} className="w-8 h-8 object-contain" />
        ) : (
          <div className="w-8 h-8 bg-[var(--color-accent)] grid place-items-center">
            <span className="text-white font-bold text-sm font-mono">IH</span>
          </div>
        )}
        <span className="font-semibold text-sm text-white">{settings.name}</span>
      </div>
      {settings.tagline && (
        <p className="text-[13px] text-[oklch(0.7_0_0)] leading-relaxed">{settings.tagline}</p>
      )}
      {settings.certificationLine && (
        <p className="font-mono text-[11px] text-[oklch(0.6_0_0)] mt-4">{settings.certificationLine}</p>
      )}
    </div>
  )
}

function FooterColumn({ column }: { column: ResolvedNavItem }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
        {column.label}
      </h3>
      <ul className="flex flex-col gap-2 text-[13px] text-[oklch(0.75_0_0)]">
        {column.children.map((item) =>
          item.href ? (
            <li key={item.id}>
              <Link
                href={item.href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  )
}

function ContactBlock({ settings }: { settings: ResolvedStoreSettings }) {
  const hasContact =
    settings.contactPhone || settings.contactEmail || settings.contactHours || settings.contactLocationLabel
  if (!hasContact) return <div />
  return (
    <div>
      <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">Contact</h3>
      <div className="flex flex-col gap-3 text-[13px] text-[oklch(0.75_0_0)]">
        {(settings.contactLocationLabel || settings.contactPhone || settings.contactEmail) && (
          <div>
            {settings.contactLocationLabel && (
              <div className="font-mono text-[10px] text-[oklch(0.5_0_0)] uppercase mb-0.5">
                {settings.contactLocationLabel}
              </div>
            )}
            {settings.contactPhone && <div>{settings.contactPhone}</div>}
            {settings.contactEmail && <div>{settings.contactEmail}</div>}
          </div>
        )}
        {settings.contactHours && (
          <div>
            <div className="font-mono text-[10px] text-[oklch(0.5_0_0)] uppercase mb-0.5">Hours</div>
            <div>{settings.contactHours}</div>
          </div>
        )}
      </div>
    </div>
  )
}
