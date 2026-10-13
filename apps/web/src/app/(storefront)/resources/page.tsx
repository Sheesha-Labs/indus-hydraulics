import {
  RESOURCE_CALCULATORS,
  RESOURCE_GUIDE_SLUGS,
  RESOURCES_LAST_CHECKED,
  buildBreadcrumbLd,
  buildItemListLd,
  list,
  resourceEntries,
  resourceTotals,
  str,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ResourcesHub, { type ResourcesHubCopy } from '../../../components/resources/ResourcesHub'
import { getResourceGuides, getResourcesShared } from '../../../lib/resources-content'
import { pageMetadata, urlFor } from '../../../lib/seo'

/**
 * `/resources` — the hub for the reference pages.
 *
 * Copy is Pages & Blocks · Resources; the cards are the registry in
 * `@indus/domain/resources`; the counts quoted in the copy are derived from the
 * same data the reference pages render, so the hub and the pages cannot
 * disagree about how many rows there are.
 *
 * Two structured-data blocks: BreadcrumbList, and an ItemList of the four
 * references in page order.
 */

const totals = resourceTotals()

const DESCRIPTION =
  `Free hydraulic reference: thread dimensions for ${totals.connectionTypes} connection types, ${totals.crimpSettings} crimp settings, ` +
  `${totals.ratings} fitting pressure ratings and a ${totals.terms}-term glossary. HTML tables, inch and metric.`

export const metadata = pageMetadata({
  title: 'Hydraulic Reference Library — Threads, Crimps, Pressures',
  description: DESCRIPTION,
  path: '/resources',
})

/* Hourly. The data is build-time; the copy and the guide titles are the only live reads. */
export const revalidate = 3600

export default async function ResourcesPage() {
  const entries = resourceEntries()
  const [shared, guides] = await Promise.all([
    getResourcesShared('Reference enquiry'),
    getResourceGuides(RESOURCE_GUIDE_SLUGS),
  ])
  const { content, t } = shared

  const pairs = (values: Parameters<typeof str>[0], key: string) =>
    list<{ label?: string; value?: string }>(values, key)
      .map((row) => ({ label: row.label ?? '', value: t(row.value ?? '') ?? '' }))
      .filter((row) => row.label !== '' || row.value !== '')

  const hero = content.values('hero')
  const references = content.values('references')
  const calculators = content.values('calculators')
  const guidesCopy = content.values('guides')

  const copy: ResourcesHubCopy = {
    hero: {
      eyebrow: t(str(hero, 'eyebrow')),
      heading: t(str(hero, 'heading')),
      headingEmphasis: t(str(hero, 'heading_emphasis')),
      body: t(str(hero, 'body')),
      tiles: pairs(hero, 'tiles'),
    },
    manifest: pairs(content.values('manifest'), 'items'),
    references: {
      eyebrow: t(str(references, 'eyebrow')),
      heading: t(str(references, 'heading')),
      body: t(str(references, 'body')),
    },
    calculators: {
      eyebrow: t(str(calculators, 'eyebrow')),
      heading: t(str(calculators, 'heading')),
      body: t(str(calculators, 'body')),
    },
    guides: { eyebrow: t(str(guidesCopy, 'eyebrow')), heading: t(str(guidesCopy, 'heading')) },
    order: content.order,
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Resources', url: urlFor('/resources') },
            ],
          }),
          buildItemListLd({
            name: 'Hydraulic reference library',
            items: entries.map((entry) => ({ name: entry.title, url: urlFor(entry.href) })),
          }),
        ]}
      />
      <ResourcesHub
        copy={copy}
        entries={entries}
        calculators={RESOURCE_CALCULATORS}
        guides={guides}
        cta={shared.cta}
        contact={shared.contact}
        meta={`${totals.references} references · ${RESOURCE_CALCULATORS.length} calculators · checked ${RESOURCES_LAST_CHECKED}`}
      />
    </>
  )
}
