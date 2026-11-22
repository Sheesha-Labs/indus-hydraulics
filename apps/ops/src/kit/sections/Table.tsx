import {
  formatDate,
  formatFx,
  formatMoney,
  listDecimals,
  quotationSlug,
} from '@indus/ops-ui/format'
import { cn } from '@indus/ops-ui/lib/cn'
import { Chip } from '@indus/ops-ui/status'
import { DataTable, TableSkeleton, type Column } from '@indus/ops-ui/table'
import type { ReactNode } from 'react'
import {
  COMPARE_SUPPLIERS,
  FX,
  KIT_NOW,
  SAMPLE_COMPARE,
  SAMPLE_HISTORY,
  SAMPLE_LANDED,
  SAMPLE_LANDED_TOTAL,
  SAMPLE_LINES,
  SAMPLE_LINES_SUBTOTAL,
  SAMPLE_QUOTATIONS,
  type SampleCompare,
  type SampleHistory,
  type SampleLanded,
  type SampleLine,
  type SampleQuotation,
} from '../fixtures'
import { SupplierIndexDemo, TableStateDemo } from './TableDemos'

/** Set to 'built' when S01-T05 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/table; inside the L1 mirror (k03) they are
 * hidden so the card keeps the sheet's height.
 */
function Row({
  name,
  code,
  note,
  full = false,
  column = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  column?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k03]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className={cn('flex gap-3', column ? 'flex-col items-start' : 'flex-wrap items-center')}>
        {children}
      </div>
    </div>
  )
}

// ---- Presets: the kit's six samples as typed columns. Money is formatted by format.ts. ----

type LineRow = SampleLine & { grand?: boolean }
const usd = (v: string) => formatMoney('USD', v).amount
/** Item rows print "—" for a missing value; the subtotal row leaves the cell blank. */
const orDash = (r: LineRow, v: string) => (r.grand ? '' : v || '—')

