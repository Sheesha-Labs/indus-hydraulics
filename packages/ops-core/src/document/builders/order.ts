import { compare, sub, toDecimalString } from '../../money/decimal'
import type {
  ClientSafeOrderDoc,
  CreditNoteInput,
  InvoiceInput,
  OaInput,
  PiInput,
  ShippingDocInput,
} from '../safe'
import { amountInWords } from '../words'
import { documentTotals, money, percentOf, qty, type DocTotals } from '../totals'
import type { DocBlock, HouseDocument } from '../types'
import {
  bankBlock,
  clientAmount,
  docDate,
  houseClientRows,
  shownNumber,
  termsBlocks,
  totalRows,
  type BuildContext,
} from './common'

/**
 * Client order documents (house layout): order acknowledgement, proforma, tax invoice, credit note, packing
 * list and delivery note. Built only from ClientSafeOrderDoc inputs (no supplier, cost or margin field).
 */

type Base = OaInput | PiInput | InvoiceInput | CreditNoteInput

function totalsOf(d: Base): DocTotals {
  return documentTotals({
    lines: d.lines.map((l) => ({ amount: clientAmount(l), vat: l.vat ?? 'standard' })),
    currency: d.currency,
    ...(d.aedRate ? { aedRate: d.aedRate } : {}),
  })
}

function issuedBy(ctx: BuildContext) {
  return { label: 'Issued by', name: ctx.signer.name, lines: [ctx.signer.role] }
}

function table(d: Base): DocBlock {
  return {
    t: 'table',
    cols: ['#', 'Item & description', 'Qty', 'Rate', 'Amount'],
    rows: houseClientRows(d.lines),
  }
}

export function buildOa(d: ClientSafeOrderDoc<OaInput>, ctx: BuildContext): HouseDocument {
  const t = totalsOf(d)
  return {
    layout: 'house',
    kind: 'oa',
    eyebrow: 'Order acknowledgement',
    title: 'Order acknowledgement',
    no: shownNumber(d.number, d.previewNumber, ctx),
    meta: [
      { label: 'Date', value: docDate(d.date) },
      { label: 'Your order', value: d.clientPo },
      ...(d.quotationRef ? [{ label: 'Our quotation', value: d.quotationRef }] : []),
      { label: 'Currency', value: d.currency },
      ...(d.delivery ? [{ label: 'Delivery', value: d.delivery }] : []),
    ],
    footLabel: d.footLabel ?? ctx.template?.footLabel ?? '',
    party: [d.billTo, issuedBy(ctx)],
    ...(d.subject ? { subject: { text: d.subject } } : {}),
    blocks: [
      table(d),
      { t: 'totals', words: amountInWords(t.total, d.currency), rows: totalRows(t, d.currency) },
      ...termsBlocks(ctx.terms, 'T', 'Terms'),
      ...bankBlock(ctx),
    ],
  }
}

/** Proforma: the order total and the advance due now (advancePct of the total). */
export function buildPi(d: ClientSafeOrderDoc<PiInput>, ctx: BuildContext): HouseDocument {
  const t = totalsOf(d)
  const due = percentOf(t.total, d.advancePct)
  const no = shownNumber(d.number, d.previewNumber, ctx)
  return {
    layout: 'house',
    kind: 'pi',
    eyebrow: 'Proforma invoice',
    title: 'Proforma invoice',
    no,
    meta: [
      { label: 'Date', value: docDate(d.date) },
      { label: 'Order', value: d.clientPo },
      { label: 'Advance', value: `${qty(d.advancePct)}%` },
      { label: 'Currency', value: d.currency },
    ],
    footLabel: d.footLabel ?? ctx.template?.footLabel ?? '',
    party: [d.billTo, issuedBy(ctx)],
    subject: { text: d.subject ?? `ADVANCE PAYMENT · ${qty(d.advancePct)}% OF ORDER VALUE` },
    blocks: [
      table(d),
      {
        t: 'totals',
        words: amountInWords(due, d.currency),
        rows: [
          ...totalRows(t, d.currency),
          { label: `Advance ${qty(d.advancePct)}%`, value: money(due) },
          { label: `Due now (${d.currency})`, value: money(due), grand: true },
        ],
      },
      ...termsBlocks([...(ctx.terms ?? []), { label: 'Reference', text: no }], 'P', 'Payment'),
      ...bankBlock(ctx),
    ],
  }
}

/**
 * Tax invoice: VAT per line, the VAT in AED at the invoice-date rate when the invoice is not in AED (UAE tax
 * invoices must state it), the advance received deducted.
 */
