import Link from 'next/link'
import {
  RESOURCES_LAST_CHECKED,
  THREAD_SEATS,
  buildBreadcrumbLd,
  resourceEntries,
  resourceEntry,
  threadChartTotals,
  threadFamiliesByRegion,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { HairlineCell, HairlineGrid, JsonLd } from '@indus/ui'
import ResourcePage from '../../../../components/resources/ResourcePage'
import { ResourceSection } from '../../../../components/resources/ResourceLayout'
import { RefTable, TD, TD_ROW_HEAD, TH, TR } from '../../../../components/resources/RefTable'
import ThreadFamilyBlock from '../../../../components/resources/ThreadFamilyBlock'
import { getResourcesShared } from '../../../../lib/resources-content'
import { pageMetadata, urlFor } from '../../../../lib/seo'

/**
 * `/resources/thread-chart` — measured thread dimensions, family by family.
 *
 * Every table is server-rendered HTML from `THREAD_FAMILIES`. The page's job is
 * the bench question the identifier tool does not answer: "my calipers read
 * this and the gauge says that — what is it?"
 */

const totals = threadChartTotals()
const PATH = '/resources/thread-chart'

export const metadata = pageMetadata({
  title: 'Hydraulic Thread Chart — JIC, ORFS, ORB, NPT, BSP, Metric',
  description: `Thread size, pitch and male and female diameters for ${totals.connectionTypes} hydraulic connection types — JIC, ORFS, ORB, NPT, NPSM, BSPP, BSPT, metric and SAE flange — in inches and millimetres.`,
  path: PATH,
})

export const revalidate = 3600

const STEPS = [
  {
    title: 'Taper or parallel',
    body: 'Lay a straight edge along the male thread. Daylight at one end means a taper — NPT, NPTF or BSPT — and the seal is the thread itself.',
  },
  {
    title: 'Measure the O.D.',
    body: 'Calipers across the crests of the male thread, or inside the crests of the female. Compare with the male O.D. column below.',
  },
  {
    title: 'Count the pitch',
    body: 'A pitch gauge gives threads per inch or millimetres between crests. Diameter and pitch together narrow it to one or two rows.',
  },
  {
    title: 'Read the seat',
    body: 'Where rows share a thread, the seat decides it: a 37° cone, a 24° cone, an O-ring in a flat face, or an O-ring under the hex.',
  },
]

export default async function ThreadChartPage() {
  const entry = resourceEntry('thread-chart')
  const shared = await getResourcesShared('Thread identification')
  const american = threadFamiliesByRegion('american')
  const international = threadFamiliesByRegion('international')

  const datasetLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Hydraulic thread chart',
    description: `Thread size, pitch and male and female diameters for ${totals.connectionTypes} hydraulic connection types, in inches and millimetres.`,
    url: urlFor(PATH),
    isAccessibleForFree: true,
    variableMeasured: ['Dash size', 'Thread', 'Threads per inch or pitch', 'Male thread O.D.', 'Female thread I.D.'],
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
          eyebrow: 'Thread chart · SAE · ISO · ASME',
          lead: 'Hydraulic thread chart.',
          emphasis: 'Every common port and connector, by dash size.',
          lede: `Thread size, pitch and measured diameters for ${totals.connectionTypes} connection types, in inches and millimetres, with the seat or seal that tells look-alike threads apart. Measure the male thread, count the pitch, then find the row.`,
          spec: [
            ['Inch standards', 'SAE J514 · J512 · J1453 · J518'],
            ['Metric and BSP', 'ISO 228 · ISO 261 · ISO 8434'],
            ['Units', 'in · mm, both on every row'],
            ['Female I.D.', 'Approximate, for ID only'],
            ['Checked', RESOURCES_LAST_CHECKED],
          ],
          stats: [
            { value: String(totals.connectionTypes), label: 'Connection types' },
            { value: String(totals.families), label: 'Tables' },
            { value: String(totals.rows), label: 'Rows' },
            { value: String(THREAD_SEATS.length), label: 'Seats compared' },
          ],
        }}
        contents={[
          { id: 'identify', label: 'Identify a thread in four steps' },
          { id: 'seats', label: 'Seats and seals at a glance' },
          { id: 'american', label: 'Inch connections' },
          { id: 'international', label: 'BSP and metric connections' },
        ]}
        railNote={{
          title: 'Measure, never machine',
          body: (
            <>
              Female I.D. figures are approximate minor diameters, good for telling families apart. Do not machine a port
              or a thread to them; take dimensions from the standard named on each table.
            </>
          ),
        }}
        related={resourceEntries().filter((e) => e.key !== 'thread-chart')}
        cta={shared.cta}
        contact={shared.contact}
      >
        <ResourceSection
          id="identify"
          number="/01"
          title="Identify a thread in four steps."
          lede={
            <>
              Diameter and pitch narrow it down; the seat settles it. The{' '}
              <Link href="/tools/thread-identifier" className="text-ih-accent hover:underline">
                thread identifier
              </Link>{' '}
              asks the same questions interactively.
            </>
          }
        >
          {/* A real sequence, so the cells are numbered. */}
          <HairlineGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, i) => (
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
          id="seats"
          number="/02"
          title="Seats and seals at a glance."
          lede="Several families share a thread. None share a seat — and two different seat angles never seal on each other, however tight the nut."
        >
          <RefTable
            caption="How each connection seals"
            captionHidden
            minWidthClass="min-w-[680px]"
            head={
              <tr>
                <th scope="col" className={TH}>
                  Connection
                </th>
                <th scope="col" className={TH}>
                  Seat
                </th>
                <th scope="col" className={TH}>
                  Seals on
                </th>
                <th scope="col" className={TH}>
                  Standard
                </th>
              </tr>
            }
          >
            {THREAD_SEATS.map((seat) => (
              <tr key={seat.connection} className={TR}>
                <th scope="row" className={`${TD_ROW_HEAD} font-sans text-[13.5px]`}>
                  <a href={`#${seat.anchor}`} className="hover:text-ih-accent">
                    {seat.connection}
                  </a>
                </th>
                <td className={TD}>{seat.seat}</td>
                <td className={`${TD} font-sans text-[13.5px]`}>{seat.sealsOn}</td>
                <td className={`${TD} text-ih-muted`}>{seat.standard}</td>
              </tr>
            ))}
          </RefTable>
        </ResourceSection>

        <ResourceSection
          id="american"
          number="/03"
          title="Inch connections."
          lede="JIC, SAE O-ring boss, ORFS, flare, flareless, pipe threads and four-bolt flanges. Dash size is the tube O.D. or pipe size in sixteenths of an inch."
        >
          <FamilyJumpList families={american} />
          <div className="mt-10 flex flex-col gap-14">
            {american.map((family) => (
              <ThreadFamilyBlock key={family.id} family={family} />
            ))}
          </div>
        </ResourceSection>

        <ResourceSection
          id="international"
          number="/04"
          title="BSP and metric connections."
          lede="British pipe threads, metric ports, the 24° cone bite-type fitting and the Japanese 30° flares. Metric threads are named by their real size; BSP by a nominal pipe size."
        >
          <FamilyJumpList families={international} />
          <div className="mt-10 flex flex-col gap-14">
            {international.map((family) => (
              <ThreadFamilyBlock key={family.id} family={family} />
            ))}
          </div>
        </ResourceSection>
      </ResourcePage>
    </>
  )
}

function FamilyJumpList({ families }: { families: readonly { id: string; name: string }[] }) {
  return (
    <nav aria-label="Tables in this section">
      <ul className="flex flex-wrap gap-2">
        {families.map((family) => (
          <li key={family.id}>
            <a
              href={`#${family.id}`}
              className="inline-flex h-[30px] items-center rounded-full border border-ih-border bg-ih-surface px-3 text-[12.5px] text-ih-ink-2 transition-colors duration-150 hover:border-ih-accent hover:text-ih-accent"
            >
              {family.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
