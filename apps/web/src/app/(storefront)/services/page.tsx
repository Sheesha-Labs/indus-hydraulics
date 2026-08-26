import type { Metadata } from 'next'
import { Fragment, Suspense, type ReactNode } from 'react'
import type { ServiceCaseCategory } from '@indus/db'
import Link from 'next/link'
import { MANUFACTURING_PAGE, QUALITY_CONTROL_PAGE, lines, str, visibleList } from '@indus/domain'
import { pageMetadata } from '../../../lib/seo'
import {
  categoryCounts,
  featuredServiceCase,
  listServiceCases,
  topTwoStoryCases,
  totalCount,
} from '../../../lib/service-cases'
import { getMasterPageContent } from '../../../lib/page-content'
import ServicesHero from '../../../components/services/ServicesHero'
import ServicesCaseBrowser from '../../../components/services/ServicesCaseBrowser'
import ServicesCaseList from '../../../components/services/ServicesCaseList'
import ApproachSteps from '../../../components/services/ApproachSteps'
import StoryCard from '../../../components/services/StoryCard'
import ServicesCta from '../../../components/services/ServicesCta'
import { buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { getStoreSettings } from '../../../lib/store-settings'
import type { ApproachStep, HeroStat } from '../../../lib/services-config'

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

/**
 * Nothing in this file may read `searchParams`, `headers()` or `cookies()`.
 *
 * It used to read `category` and `sort`, which made the route dynamic: it
 * rendered per request for every visitor and every crawler, was never cached,
 * and cost ~47 KB of origin transfer each time. The chips and the sort control
 * now filter in the browser over the full set, which the page already shipped.
 */
export const revalidate = 3600

export default async function ServicesIndexPage() {
  const [featured, total, perCategory, allCases, twoUp, settings, content] = await Promise.all([
    // Featured is fetched unconditionally now. Whether it renders is the
    // browser's call — it shows above the grid on the unfiltered view only.
    featuredServiceCase(),
    totalCount(),
    categoryCounts(),
    // Every published case, unfiltered and in default order. There are twenty;
    // the unfiltered page already rendered all of them.
    listServiceCases({ limit: 30 }),
    // Two-up at the bottom always renders the latest 2 stories irrespective
    // of filter — no point hiding them.
    topTwoStoryCases(),
    getStoreSettings(),
    // Section order, visibility and copy, edited under Pages & Blocks.
    getMasterPageContent('services'),
  ])

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

  const capability = content.values('capability')

  // One object for both the prerendered fallback and the client component, so
  // the two cannot be given different data.
  const browserProps = {
    cases: allCases,
    featured,
    totalCount: total,
    perCategory,
    chipOrder: CHIP_ORDER,
    emptyMessage: str(cases, 'empty_message') ?? '',
  }

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

    // The rail and the grid moved into one client component so they can share
    // the filter state without the server reading it. Rendered here as a
    // single section rather than two, because the featured case sits between
    // them and belongs to the same decision.
    topics: (
      // The fallback is not a spinner: `useSearchParams` bails out of
      // prerendering, so whatever sits here is what a crawler reads at
      // /services. It renders the same list with the defaults — every case, in
      // default order — and the client swaps in the filtered view on hydration.
      <Suspense fallback={<ServicesCaseList {...browserProps} category={null} sort="recent" />}>
        <ServicesCaseBrowser {...browserProps} />
      </Suspense>
    ),

    cases: null,

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

    /*
      The route into /manufacturing.

      It sits here rather than in the nav because the nav is editor-curated
      data: a code-only link would have to be unioned into a DB-driven menu for
      one page. This band is the same idea in the place the reader is already
      asking the question — they have just scrolled a page of service case
      studies and the next honest question is who makes the parts.

      The three figures come from MANUFACTURING_PAGE, not from editable copy,
      so the band cannot claim a workshop count the page itself contradicts.
    */
    capability: (
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 xl:px-12">
        {/*
          A plain container with two explicit links, NOT one card-wide anchor.
          The band points at two pages now, and nesting a second link inside a
          wrapping anchor is invalid markup that screen readers and browsers
          disagree about how to resolve.
        */}
        <div className="grid grid-cols-1 items-center gap-8 rounded-lg border border-ih-border bg-ih-steel-soft px-8 py-9 lg:grid-cols-[1.35fr_1fr] lg:px-11">
          <div>
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              {str(capability, 'eyebrow')}
            </p>
            <h2 className="mt-3 max-w-[560px] text-balance font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[30px]">
              {str(capability, 'heading')}
            </h2>
            <p className="mt-2.5 max-w-[600px] text-[14px] leading-[1.6] text-ih-ink-2">
              {str(capability, 'body')}
            </p>
          </div>

          <div>
            <dl className="grid grid-cols-3 gap-5">
              {MANUFACTURING_PAGE.hero.stats.slice(0, 3).map((stat) => (
                <div key={stat.label} className="border-t-2 border-ih-accent pt-3">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-mono text-[24px] leading-none tracking-[-0.03em] tabular-nums">
                    {stat.value}
                  </dd>
                  <p aria-hidden="true" className="mt-2 font-mono text-[10px] uppercase leading-[1.4] tracking-[0.1em] text-ih-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {str(capability, 'cta_label') ? (
                <Link
                  href={MANUFACTURING_PAGE.path}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ih-accent hover:underline"
                >
                  {str(capability, 'cta_label')}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
              {str(capability, 'cta_label_quality') ? (
                <Link
                  href={QUALITY_CONTROL_PAGE.path}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ih-accent hover:underline"
                >
                  {str(capability, 'cta_label_quality')}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    ),

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
