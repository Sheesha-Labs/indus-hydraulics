import { documentNumber } from '../revision'
import type { ClientSafeQuotation } from '../safe'
import { documentTotals } from '../totals'
import type { EstimateDocument } from '../types'
import {
  clientAmount,
  clientTable,
  docDate,
  shownNumber,
  totalRows,
  type BuildContext,
} from './common'

/**
 * The client quotation in the Estimate layout clients already receive (ADR-14, board 156). "Price to follow"
 * and "Not quoted · <reason>" rows span the price columns; VAT may differ per line (mixed); a quotation not in
 * AED with VAT shows the VAT in AED too. A revision keeps the base number and adds "-R{n}" (ADR-15); a
 * supplementary quotation has its own number and says so.
 */
export function buildQuotation(q: ClientSafeQuotation, ctx: BuildContext): EstimateDocument {
  const table = clientTable(q.lines, ctx.template?.columns)
  const totals = documentTotals({
    lines: q.lines.map((l) => ({ amount: clientAmount(l), vat: l.vat ?? 'standard' })),
    currency: q.currency,
    ...(q.discount ? { discount: q.discount } : {}),
    ...(q.freight ? { freight: q.freight } : {}),
    ...(q.aedRate ? { aedRate: q.aedRate } : {}),
  })
  const no = shownNumber(q.number, q.previewNumber, ctx)
  const bank =
    ctx.template?.showBank === false || ctx.bank === undefined
      ? []
      : [
          {
            label: 'Bank',
            text: ctx.bank ? ctx.bank.lines.join(' · ') : 'Bank details to follow',
          },
        ]
  return {
    layout: 'estimate',
    kind: 'quotation',
    eyebrow: q.supplementary ? 'Supplementary quotation' : 'Quotation',
    title: q.supplementary ? 'SUPPLEMENTARY QUOTATION' : 'QUOTATION',
    no: q.number ? documentNumber(q.number) : no,
    ...(q.revision ? { revision: `R${q.revision}` } : {}),
    meta: [
      { label: 'Date', value: docDate(q.date) },
      ...(q.validity ? [{ label: 'Validity', value: q.validity }] : []),
      ...(q.clientRef ? [{ label: 'Your reference', value: q.clientRef }] : []),
      { label: 'Currency', value: q.currency },
      ...(q.incoterm ? [{ label: 'Incoterm', value: q.incoterm }] : []),
    ],
    footLabel: q.footLabel ?? ctx.template?.footLabel ?? '',
    billTo: q.billTo,
    items: { t: 'table', ...table },
    totals: totalRows(totals, q.currency),
    notes: [...(q.notes ?? []), ...(ctx.terms ?? []), ...bank],
    signer: ctx.signer.name,
  }
}
