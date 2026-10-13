import Link from 'next/link'
import {
  CONE_RATING_ROWS,
  RATING_CONNECTIONS,
  RATING_ROWS,
  RESOURCES_LAST_CHECKED,
  buildBreadcrumbLd,
  pressureRatingTotals,
  psiToBar,
  resourceEntries,
  resourceEntry,
  type ConeSeries,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { HairlineCell, HairlineGrid, JsonLd } from '@indus/ui'
import DeratingChart from '../../../../components/resources/DeratingChart'
import JointRatingCalculator from '../../../../components/resources/JointRatingCalculator'
import ResourcePage from '../../../../components/resources/ResourcePage'
import { ResourceSection } from '../../../../components/resources/ResourceLayout'
import { RefTable, TD, TD_NUM, TD_ROW_HEAD, TH, TH_NUM, TR } from '../../../../components/resources/RefTable'
import { getResourcesShared } from '../../../../lib/resources-content'
import { pageMetadata, urlFor } from '../../../../lib/seo'

/**
 * `/resources/fitting-pressure-ratings` — maximum working pressure by
 * connection and size, and the rule that a joint is rated by its weaker end.
 *
 * The conditions come BEFORE the numbers: carbon steel, 4:1 on minimum burst,
 * tested at SAE torque. A rating quoted without them is the kind of claim the
 * 2026-10-07 pressure audit removed from 104 listings.
 */

const totals = pressureRatingTotals()
const PATH = '/resources/fitting-pressure-ratings'

export const metadata = pageMetadata({
  title: 'Hydraulic Fitting Pressure Ratings by Connection and Size',
  description: `Maximum working pressure for NPTF, NPSM, JIC, flareless, ORFS, BSP and SAE Code 61/62 flange fittings by dash size, plus DIN 2353 metric — ${totals.ratings} ratings in psi and bar, and a joint calculator.`,
  path: PATH,
})

export const revalidate = 3600

const fmt = (n: number) => n.toLocaleString('en-GB')

const CONDITIONS = [
  {
    title: '4:1 on minimum burst',
    body: 'Each figure is a quarter of the connection’s minimum burst pressure — the same safety factor hydraulic hose is rated to.',
  },
  {
    title: 'Tested at SAE torque',
    body: 'Measured in hardened test blocks at the SAE recommended assembly torque. A joint made up loose or over-tight will not hold it.',
  },
  {
    title: 'Carbon steel only',
    body: 'Stainless steel and brass adapters rate differently, usually lower, and the figures here do not transfer. Ask for the material you are using.',
  },
  {
    title: 'The weaker end governs',
    body: 'An adapter is only as strong as its lower-rated end, and an assembly as its lowest part — the hose included.',
  },
]

const CHART_CONNECTIONS = ['nptf', 'jic', 'jic-swivel', 'orfs', 'bsp', 'code61'] as const
const CONE_SERIES: readonly { key: ConeSeries; label: string }[] = [
  { key: 'LL', label: 'LL · extra light' },
  { key: 'L', label: 'L · light' },
  { key: 'S', label: 'S · heavy' },
]

/** psi with bar beneath, or a muted dash. */
function Rating({ psi }: { psi: number | undefined }) {
  if (psi === undefined) return <span className="text-ih-muted-2">—</span>
  return (
    <span className="flex flex-col items-end leading-tight">
      <span className="text-ih-ink">{fmt(psi)}</span>
      <span className="text-[11px] text-ih-muted">{fmt(psiToBar(psi))} bar</span>
    </span>
  )
}

export default async function FittingPressureRatingsPage() {
  const entry = resourceEntry('fitting-pressure-ratings')
  const shared = await getResourcesShared('Fitting pressure rating')

  const datasetLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Hydraulic fitting pressure ratings',
    description: `Maximum working pressure for carbon steel hydraulic adapters and fittings by connection type and dash size — ${totals.ratings} ratings.`,
    url: urlFor(PATH),
    isAccessibleForFree: true,
    variableMeasured: ['Connection type', 'Dash size', 'Maximum working pressure (psi)', 'Maximum working pressure (bar)'],
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
          eyebrow: 'Pressure ratings · carbon steel · 4:1',
          lead: 'Fitting pressure ratings by connection and size.',
          emphasis: 'The weaker end always wins.',
          lede: `Maximum working pressure for ${RATING_CONNECTIONS.length} inch connection types and the three DIN 2353 metric series, in psi and bar. Pick the two ends of a joint below and the calculator names the one that limits it.`,
          spec: [
            ['Material', 'Carbon steel adapters and fittings'],
            ['Basis', '4:1 on minimum burst'],
            ['Test', 'SAE torque, hardened blocks'],
            ['Units', 'psi · bar'],
            ['Checked', RESOURCES_LAST_CHECKED],
          ],
          stats: [
            { value: String(totals.ratings), label: 'Ratings published' },
            { value: String(totals.connections), label: 'Connection types' },
            { value: String(totals.sizes), label: 'Inch sizes' },
            { value: '4:1', label: 'Safety factor' },
          ],
        }}
        contents={[
          { id: 'calculator', label: 'Rate a joint' },
          { id: 'conditions', label: 'What the figures assume' },
          { id: 'inch', label: 'Inch connections' },
          { id: 'derating', label: 'How ratings fall with size' },
          { id: 'metric', label: 'Metric 24° cone fittings' },
        ]}
        railNote={{
          title: 'A guideline, not a guarantee',
          body: (
            <>
              These are the maker’s recommended maximums for carbon steel. For stainless, brass, temperature above 100 °C or
              shock loads, send us the service and we will confirm the rating in writing.
            </>
          ),
        }}
        related={resourceEntries().filter((e) => e.key !== 'fitting-pressure-ratings')}
        cta={shared.cta}
        contact={shared.contact}
      >
        <ResourceSection
          id="calculator"
          number="/01"
          title="Rate a joint."
          lede="Choose the two ends and the size. The joint is rated at the lower of the two, and the panel says which end that is."
        >
          <JointRatingCalculator />
        </ResourceSection>

        <ResourceSection
          id="conditions"
          number="/02"
          title="What the figures assume."
          lede="Four conditions sit behind every number on this page. Change any one and the rating changes with it."
        >
          <HairlineGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {CONDITIONS.map((item) => (
              <HairlineCell key={item.title} className="flex flex-col gap-2 px-5 pb-5 pt-[18px]">
                <h3 className="text-[15.5px] font-medium tracking-[-0.02em]">{item.title}</h3>
                <p className="text-[12.5px] leading-[1.6] text-ih-muted">{item.body}</p>
              </HairlineCell>
            ))}
          </HairlineGrid>
        </ResourceSection>

        <ResourceSection
          id="inch"
          number="/03"
          title="Inch connections, carbon steel."
          lede={
            <>
              Maximum working pressure in psi, with bar beneath. The last column is two-wire SAE 100R2 hose of the same
              size — when it is lower than both ends, the hose is the limit, not the fitting. Hose ratings by grade are in{' '}
              <Link href="/blog/hydraulic-hose-pressure-by-size" className="text-ih-accent hover:underline">
                hose pressure by size
              </Link>
              .
            </>
          }
        >
          <RefTable
            caption="Maximum working pressure by connection type and dash size, psi (bar)"
            minWidthClass="min-w-[1040px]"
            head={
              <tr>
                <th scope="col" className={TH}>
                  Size
                </th>
                {RATING_CONNECTIONS.map((c) => (
                  <th key={c.id} scope="col" className={TH_NUM} title={`${c.name} — ${c.standard}`}>
                    {c.short}
                  </th>
                ))}
                <th scope="col" className={`${TH_NUM} border-l border-ih-border`}>
                  100R2 hose <span className="text-ih-muted-2">ref.</span>
                </th>
              </tr>
            }
          >
            {RATING_ROWS.map((row) => (
              <tr key={row.dash} className={TR}>
                <th scope="row" className={TD_ROW_HEAD}>
                  -{row.dash}
                  <span className="ml-2 font-normal text-ih-muted">{row.nominal}</span>
                </th>
                {RATING_CONNECTIONS.map((c) => (
                  <td key={c.id} className={TD_NUM}>
                    <Rating psi={row.psi[c.id]} />
                  </td>
                ))}
                <td className={`${TD_NUM} border-l border-ih-border bg-ih-surface-2/50`}>
                  <Rating psi={row.r2 ?? undefined} />
                </td>
              </tr>
            ))}
          </RefTable>
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
            {RATING_CONNECTIONS.map((c) => (
              <li key={c.id} className="text-[13px] leading-[1.55] text-ih-ink-2">
                <span className="mono mr-2 text-[11px] text-ih-ink">{c.short}</span>
                <span className="text-ih-muted">{c.standard} · </span>
                {c.note}
              </li>
            ))}
          </ul>
        </ResourceSection>

        <ResourceSection
          id="derating"
          number="/04"
          title="How ratings fall with size."
          lede="Six connections on one scale, from -4 to -32. Pipe threads and JIC swivels lose the most; ORFS and the Code 61 flange hold their rating much further. A dash on the baseline means no rating is published at that size."
        >
          <DeratingChart connections={CHART_CONNECTIONS} />
        </ResourceSection>

        <ResourceSection
          id="metric"
          number="/05"
          title="Metric 24° cone fittings, DIN 2353."
          lede="By tube O.D. and series. The same thread can belong to two series at two different ratings — M22×1.5 is a 15 mm light fitting at 3,750 psi and a 14 mm heavy one at 9,450 psi — so always name the series."
        >
          <RefTable
            caption="Maximum working pressure, DIN 2353 / ISO 8434-1 24° cone fittings, carbon steel"
            minWidthClass="min-w-[720px]"
            head={
              <tr>
                <th scope="col" className={TH}>
                  Tube O.D.
                </th>
                {CONE_SERIES.map((s) => (
                  <th key={s.key} scope="col" className={TH} colSpan={2}>
                    {s.label}
                  </th>
                ))}
              </tr>
            }
          >
            {CONE_RATING_ROWS.map((row) => (
              <tr key={row.tubeOd} className={TR}>
                <th scope="row" className={TD_ROW_HEAD}>
                  {row.tubeOd} mm
                </th>
                {CONE_SERIES.map((s) => {
                  const cell = row.series[s.key]
                  return cell ? (
                    <FragmentCells key={s.key} thread={cell.thread} psi={cell.psi} />
                  ) : (
                    <FragmentCells key={s.key} thread={null} psi={undefined} />
                  )
                })}
              </tr>
            ))}
          </RefTable>
        </ResourceSection>
      </ResourcePage>
    </>
  )
}

function FragmentCells({ thread, psi }: { thread: string | null; psi: number | undefined }) {
  return (
    <>
      <td className={TD}>{thread ?? <span className="text-ih-muted-2">—</span>}</td>
      <td className={TD_NUM}>
        <Rating psi={psi} />
      </td>
    </>
  )
}
