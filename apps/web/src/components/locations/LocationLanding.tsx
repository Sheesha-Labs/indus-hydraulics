import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, LeadCapturePanel } from '@indus/ui'
import {
  hoseBayDistanceKm,
  img,
  kmBetween,
  LOCATION_BUILT_IN_PREPARE,
  locationBuiltInOptions,
  locationBuiltInServices,
  lines,
  list,
  nearestServiceAreas,
  serviceAreasOrdered,
  str,
  visibleList,
  type SectionValues,
  type ServiceArea,
} from '@indus/domain'
import type { LocationMapModel } from '../../lib/location-geometry'
import type { LocationArticleCard, LocationRangeCard } from '../../lib/location-data'
import type { PageContent } from '../../lib/page-content'
import { categoryFaqs } from '../category/CategoryBands'
import LocationMap from './LocationMap'

/**
 * The service-area page, `/locations/<slug>`.
 *
 * Every band is keyed and the page renders `content.order` — the editor's
 * arrangement with hidden bands dropped. Every copy field is an override:
 * blank keeps the wording built from the area record, so an area nobody has
 * edited still renders a complete page.
 *
 * The bands that need local knowledge (zone notes, the equipment here, recent
 * work, the FAQ) render the record's own facts or nothing until someone writes
 * them. See LOCATION_SECTIONS for why that is the rule.
 */

type CardRow = { name?: string; desc?: string; cta?: string; href?: string; tag?: string }
type IndustryRow = { name?: string; desc?: string; industry?: string | null }

export type LocationIndustryCard = {
  slug: string
  name: string
  url: string | null
  alt: string | null
}

const BAND = 'px-5 sm:px-8 lg:px-12'
const INNER = 'mx-auto max-w-[1440px]'
const EYEBROW = 'text-ih-muted text-[10.5px] font-medium tracking-[0.13em] uppercase'
const H2 = 'mt-3 font-serif text-[28px] leading-[1.1] font-normal tracking-[-0.01em] sm:text-[34px]'
const LEDE = 'text-ih-ink-2 mt-4 max-w-[68ch] text-[15.5px] leading-[1.65] text-pretty'

function SectionHead({
  eyebrow,
  heading,
  body,
}: {
  eyebrow: string
  heading: string
  body?: string | null
}) {
  return (
    <div className="mb-8">
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className={H2}>{heading}</h2>
      {body &&
        body
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => (
            <p key={p.slice(0, 40)} className={LEDE}>
              {p}
            </p>
          ))}
    </div>
  )
}

