import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * The directory profile header (boards 12 and 129): crumb, the record title in Instrument Serif, a meta line, the
 * actions (one primary) and the KPI figures on the right. Bespoke to the directory (T2-like, no stage track).
 */
export interface ProfileKpi {
  label: string
  value: string
}

export default function ProfileHeader({
  crumb,
  title,
  meta,
  chips,
  actions,
  kpis,
  below,
}: {
  crumb: { label: string; href: string }
  title: string
  meta: ReactNode
  chips?: ReactNode
  actions: ReactNode
  kpis?: readonly ProfileKpi[]
  below?: ReactNode
}) {
  return (
    <header
      className="border-io-line bg-io-card border-b px-7 pt-5 pb-5"
      data-part="profile-header"
    >
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="text-io-ink-3 text-[12px]">
          <Link href={crumb.href as Route} className="io-focus rounded-io-tag hover:text-io-ink">
            {crumb.label}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{title}</span>
        </nav>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="io-display text-io-record m-0">{title}</h1>
            {chips}
          </div>
          <p className="text-io-ink-2 m-0 mt-1.5 text-[12.5px]">{meta}</p>
        </div>
        {kpis?.length ? (
          <dl className="m-0 flex flex-none items-end gap-7" aria-label="Figures">
            {kpis.map((k) => (
              <div key={k.label} className="flex flex-col items-end gap-0.5">
                <dt className="text-io-ink-3 text-[11.5px]">{k.label}</dt>
                <dd className="text-io-kpi m-0 font-medium">{k.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {below}
    </header>
  )
}
