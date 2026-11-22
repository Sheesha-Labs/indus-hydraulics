import { Stat } from '@indus/ops-ui/card'
import { Button } from '@indus/ops-ui/controls'
import { formatMoney } from '@indus/ops-ui/format'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { T12Client } from '@indus/ops-ui/templates'
import { SAMPLE_LINES, SAMPLE_LINES_SUBTOTAL, TEMPLATES, type SampleLine } from '../fixtures'
import { ProductMark } from './shared'

/**
 * The client's view of a quotation line: only what the client is quoted (C36). The type is built by
 * picking, so a supplier, line state, cost or margin cannot reach the page even by accident: the mapper
 * below copies these fields and nothing else.
 */
export interface ClientQuotationLine {
  n: string
  part: string
  brand?: string
  desc: string
  descSub?: string
  qty: string
  uom: string
  /** Decimal string; '' while the price is to follow. */
  unit: string
  total: string
  subtotal?: boolean
}

export function toClientLine(l: SampleLine): ClientQuotationLine {
  return {
    n: l.n,
    part: l.part,
    ...(l.brand ? { brand: l.brand } : {}),
    desc: l.desc,
    ...(l.descSub ? { descSub: l.descSub } : {}),
    qty: l.qty,
    uom: l.uom,
    unit: l.unit,
    total: l.total,
  }
}

const usd = (v: string) => formatMoney('USD', v).amount
const priced = SAMPLE_LINES.filter((l) => l.unit !== '').length

const ROWS: ClientQuotationLine[] = [
  ...SAMPLE_LINES.map(toClientLine),
  {
    n: 'subtotal',
    part: '',
    desc: `Subtotal · ${priced} of ${SAMPLE_LINES.length} lines priced`,
    qty: '',
    uom: '',
    unit: '',
    total: SAMPLE_LINES_SUBTOTAL,
    subtotal: true,
  },
]

/**
 * clientQuotationColumns (05 §5 T12 corrections, C36): #, part, description, qty, unit, unit price, line
 * total, and "Price to follow" where a line is not priced yet. No supplier, no state, no cost, no margin;
 * no links into the console.
 */
export const CLIENT_QUOTATION_COLUMNS: Column<ClientQuotationLine>[] = [
  { key: 'n', label: '#', type: 'muted', value: (r) => (r.subtotal ? '' : r.n) },
  { key: 'part', label: 'Part', type: 'text', value: (r) => r.part, brand: (r) => r.brand },
  { key: 'desc', label: 'Description', type: 'text', value: (r) => r.desc, sub: (r) => r.descSub },
  { key: 'qty', label: 'Qty', type: 'num', value: (r) => r.qty },
  { key: 'uom', label: 'Unit', type: 'muted', value: (r) => r.uom },
  {
    key: 'unit',
    label: 'Unit price',
    type: 'money',
    value: (r) => (r.subtotal ? '' : r.unit ? usd(r.unit) : 'Price to follow'),
  },
  {
    key: 'total',
    label: 'Line total',
    type: 'money',
    value: (r) =>
      r.subtotal ? formatMoney('USD', r.total).text : r.total ? usd(r.total) : '—',
  },
]

const GRID = 'grid-cols-[28px_150px_minmax(0,1.6fr)_44px_44px_120px_120px]'

/**
 * T12a · Client page: the online quotation, desktop and phone (the one responsive surface). On a phone the
 * table keeps its columns and scrolls sideways inside its own box; the page never does.
 */
export default function T12ASpecimen() {
  return (
    <T12Client
      brandBar={
        <>
          <ProductMark />
          <span className="text-io-ink-3 text-[12.5px]">{TEMPLATES.preparedFor}</span>
        </>
      }
      eyebrow={TEMPLATES.quotationEyebrow}
      title={TEMPLATES.quotationTitle}
      document={
        <div data-part="client-lines" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <DataTable
            caption="Quotation lines"
            className="min-w-[640px] lg:min-w-0"
            gridClass={GRID}
            columns={CLIENT_QUOTATION_COLUMNS}
            rows={ROWS}
            rowKey={(r) => r.n}
            rowKind={(r) => (r.subtotal ? 'grand' : 'item')}
            hover={false}
            foot="Line 4 follows on a supplementary quotation by 9 Oct"
            footRight="USD · DAP site"
          />
        </div>
      }
      summary={
        <Stat
          rows={[
            { label: 'Sub total', value: formatMoney('USD', SAMPLE_LINES_SUBTOTAL).text },
            { label: 'VAT · export', value: '0.00' },
            { label: 'Total', value: formatMoney('USD', SAMPLE_LINES_SUBTOTAL).text, total: true },
          ]}
        />
      }
      actions={
        <>
          <Button variant="navy" size="client">
            Accept quotation
          </Button>
          <Button size="client">Ask for changes</Button>
          <Button size="client">Download PDF</Button>
        </>
      }
      note={<p className="text-io-ink-3 text-[12px] leading-[1.5]">{TEMPLATES.contact}</p>}
    />
  )
}
