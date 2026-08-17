import type React from 'react'
import Link from 'next/link'
import type { ResolvedNavItem } from '@indus/domain'
import BrandLockup from './BrandLockup'
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

  // Adaptive grid: Brand + N CMS columns + Contact. The column count is
  // editor-controlled, so the template is computed at render time. It is
  // passed as a CUSTOM PROPERTY rather than as `gridTemplateColumns`
  // directly: an inline declaration applies at every width and would beat
  // the `grid-cols-1` class, forcing N+2 columns onto a 375px screen and
  // scrolling the whole page sideways. As a variable it only takes effect
  // where the md: utility below references it.
  const gridStyle = {
    '--footer-cols': `auto repeat(${cmsColumns.length}, minmax(0,1fr)) auto`,
  } as React.CSSProperties

  return (
    <footer className="mt-auto bg-ih-navy text-[oklch(0.82_0.02_250)]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pb-7 pt-16">
        <div className="grid grid-cols-1 gap-10 md:[grid-template-columns:var(--footer-cols)]" style={gridStyle}>
          <BrandBlock settings={settings} />
          {cmsColumns.map((column) => (
            <FooterColumn key={column.id} column={column} />
          ))}
          <ContactBlock settings={settings} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-10 pt-8 border-t border-ih-navy-2">
          <p className="font-mono text-[11px] text-[oklch(0.62_0.03_250)]">
            © {year} {settings.name} Pvt. Ltd. All rights reserved.
          </p>
          {legalLinks.length > 0 && (
            <div className="flex gap-6 font-mono text-[11px] text-[oklch(0.68_0.03_250)]">
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
      {/*
        `footerLogoUrl`, deliberately NOT falling back to `logoUrl`. The footer
        is the navy surface, so the file that works here is the reversed
        (light) variant of the header artwork — and a dark header lockup drawn
        on the dark footer reads as a broken image, where the built-in mark
        always reads. Operators set the two independently in
        /admin/settings?tab=brand.
      */}
      <div className="mb-4">
        <BrandLockup
          logoUrl={settings.footerLogoUrl}
          logoStyle={settings.logoStyle}
          name={settings.name}
          surface="footer"
        />
      </div>
      {settings.tagline && (
        <p className="text-[13px] leading-relaxed">{settings.tagline}</p>
      )}
      {settings.certificationLine && (
        <p className="mt-4 font-mono text-[11px] text-[oklch(0.68_0.03_250)]">{settings.certificationLine}</p>
      )}
    </div>
  )
}

function FooterColumn({ column }: { column: ResolvedNavItem }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[oklch(0.68_0.03_250)]">
        {column.label}
      </h3>
      <ul className="flex flex-col gap-2.5 text-[13px]">
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
      <h3 className="mb-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[oklch(0.68_0.03_250)]">Contact</h3>
      <div className="flex flex-col gap-3 text-[13px]">
        {(settings.contactLocationLabel || settings.contactPhone || settings.contactEmail) && (
          <div>
            {settings.contactLocationLabel && (
              <div className="mb-0.5 font-mono text-[10px] uppercase text-[oklch(0.68_0.03_250)]">
                {settings.contactLocationLabel}
              </div>
            )}
            {settings.contactPhone && <div>{settings.contactPhone}</div>}
            {settings.contactEmail && <div>{settings.contactEmail}</div>}
          </div>
        )}
        {settings.contactHours && (
          <div>
            <div className="mb-0.5 font-mono text-[10px] uppercase text-[oklch(0.68_0.03_250)]">Hours</div>
            <div>{settings.contactHours}</div>
          </div>
        )}
      </div>
    </div>
  )
}