const LINE_COLUMNS: Column<LineRow>[] = [
  { key: 'n', label: '#', type: 'muted', value: (r) => (r.grand ? '' : r.n) },
  {
    key: 'part',
    label: 'Part',
    type: 'ref',
    value: (r) => r.part,
    brand: (r) => r.brand,
    href: (r) => (r.grand ? undefined : `/_kit/table?line=${r.n}`),
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
    chip: { family: 'line', word: (r) => r.state },
  },
]
const LINE_ROWS: LineRow[] = [
  ...SAMPLE_LINES,
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

type LandedRow = SampleLanded & { grand?: boolean }
const LANDED_COLUMNS: Column<LandedRow>[] = [
  { key: 'component', label: 'Component', type: 'text', value: (r) => r.component },
  { key: 'basis', label: 'Basis', type: 'muted', value: (r) => r.basis },
  { key: 'eur', label: 'EUR', type: 'money', value: (r) => formatMoney('EUR', r.eur).amount },
  { key: 'aed', label: 'AED', type: 'money', value: (r) => formatMoney('AED', r.aed).amount },
]
const LANDED_ROWS: LandedRow[] = [
  ...SAMPLE_LANDED,
  { key: 'landed', component: 'Landed cost', basis: '', ...SAMPLE_LANDED_TOTAL, grand: true },
]

const QUOTATION_DECIMALS = listDecimals(SAMPLE_QUOTATIONS.map((q) => q.value))
const QUOTATION_COLUMNS: Column<SampleQuotation>[] = [
  {
    key: 'no',
    label: 'Number',
    type: 'ref',
    value: (r) => r.no,
    href: (r) => `/_kit/table?quotation=${quotationSlug(r.no)}`,
  },
  { key: 'client', label: 'Client', type: 'text', value: (r) => r.client },
  { key: 'enquiry', label: 'Enquiry', type: 'muted', value: (r) => r.enquiry },
  {
    key: 'value',
    label: 'Value',
    type: 'money',
    value: (r) => formatMoney(r.ccy, r.value, { decimals: QUOTATION_DECIMALS }).amount,
  },
  { key: 'ccy', label: 'Ccy', type: 'muted', value: (r) => r.ccy },
  { key: 'sent', label: 'Sent', type: 'muted', value: (r) => formatDate(r.sent, { now: KIT_NOW }) },
  {
    key: 'status',
    label: 'Client status',
    type: 'chip',
    // A superseded quotation has no client status: the struck row says it.
    value: () => 'Superseded',
    chip: { family: 'client', word: (r) => r.status },
  },
  { key: 'next', label: 'Next touch', type: 'muted', value: (r) => r.next || '—' },
  { key: 'prob', label: 'Prob.', type: 'num', value: (r) => r.prob || '—' },
]

const comparePrice = (v: string) => (/^\d/.test(v) ? formatMoney('AED', v).amount : v || '—')
const COMPARE_COLUMNS: Column<SampleCompare>[] = [
  { key: 'line', label: 'Line', type: 'text', value: (r) => r.line, sub: (r) => r.qty },
  ...COMPARE_SUPPLIERS.map((name, i): Column<SampleCompare> => ({
    key: `s${i}`,
    label: name,
    type: 'money',
    value: (r) => comparePrice(r.prices[i] ?? ''),
  })),
  {
    key: 'pick',
    label: 'Pick',
    type: 'text',
    value: (r) => (r.pick ? <Chip tone="n" label={r.pick} className="h-io-tag px-[7px]" /> : null),
  },
]

const HISTORY_COLUMNS: Column<SampleHistory>[] = [
  { key: 'date', label: 'Date', type: 'muted', value: (r) => formatDate(r.date, { now: KIT_NOW }) },
  { key: 'supplier', label: 'Supplier', type: 'text', value: (r) => r.supplier },
  { key: 'ref', label: 'Quote', type: 'ref', value: (r) => r.ref },
  {
    key: 'price',
    label: 'Price',
    type: 'money',
    value: (r) => formatMoney(r.ccy, r.price, { decimals: r.ccy === 'JPY' ? 'list' : 'doc' }).text,
  },
  { key: 'lead', label: 'Lead time', type: 'muted', value: (r) => r.lead },
]

const LINES_GRID =
  'grid-cols-[28px_150px_minmax(0,1.6fr)_50px_44px_minmax(0,1fr)_100px_110px_130px]'
const LANDED_GRID = 'grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_110px_120px]'
const QUOTATIONS_GRID =
  'grid-cols-[140px_minmax(0,1.3fr)_120px_100px_50px_70px_140px_minmax(0,1fr)_50px]'
const COMPARE_GRID = 'grid-cols-[minmax(0,1.4fr)_110px_110px_110px_110px]'
const HISTORY_GRID = 'grid-cols-[70px_minmax(0,1fr)_120px_110px_90px]'

/**
 * Table kit specimen: the L1 k03 mirror (the sheet's five rows, parts and widths with neutral samples),
 * then every other variant and state (/_kit/table only): sort links, pagination, keyboard and selection,
 * the bad and mute tones, bare, empty and loading.
 */
export default function TableSpecimen() {
  return (
    <>
      {/* ---- L1 k03 mirror ---- */}
      <Row
        name="Quotation lines"
        code={'sample="lines"'}
        note="Selected row (sel) and flagged row (flag); grand total row"
        column
      >
        <DataTable
          caption="Quotation lines"
          className="w-[1155px]"
          gridClass={LINES_GRID}
          columns={LINE_COLUMNS}
          rows={LINE_ROWS}
          rowKey={(r) => r.n}
          rowKind={(r) => (r.grand ? 'grand' : 'item')}
          rowTone={(r) => (r.flag ? 'flag' : undefined)}
          selectedKey="4"
          foot="Sample figures"
          footRight="Prices USD ex-works"
        />
      </Row>

      <Row
        name="Landed cost"
        code={'sample="landed"'}
        note="Breakdown in two currencies, rate in the foot"
      >
        <div className="flex w-[700px] flex-col gap-2.5">
          <DataTable
            caption="Landed cost"
            gridClass={LANDED_GRID}
            columns={LANDED_COLUMNS}
            rows={LANDED_ROWS}
            rowKey={(r) => r.key}
            rowKind={(r) => (r.grand ? 'grand' : 'item')}
            rowTone={(r) => (r.mute ? 'mute' : undefined)}
            foot={formatFx('EUR', FX.EUR, '2026-10-02T08:00:00Z', { now: KIT_NOW })}
          />
        </div>
      </Row>

      <Row
        name="Index"
        code={'sample="quotations"'}
        note="Index list rows; superseded rows strike through"
        column
      >
        <DataTable
          caption="Quotations"
          className="w-[1028px]"
          gridClass={QUOTATIONS_GRID}
          columns={QUOTATION_COLUMNS}
          rows={SAMPLE_QUOTATIONS}
          rowKey={(r) => r.no}
          rowTone={(r) => (r.superseded ? 'strike' : undefined)}
        />
      </Row>

      <Row name="Compare" code={'sample="compare"'} note="Group row, picks as chips">
        <div className="flex w-[700px] flex-col gap-2.5">
          <DataTable
            caption="Compare: landed cost per unit"
            gridClass={COMPARE_GRID}
            columns={COMPARE_COLUMNS}
            rows={SAMPLE_COMPARE}
            rowKey={(r) => r.key}
            rowKind={(r) => r.kind ?? 'item'}
            groupLabel={(r) => r.line}
            selectedKey="c1"
            foot="Lowest landed cost is suggested; you can override any cell"
          />
        </div>
        <div className="flex w-[420px] flex-col gap-2.5">
          <DataTable
            caption="Price history"
            dense
            gridClass={HISTORY_GRID}
            columns={HISTORY_COLUMNS}
            rows={SAMPLE_HISTORY}
            rowKey={(r) => r.key}
          />
        </div>
      </Row>

      <Row name="Suppliers · check" code={'sample="suppliers" check'} note="Bulk select column">
        <div className="flex w-[800px] flex-col gap-2.5">
          <SupplierIndexDemo />
        </div>
      </Row>

      {/* ---- Beyond the sheet (/_kit/table only) ---- */}
      <Row
        name="Sort · pages · keys"
        code="sort sortHref rowCount keyboard"
        note="Sort headers are links with aria-sort; J/K or ↑/↓ move the selected row, X checks it, Enter opens"
        full
      >
        <div className="flex w-[800px] flex-col gap-2.5">
          <TableStateDemo />
        </div>
      </Row>

      <Row
        name="Tones"
        code="rowTone bad|mute"
        note="bad and mute tones on item rows (sel, flag and strike are in the mirror above)"
        full
        column
      >
        <DataTable
          caption="Line tones"
          gridClass={LINES_GRID}
          className="w-[1155px]"
          columns={LINE_COLUMNS}
          rows={SAMPLE_LINES.slice(0, 3)}
          rowKey={(r) => r.n}
          rowTone={(r) => (r.n === '1' ? 'bad' : r.n === '2' ? 'mute' : undefined)}
        />
      </Row>

      <Row name="Bare · dense" code="bare dense" note="No frame, for a table inside a card" full>
        <div className="border-io-line rounded-io-card flex w-[760px] flex-col gap-2.5 border p-4">
          <DataTable
            caption="Price history, every column"
            bare
            dense
            gridClass={HISTORY_GRID}
            columns={HISTORY_COLUMNS}
            rows={SAMPLE_HISTORY}
            rowKey={(r) => r.key}
          />
        </div>
      </Row>

      <Row
        name="Empty · loading"
        code="empty · TableSkeleton"
        note="The empty slot replaces the body; TableSkeleton is the body of every loading.tsx (aria-busy)"
        full
      >
        <div className="flex w-[520px] flex-col gap-2.5">
          <DataTable
            caption="Supplier quotes on this line"
            gridClass={HISTORY_GRID}
            columns={HISTORY_COLUMNS}
            rows={[]}
            rowKey={(r) => r.key}
            empty={
              <p className="text-io-ink-3 px-3.5 py-3 text-[12.5px]">
                No supplier quotes on this line yet.
              </p>
            }
          />
        </div>
        <div className="flex w-[520px] flex-col gap-2.5">
          <TableSkeleton rows={3} cols={5} label="Loading lines…" />
        </div>
      </Row>
    </>
  )
}
