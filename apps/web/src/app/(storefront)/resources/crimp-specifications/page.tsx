import Link from 'next/link'
import {
  CRIMP_DIE_POSITIONS,
  CRIMP_HOSES,
  CRIMP_SERIES,
  CRIMP_SPECS,
  RESOURCES_LAST_CHECKED,
  buildBreadcrumbLd,
  crimpSpecTotals,
  resourceEntries,
  resourceEntry,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { HairlineCell, HairlineGrid, JsonLd } from '@indus/ui'
import CrimpFinder from '../../../../components/resources/CrimpFinder'
import ResourcePage from '../../../../components/resources/ResourcePage'
import { ResourceSection } from '../../../../components/resources/ResourceLayout'
import { RefTable, TD, TD_NUM, TD_ROW_HEAD, TH, TH_NUM, TR } from '../../../../components/resources/RefTable'
import { getResourcesShared } from '../../../../lib/resources-content'
import { pageMetadata, urlFor } from '../../../../lib/seo'

/**
 * `/resources/crimp-specifications` — finished crimp diameters.
 *
 * The matched-pair warning is the first thing on the page after the hero, above
 * the finder, and it is repeated in the rail. A crimp figure applied to the
 * wrong maker's hose is a hose that blows off under pressure; nothing on this
 * page is allowed to read as a universal chart.
 */

const totals = crimpSpecTotals()
const PATH = '/resources/crimp-specifications'

export const metadata = pageMetadata({
  title: 'Hydraulic Hose Crimp Specifications — Crimp Diameter Chart',
  description: `Finished crimp diameter and die position for ${totals.settings} hose and fitting combinations — SAE 100R1 to R17, 4SH, R14 PTFE — in inches and millimetres, with how to measure a crimp.`,
  path: PATH,
})

export const revalidate = 3600

const MEASURE_STEPS = [
  {
    title: 'Let it settle',
    body: 'Measure after the crimper has released and the ferrule has sprung back. A reading taken in the dies is not the finished diameter.',
  },
  {
    title: 'Halfway between ridges',
    body: 'Set the caliper jaws on the flat between two die ridges, never on a ridge. Ridges read high.',
  },
  {
    title: 'Twice, at 90°',
    body: 'Take two readings at right angles to each other. A crimp that is oval by more than the published tolerance is not round, whatever the average.',
  },
  {
    title: 'Compare, then decide',
    body: 'Inside the published limits, the assembly goes on to proof test. Outside them, it does not go into service: cut it off and remake it.',
  },
]

export default async function CrimpSpecificationsPage() {
  const entry = resourceEntry('crimp-specifications')
  const shared = await getResourcesShared('Crimp specification')

  const countByHose = new Map<string, number>()
  const countBySeries = new Map<string, number>()
  for (const row of CRIMP_SPECS) {
    countByHose.set(row.hose, (countByHose.get(row.hose) ?? 0) + 1)
    countBySeries.set(row.series, (countBySeries.get(row.series) ?? 0) + 1)
  }

  const datasetLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Hydraulic hose crimp specifications',
    description: `Finished crimp diameter and die position for ${totals.settings} hose and fitting series combinations.`,
    url: urlFor(PATH),
    isAccessibleForFree: true,
    variableMeasured: ['Hose type', 'Dash size', 'Fitting series', 'Crimp diameter (in)', 'Crimp diameter (mm)', 'Die position'],
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Resources', url: urlFor('/resources') },
              { name: entry.title, url: urlFor(PATH) },
            ],
          }),
          datasetLd,
        ]}
      />
      <ResourcePage
        entry={entry}
        hero={{
          eyebrow: 'Crimp specifications · maker’s settings',
          lead: 'Crimp diameters by hose and fitting series.',
          emphasis: 'Measured, never guessed.',
          lede: `The finished crimp diameter and die position for ${totals.settings} combinations of hose and fitting series we supply. Pick the hose, the series and the size, set the crimper, then check the result with calipers against the figure here.`,
          spec: [
            ['Source', 'Maker’s published settings'],
            ['Applies to', 'The hose and series named, only'],
            ['Units', 'in · mm'],
            ['Tolerance', 'Per fitting series; ask'],
            ['Checked', RESOURCES_LAST_CHECKED],
          ],
          stats: [
            { value: String(totals.settings), label: 'Crimp settings' },
            { value: String(totals.hoses), label: 'Hose types' },
            { value: String(totals.series), label: 'Fitting series' },
            { value: String(totals.sizes), label: 'Dash sizes' },
          ],
        }}
        contents={[
          { id: 'find', label: 'Find a crimp setting' },
          { id: 'measure', label: 'Measuring a finished crimp' },
          { id: 'hoses', label: 'Hose types in the chart' },
          { id: 'series', label: 'Fitting series in the chart' },
        ]}
        railNote={{
          title: 'A matched pair, never a universal chart',
          body: (
            <>
              Each figure is for one maker’s hose in the same maker’s fitting series. Another maker’s 100R2, or a fitting
              from another series, needs that maker’s figure — the outside diameters, wire and ferrule wall all differ.
            </>
          ),
        }}
        related={resourceEntries().filter((e) => e.key !== 'crimp-specifications')}
        cta={shared.cta}
        contact={shared.contact}
      >
        <ResourceSection
          id="find"
          number="/01"
          title="Find a crimp setting."
          lede="Narrow by hose, fitting series and size. Each filter only offers what the chart actually publishes for the choices before it."
        >
          <div
            role="note"
            className="mb-5 flex gap-3 rounded-md border border-[oklch(0.86_0.08_78)] bg-ih-warning-soft px-4 py-3.5"
          >
            <span className="mono shrink-0 pt-px text-[10px] uppercase tracking-[0.12em] text-ih-warning-ink">Read first</span>
            <p className="text-[13.5px] leading-[1.6] text-ih-ink-2">
              These settings apply only to the hose and fitting series named in each row. Never crimp another maker’s hose
              or fitting to them. If you are not sure whose hose you have,{' '}
              <Link href="/blog/how-to-read-a-hose-layline" className="text-ih-accent hover:underline">
                read the layline
              </Link>{' '}
              or send us a photo.
            </p>
          </div>
          <CrimpFinder />
          <p className="mt-4 text-[12.5px] leading-[1.6] text-ih-muted">
            Die positions: <strong className="font-medium text-ih-ink-2">{CRIMP_DIE_POSITIONS.full.label}</strong> —{' '}
            {CRIMP_DIE_POSITIONS.full.description.toLowerCase()}{' '}
            <strong className="font-medium text-ih-ink-2">{CRIMP_DIE_POSITIONS.knurl.label}</strong> —{' '}
            {CRIMP_DIE_POSITIONS.knurl.description.toLowerCase()}
          </p>
        </ResourceSection>

        <ResourceSection
          id="measure"
          number="/02"
          title="Measuring a finished crimp."
          lede={
            <>
              The crimper’s dial is a setting, not a result. Tooling wear and die tolerances move the finished diameter, so
              every first crimp of a run gets measured. Why it matters is in{' '}
              <Link href="/blog/hydraulic-hose-crimp-faults" className="text-ih-accent hover:underline">
                crimp too tight, crimp too loose
              </Link>
              .
            </>
          }
        >
          <HairlineGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {MEASURE_STEPS.map((step, i) => (
              <HairlineCell key={step.title} className="flex flex-col gap-2 px-5 pb-5 pt-[18px]">
                <span className="font-mono text-[10.5px] tracking-[0.1em] text-ih-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[15.5px] font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="text-[12.5px] leading-[1.6] text-ih-muted">{step.body}</p>
              </HairlineCell>
            ))}
          </HairlineGrid>
        </ResourceSection>

        <ResourceSection
          id="hoses"
          number="/03"
          title="Hose types in the chart."
          lede="Where we list the same maker’s hose, its product page is linked. Grades without a link are supplied to order."
        >
          <RefTable
            caption="Hose types covered by the crimp chart"
            captionHidden
            minWidthClass="min-w-[600px]"
            head={
              <tr>
                <th scope="col" className={TH}>
                  Hose
                </th>
                <th scope="col" className={TH}>
                  Construction
                </th>
                <th scope="col" className={TH_NUM}>
                  Settings
                </th>
                <th scope="col" className={TH}>
                  On this site
                </th>
              </tr>
            }
          >
            {CRIMP_HOSES.map((hose) => (
              <tr key={hose.code} className={TR}>
                <th scope="row" className={TD_ROW_HEAD}>
                  {hose.name}
                </th>
                <td className={`${TD} font-sans text-[13.5px]`}>{hose.construction}</td>
                <td className={TD_NUM}>{countByHose.get(hose.code) ?? 0}</td>
                <td className={`${TD} font-sans text-[13px]`}>
                  {hose.href ? (
                    <Link href={hose.href} className="text-ih-accent hover:underline">
                      View hose
                    </Link>
                  ) : (
                    <span className="text-ih-muted">To order</span>
                  )}
                </td>
              </tr>
            ))}
          </RefTable>
        </ResourceSection>

        <ResourceSection
          id="series"
          number="/04"
          title="Fitting series in the chart."
          lede="A series is a family of fittings made to one ferrule design. The same thread and the same hose can need a different crimp in a different series."
        >
          <RefTable
            caption="Fitting series covered by the crimp chart"
            captionHidden
            minWidthClass="min-w-[600px]"
            head={
              <tr>
                <th scope="col" className={TH}>
                  Series
                </th>
                <th scope="col" className={TH}>
                  What it is
                </th>
                <th scope="col" className={TH_NUM}>
                  Settings
                </th>
                <th scope="col" className={TH}>
                  On this site
                </th>
              </tr>
            }
          >
            {CRIMP_SERIES.map((series) => (
              <tr key={series.code} className={TR}>
                <th scope="row" className={TD_ROW_HEAD}>
                  {series.name}
                </th>
                <td className={`${TD} whitespace-normal font-sans text-[13.5px]`}>{series.description}</td>
                <td className={TD_NUM}>{countBySeries.get(series.code) ?? 0}</td>
                <td className={`${TD} font-sans text-[13px]`}>
                  {series.href ? (
                    <Link href={series.href} className="text-ih-accent hover:underline">
                      View fittings
                    </Link>
                  ) : (
                    <span className="text-ih-muted">To order</span>
                  )}
                </td>
              </tr>
            ))}
          </RefTable>
        </ResourceSection>
      </ResourcePage>
    </>
  )
}
