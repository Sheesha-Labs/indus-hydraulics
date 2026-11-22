import { Card } from '@indus/ops-ui/card'
import { formatMoney } from '@indus/ops-ui/format'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { T2Record } from '@indus/ops-ui/templates'
import {
  ASSISTANT,
  COMPANIES,
  HEADERS,
  SAMPLE_LINES,
  SAMPLE_LINES_SUBTOTAL,
  type SampleLine,
} from '../fixtures'
import { SpecimenProposal } from './islands'
import { ENQ, specimenRecord } from './shared'

type LineRow = SampleLine & { grand?: boolean }
const usd = (v: string) => formatMoney('USD', v).amount
const orDash = (r: LineRow, v: string) => (r.grand ? '' : v || '—')

/** The Lines tab: the kit's lines preset with Unit and Unit price hidden, as the board mounts it. */
export const LINE_COLUMNS: Column<LineRow>[] = [
  { key: 'n', label: '#', type: 'muted', value: (r) => (r.grand ? '' : r.n) },
  {
    key: 'part',
    label: 'Part',
    type: 'ref',
    value: (r) => r.part,
    brand: (r) => r.brand,
    href: (r) => (r.grand ? undefined : `/enquiries/${ENQ}/lines?line=${r.n}`),
  },
  { key: 'desc', label: 'Description', type: 'text', value: (r) => r.desc, sub: (r) => r.descSub },
  { key: 'qty', label: 'Qty', type: 'num', value: (r) => (r.grand ? '' : r.qty) },
  { key: 'uom', label: 'Unit', type: 'muted', value: (r) => (r.grand ? '' : r.uom) },
  { key: 'supplier', label: 'Supplier', type: 'text', value: (r) => orDash(r, r.supplier) },
  {
    key: 'unit',
    label: 'Unit price',
    type: 'money',
    value: (r) => orDash(r, r.unit && usd(r.unit)),
  },
  {
    key: 'total',
    label: 'Line total',
    type: 'money',
    value: (r) => (r.grand ? formatMoney('USD', r.total).text : orDash(r, r.total && usd(r.total))),
  },
  {
    key: 'state',
    label: 'State',
    type: 'chip',
    value: () => '',
    chip: { family: 'line', word: (r) => (r.grand ? undefined : r.state) },
  },
]

/** The kit's lines; line 6's supplier shortened so the row sets on one line, as the board's does. */
const LINE_ROWS: LineRow[] = [
  ...SAMPLE_LINES.map((l) => (l.n === '6' ? { ...l, supplier: 'Sample Valves' } : l)),
  {
    n: 'subtotal',
    part: '',
    desc: 'Subtotal · 5 of 6 lines priced',
    qty: '',
    uom: '',
    supplier: '',
    unit: '',
    total: SAMPLE_LINES_SUBTOTAL,
    state: 'Quoted',
    grand: true,
  },
]

/** T2a · Record cockpit: the enquiry on its Lines tab, the rail with the facts and one proposal. */
export default function T2ASpecimen() {
  const { header, strip } = specimenRecord({
    slug: 't2a',
    kind: 'enquiry',
    tab: 'lines',
    cta: 'Compare quotes',
    ctaSegment: 'compare',
    did: HEADERS.t2aDid,
    needs: 1,
  })
  return (
    <T2Record
      header={header}
      strip={strip}
      rail={
        <>
          <Card
            eyebrow="Enquiry"
            pairs={[
              { label: 'Client', value: COMPANIES.client },
              { label: 'Contact', value: 'Sam Sample' },
              { label: 'Lines', value: '12 · 9 quoted' },
              { label: 'Deadline', value: '30 Sep · 8 days', emphasis: 'bad' },
              {
                label: 'Value so far',
                value: formatMoney('USD', SAMPLE_LINES_SUBTOTAL, { decimals: 'list' }).text,
              },
            ]}
          />
          <SpecimenProposal
            id="A-26-11-20-0020"
            type={ASSISTANT.chase.type}
            record={{ label: 'Line 4', href: `/enquiries/${ENQ}/lines?line=4` }}
            level={{ label: ASSISTANT.chase.level }}
            headline={`Chase ${COMPANIES.supplier} a third time on line 4 tomorrow 09:00.`}
            state="collapsed"
            compact
            minutesAgo={12}
          />
        </>
      }
    >
      <DataTable
        caption="Enquiry lines"
        gridClass="grid-cols-[28px_150px_minmax(0,1.6fr)_50px_minmax(0,1fr)_110px_130px]"
        columns={LINE_COLUMNS}
        hide={['uom', 'unit']}
        rows={LINE_ROWS}
        rowKey={(r) => r.n}
        rowKind={(r) => (r.grand ? 'grand' : 'item')}
        rowTone={(r) => (r.flag ? 'flag' : undefined)}
        selectedKey="4"
        foot="Sample figures"
        footRight="Prices USD ex-works"
      />
    </T2Record>
  )
}