export function buildInvoice(
  d: ClientSafeOrderDoc<InvoiceInput>,
  ctx: BuildContext
): HouseDocument {
  const t = totalsOf(d)
  if (d.currency !== 'AED' && compare(t.vat, '0') !== 0 && !d.aedRate)
    throw new RangeError('A tax invoice not in AED with VAT needs the AED rate of the invoice date')
  const advance = d.advancePaid ?? null
  if (advance && compare(advance, t.total) > 0)
    throw new RangeError('The advance is larger than the invoice total')
  const balanceDue = advance ? toDecimalString(sub(t.total, advance), 2) : t.total
  const balance = money(balanceDue)
  const rows = totalRows(t, d.currency)
  return {
    layout: 'house',
    kind: 'invoice',
    eyebrow: 'Tax invoice',
    title: 'Tax invoice',
    no: shownNumber(d.number, d.previewNumber, ctx),
    meta: [
      { label: 'Date', value: docDate(d.date) },
      { label: 'Order', value: d.clientPo },
      ...(d.deliveryNote ? [{ label: 'Delivery note', value: d.deliveryNote }] : []),
      { label: 'Currency', value: d.currency },
    ],
    footLabel: d.footLabel ?? ctx.template?.footLabel ?? '',
    party: [d.billTo, issuedBy(ctx)],
    ...(d.subject ? { subject: { text: d.subject } } : {}),
    blocks: [
      table(d),
      {
        t: 'totals',
        words: amountInWords(balanceDue, d.currency),
        rows: advance
          ? [
              ...rows.map((r) => (r.grand ? { label: r.label, value: r.value } : r)),
              {
                label: `Less advance${d.advanceRef ? ` ${d.advanceRef}` : ''}`,
                value: money(`-${advance}`),
              },
              { label: `Balance due (${d.currency})`, value: balance, grand: true },
            ]
          : rows,
      },
      ...termsBlocks(
        [...(d.paymentDue ? [{ label: 'Due', text: d.paymentDue }] : []), ...(ctx.terms ?? [])],
        'P',
        'Payment'
      ),
      ...bankBlock(ctx),
    ],
  }
}

/** Credit note: the credited lines against an invoice, with the reason. */
export function buildCreditNote(
  d: ClientSafeOrderDoc<CreditNoteInput>,
  ctx: BuildContext
): HouseDocument {
  const t = totalsOf(d)
  return {
    layout: 'house',
    kind: 'cn',
    eyebrow: 'Credit note',
    title: 'Credit note',
    no: shownNumber(d.number, d.previewNumber, ctx),
    meta: [
      { label: 'Date', value: docDate(d.date) },
      { label: 'Against invoice', value: d.invoiceRef },
      { label: 'Currency', value: d.currency },
    ],
    footLabel: d.footLabel ?? ctx.template?.footLabel ?? '',
    party: [d.billTo, issuedBy(ctx)],
    subject: { text: d.subject ?? `CREDIT NOTE AGAINST ${d.invoiceRef}` },
    blocks: [
      table(d),
      { t: 'totals', words: amountInWords(t.total, d.currency), rows: totalRows(t, d.currency) },
      { t: 'remark', text: d.reason },
      { t: 'sign', lead: ctx.signer.lead ?? 'Best regards,', name: ctx.signer.name },
    ],
  }
}

/** Packing list and delivery note: no prices; the shipment's own suffix "-01". */
export function buildShippingDoc(
  d: ClientSafeOrderDoc<ShippingDocInput>,
  ctx: BuildContext
): HouseDocument {
  const base = shownNumber(d.number, d.previewNumber, ctx)
  const no = `${base}-${String(d.shipmentNo).padStart(2, '0')}`
  const isDn = d.kind === 'dn'
  return {
    layout: 'house',
    kind: d.kind,
    eyebrow: isDn ? 'Delivery note' : 'Packing list',
    title: isDn ? 'Delivery note' : 'Packing list',
    no,
    meta: [
      { label: 'Date', value: docDate(d.date) },
      { label: 'Order', value: d.clientPo },
      ...(d.packages ? [{ label: 'Packages', value: String(d.packages) }] : []),
      ...(d.grossKg ? [{ label: 'Gross', value: `${qty(d.grossKg)} kg` }] : []),
    ],
    footLabel: d.footLabel ?? ctx.template?.footLabel ?? '',
    party: [{ ...d.billTo, label: isDn ? 'Deliver to' : d.billTo.label }, d.from],
    ...(d.subject ? { subject: { text: d.subject } } : {}),
    blocks: [
      {
        t: 'table',
        cols: ['#', 'Description', 'Qty', 'Package'],
        rows: d.lines.map((l) => ({
          cells: [
            { v: String(l.lineNo) },
            { v: l.description, ...(l.partNumber ? { bold: l.partNumber } : {}) },
            { v: `${qty(l.qty)} ${l.uom}` },
            { v: l.packages ?? '—' },
          ],
        })),
      },
      ...(isDn
        ? [
            { t: 'section' as const, n: 'R', title: 'Received by' },
            {
              t: 'terms' as const,
              rows: [
                { label: 'Name', value: '' },
                { label: 'Signature and stamp', value: '' },
                { label: 'Date', value: '' },
              ],
            },
          ]
        : []),
    ],
  }
}

export const buildPl = (d: ClientSafeOrderDoc<ShippingDocInput>, ctx: BuildContext) =>
  buildShippingDoc({ ...d, kind: 'pl' } as ClientSafeOrderDoc<ShippingDocInput>, ctx)
export const buildDn = (d: ClientSafeOrderDoc<ShippingDocInput>, ctx: BuildContext) =>
  buildShippingDoc({ ...d, kind: 'dn' } as ClientSafeOrderDoc<ShippingDocInput>, ctx)
