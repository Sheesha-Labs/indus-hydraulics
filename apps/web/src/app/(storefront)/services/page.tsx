import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import type { ServiceCaseCategory } from '@indus/db'
import { lines, str, visibleList } from '@indus/domain'
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
import { getMasterPageContent } from '../../../lib/page-content'
import ServicesHero from '../../../components/services/ServicesHero'
import ServicesTopicRail from '../../../components/services/ServicesTopicRail'
import FeaturedCase from '../../../components/services/FeaturedCase'
import ServiceCaseCard from '../../../components/services/ServiceCaseCard'
import ApproachSteps from '../../../components/services/ApproachSteps'
import StoryCard from '../../../components/services/StoryCard'
import ServicesCta from '../../../components/services/ServicesCta'
import { buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { getStoreSettings } from '../../../lib/store-settings'
import type { ApproachStep, HeroStat } from '../../../lib/services-config'

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

  const [featured, total, perCategory, allCases, twoUp, settings, content] = await Promise.all([
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
    // Section order, visibility and copy, edited under Pages & Blocks.
    getMasterPageContent('services'),
  ])

  // When a featured case is shown above the grid, drop it from the grid so
  // it doesn't appear twice on the unfiltered view.
  const gridCases = featured ? allCases.filter((c) => c.id !== featured.id) : allCases

  const hero = content.values('hero')
  const cases = content.values('cases')
  const approach = content.values('approach')
  const stories = content.values('stories')
  const cta = content.values('cta')

  /*
    The hero figures and the four approach steps used to be module constants in
    lib/services-config.ts. They are section values now; the components' props
    are unchanged, so the mapping happens here rather than inside them.
  */
  const heroStats: HeroStat[] = visibleList<{
    value?: string
    suffix?: string
    label?: string
  }>(hero, 'stats').map((stat) => ({
    value: stat.value ?? '',
    label: stat.label ?? '',
    ...(stat.suffix ? { smallSuffix: stat.suffix } : {}),
  }))

  const approachSteps: ApproachStep[] = visibleList<{
    name?: string
    desc?: string
    panel_tag?: string
    panel_title?: string
    panel_body?: string
    panel_deliverables?: string
  }>(approach, 'items').map((step, i) => ({
    number: `/${String(i + 1).padStart(2, '0')}`,
    title: step.name ?? '',
    body: step.desc ?? '',
    preview: {
      tagLabel: step.panel_tag ?? '',
      title: step.panel_title ?? '',
      body: step.panel_body ?? '',
      deliverables: lines(step.panel_deliverables),
      // The preview art was a caption describing a photograph nobody has
      // taken. Dropping it leaves the panel with the copy, which is what an
      // editor can actually change.
      placeholderLabel: '',
    },
  }))

  const sections: Record<string, ReactNode> = {
    hero: (
      <ServicesHero
        stats={heroStats}
        eyebrow={str(hero, 'eyebrow')}
        headingLead={str(hero, 'heading_lead')}
        headingEmphasis={str(hero, 'heading_emphasis')}
        headingTail={str(hero, 'heading_tail')}
        body={str(hero, 'body')}
        primaryLabel={str(hero, 'primary_cta_label')}
        primaryHref={str(hero, 'primary_cta_href')}
        secondaryLabel={str(hero, 'secondary_cta_label')}
        secondaryHref={str(hero, 'secondary_cta_href')}
      />
    ),

    topics: (
      <ServicesTopicRail
        totalCount={total}
        perCategory={perCategory}
        activeCategory={category}
        activeSort={sort}
        chipOrder={CHIP_ORDER}
      />
    ),

    cases: (
      <>
        {featured ? <FeaturedCase case={featured} /> : null}
        {gridCases.length > 0 ? (
          <section className="grid grid-cols-1 gap-7 py-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
            {gridCases.map((c) => (
              <ServiceCaseCard key={c.id} case={c} />
            ))}
          </section>
        ) : (
          <section className="py-16 text-center text-ih-muted">
            <p className="mono text-xs uppercase tracking-[0.1em]">{str(cases, 'empty_message')}</p>
          </section>
        )}
      </>
    ),

    approach:
      approachSteps.length > 0 ? (
        <ApproachSteps
          steps={approachSteps}
          eyebrow={str(approach, 'eyebrow')}
          heading={str(approach, 'heading')}
        />
      ) : null,

    stories:
      twoUp.length === 2 && twoUp[0] && twoUp[1] ? (
        <section className="border-b border-ih-border py-20">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="eyebrow">{str(stories, 'eyebrow')}</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-[36px]">
                {str(stories, 'heading')}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <StoryCard case={twoUp[0]} variant="dark" />
            <StoryCard case={twoUp[1]} variant="light" />
          </div>
        </section>
      ) : null,

    cta: (
      <ServicesCta
        whatsappUrl={buildWhatsappHref(settings.contactPhone, 'Enquiry: service intake')}
        emailUrl={buildMailtoHref(settings.contactEmail, 'Service intake enquiry')}
        eyebrow={str(cta, 'eyebrow')}
        byline={str(cta, 'byline')}
        heading={str(cta, 'heading')}
        body={str(cta, 'body')}
        primaryLabel={str(cta, 'primary_cta_label')}
        whatsappLabel={str(cta, 'whatsapp_cta_label')}
        emailLabel={str(cta, 'email_cta_label')}
      />
    ),
  }

  return (
    <main>
      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        {content.order.map((key) =>
          sections[key] ? <Fragment key={key}>{sections[key]}</Fragment> : null,
        )}
      </div>
    </main>
  )
}
