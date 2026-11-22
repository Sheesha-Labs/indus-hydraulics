import { Card } from '@indus/ops-ui/card'
import { formatFx, formatMoney } from '@indus/ops-ui/format'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { T2Record } from '@indus/ops-ui/templates'
import { Gantt, Timeline } from '@indus/ops-ui/timeline'
import {
  FX,
  GANTT,
  HEADERS,
  KIT_NOW,
  SAMPLE_LANDED,
  SAMPLE_LANDED_TOTAL,
  TIMELINE,
  type SampleLanded,
} from '../fixtures'
import { specimenRecord } from './shared'

type LandedRow = SampleLanded & { grand?: boolean }
const COLUMNS: Column<LandedRow>[] = [
  { key: 'component', label: 'Component', type: 'text', value: (r) => r.component },
  { key: 'basis', label: 'Basis', type: 'muted', value: (r) => r.basis },
  { key: 'eur', label: 'EUR', type: 'money', value: (r) => formatMoney('EUR', r.eur).amount },
  { key: 'aed', label: 'AED', type: 'money', value: (r) => formatMoney('AED', r.aed).amount },
]
const ROWS: LandedRow[] = [
  ...SAMPLE_LANDED,
  { key: 'landed', component: 'Landed cost', basis: '', ...SAMPLE_LANDED_TOTAL, grand: true },
]

/** The kit's supplier plan, its third order still on plan (the kit sample shows it late). */
const PLAN = GANTT.rows.map((r) =>
  r.key === 'g3'
    ? { ...r, bars: [{ start: 1, end: 5, kind: 'plan' as const, label: 'Production' }] }
    : r
)

/** The kit's timeline with the chaser line short enough for the 330 rail. */
const HISTORY = TIMELINE.map((t) => (t.key === 't3' ? { ...t, title: 'Supplier chased twice' } : t))

/** T2b · Record cockpit, order: the Freight tab (supplier plan and landed cost), the order rail. */
export default function T2BSpecimen() {
  const { header, strip } = specimenRecord({
    slug: 't2b',
    kind: 'order',
    tab: 'freight',
    cta: 'Book freight',
    ctaSegment: 'freight',
    did: HEADERS.orderDidSheet,
  })
  return (
    <T2Record
      header={header}
      strip={strip}
      rail={
        <>
          <Card
            eyebrow="Order"
            pairs={[
              { label: 'Order value', value: 'USD 200,000' },
              { label: 'Advance', value: 'USD 60,000.00 · received' },
              { label: 'Client delivery', value: '14 Dec · DAP Plant 2' },
              { label: 'Margin', value: '13.7% · est. 15.4%' },
            ]}
          />
          <Timeline aria-label="Order history" items={HISTORY} />
        </>
      }
    >
      <Gantt caption="Supplier plan" axis={GANTT.axis} today={GANTT.today} rows={PLAN} />
      <DataTable
        caption="Landed cost"
        gridClass="grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_110px_120px]"
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.key}
        rowKind={(r) => (r.grand ? 'grand' : 'item')}
        rowTone={(r) => (r.mute ? 'mute' : undefined)}
        foot={formatFx('EUR', FX.EUR, '2026-10-02T08:00:00Z', { now: KIT_NOW })}
      />
    </T2Record>
  )
}
