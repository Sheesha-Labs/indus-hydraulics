import { z } from 'zod'

/**
 * Line-table columns (S11-T01, C36, board 57). Client documents may print only these; supplier documents
 * only those. There is no supplier, cost, landed or margin column anywhere: "Never print: Supplier, cost,
 * margin" is a property of this module, not a template setting (a test greps it).
 */
export const CLIENT_COLUMNS = [
  'no',
  'description',
  'clientPartNo',
  'qty',
  'uom',
  'rate',
  'delivery',
  'tax',
  'amount',
  'origin',
  'hsCode',
] as const
export type ClientColumn = (typeof CLIENT_COLUMNS)[number]
export const clientColumnSchema = z.enum(CLIENT_COLUMNS)

export const SUPPLIER_COLUMNS = [
  'no',
  'description',
  'partNo',
  'qty',
  'uom',
  'delivery',
  'targetDate',
] as const
export type SupplierColumn = (typeof SUPPLIER_COLUMNS)[number]
export const supplierColumnSchema = z.enum(SUPPLIER_COLUMNS)

export type ColumnKey = ClientColumn | SupplierColumn

export const CLIENT_COLUMN_LABEL: Record<ClientColumn, string> = {
  no: '#',
  description: 'Item & description',
  clientPartNo: 'Your code',
  qty: 'Qty',
  uom: 'UoM',
  rate: 'Rate',
  delivery: 'Wks',
  tax: 'Tax',
  amount: 'Amount',
  origin: 'Origin',
  hsCode: 'HS code',
}

export const SUPPLIER_COLUMN_LABEL: Record<SupplierColumn, string> = {
  no: '#',
  description: 'Description',
  partNo: 'Part no.',
  qty: 'Qty',
  uom: 'UoM',
  delivery: 'Lead time',
  targetDate: 'Needed by',
}

/** The quotation's line table as clients already receive it (the Estimate layout, board 156). */
export const DEFAULT_QUOTATION_COLUMNS: readonly ClientColumn[] = [
  'no',
  'description',
  'qty',
  'uom',
  'rate',
  'delivery',
  'tax',
  'amount',
]

/** Columns that hold a price: a "Price to follow" or "Not quoted" note spans them. */
export const PRICE_COLUMNS: ReadonlySet<ClientColumn> = new Set([
  'rate',
  'delivery',
  'tax',
  'amount',
])

/**
 * A template's column list, cleaned: only known client columns, each once; "no" and "description" in front
 * and "qty" always present, the template's order kept otherwise; the price columns together at the end with
 * "amount" last, so a "Price to follow" note can span them as one cell.
 */
export function normaliseClientColumns(cols: readonly string[] | undefined): ClientColumn[] {
  const want = (cols?.length ? cols : DEFAULT_QUOTATION_COLUMNS).filter((c): c is ClientColumn =>
    (CLIENT_COLUMNS as readonly string[]).includes(c)
  )
  const seen = new Set<ClientColumn>()
  const ordered: ClientColumn[] = []
  for (const c of ['no', 'description', ...want] as ClientColumn[]) {
    if (seen.has(c)) continue
    seen.add(c)
    ordered.push(c)
  }
  if (!seen.has('qty')) ordered.splice(2, 0, 'qty')
  const head = ordered.filter((c) => !PRICE_COLUMNS.has(c))
  const prices = ordered.filter((c) => PRICE_COLUMNS.has(c) && c !== 'amount')
  return prices.length || want.includes('amount') ? [...head, ...prices, 'amount'] : head
}
