import Link from 'next/link'
import type { ServiceCaseCategory } from '@indus/db'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'

type Props = {
  totalCount: number
  perCategory: Record<string, number>
  activeCategory: ServiceCaseCategory | null
  /**
   * Subset of category enum values to surface as chips. Order is honoured.
   * Categories with 0 published cases are still shown (with count 0) so the
   * taxonomy is visible — buyers know what's coming.
   */
  chipOrder: ServiceCaseCategory[]
}

/**
 * The category chips, on ONE line. Where they outrun the width they scroll
 * sideways under an edge fade rather than wrapping to a second row. There is
 * no sort control: the cases read newest first and that is the only order the
 * page offers (owner call, 2026-11-18).
 */
export default function ServicesTopicRail({
  totalCount,
  perCategory,
  activeCategory,
  chipOrder,
}: Props) {
  return (
    <nav aria-label="Service categories" className="border-ih-border border-b py-3.5">
      <ul className="-mx-1 flex flex-nowrap gap-1.5 overflow-x-auto [mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-48px),transparent_100%)] px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Chip
            href="/services"
            active={activeCategory === null}
            label="All services"
            count={totalCount}
          />
        </li>
        {chipOrder.map((cat) => (
          <li key={cat} className="shrink-0">
            <Chip
              href={`/services?category=${cat}`}
              active={activeCategory === cat}
              label={SERVICE_CASE_CATEGORY_LABELS[cat] ?? cat}
              count={perCategory[cat] ?? 0}
            />
          </li>
        ))}
        {/* Room under the fade, so the last chip can scroll fully clear of it. */}
        <li aria-hidden="true" className="w-10 shrink-0" />
      </ul>
    </nav>
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
    ? 'border-ih-navy bg-ih-navy text-white'
    : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-border-strong'
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap ${cls}`}
    >
      {label}
      <span className="text-[11.5px] tabular-nums opacity-60">{count}</span>
    </Link>
  )
}
