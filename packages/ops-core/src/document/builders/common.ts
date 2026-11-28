import {
  CLIENT_COLUMN_LABEL,
  DEFAULT_HOUSE_CLIENT_COLUMNS,
  PRICE_COLUMNS,
  SUPPLIER_COLUMN_LABEL,
  normaliseClientColumns,
  normaliseSupplierColumns,
  type ClientColumn,
  type SupplierColumn,
} from '../columns'
import type { DocBlock, DocCell, DocSign, DocTableRow, DocTotalRow } from '../types'
import type { ClientLineInput, SupplierLineInput } from '../safe'
import { lineAmount, money, qty, type DocTotals } from '../totals'

/**
 * What every builder needs besides the record (S11-T01). All of it is database content resolved at render
 * time: the template (Settings › Document templates, T05), the terms (Settings › Offer terms, T06), the bank
 * block and signatory (Settings › Company documents, T07). Nothing here is a literal of Indus's: the
 * repository is public. The letterhead itself is passed to the renderers, not to the builders.
 */
export interface DocTemplateOptions {
  /** Quotation line-table columns (board 57); cleaned by normaliseClientColumns. */
  columns?: readonly string[]
  /** Print the bank block on client documents (on by default where the kind carries one). */
  showBank?: boolean
  /** The disclaimer under the bank block; null hides it. */
  disclaimer?: string | null
  /** Middle of the running footer. */
  footLabel?: string
  /** What an unpriced line prints when it carries no note of its own (board 57 "Pending lines"). */
  pendingNote?: string
}

export interface BuildContext {
  template?: DocTemplateOptions
  /** Offer terms for this document, resolved for the client or supplier (T06). */
  terms?: { label: string; text: string }[]
  /** Client documents only. null when no confirmed bank block exists (the document then says so). */
  bank?: { lines: string[] } | null
  signer: { name: string; role: string; lead?: string }
  /** Placeholder for an unissued number ("INDUS/Q — next free"). */
  previewLabel?: string
}

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2026-11-20" → "20 Nov 2026". Anything not an ISO date is printed as given. */
export function docDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return DATE.format(new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!))).replace('Sept', 'Sep')
}

export const DASH = '—'

/** The number printed: the issued number, else the preview's, else the generic placeholder. */
export function shownNumber(
  n: string | null,
  preview: string | undefined,
  ctx: BuildContext
): string {
  return n ?? preview ?? ctx.previewLabel ?? 'Next free number'
}

export function sign(ctx: BuildContext): DocSign {
  return { lead: ctx.signer.lead ?? 'Best regards,', name: ctx.signer.name, role: ctx.signer.role }
}

/** Amount of a priced client line; null otherwise. */
export function clientAmount(l: ClientLineInput): string | null {
  if (l.state !== 'priced') return null
  if (!l.rate) throw new RangeError(`line ${l.lineNo} is priced but has no rate`)
  return lineAmount(l.qty, l.rate)
}

export const PRICE_TO_FOLLOW = 'Price to follow'

/** The client-visible note for a line without a price. */
export function unpricedNote(l: ClientLineInput, pending: string = PRICE_TO_FOLLOW): string {
  if (l.state === 'not_quoted') return l.note ? `Not quoted · ${l.note}` : 'Not quoted'
  return l.note ?? pending
}

const vatLabel = (l: ClientLineInput) => ((l.vat ?? 'standard') === 'standard' ? '5%' : '0%')

/** The quotation's line table, from the template's columns. Notes span the price columns. */
export function clientTable(
  lines: readonly ClientLineInput[],
  cols?: readonly string[],
  pending?: string
): { cols: string[]; rows: DocTableRow[] } {
  const columns = normaliseClientColumns(cols)
  const showCodeColumn = columns.includes('clientPartNo')
  const rows = lines.map((l): DocTableRow => {
    const amount = clientAmount(l)
    const cell = (c: ClientColumn): DocCell => {
      switch (c) {
        case 'no':
          return { v: String(l.lineNo) }
        case 'description':
          return showCodeColumn
            ? { v: l.description, ...(l.partNumber ? { sub: l.partNumber } : {}) }
            : { v: l.description, sub: l.clientPartNumber ?? l.partNumber ?? '' }
        case 'clientPartNo':
          return { v: l.clientPartNumber ?? DASH }
        case 'qty':
          return { v: qty(l.qty) }
        case 'uom':
          return { v: l.uom }
        case 'rate':
          return { v: l.rate ? money(l.rate) : DASH }
        case 'delivery':
          return { v: l.delivery ?? DASH }
        case 'tax':
          return { v: vatLabel(l) }
        case 'amount':
          return { v: amount ? money(amount) : DASH }
        case 'origin':
          return { v: l.origin ?? DASH }
        case 'hsCode':
          return { v: l.hsCode ?? DASH }
      }
    }
    if (amount !== null) return { cells: columns.map(cell) }
    const head = columns.filter((c) => !PRICE_COLUMNS.has(c)).map(cell)
    const span = columns.filter((c) => PRICE_COLUMNS.has(c)).length
    return {
      cells: [...head, { v: unpricedNote(l, pending), ...(span > 1 ? { span } : {}) }],
      flag: 'to-follow',
    }
  })
  // Unpriced rows put the price columns last; order the header the same way.
  return { cols: columns.map((c) => CLIENT_COLUMN_LABEL[c]), rows }
}

const HOUSE_CLIENT_LABEL: Record<ClientColumn, string> = {
  ...CLIENT_COLUMN_LABEL,
  clientPartNo: 'Your code',
  delivery: 'Delivery',
}

