import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildServiceLd,
  hoseBayDistanceKm,
  serviceAreasOrdered,
  str,
  strOr,
  visibleList,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import LocationMap from '../../../components/locations/LocationMap'
import { categoryFaqs } from '../../../components/category/CategoryBands'
import { gccMarketLinks } from '../../../lib/category-bands'
import { buildLocationMapModel } from '../../../lib/location-geometry'
import { getMasterPageContent } from '../../../lib/page-content'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const hero = (await getMasterPageContent('locations')).values('hero')
  return pageMetadata({
    title: strOr(hero, 'meta_title', 'Hydraulic Hose Repair Across the UAE'),
    description: strOr(hero, 'meta_description', strOr(hero, 'body', '')),
    path: '/locations',
  })
}

const BAND = 'px-5 sm:px-8 lg:px-12'
const INNER = 'mx-auto max-w-[1440px]'
const EYEBROW = 'text-ih-muted text-[10.5px] font-medium tracking-[0.13em] uppercase'
const H2 = 'mt-3 font-serif text-[28px] leading-[1.1] font-normal tracking-[-0.01em] sm:text-[34px]'

type Step = { name?: string; desc?: string }

/**
 * `/locations` — the hub for the UAE areas we service on site.
 *
 * The UAE has no `/markets` page, so this is the site's page about working
 * inside the country. Copy is in Pages & Blocks (`master/locations`); the map,
 * the cards and the comparison table are built from the area records.
 *
 * Wording matters and is asserted by tests: these are areas we SERVICE, not
 * places we have premises. There is one premises, and claiming more risks a
 * false-presence penalty.
 */
