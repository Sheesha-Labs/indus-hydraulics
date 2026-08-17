import type { Metadata } from 'next'
import type { ServiceCaseCategory } from '@indus/db'
import { pageMetadata } from '../../../lib/seo'
import {
  categoryCounts,
  featuredServiceCase,
  listServiceCases,
  parseCategory,
  parseSort,
  topTwoStoryCases,
  totalCount,
} from '../../../lib/service-cases'
import { APPROACH_STEPS, HERO_STATS } from '../../../lib/services-config'
import ServicesHero from '../../../components/services/ServicesHero'
import ServicesTopicRail from '../../../components/services/ServicesTopicRail'
import FeaturedCase from '../../../components/services/FeaturedCase'
import ServiceCaseCard from '../../../components/services/ServiceCaseCard'
import ApproachSteps from '../../../components/services/ApproachSteps'
import StoryCard from '../../../components/services/StoryCard'
import ServicesCta from '../../../components/services/ServicesCta'
import { buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { getStoreSettings } from '../../../lib/store-settings'

type Props = {
  searchParams: Promise<{
    category?: string
    sort?: string
  }>
}

// Order of chips on the topic rail. Matches the breadth of services Indus
// covers in the GCC; categories with 0 published cases are still shown so
// the taxonomy is visible.
const CHIP_ORDER: ServiceCaseCategory[] = [
  'cylinders',
  'hoses',
  'pumps',
  'valves_manifolds',
  'bop_pressure_control',
  'ct_wireline',
  'wellhead',
  'field_service',
  'lab_forensics',
  'custom_builds',
]

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Services & case studies — Indus Hydraulics',
    description:
      'Cylinder, hose, pump, BOP and wellhead service jobs run out of our Jebel Ali yard — written as case studies, with photos, measurements, and what it actually cost.',
    path: '/services',
  })
}

export default async function ServicesIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const category = parseCategory(sp.category)
  const sort = parseSort(sp.sort)

  const [featured, total, perCategory, allCases, twoUp, settings] = await Promise.all([
    // Featured only renders when no filter is applied (matches the mock —
    // the "Case of the Week" sits at the top of the unfiltered view).
    !category ? featuredServiceCase() : Promise.resolve(null),
    totalCount(),
    categoryCounts(),
    listServiceCases({ category, sort, limit: 30 }),
    // Two-up at the bottom always renders the latest 2 stories irrespective
    // of filter — no point hiding them.
    topTwoStoryCases(),
    getStoreSettings(),
  ])

  // When a featured case is shown above the grid, drop it from the grid so
  // it doesn't appear twice on the unfiltered view.
  const gridCases = featured ? allCases.filter((c) => c.id !== featured.id) : allCases

  return (
    <main>
      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        <ServicesHero stats={HERO_STATS} />
        <ServicesTopicRail
          totalCount={total}
          perCategory={perCategory}
          activeCategory={category}
          activeSort={sort}
          chipOrder={CHIP_ORDER}
        />

        {featured ? <FeaturedCase case={featured} /> : null}

        {gridCases.length > 0 ? (
          <section className="grid grid-cols-1 gap-7 py-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
            {gridCases.map((c) => (
              <ServiceCaseCard key={c.id} case={c} />
            ))}
          </section>
        ) : (
          <section className="py-16 text-center text-ih-muted">
            <p className="mono text-xs uppercase tracking-[0.1em]">No cases match this filter yet.</p>
          </section>
        )}

        <ApproachSteps steps={APPROACH_STEPS} />

        {twoUp.length === 2 && twoUp[0] && twoUp[1] ? (
          <section className="border-b border-ih-border py-20">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="eyebrow">LONG READS · ENGINEERS WRITING ABOUT THEIR JOBS</span>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-[36px]">
                  Two recent service stories worth your time.
                </h2>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <StoryCard case={twoUp[0]} variant="dark" />
              <StoryCard case={twoUp[1]} variant="light" />
            </div>
          </section>
        ) : null}

        <ServicesCta
          whatsappUrl={buildWhatsappHref(settings.contactPhone, 'Enquiry: service intake')}
          emailUrl={buildMailtoHref(settings.contactEmail, 'Service intake enquiry')}
        />
      </div>
    </main>
  )
}
