import Link from 'next/link'
import type { ServiceCaseCategory } from '@indus/db'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'
import ServicesSortDropdown from './ServicesSortDropdown'
import type { ServiceCaseSort } from '../../lib/service-case-params'

type Props = {
  totalCount: number
  perCategory: Record<string, number>
  activeCategory: ServiceCaseCategory | null
  activeSort: ServiceCaseSort
  /**
   * Subset of category enum values to surface as chips. Order is honoured.
   * Categories with 0 published cases are still shown (with count 0) so the
   * taxonomy is visible — buyers know what's coming.
   */
  chipOrder: ServiceCaseCategory[]
}

export default function ServicesTopicRail({
  totalCount,
  perCategory,
  activeCategory,
  activeSort,
  chipOrder,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-ih-border py-4">
      <div className="flex flex-wrap gap-2">
        <Chip
          href={paramsHref({})}
          active={activeCategory === null}
          label="All services"
          count={totalCount}
        />
        {chipOrder.map((cat) => (
          <Chip
            key={cat}
            href={paramsHref({ category: cat })}
            active={activeCategory === cat}
            label={SERVICE_CASE_CATEGORY_LABELS[cat] ?? cat}
            count={perCategory[cat] ?? 0}
          />
        ))}
      </div>
      <ServicesSortDropdown activeSort={activeSort} activeCategory={activeCategory} />
    </div>
  )
}

function Chip({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count: number
}) {
  const cls = active
    ? 'border-ih-ink bg-ih-navy text-white'
    : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent'
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-[40px] border px-3.5 py-2 text-[13px] font-medium ${cls}`}
    >
      {label}
      <span className="mono text-[10.5px] opacity-60">{count}</span>
    </Link>
  )
}

function paramsHref(args: { category?: ServiceCaseCategory; sort?: ServiceCaseSort }): string {
  const sp = new URLSearchParams()
  if (args.category) sp.set('category', args.category)
  if (args.sort && args.sort !== 'recent') sp.set('sort', args.sort)
  const qs = sp.toString()
  return qs ? `/services?${qs}` : '/services'
}
