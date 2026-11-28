import type { BuildContext } from '../builders/common'
import type {
  ClientLineInput,
  CreditNoteInput,
  InvoiceInput,
  OaInput,
  PiInput,
  PoInput,
  QuotationInput,
  RfqInput,
  ShippingDocInput,
  SupplierLineInput,
} from '../safe'

/**
 * NEUTRAL builder inputs, one per kind (S11-T01). The repository is public: "Sample Client LLC", "Example
 * Valve Co", "TEST BANK" with an all-zero IBAN and TRN only. The quotation is the C37 fixture: 12 lines, one
 * "Price to follow", one "Not quoted", total USD 157,587.08 (zero-rated export).
 */

export const CLIENT = {
  label: 'Bill to',
  name: 'Sample Client LLC',
  lines: ['Attn: Purchasing', 'Example City, UAE'],
}
export const SUPPLIER = {
  label: 'To',
  name: 'Example Valve Co',
  lines: ['Attn: Sales', 'Example Country'],
}
export const INDUS = { label: 'From', name: 'Owner Example', lines: ['purchase@example.test'] }

export const CTX: BuildContext = {
  signer: { name: 'Owner Example', role: 'Owner' },
  terms: [
    { label: 'Payment', text: '30% advance, 70% 30 days from delivery' },
    { label: 'Delivery', text: 'Weeks from receipt of PO and advance' },
  ],
  bank: { lines: ['TEST BANK · USD · AE00 0000 0000 0000 0000 000'] },
  template: { disclaimer: 'Material is supplied as offered.' },
}

const p = (
  lineNo: number,
  description: string,
  clientPartNumber: string,
  qty: string,
  uom: string,
  rate: string,
  delivery: string
): ClientLineInput => ({
  lineNo,
  partNumber: `IH-${String(lineNo).padStart(3, '0')}`,
  description,
  clientPartNumber,
  qty,
  uom,
  rate,
  delivery,
  vat: 'zero_rated',
  state: 'priced',
})

/** C37: ten priced lines summing to 157,587.08, then a line to follow and a line not quoted. */
export const C37_LINES: ClientLineInput[] = [
  p(1, 'Gate valve 2″ class 300, A105, flanged RF', 'SAMPLE-V-0101', '24', 'pcs', '412.50', '6'),
  p(2, 'Ball valve 4″ class 600, full bore', 'SAMPLE-V-0102', '8', 'pcs', '2380.40', '7'),
  p(3, 'Deep groove ball bearing 6316-C3', 'SAMPLE-B-0201', '40', 'pcs', '128.40', '1'),
  p(4, 'Globe valve 3″ class 600, 13Cr trim', 'SAMPLE-V-0103', '6', 'pcs', '2150.00', '8'),
  p(5, 'Spiral wound gasket 3″ class 600', 'SAMPLE-G-0301', '120', 'pcs', '18.75', '2'),
  p(6, 'Control valve trim 3″ class 600', 'SAMPLE-V-0104', '4', 'set', '9640.00', '10'),
  p(7, 'Pressure gauge 0–250 bar, 100 mm, SS316', 'SAMPLE-I-0401', '30', 'pcs', '86.20', '3'),
  p(8, 'Hydraulic pump, axial piston, 71 cc', 'SAMPLE-P-0501', '2', 'pcs', '14850.00', '9'),
  p(9, 'Hydraulic pump, axial piston, 71 cc (spare)', 'SAMPLE-P-0502', '1', 'pcs', '14850.00', '9'),
  p(10, 'Magnetic level gauge 1200 mm C-C, SS316', 'SAMPLE-I-0402', '4', 'pcs', '5665.47', '8'),
  {
    lineNo: 11,
    description: 'Level switch, float type',
    clientPartNumber: 'SAMPLE-I-0403',
    qty: '2',
    uom: 'pcs',
    state: 'price_to_follow',
  },
  {
    lineNo: 12,
    description: 'Obsolete actuator model, no longer made',
    clientPartNumber: 'SAMPLE-A-0601',
    qty: '1',
    uom: 'pcs',
    state: 'not_quoted',
    note: 'Discontinued by the maker',
  },
]

export const QUOTATION: QuotationInput = {
  number: 'INDUS/Q10001',
  revision: 2,
  date: '2026-11-20',
  validity: 'Prices valid 30 days',
  clientRef: 'SAMPLE/RFQ-0001',
  currency: 'USD',
  incoterm: 'DAP Example Port',
  billTo: CLIENT,
  lines: C37_LINES,
  footLabel: 'Spares',
}

const ORDER_LINES: ClientLineInput[] = [
  {
    lineNo: 1,
    partNumber: 'CVT-3-600',
    description: 'Control valve trim 3″ class 600',
    qty: '6',
    uom: 'set',
    rate: '36750.00',
    vat: 'standard',
    state: 'priced',
    packages: '1–3',
  },
]

const orderBase = {
  number: 'INDUS/X0001',
  date: '2026-11-24',
  currency: 'USD',
  billTo: CLIENT,
  clientPo: 'SAMPLE/PO-0001',
  lines: ORDER_LINES,
  aedRate: '3.6725',
}

export const OA: OaInput = { ...orderBase, kind: 'oa', quotationRef: 'INDUS/Q10001-R2' }
export const PI: PiInput = { ...orderBase, kind: 'pi', advancePct: '30' }
export const INVOICE: InvoiceInput = {
  ...orderBase,
  kind: 'invoice',
  deliveryNote: 'INDUS/DN1001-01',
  advancePaid: '69457.50',
  advanceRef: 'INDUS/PI1001',
  paymentDue: '30 days from invoice',
}
export const CREDIT_NOTE: CreditNoteInput = {
  ...orderBase,
  kind: 'cn',
  invoiceRef: 'INDUS/INV10001',
  reason: 'One trim set returned unused.',
  lines: [{ ...ORDER_LINES[0]!, qty: '1' }],
}
export const DELIVERY_NOTE: ShippingDocInput = {
  ...orderBase,
  kind: 'dn',
  shipmentNo: 1,
  packages: 3,
  grossKg: '405',
  from: { label: 'From', name: 'Example Trading LLC', lines: ['sales@example.test'] },
}
export const PACKING_LIST: ShippingDocInput = { ...DELIVERY_NOTE, kind: 'pl', shipmentNo: 2 }

const SUPPLIER_LINES: SupplierLineInput[] = [
  {
    lineNo: 1,
    ourRef: 'Ref 2611-01',
    description: 'Control valve trim 3″ class 600, 13Cr',
    qty: '6',
    uom: 'set',
    rate: '2716.6667',
    delivery: '10 wks',
  },
  {
    lineNo: 2,
    ourRef: 'Ref 2611-02',
    partNumber: 'GSK-2001',
    description: 'Spiral wound gasket 3″ class 600',
    qty: '120',
    uom: 'pcs',
    rate: '6.25',
  },
]

export const RFQ: RfqInput = {
  ref: 'IH-RFQ-2611-P01',
  date: '2026-11-15',
  replyBy: '2026-11-18',
  currency: 'EUR',
  supplier: SUPPLIER,
  from: INDUS,
  deliveryPoint: 'Dubai, UAE',
  lines: SUPPLIER_LINES.map(({ rate: _rate, ...l }) => l),
}

export const PO: PoInput = {
  number: 'INDUS/PO10001',
  date: '2026-11-24',
  currency: 'EUR',
  supplier: SUPPLIER,
  from: INDUS,
  offerRef: 'EVC-Q-0001',
  deliverBy: '2027-01-06',
  deliveryPoint: 'Dubai, UAE',
  lines: SUPPLIER_LINES,
}
