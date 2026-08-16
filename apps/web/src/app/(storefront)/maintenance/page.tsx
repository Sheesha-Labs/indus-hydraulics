import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Down for Maintenance' }

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-ih-bg flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="max-w-[560px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-ih-navy grid place-items-center">
            <span className="text-white font-bold font-mono text-sm">IH</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-base leading-tight">Indus Hydraulics</div>
            <div className="font-mono text-[10px] tracking-[0.12em] text-ih-muted uppercase">
              Industrial Components
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-ih-warning animate-pulse" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            Scheduled Maintenance
          </span>
        </div>

        <h1 className="text-[32px] font-semibold tracking-tight mb-4">
          We&apos;ll be back shortly
        </h1>
        <p className="text-[14px] text-ih-muted leading-[1.7] mb-8">
          The Indus Hydraulics catalogue is undergoing scheduled maintenance. We expect to be back
          online within a few hours. Thank you for your patience.
        </p>

        {/* Contact options */}
        <div className="border border-ih-border bg-ih-surface p-6 mb-8 text-left">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-4">
            Need immediate assistance?
          </p>
          <div className="space-y-3">
            {[
              // Hardcoded — this page renders when the DB is unavailable,
              // so we can't read StoreSettings here. Keep these in sync
              // with StoreSettings.contactPhone / contactEmail / contactHours.
              { label: 'Phone', value: '+971 52 2477942', href: 'tel:+971522477942' },
              { label: 'Email', value: 'sales@indushydraulics.me', href: 'mailto:sales@indushydraulics.me' },
              { label: 'Hours', value: 'Mon–Fri 09:00–18:00 GST', href: null },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted w-16 shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <Link href={item.href} className="text-[13px] text-ih-accent hover:underline">
                    {item.value}
                  </Link>
                ) : (
                  <span className="text-[13px] text-ih-ink-2">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-ih-muted-2">
          © {new Date().getFullYear()} Indus Hydraulics. All rights reserved.
        </p>
      </div>
    </div>
  )
}