export default function LocationLanding({
  area,
  content,
  mapModel,
  ranges,
  articles,
  industryCards,
  contact,
}: {
  area: ServiceArea
  content: PageContent
  mapModel: LocationMapModel | null
  ranges: LocationRangeCard[]
  articles: LocationArticleCard[]
  /** Photo cards for the area's industries, keyed by slug. */
  industryCards: Record<string, LocationIndustryCard>
  contact: { phone: string | null; whatsappUrl: string | null; emailUrl: string }
}) {
  const v = (key: string): SectionValues => content.values(key)
  const over = (values: SectionValues, key: string, built: string): string =>
    (str(values, key) ?? built).replace(/\{area\}/g, area.name)

  const hero = v('hero')
  const heroImage = img(hero, 'image')
  const km = hoseBayDistanceKm(area)
  const isBase = area.slug === 'dubai'

  const optionsCopy = v('options')
  const writtenOptions = visibleList<CardRow>(optionsCopy, 'items').filter((r) => r.name && r.desc)
  const options = writtenOptions.length === 3 ? writtenOptions : locationBuiltInOptions(area)

  const servicesCopy = v('services')
  const writtenServices = visibleList<CardRow>(servicesCopy, 'items').filter(
    (r) => r.name && r.desc
  )
  const services = writtenServices.length > 0 ? writtenServices : locationBuiltInServices(area)

  const zonesCopy = v('zones')
  const zoneNotes = visibleList<CardRow>(zonesCopy, 'items').filter((r) => r.name && r.desc)

  const industriesCopy = v('industries')
  const equipment = list<IndustryRow>(industriesCopy, 'items').filter((r) => r.name && r.desc)

  const accessCopy = v('access')
  const accessChecklist = lines(accessCopy.checklist)

  const prepareCopy = v('prepare')
  const prepareItems = lines(prepareCopy.checklist)

  const workCopy = v('work')
  const jobs = visibleList<CardRow>(workCopy, 'items').filter((r) => r.name && r.desc)

  const faqCopy = v('faq')
  const faqs = categoryFaqs(faqCopy)

  const nearby = nearestServiceAreas(area, 3)

  const bands: Record<string, ReactNode> = {
    hero: (
      <section
        className={`border-ih-border bg-ih-surface border-b ${BAND} pt-8 pb-12 lg:pt-10 lg:pb-14`}
      >
        <div className={INNER}>
          <nav
            aria-label="Breadcrumb"
            className="text-ih-muted mb-7 flex items-center gap-2 text-[12px]"
          >
            <Link href="/" className="hover:text-ih-ink">
              Home
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <Link href="/locations" className="hover:text-ih-ink">
              Service areas
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <span className="text-ih-ink" aria-current="page">
              {area.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:gap-14">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className={EYEBROW}>
                  {over(hero, 'eyebrow', `On-site service · ${area.region}`)}
                </p>
              </div>
              <h1 className="mt-4 max-w-[640px] font-serif text-[36px] leading-[1.04] tracking-[-0.01em] text-balance sm:text-[46px] lg:text-[54px]">
                {str(hero, 'heading') ? (
                  over(hero, 'heading', '')
                ) : (
                  <>
                    Hydraulic hose repair and on-site service in <em>{area.name}</em>
                  </>
                )}
              </h1>
              <p className="text-ih-ink-2 mt-5 max-w-[620px] text-[16px] leading-[1.65] text-pretty">
                {over(hero, 'intro', area.intro)}
              </p>

              <dl className="border-ih-border mt-7 border-t">
                {[
                  {
                    label: 'From the hose bay',
                    value: isBase
                      ? 'Home of the hose bay — Al Qusais, Dubai'
                      : `About ${km} km from the Al Qusais hose bay, in a straight line`,
                  },
                  {
                    label: 'Zones covered',
                    value: area.zones.join(' · '),
                  },
                  {
                    label: 'How we work here',
                    value: isBase
                      ? 'In the bay, at the machine, or built and delivered'
                      : 'At the machine, or built in Dubai and delivered',
                  },
                  ...(area.alternateNames.length > 0
                    ? [{ label: 'Also written', value: area.alternateNames.join(', ') }]
                    : []),
                ].map((fact) => (
                  <div
                    key={fact.label}
                    className="border-ih-border grid grid-cols-1 gap-x-5 gap-y-1 border-b py-3 sm:grid-cols-[148px_1fr]"
                  >
                    <dt className="text-ih-muted pt-0.5 text-[10.5px] font-medium tracking-[0.1em] uppercase">
                      {fact.label}
                    </dt>
                    <dd className="text-ih-ink-2 m-0 text-[13.5px] leading-[1.5]">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {contact.whatsappUrl && (
                  <Button asChild kind="primary" size="lg">
                    <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      WhatsApp a photo of the hose <span aria-hidden="true">→</span>
                    </a>
                  </Button>
                )}
                <Button asChild kind="outline" size="lg">
                  <a href={contact.emailUrl}>Email for on-site service</a>
                </Button>
                {contact.phone && (
                  <Button asChild kind="ghost" size="lg">
                    <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>Call {contact.phone}</a>
                  </Button>
                )}
              </div>
            </div>

            {mapModel && <LocationMap model={mapModel} />}
          </div>
        </div>
      </section>
    ),

    options: (
      <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <SectionHead
            eyebrow={over(optionsCopy, 'eyebrow', 'Bay or on site')}
            heading={over(optionsCopy, 'heading', `Three ways to get a hose made in ${area.name}`)}
            body={str(optionsCopy, 'body')}
          />
          {heroImage?.url && (
            <figure className="m-0 mb-8">
              <div className="bg-ih-surface-2 relative aspect-[21/9] overflow-hidden rounded-[10px]">
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt ?? ''}
                  fill
                  sizes="(max-width: 1440px) 100vw, 1344px"
                  className="object-cover"
                  priority
                />
              </div>
              {str(hero, 'image_caption') && (
                <figcaption className="text-ih-muted mt-2.5 text-[12.5px] leading-[1.5]">
                  {over(hero, 'image_caption', '')}
                </figcaption>
              )}
            </figure>
          )}
          <ol className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
            {options.map((option, index) => (
              <li
                key={option.name}
                className="border-ih-border bg-ih-surface flex flex-col rounded-[10px] border p-6"
              >
                <span className="text-ih-accent text-[12px] font-medium tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[17px] leading-[1.3] font-semibold">{option.name}</h3>
                <p className="text-ih-ink-2 mt-2 text-[14px] leading-[1.6]">{option.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    ),

    services: (
      <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <SectionHead
            eyebrow={over(servicesCopy, 'eyebrow', 'Services')}
            heading={over(servicesCopy, 'heading', `What we do on site in ${area.name}`)}
            body={str(servicesCopy, 'body')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.name}
                className="border-ih-border flex min-w-0 flex-col rounded-[10px] border p-5"
              >
                <h3 className="text-[16px] leading-[1.3] font-semibold">{service.name}</h3>
                <p className="text-ih-ink-2 mt-2 text-[13.5px] leading-[1.6]">{service.desc}</p>
                {service.href && (
                  <Link
                    href={service.href}
                    className="text-ih-accent mt-auto pt-4 text-[13px] font-medium hover:underline"
                  >
                    {service.cta ?? 'Read more'} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    ),

    zones: (
      <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <SectionHead
            eyebrow={over(zonesCopy, 'eyebrow', 'Zones')}
            heading={over(zonesCopy, 'heading', `Where we work in ${area.name}`)}
            body={str(zonesCopy, 'body')}
          />
          {zoneNotes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneNotes.map((zone) => (
                <article
                  key={zone.name}
                  className="border-ih-border bg-ih-surface rounded-[10px] border p-5"
                >
                  <h3 className="text-[16px] leading-[1.3] font-semibold">{zone.name}</h3>
                  <p className="text-ih-ink-2 mt-2 text-[13.5px] leading-[1.6]">{zone.desc}</p>
                </article>
              ))}
            </div>
          ) : (
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {area.zones.map((zone) => (
                <li
                  key={zone}
                  className="border-ih-border bg-ih-surface text-ih-ink-2 rounded-full border px-3.5 py-1.5 text-[13px]"
                >
                  {zone}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    ),

    industries: (
      <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <SectionHead
            eyebrow={over(industriesCopy, 'eyebrow', 'Industries and equipment')}
            heading={over(industriesCopy, 'heading', `What runs on hydraulics in ${area.name}`)}
            body={str(industriesCopy, 'body')}
          />
          {equipment.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((row) => {
                const card = row.industry ? industryCards[row.industry] : undefined
                return (
                  <article
                    key={row.name}
                    className="border-ih-border flex min-w-0 flex-col overflow-hidden rounded-[10px] border"
                  >
                    {card?.url && (
                      <div className="bg-ih-surface-2 relative aspect-[16/9]">
                        <Image
                          src={card.url}
                          alt={card.alt ?? ''}
                          fill
                          sizes="(max-width: 640px) 100vw, 440px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[16px] leading-[1.3] font-semibold">{row.name}</h3>
                      <p className="text-ih-ink-2 mt-2 text-[13.5px] leading-[1.6]">{row.desc}</p>
                      {card && (
                        <Link
                          href={`/industries/${card.slug}`}
                          className="text-ih-accent mt-auto pt-4 text-[13px] font-medium hover:underline"
                        >
                          {card.name} <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <ul className="flex list-none flex-col gap-3 p-0">
                {area.demand.map((item) => (
                  <li key={item} className="text-ih-ink-2 flex gap-3 text-[15px] leading-[1.55]">
                    <span
                      aria-hidden="true"
                      className="bg-ih-accent mt-[9px] block h-1.5 w-1.5 shrink-0 rounded-full"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {area.industries
                  .map((slug) => industryCards[slug])
                  .filter((c): c is LocationIndustryCard => c != null)
                  .map((card) => (
                    <Link
                      key={card.slug}
                      href={`/industries/${card.slug}`}
                      className="border-ih-border hover:border-ih-accent group block overflow-hidden rounded-[10px] border transition-colors"
                    >
                      <div className="bg-ih-surface-2 relative aspect-[16/9]">
                        {card.url && (
                          <Image
                            src={card.url}
                            alt={card.alt ?? ''}
                            fill
                            sizes="(max-width: 640px) 100vw, 440px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="group-hover:text-ih-accent px-4 py-3 text-[14.5px] font-medium">
                        {card.name} <span aria-hidden="true">→</span>
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>
    ),

    access: (
      <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
        <div
          className={`${INNER} grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14`}
        >
          <div>
            <SectionHead
              eyebrow={over(accessCopy, 'eyebrow', 'What sets the timeline here')}
              heading={over(accessCopy, 'heading', area.constraint.label)}
              body={over(accessCopy, 'body', area.constraint.detail)}
            />
          </div>
          {accessChecklist.length > 0 && (
            <div className="border-ih-accent bg-ih-surface rounded-[10px] border border-l-4 p-6">
              <p className={EYEBROW}>Before the visit</p>
              <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
                {accessChecklist.map((item) => (
                  <li key={item} className="text-ih-ink-2 flex gap-3 text-[14px] leading-[1.55]">
                    <span aria-hidden="true" className="text-ih-accent shrink-0 font-semibold">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    ),

    prepare: (
      <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
        <div className={`${INNER} grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14`}>
          <SectionHead
            eyebrow={over(prepareCopy, 'eyebrow', 'Before you call')}
            heading={over(prepareCopy, 'heading', 'What to have ready')}
            body={over(
              prepareCopy,
              'body',
              'That decides whether the right hose and fittings are already on the van — the difference between one visit and two.'
            )}
          />
          <div>
            <ol className="flex list-none flex-col p-0">
              {(prepareItems.length > 0 ? prepareItems : LOCATION_BUILT_IN_PREPARE).map(
                (item, index) => (
                  <li
                    key={item}
                    className="border-ih-border flex gap-4 border-t py-3.5 text-[15px] leading-[1.5]"
                  >
                    <span className="text-ih-accent w-6 shrink-0 text-[13px] font-medium tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-ih-ink-2">{item}</span>
                  </li>
                )
              )}
            </ol>
            <p className="text-ih-muted mt-4 text-[13.5px] leading-[1.6]">
              Not sure what you are looking at?{' '}
              <Link
                href="/blog/how-to-read-a-hose-layline"
                className="text-ih-accent hover:underline"
              >
                How to read a hose layline
              </Link>{' '}
              and{' '}
              <Link
                href="/blog/getting-a-hydraulic-hose-made"
                className="text-ih-accent hover:underline"
              >
                what we measure when a hose is made
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    ),

    ranges:
      ranges.length > 0 ? (
        <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
          <div className={INNER}>
            <SectionHead
              eyebrow={over(v('ranges'), 'eyebrow', 'Stocked in Dubai')}
              heading={over(v('ranges'), 'heading', `Ranges most often needed in ${area.name}`)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ranges.map((range) => (
                <Link
                  key={range.slug}
                  href={`/c/${range.slug}`}
                  className="border-ih-border bg-ih-surface hover:border-ih-accent group flex min-w-0 flex-col overflow-hidden rounded-[10px] border transition-colors"
                >
                  <div className="bg-ih-surface-2 relative aspect-[4/3]">
                    {range.imageUrl ? (
                      <Image
                        src={range.imageUrl}
                        alt={range.imageAlt ?? ''}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
                        className="object-contain p-4"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="group-hover:text-ih-accent text-[15.5px] leading-[1.3] font-semibold">
                      {range.name}
                    </h3>
                    {range.description && (
                      <p className="text-ih-muted mt-1.5 line-clamp-2 text-[13px] leading-[1.5]">
                        {range.description}
                      </p>
                    )}
                    {range.productCount > 0 && (
                      <p className="text-ih-muted-2 mt-auto pt-3 text-[12px] tabular-nums">
                        {range.productCount.toLocaleString('en-US')} products
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    work:
      jobs.length > 0 ? (
        <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
          <div className={INNER}>
            <SectionHead
              eyebrow={over(workCopy, 'eyebrow', 'Recent work')}
              heading={over(workCopy, 'heading', `Jobs we have done in ${area.name}`)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <article
                  key={job.name}
                  className="border-ih-border flex flex-col rounded-[10px] border p-5"
                >
                  {job.tag && <p className={EYEBROW}>{job.tag}</p>}
                  <h3 className="mt-2 text-[16px] leading-[1.3] font-semibold">{job.name}</h3>
                  <p className="text-ih-ink-2 mt-2 text-[13.5px] leading-[1.6]">{job.desc}</p>
                  {job.href && (
                    <Link
                      href={job.href}
                      className="text-ih-accent mt-auto pt-4 text-[13px] font-medium hover:underline"
                    >
                      {job.cta ?? 'Read the write-up'} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    faq:
      faqs.length > 0 ? (
        <section className={`border-ih-border border-b ${BAND} py-14 lg:py-16`}>
          <div
            className={`${INNER} grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-14`}
          >
            <SectionHead
              eyebrow={over(faqCopy, 'eyebrow', 'Questions we get asked')}
              heading={over(faqCopy, 'heading', `On-site hose service in ${area.name}`)}
            />
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

    reading:
      articles.length > 0 ? (
        <section className={`border-ih-border bg-ih-surface border-b ${BAND} py-14 lg:py-16`}>
          <div className={INNER}>
            <SectionHead
              eyebrow={over(v('reading'), 'eyebrow', 'Guides')}
              heading={over(v('reading'), 'heading', 'Worth reading before you call')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="border-ih-border hover:border-ih-accent group flex min-w-0 flex-col overflow-hidden rounded-[10px] border transition-colors"
                >
                  {article.imageUrl && (
                    <div className="bg-ih-surface-2 relative aspect-[16/9]">
                      <Image
                        src={article.imageUrl}
                        alt={article.imageAlt ?? ''}
                        fill
                        sizes="(max-width: 640px) 100vw, 440px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="group-hover:text-ih-accent text-[15.5px] leading-[1.3] font-semibold">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-ih-muted mt-2 line-clamp-2 text-[13px] leading-[1.5]">
                        {article.excerpt}
                      </p>
                    )}
                    {article.readingMinutes && (
                      <p className="text-ih-muted-2 mt-auto pt-3 text-[12px] tabular-nums">
                        {article.readingMinutes} min read
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    lead: (
      <section className={`${BAND} py-14 lg:py-16`}>
        <div className={INNER}>
          <LeadCapturePanel
            heading={over(v('lead'), 'heading', `Machine down in ${area.name}?`)}
            body={over(
              v('lead'),
              'body',
              'Tell us where it is, what failed and whether the site needs a permit. We will tell you plainly whether it is an on-site job or a bay job before anyone travels.'
            )}
            whatsappUrl={contact.whatsappUrl}
            emailUrl={contact.emailUrl}
            phone={contact.phone}
            ctaLabel="Email for on-site service"
          />
        </div>
      </section>
    ),

    nearby: (
      <nav aria-label="Other service areas" className={`border-ih-border border-t ${BAND} py-12`}>
        <div className={INNER}>
          <p className={EYEBROW}>{over(v('nearby'), 'eyebrow', 'Nearby')}</p>
          <h2 className="mt-3 font-serif text-[24px] leading-[1.15] sm:text-[28px]">
            {over(v('nearby'), 'heading', `Other areas near ${area.name}`)}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {nearby.map((other) => (
              <Link
                key={other.slug}
                href={`/locations/${other.slug}`}
                className="border-ih-border bg-ih-surface hover:border-ih-accent group rounded-[10px] border p-4 transition-colors"
              >
                <p className="text-ih-muted text-[11.5px] tabular-nums">
                  About {Math.max(5, Math.round(kmBetween(area.coords, other.coords) / 5) * 5)} km
                  away
                </p>
                <p className="group-hover:text-ih-accent mt-1 text-[16px] font-semibold">
                  {other.name} <span aria-hidden="true">→</span>
                </p>
                <p className="text-ih-muted mt-1 line-clamp-2 text-[13px] leading-[1.5]">
                  {other.summary}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {serviceAreasOrdered()
              .filter((a) => a.slug !== area.slug && !nearby.some((n) => n.slug === a.slug))
              .map((a) => (
                <Link
                  key={a.slug}
                  href={`/locations/${a.slug}`}
                  className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
                >
                  {a.name}
                </Link>
              ))}
            <Link
              href="/locations"
              className="text-ih-accent px-2 py-1.5 text-[13px] font-medium hover:underline"
            >
              All service areas →
            </Link>
          </div>
        </div>
      </nav>
    ),
  }

  // The storefront layout owns <main id="main">; a second one here would be
  // invalid and would confuse the skip link.
  return <>{content.order.map((key) => (bands[key] ? <div key={key}>{bands[key]}</div> : null))}</>
}