/**
 * The house client documents' line table (OA, proforma, invoice, credit note) from the template's columns.
 * The part number is the bold first line of the description; without a UoM column the quantity carries its
 * unit ("4 pcs"). An unpriced line's note spans the price columns.
 */
export function houseClientTable(
  lines: readonly ClientLineInput[],
  cols?: readonly string[],
  pending?: string
): { cols: string[]; rows: DocTableRow[] } {
  const columns = normaliseClientColumns(cols, DEFAULT_HOUSE_CLIENT_COLUMNS)
  const hasUom = columns.includes('uom')
  const rows = lines.map((l): DocTableRow => {
    const amount = clientAmount(l)
    const cell = (c: ClientColumn): DocCell => {
      switch (c) {
        case 'no':
          return { v: String(l.lineNo) }
        case 'description':
          return { v: l.description, ...(l.partNumber ? { bold: l.partNumber } : {}) }
        case 'clientPartNo':
          return { v: l.clientPartNumber ?? DASH }
        case 'qty':
          return { v: hasUom ? qty(l.qty) : `${qty(l.qty)} ${l.uom}` }
        case 'uom':
          return { v: l.uom }
        case 'rate':
          return { v: l.rate ? money(l.rate) : DASH }
        case 'delivery':
          return { v: l.delivery ?? DASH }
        case 'tax':
          return { v: vatLabel(l) }
        case 'amount':
          return { v: amount ? money(amount) : DASH }
        case 'origin':
          return { v: l.origin ?? DASH }
        case 'hsCode':
          return { v: l.hsCode ?? DASH }
      }
    }
    if (amount !== null) return { cells: columns.map(cell) }
    const head = columns.filter((c) => !PRICE_COLUMNS.has(c)).map(cell)
    const span = columns.filter((c) => PRICE_COLUMNS.has(c)).length
    return {
      cells: [...head, { v: unpricedNote(l, pending), ...(span > 1 ? { span } : {}) }],
      flag: 'to-follow',
    }
  })
  return { cols: columns.map((c) => HOUSE_CLIENT_LABEL[c]), rows }
}

/**
 * The supplier line table (RFQ, PO) from the template's columns: our line number, the cleaned description
 * with the part number and our ref under it (the ref only, when a part-number column is printed), qty, UoM;
 * on an RFQ the price column is left blank for the supplier, on a PO it carries their own offered price.
 */
export function supplierTable(
  lines: readonly SupplierLineInput[],
  priced: boolean,
  cols?: readonly string[]
): { cols: string[]; rows: DocTableRow[] } {
  const columns = normaliseSupplierColumns(cols, priced)
  const hasPartNo = columns.includes('partNo')
  const rows = lines.map((l): DocTableRow => {
    if (priced && !l.rate)
      throw new RangeError(`PO line ${l.lineNo} has no price from the supplier's offer`)
    const cell = (c: SupplierColumn): DocCell => {
      switch (c) {
        case 'no':
          return { v: String(l.lineNo).padStart(2, '0') }
        case 'description':
          return {
            v: l.description,
            sub: (hasPartNo ? [l.ourRef] : [l.partNumber, l.ourRef]).filter(Boolean).join(' · '),
          }
        case 'partNo':
          return { v: l.partNumber ?? DASH }
        case 'qty':
          return { v: qty(l.qty) }
        case 'uom':
          return { v: l.uom }
        case 'rate':
          return { v: priced ? money(l.rate!) : DASH }
        case 'amount':
          return { v: money(lineAmount(l.qty, l.rate!)) }
        case 'delivery':
          return { v: l.delivery ?? DASH }
        case 'targetDate':
          return { v: l.targetDate ? docDate(l.targetDate) : DASH }
      }
    }
    return { cells: columns.map(cell) }
  })
  const label = (c: SupplierColumn) =>
    !priced && c === 'rate'
      ? 'Your price'
      : priced && c === 'description'
        ? 'Item & description'
        : c === 'description'
          ? 'Description'
          : SUPPLIER_COLUMN_LABEL[c]
  return { cols: columns.map(label), rows }
}

/** Totals rows from DocTotals: sub total, discount, freight, VAT rows, total. */
export function totalRows(t: DocTotals, currency: string): DocTotalRow[] {
  const out: DocTotalRow[] = []
  for (const r of t.rows) {
    if (r.key === 'total') {
      if (t.discount) out.push({ label: 'Discount', value: money(`-${t.discount}`) })
      if (t.freight) out.push({ label: 'Freight', value: money(t.freight) })
      out.push({ label: `Total (${currency})`, value: money(r.value), grand: true })
    } else if (r.key === 'vat_aed') {
      out.push({ label: r.label, value: `AED ${money(r.value)}` })
    } else out.push({ label: r.label, value: money(r.value) })
  }
  return out
}

/** The terms block (numbered section + rows), or nothing when there are none. */
export function termsBlocks(terms: BuildContext['terms'], n: string, title: string): DocBlock[] {
  if (!terms?.length) return []
  return [
    { t: 'section', n, title },
    { t: 'terms', rows: terms.map((x) => ({ label: x.label, value: x.text })) },
  ]
}

/** Bank block for client documents: the confirmed lines, or a visible gap when none is confirmed. */
export function bankBlock(ctx: BuildContext, withSign = true): DocBlock[] {
  if (ctx.template?.showBank === false)
    return [{ t: 'sign', lead: sign(ctx).lead, name: ctx.signer.name }]
  return [
    {
      t: 'bank',
      ...(ctx.template?.disclaimer !== undefined ? { disclaimer: ctx.template.disclaimer } : {}),
      sign: withSign ? sign(ctx) : false,
    },
  ]
}
