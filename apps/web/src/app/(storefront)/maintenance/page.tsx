import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Down for Maintenance' }

export default function MaintenancePage() {
  // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
  const year = new Date().getFullYear()
  return (
    <div className="bg-ih-bg flex min-h-screen flex-col items-center justify-center px-8 py-20 text-center">
      <div className="max-w-[560px]">
        {/* Logo */}
        <div className="mb-12 flex items-center justify-center gap-2.5">
          <div className="bg-ih-navy grid h-10 w-10 place-items-center">
            <span className="font-mono text-sm font-bold text-white">IH</span>
          </div>
          <div className="text-left">
            <div className="text-base leading-tight font-semibold">Indus Hydraulics</div>
            <div className="text-ih-muted font-mono text-[10px] tracking-[0.12em] uppercase">
              Industrial Components
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="bg-ih-warning h-2 w-2 animate-pulse rounded-full" />
          <span className="text-ih-muted font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
            Scheduled Maintenance
          </span>
        </div>

        <h1 className="mb-4 text-[32px] font-semibold tracking-tight">
          We&apos;ll be back shortly
        </h1>
        <p className="text-ih-muted mb-8 text-[14px] leading-[1.7]">
          The Indus Hydraulics catalogue is undergoing scheduled maintenance. We expect to be back
          online within a few hours. Thank you for your patience.
        </p>

        {/* Contact options */}
        <div className="border-ih-border bg-ih-surface mb-8 border p-6 text-left">
          <p className="text-ih-muted mb-4 font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
            Need immediate assistance?
          </p>
          <div className="space-y-3">
            {[
              // Hardcoded — this page renders when the DB is unavailable,
              // so we can't read StoreSettings here. Keep these in sync
              // with StoreSettings.contactPhone / contactEmail / contactHours.
              { label: 'Phone', value: '+971 52 2477942', href: 'tel:+971522477942' },
              {
                label: 'Email',
                value: 'sales@indushydraulics.me',
                href: 'mailto:sales@indushydraulics.me',
              },
              { label: 'Hours', value: 'Mon–Fri 09:00–18:00 GST', href: null },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-ih-muted w-16 shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase">
                  {item.label}
                </span>
                {item.href ? (
                  <Link href={item.href} className="text-ih-accent text-[13px] hover:underline">
                    {item.value}
                  </Link>
                ) : (
                  <span className="text-ih-ink-2 text-[13px]">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-ih-muted-2 font-mono text-[11px]">
          © {year} Indus Hydraulics. All rights reserved.
        </p>
      </div>
    </div>
  )
}
