import {
  buildCreditNote,
  buildDn,
  buildInvoice,
  buildOa,
  buildPi,
  buildPl,
  buildPo,
  buildQuotation,
  buildRfq,
  createClientSafeOrderDoc,
  createClientSafeQuotation,
  createSupplierSafePo,
  createSupplierSafeRfq,
  type DocumentData,
  type Letterhead,
} from '../index'
import * as F from './inputs'

/**
 * Every document kind built from the ops-core neutral fixtures (S11-T02), with a neutral letterhead: no real
 * company, address, bank, IBAN or TRN (the repository is public).
 */
export const NEUTRAL_LETTERHEAD: Letterhead = {
  legalName: 'Example Trading LLC',
  addressLines: ['Unit 1, Example Street', 'Dubai, UAE'],
  trn: '000000000000000',
  phone: '+971 00 000 0000',
  mailbox: 'sales@example.test',
  logo: { src: '', width: 150, height: 60 },
  bank: { lines: ['TEST BANK · USD · AE00 0000 0000 0000 0000 000'] },
}
export const PURCHASE_LETTERHEAD: Letterhead = {
  ...NEUTRAL_LETTERHEAD,
  mailbox: 'purchase@example.test',
  bank: { lines: [] },
}

export interface RenderFixture {
  name: string
  data: DocumentData
  letterhead: Letterhead
  draft?: boolean
}

export function renderFixtures(): RenderFixture[] {
  const c = F.CTX
  const L = NEUTRAL_LETTERHEAD
  return [
    {
      name: 'quotation-c37',
      data: buildQuotation(createClientSafeQuotation(F.QUOTATION), c),
      letterhead: L,
    },
    {
      name: 'quotation-draft',
      data: buildQuotation(createClientSafeQuotation({ ...F.QUOTATION, number: null }), {
        ...c,
        previewLabel: 'INDUS/Q — next free',
      }),
      letterhead: L,
      draft: true,
    },
    {
      name: 'rfq',
      data: buildRfq(createSupplierSafeRfq(F.RFQ), c),
      letterhead: PURCHASE_LETTERHEAD,
    },
    { name: 'po', data: buildPo(createSupplierSafePo(F.PO), c), letterhead: PURCHASE_LETTERHEAD },
    { name: 'oa', data: buildOa(createClientSafeOrderDoc(F.OA), c), letterhead: L },
    { name: 'pi', data: buildPi(createClientSafeOrderDoc(F.PI), c), letterhead: L },
    { name: 'invoice', data: buildInvoice(createClientSafeOrderDoc(F.INVOICE), c), letterhead: L },
    {
      name: 'credit-note',
      data: buildCreditNote(createClientSafeOrderDoc(F.CREDIT_NOTE), c),
      letterhead: L,
    },
    {
      name: 'delivery-note',
      data: buildDn(createClientSafeOrderDoc(F.DELIVERY_NOTE), c),
      letterhead: L,
    },
    {
      name: 'packing-list',
      data: buildPl(createClientSafeOrderDoc(F.PACKING_LIST), c),
      letterhead: L,
    },
  ]
}