export default async function LocationsIndexPage() {
  const content = await getMasterPageContent('locations')
  const hero = content.values('hero')
  const how = content.values('how')
  const areasCopy = content.values('areas')
  const compare = content.values('compare')
  const faqCopy = content.values('faq')
  const beyond = content.values('beyond')

  const areas = serviceAreasOrdered()
  const steps = visibleList<Step>(how, 'steps').filter((s) => s.name && s.desc)
  const faqs = content.isOn('faq') ? categoryFaqs(faqCopy) : []
  const mapModel = buildLocationMapModel(null)
  const description = strOr(hero, 'meta_description', strOr(hero, 'body', ''))

  const serviceLd = buildServiceLd({
    name: 'Hydraulic hose repair and on-site service in the UAE',
    description,
    url: urlFor('/locations'),
    areaServed: areas.map((a) => ({
      name: a.name,
      type: 'AdministrativeArea' as const,
      sameAs: a.wikipedia,
    })),
    providerId: ORG_ID,
    providerName: SITE_NAME,
    serviceType: 'Hydraulic hose assembly and repair',
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Service areas', url: urlFor('/locations') },
    ],
  })
  const faqLd = faqs.length > 0 ? buildFaqLd({ faqs }) : null

  const bands: Record<string, ReactNode> = {
    hero: (
      <section
        className={`border-ih-border bg-ih-surface border-b ${BAND} pt-10 pb-12 lg:pt-14 lg:pb-16`}
      >
        <div
          className={`${INNER} grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:gap-14`}
        >
          <div className="min-w-0">
            <p className={EYEBROW}>{strOr(hero, 'eyebrow', 'On-site service · UAE')}</p>
            <h1 className="mt-4 max-w-[640px] font-serif text-[36px] leading-[1.04] tracking-[-0.01em] text-balance sm:text-[46px] lg:text-[54px]">
              {strOr(hero, 'heading', 'Hydraulic hose repair and on-site service across the UAE')}
            </h1>
            {str(hero, 'body') && (
              <p className="text-ih-ink-2 mt-5 max-w-[620px] text-[16.5px] leading-[1.6] text-pretty">
                {str(hero, 'body')}
              </p>
            )}
            {str(hero, 'note') && (
              <p className="border-ih-accent text-ih-ink-2 mt-6 max-w-[620px] border-l-2 pl-4 text-[14px] leading-[1.6]">
                {str(hero, 'note')}
              </p>
            )}
            <ul className="mt-7 flex list-none flex-wrap gap-2 p-0">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/locations/${a.slug}`}
                    className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-10 items-center rounded-full border px-4 text-[13.5px] transition-colors"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {mapModel && <LocationMap model={mapModel} />}
        </div>
      </section>
    ),

    how:
      steps.length > 0 ? (
        <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
          <div className={INNER}>
            <p className={EYEBROW}>{strOr(how, 'eyebrow', 'How it works')}</p>
            <h2 className={H2}>{strOr(how, 'heading', 'From a failed hose to a fitted one')}</h2>
            <ol className="mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li
                  key={step.name}
                  className="border-ih-border bg-ih-surface rounded-[10px] border p-6"
                >
                  <span className="text-ih-accent text-[12px] font-medium tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-[17px] leading-[1.3] font-semibold">{step.name}</h3>
                  <p className="text-ih-ink-2 mt-2 text-[14px] leading-[1.6]">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null,

    areas: (
      <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <p className={EYEBROW}>{strOr(areasCopy, 'eyebrow', 'Where we work')}</p>
          <h2 className={H2}>{strOr(areasCopy, 'heading', 'Areas we service on site')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/locations/${area.slug}`}
                className="border-ih-border hover:border-ih-accent group flex min-w-0 flex-col rounded-[10px] border p-6 transition-colors"
              >
                <p className="text-ih-muted text-[10.5px] font-medium tracking-[0.12em] uppercase">
                  {area.region}
                </p>
                <h3 className="group-hover:text-ih-accent mt-2 text-[19px] font-semibold">
                  {area.name}
                </h3>
                <p className="text-ih-ink-2 mt-2 text-[14px] leading-[1.55]">{area.summary}</p>
                <p className="text-ih-muted-2 mt-auto pt-4 text-[12px] leading-[1.5]">
                  {area.zones.slice(0, 3).join(' · ')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),

    compare: (
      <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <p className={EYEBROW}>{strOr(compare, 'eyebrow', 'At a glance')}</p>
          <h2 className={H2}>{strOr(compare, 'heading', 'What decides a visit, area by area')}</h2>
          <div className="border-ih-border mt-8 overflow-x-auto rounded-[10px] border">
            <table className="bg-ih-surface w-full min-w-[760px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-ih-border bg-ih-surface-2 border-b">
                  {['Area', 'From the hose bay', 'Main work', 'What sets the timeline'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-ih-muted px-4 py-3 text-[10.5px] font-medium tracking-[0.1em] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.slug} className="border-ih-border border-b last:border-b-0">
                    <th scope="row" className="px-4 py-3 align-top font-semibold">
                      <Link href={`/locations/${area.slug}`} className="hover:text-ih-accent">
                        {area.name}
                      </Link>
                    </th>
                    <td className="text-ih-ink-2 px-4 py-3 align-top tabular-nums">
                      {area.slug === 'dubai' ? 'Base' : `~${hoseBayDistanceKm(area)} km`}
                    </td>
                    <td className="text-ih-ink-2 px-4 py-3 align-top">{area.demand[0]}</td>
                    <td className="text-ih-ink-2 px-4 py-3 align-top">{area.constraint.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-ih-muted mt-3 text-[12.5px]">
            Distances are straight-line from the Al Qusais hose bay, rounded to 5 km.
          </p>
        </div>
      </section>
    ),

    faq:
      faqs.length > 0 ? (
        <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
          <div
            className={`${INNER} grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-14`}
          >
            <div>
              <p className={EYEBROW}>{strOr(faqCopy, 'eyebrow', 'Questions we get asked')}</p>
              <h2 className={H2}>{strOr(faqCopy, 'heading', 'On-site hose service in the UAE')}</h2>
            </div>
            <dl className="m-0">
              {faqs.map((faq, index) => (
                <div key={faq.question} className="border-ih-border border-t py-5">
                  <dt className="flex gap-3 text-[16px] leading-[1.4] font-medium">
                    <span className="text-ih-accent w-6 shrink-0 text-[12.5px] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {faq.question}
                  </dt>
                  <dd className="text-ih-ink-2 m-0 mt-2 pl-9 text-[14.5px] leading-[1.65]">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null,

    beyond: (
      <section className={`${BAND} py-14 lg:py-16`}>
        <div
          className={`${INNER} grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14`}
        >
          <div>
            <p className={EYEBROW}>{strOr(beyond, 'eyebrow', 'Outside the UAE')}</p>
            <h2 className={H2}>{strOr(beyond, 'heading', 'Elsewhere in the GCC, we ship')}</h2>
            {str(beyond, 'body') && (
              <p className="text-ih-ink-2 mt-4 max-w-[62ch] text-[15.5px] leading-[1.65]">
                {str(beyond, 'body')}
              </p>
            )}
          </div>
          <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
            {gccMarketLinks().map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/markets/${m.slug}`}
                  className="border-ih-border bg-ih-surface hover:border-ih-accent group block rounded-[10px] border p-4 transition-colors"
                >
                  <p className="group-hover:text-ih-accent text-[15px] font-semibold">
                    {m.name} <span aria-hidden="true">→</span>
                  </p>
                  <p className="text-ih-muted mt-1 text-[12.5px] leading-[1.5]">{m.leadTime}</p>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/markets"
                className="text-ih-accent flex h-full items-center p-4 text-[14px] font-medium hover:underline"
              >
                All export markets →
              </Link>
            </li>
          </ul>
        </div>
      </section>
    ),
  }

  return (
    <>
      <JsonLd data={faqLd ? [serviceLd, breadcrumbLd, faqLd] : [serviceLd, breadcrumbLd]} />
      {content.order.map((key) => (bands[key] ? <div key={key}>{bands[key]}</div> : null))}
    </>
  )
}
