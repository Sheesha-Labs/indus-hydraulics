import type { ServiceCaseCategory } from '@indus/db'
import ServicesTopicRail from './ServicesTopicRail'
import FeaturedCase from './FeaturedCase'
import ServiceCaseCard from './ServiceCaseCard'
import { filterServiceCases, sortServiceCases } from '../../lib/service-case-browse'
import type { ServiceCaseSort } from '../../lib/service-case-params'
import type { ServiceCaseListItem } from '../../lib/service-cases'

export type ServicesCaseListProps = {
  cases: ServiceCaseListItem[]
  featured: ServiceCaseListItem | null
  totalCount: number
  perCategory: Record<string, number>
  chipOrder: ServiceCaseCategory[]
  emptyMessage: string
}

/**
 * The chips, the sort control, the featured case and the grid.
 *
 * Takes the active category and sort as plain props rather than reading them
 * anywhere, so it renders identically on the server and in the browser. That
 * is what makes /services cacheable AND keeps every case in the prerendered
 * HTML: the server renders this with the defaults, and the client re-renders
 * it with whatever the query string says once React takes over.
 */
export default function ServicesCaseList({
  cases,
  featured,
  totalCount,
  perCategory,
  chipOrder,
  emptyMessage,
  category,
  sort,
}: ServicesCaseListProps & {
  category: ServiceCaseCategory | null
  sort: ServiceCaseSort
}) {
  const visible = sortServiceCases(filterServiceCases(cases, category), sort)

  // Featured sits above the grid on the unfiltered view only, and is dropped
  // from the grid there so it cannot appear twice.
  const showFeatured = !category && featured !== null
  const gridCases = showFeatured ? visible.filter((c) => c.id !== featured.id) : visible

  return (
    <>
      <ServicesTopicRail
        totalCount={totalCount}
        perCategory={perCategory}
        activeCategory={category}
        activeSort={sort}
        chipOrder={chipOrder}
      />
      {showFeatured ? <FeaturedCase case={featured} /> : null}
      {gridCases.length > 0 ? (
        <section className="grid grid-cols-1 gap-7 py-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
          {gridCases.map((c) => (
            <ServiceCaseCard key={c.id} case={c} />
          ))}
        </section>
      ) : (
        <section className="py-16 text-center text-ih-muted">
          <p className="mono text-xs uppercase tracking-[0.1em]">{emptyMessage}</p>
        </section>
      )}
    </>
  )
}
