import { add, type Fixed } from '../../money/decimal'
import type { SupplierSafePo, SupplierSafeRfq } from '../safe'
import { lineAmount, money } from '../totals'
import type { HouseDocument } from '../types'
import { docDate, shownNumber, sign, supplierTable, termsBlocks, type BuildContext } from './common'

/**
 * Supplier documents (house layout): the RFQ and the PO. Built only from SupplierSafe* inputs: cleaned
 * descriptions, quantities, our line refs, Indus's delivery point and contact. No client name, ref, part
 * number, site, vessel, project or ENQ ref can reach them (types, then the factories at run time).
 */

export function buildRfq(r: SupplierSafeRfq, ctx: BuildContext): HouseDocument {
  return {
    layout: 'house',
    kind: 'rfq',
    eyebrow: 'Request for quotation',
    title: 'Request for quotation',
    no: r.ref,
    meta: [
      { label: 'Date', value: docDate(r.date) },
      { label: 'Reply by', value: docDate(r.replyBy) },
      ...(r.currency ? [{ label: 'Currency', value: r.currency }] : []),
      { label: 'Lines', value: String(r.lines.length) },
    ],
    footLabel: r.footLabel ?? ctx.template?.footLabel ?? '',
    party: [r.supplier, r.from],
    subject: { text: r.subject ?? `RFQ ${r.ref} · DELIVERY ${r.deliveryPoint.toUpperCase()}` },
    blocks: [
      { t: 'table', ...supplierTable(r.lines, false, ctx.template?.columns) },
      ...termsBlocks(ctx.terms, 'R', 'Please quote'),
      { t: 'sign', lead: sign(ctx).lead, name: ctx.signer.name },
    ],
  }
}

/** The supplier PO: prices are the supplier's own offer, never our client price. */
export function buildPo(p: SupplierSafePo, ctx: BuildContext): HouseDocument {
  const total = p.lines.reduce<Fixed>((s, l) => {
    if (!l.rate) throw new RangeError(`PO line ${l.lineNo} has no price from the supplier's offer`)
    return add(s, lineAmount(l.qty, l.rate))
  }, 0n)
  return {
    layout: 'house',
    kind: 'po',
    eyebrow: 'Purchase order',
    title: 'Purchase order',
    no: shownNumber(p.number, p.previewNumber, ctx),
    meta: [
      { label: 'Date', value: docDate(p.date) },
      ...(p.offerRef ? [{ label: 'Your offer', value: p.offerRef }] : []),
      { label: 'Currency', value: p.currency },
      ...(p.deliverBy ? [{ label: 'Deliver by', value: docDate(p.deliverBy) }] : []),
    ],
    footLabel: p.footLabel ?? ctx.template?.footLabel ?? '',
    party: [p.supplier, p.from],
    subject: { text: p.subject ?? `PURCHASE ORDER · DELIVERY ${p.deliveryPoint.toUpperCase()}` },
    blocks: [
      { t: 'table', ...supplierTable(p.lines, true, ctx.template?.columns) },
      {
        t: 'totals',
        rows: [
          { label: 'Sub total', value: money(total) },
          { label: `Total (${p.currency})`, value: money(total), grand: true },
        ],
      },
      ...termsBlocks(ctx.terms, 'T', 'Terms'),
      { t: 'sign', lead: sign(ctx).lead, name: ctx.signer.name },
    ],
  }
}
