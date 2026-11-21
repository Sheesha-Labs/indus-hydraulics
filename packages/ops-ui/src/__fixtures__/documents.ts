import type {
  ClientSafeLine,
  DocTableRow,
  EstimateDocument,
  HouseDocument,
  Letterhead,
  SupplierSafeLine,
} from '@indus/ops-core'

// NEUTRAL document fixtures for the /_kit specimen, tests and visual baselines. The repository is public:
// no real company, person, address, phone, bank, IBAN or TRN, and no logo from the handoff (CLAUDE.md §12).
// The real letterhead arrives from Settings › Company through the Letterhead type (S03/S11). Figures are
// invented; the Estimate total is the Round 3 fixture value 157,587.08 (C37).

/** A plain geometric mark, generated here: no text, no brand, no colour literal (it draws in currentColor). */
const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="60" viewBox="0 0 150 60">' +
  '<rect x="0" y="14" width="32" height="32" rx="4" fill="currentColor"/>' +
  '<rect x="42" y="18" width="96" height="9" rx="2" fill="currentColor"/>' +
  '<rect x="42" y="33" width="64" height="9" rx="2" fill="currentColor" opacity=".45"/>' +
  '</svg>'

export const NEUTRAL_LOGO_SRC = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`

export const NEUTRAL_LETTERHEAD: Letterhead = {
  legalName: 'Example Trading LLC',
  addressLines: ['Unit 1, Example Street', 'Dubai, UAE'],
  trn: '000000000000000',
  phone: '+971 00 000 0000',
  mailbox: 'sales@example.test',
  logo: { src: NEUTRAL_LOGO_SRC, width: 150, height: 60 },
  bank: { lines: ['TEST BANK · AED · AE00 0000 0000 0000 0000 000'] },
}

/** Supplier documents (RFQ, PO) go out from the purchasing mailbox. */
export const NEUTRAL_PURCHASE_LETTERHEAD: Letterhead = {
  ...NEUTRAL_LETTERHEAD,
  mailbox: 'purchase@example.test',
}

const DISCLAIMER =
  'Orders are processed as confirmed and cannot be changed or cancelled afterwards. Material is supplied as offered; please check every technical detail before you place the order.'

const OWNER_SIGN = { lead: 'Best regards,', name: 'Owner Example', role: 'Owner' } as const

const owner = (mailbox: string) => ({
  name: 'Owner Example',
  lines: ['Owner · Example Trading', mailbox],
})

// ---------------------------------------------------------------------------------------------------
// Row mapping. Builders arrive in S11; until then the fixtures map safe lines to table rows here, so the
// RFQ and PO are provably built from SupplierSafeLine and the client documents from ClientSafeLine.

const dash = '—'

/** House items table from client lines: #, part + description, qty, rate, amount. */
function houseClientRows(lines: readonly ClientSafeLine[]): DocTableRow[] {
  return lines.map((l) => ({
    cells: [
      { v: String(l.lineNo) },
      { bold: l.partNumber, v: l.description },
      { v: `${l.qty} ${l.uom}` },
      { v: l.unitPrice ?? dash },
      { v: l.amount ?? dash },
    ],
    ...(l.state === 'priced' ? {} : { flag: 'to-follow' as const }),
  }))
}

/** Estimate items table: #, description + client code, qty, UoM, rate, weeks, tax, amount. */
function estimateRows(lines: readonly ClientSafeLine[]): DocTableRow[] {
  return lines.map((l) => {
    const head = [
      { v: String(l.lineNo) },
      { v: l.description, sub: l.clientPartNumber ?? l.partNumber },
      { v: l.qty },
      { v: l.uom },
    ]
    if (l.state !== 'priced') {
      return { cells: [...head, { v: l.note ?? 'Price to follow', span: 4 }], flag: 'to-follow' }
    }
    return {
      cells: [
        ...head,
        { v: l.unitPrice ?? dash },
        { v: l.leadWeeks ?? dash },
        { v: l.taxRate ?? '0%' },
        { v: l.amount ?? dash },
      ],
    }
  })
}

/** Supplier RFQ rows: our line number and ref only; the price columns are for the supplier. */
function rfqRows(lines: readonly SupplierSafeLine[]): DocTableRow[] {
  return lines.map((l) => ({
    cells: [
      { v: String(l.lineNo).padStart(2, '0') },
      { v: l.description, sub: l.ourRef },
      { v: l.qty },
      { v: l.uom },
      { v: dash },
      { v: dash },
    ],
  }))
}

/** Supplier PO rows: part + description, qty, agreed rate and amount. */
function poRows(lines: readonly SupplierSafeLine[]): DocTableRow[] {
  return lines.map((l) => ({
    cells: [
      { v: String(l.lineNo) },
      { bold: l.partNumber ?? l.ourRef, v: l.description },
      { v: `${l.qty} ${l.uom}` },
      { v: l.unitPrice ?? dash },
      { v: l.amount ?? dash },
    ],
  }))
}

// ---------------------------------------------------------------------------------------------------
// Client quotation, house layout (the L1 k07 specimen).

export const QUOTATION_LINES: readonly ClientSafeLine[] = [
  {
    lineNo: 1,
    partNumber: 'BRG-6316-C3',
    description: 'Deep groove ball bearing, C3',
    qty: '24',
    uom: 'EA',
    unitPrice: '126.50',
    amount: '3,036.00',
    state: 'priced',
  },
  {
    lineNo: 2,
    partNumber: 'BRG-22220-K',
    description: 'Spherical roller bearing, tapered bore',
    qty: '8',
    uom: 'EA',
    unitPrice: '418.75',
    amount: '3,350.00',
    state: 'priced',
  },
  {
    lineNo: 3,
    partNumber: 'FLT-10-220',
    description: 'Return filter element 10 µm',
    qty: '40',
    uom: 'EA',
    unitPrice: '51.20',
    amount: '2,048.00',
    state: 'priced',
  },
  {
    lineNo: 4,
    partNumber: 'SWT-110541',
    description: 'Limit switch, roller lever · price to follow by 9 Dec',
    qty: '12',
    uom: 'EA',
    state: 'to-follow',
  },
  {
    lineNo: 5,
    partNumber: 'CVT-3-600',
    description: 'Control valve trim 3″ Class 600',
    qty: '2',
    uom: 'SET',
    unitPrice: '9,480.00',
    amount: '18,960.00',
    state: 'priced',
  },
  {
    lineNo: 6,
    partNumber: 'BV-2-300-RF',
    description: 'Ball valve 2″ Class 300 RF',
    qty: '6',
    uom: 'EA',
    unitPrice: '1,320.00',
    amount: '7,920.00',
    state: 'priced',
  },
]

export const QUOTATION_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'quotation',
  eyebrow: 'Quotation',
  title: 'Quotation',
  no: 'INDUS/Q10001',
  meta: [
    { label: 'Date', value: '16 Nov 2026' },
    { label: 'Your ref', value: 'SAMPLE/RFQ-0001' },
    { label: 'Enquiry', value: 'ENQ-2026-0001' },
    { label: 'Currency', value: 'USD' },
  ],
  footLabel: 'Spares',
  party: [
    { label: 'Bill to', name: 'Sample Client LLC', lines: ['Attn: Purchasing', 'Example City'] },
    { label: 'Quoted by', ...owner('sales@example.test') },
  ],
  subject: { text: 'QUOTATION FOR SPARES — VALVES, BEARINGS & INSTRUMENTS' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Item & description', 'Qty', 'Rate', 'Amount'],
      rows: houseClientRows(QUOTATION_LINES),
    },
    {
      t: 'totals',
      words:
        'Amounts in USD. Export sale, zero-rated for VAT. Line 4 follows on a supplementary quotation.',
      rows: [
        { label: 'Sub total', value: '35,314.00' },
        { label: 'VAT · zero-rated (0%)', value: '0.00' },
        { label: 'Total (USD)', value: '35,314.00', grand: true },
      ],
    },
    { t: 'section', n: 'T', title: 'Terms & conditions' },
    {
      t: 'terms',
      rows: [
        { label: 'Delivery', value: 'DAP Example Port; per line as stated' },
        { label: 'Payment', value: '30% advance with order; balance before dispatch' },
        { label: 'Validity', value: 'As stated per line' },
        { label: 'Documents', value: 'EN 10204 3.1 certificates where listed' },
      ],
    },
    { t: 'bank', disclaimer: DISCLAIMER, sign: OWNER_SIGN },
  ],
}

// ---------------------------------------------------------------------------------------------------
// Client quotation, Estimate layout: Round 3 total 157,587.08 (C37), revision R2.

export const ESTIMATE_LINES: readonly ClientSafeLine[] = [
  {
    lineNo: 1,
    partNumber: 'VLV-1001',
    clientPartNumber: 'SAMPLE-V-0101',
    description: 'Gate valve 2″ class 300, A105, flanged RF',
    qty: '24',
    uom: 'pcs',
    unitPrice: '412.50',
    leadWeeks: '6',
    taxRate: '0%',
    amount: '9,900.00',
    state: 'priced',
  },
  {
    lineNo: 2,
    partNumber: 'VLV-2004',
    clientPartNumber: 'SAMPLE-V-0102',
    description: 'Ball valve 4″ class 600, full bore',
    qty: '8',
    uom: 'pcs',
    unitPrice: '2,380.40',
    leadWeeks: '7',
    taxRate: '0%',
    amount: '19,043.20',
    state: 'priced',
  },
  {
    lineNo: 3,
    partNumber: 'BRG-6316-C3',
    clientPartNumber: 'SAMPLE-B-0201',
    description: 'Deep groove ball bearing 6316-C3',
    qty: '40',
    uom: 'pcs',
    unitPrice: '128.40',
    leadWeeks: '1',
    taxRate: '0%',
    amount: '5,136.00',
    state: 'priced',
  },
  {
    lineNo: 4,
    partNumber: 'VLV-3006',
    clientPartNumber: 'SAMPLE-V-0103',
    description: 'Globe valve 3″ class 600, 13Cr trim',
    qty: '6',
    uom: 'pcs',
    unitPrice: '2,150.00',
    leadWeeks: '8',
    taxRate: '0%',
    amount: '12,900.00',
    state: 'priced',
  },
  {
    lineNo: 5,
    partNumber: 'GSK-2001',
    clientPartNumber: 'SAMPLE-G-0301',
    description: 'Spiral wound gasket 3″ class 600',
    qty: '120',
    uom: 'pcs',
    unitPrice: '18.75',
    leadWeeks: '2',
    taxRate: '0%',
    amount: '2,250.00',
    state: 'priced',
  },
  {
    lineNo: 6,
    partNumber: 'CVT-3-600',
    clientPartNumber: 'SAMPLE-V-0104',
    description: 'Control valve trim 3″ class 600',
    qty: '4',
    uom: 'set',
    unitPrice: '9,640.00',
    leadWeeks: '10',
    taxRate: '0%',
    amount: '38,560.00',
    state: 'priced',
  },
  {
    lineNo: 7,
    partNumber: 'GAU-250-100',
    clientPartNumber: 'SAMPLE-I-0401',
    description: 'Pressure gauge 0–250 bar, 100 mm, SS316',
    qty: '30',
    uom: 'pcs',
    unitPrice: '86.20',
    leadWeeks: '3',
    taxRate: '0%',
    amount: '2,586.00',
    state: 'priced',
  },
  {
    lineNo: 8,
    partNumber: 'PMP-AX-71',
    clientPartNumber: 'SAMPLE-P-0501',
    description: 'Hydraulic pump, axial piston, 71 cc',
    qty: '3',
    uom: 'pcs',
    unitPrice: '14,850.00',
    leadWeeks: '9',
    taxRate: '0%',
    amount: '44,550.00',
    state: 'priced',
  },
  {
    lineNo: 9,
    partNumber: 'LVL-1200',
    clientPartNumber: 'SAMPLE-I-0402',
    description: 'Magnetic level gauge 1200 mm C-C, SS316',
    qty: '4',
    uom: 'pcs',
    unitPrice: '5,665.47',
    leadWeeks: '8',
    taxRate: '0%',
    amount: '22,661.88',
    state: 'priced',
  },
  {
    lineNo: 10,
    partNumber: 'LSW-40',
    clientPartNumber: 'SAMPLE-I-0403',
    description: 'Level switch, float type',
    qty: '2',
    uom: 'pcs',
    state: 'to-follow',
    note: 'Price to follow',
  },
]

export const QUOTATION_ESTIMATE: EstimateDocument = {
  layout: 'estimate',
  kind: 'quotation',
  eyebrow: 'Quotation',
  title: 'QUOTATION',
  no: 'INDUS/Q10001',
  revision: 'R2',
  meta: [
    { label: 'Date', value: '20 Nov 2026' },
    { label: 'Validity', value: 'Prices valid 30 days' },
    { label: 'Your reference', value: 'SAMPLE/RFQ-0001' },
    { label: 'Currency', value: 'USD' },
    { label: 'Incoterm', value: 'DAP Example Port' },
  ],
  footLabel: 'Spares',
  billTo: {
    label: 'Bill to',
    name: 'Sample Client LLC',
    lines: ['Attn: Purchasing', 'Example City, UAE'],
  },
  items: {
    t: 'table',
    cols: ['#', 'Item & description', 'Qty', 'UoM', 'Rate', 'Wks', 'Tax', 'Amount'],
    // One A4 page: lines 5–8 fold into a gap row, as the board does; the totals still cover every line.
    rows: [
      ...estimateRows(ESTIMATE_LINES.slice(0, 4)),
      { cells: [{ v: '…' }, { v: 'Lines 5–8', span: 7 }], flag: 'gap' },
      ...estimateRows(ESTIMATE_LINES.slice(8)),
    ],
  },
  totals: [
    { label: 'Sub total', value: '157,587.08' },
    { label: 'VAT · zero-rated export', value: '0.00' },
    { label: 'Total USD', value: '157,587.08', grand: true },
  ],
  notes: [
    {
      label: 'Notes',
      text: 'Zero-rated export. Delivery weeks run from receipt of PO and advance.',
    },
    {
      label: 'Terms',
      text: 'Payment 30% advance, 70% 30 days from delivery. Partial shipment allowed.',
    },
    { label: 'Bank', text: NEUTRAL_LETTERHEAD.bank.lines.join(' · ') },
  ],
  signer: 'Owner Example',
}

// ---------------------------------------------------------------------------------------------------
// Supplier RFQ, house layout, from SupplierSafeLine rows.

export const RFQ_LINES: readonly SupplierSafeLine[] = [
  {
    lineNo: 1,
    ourRef: 'Ref 2611-01',
    description: 'Gate valve 6″ CL300, WCB, flanged RF, API 600',
    qty: '6',
    uom: 'EA',
  },
  {
    lineNo: 2,
    ourRef: 'Ref 2611-02',
    description: 'Gate valve 2″ CL800, A105, socket weld, API 602',
    qty: '20',
    uom: 'EA',
  },
  {
    lineNo: 3,
    ourRef: 'Ref 2611-03',
    description: 'Ball valve 4″ CL150, floating, SS316, fire-safe',
    qty: '10',
    uom: 'EA',
  },
  {
    lineNo: 5,
    ourRef: 'Ref 2611-05',
    description: 'Pneumatic actuator, double-acting, for 4″ ball valve',
    qty: '10',
    uom: 'EA',
  },
]

export const RFQ_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'rfq',
  eyebrow: 'Request for quotation',
  title: 'Request for quotation',
  no: 'IH-RFQ-2611-P01',
  meta: [
    { label: 'Date', value: '15 Nov 2026' },
    { label: 'Reply by', value: '18 Nov 2026' },
    { label: 'Currency', value: 'EUR' },
    { label: 'Lines', value: String(RFQ_LINES.length) },
  ],
  footLabel: 'Valves & actuators',
  party: [
    {
      label: 'To',
      name: 'Example Valve Co',
      lines: ['Attn: Sales', '1 Example Road, Example City'],
    },
    {
      label: 'From',
      name: 'Helper Example',
      lines: ['Sourcing · Example Trading', 'purchase@example.test'],
    },
  ],
  subject: { text: 'RFQ IH-RFQ-2611-P01 — VALVES & ACTUATORS · DELIVERY DUBAI, UAE' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Description', 'Qty', 'UoM', 'Your price', 'Lead time'],
      rows: rfqRows(RFQ_LINES),
    },
    { t: 'section', n: 'R', title: 'Please quote' },
    {
      t: 'terms',
      rows: [
        { label: 'Basis', value: 'EXW or FCA your works; state packed weight and dimensions' },
        { label: 'Validity', value: 'At least 45 days from the date of your offer' },
        { label: 'Lead time', value: 'Per line, in weeks from receipt of order' },
        {
          label: 'Documents',
          value: 'EN 10204 3.1 material certificates; test reports to API 598',
        },
        { label: 'Packing', value: 'Seaworthy, marked with our reference' },
        { label: 'Reference', value: 'Quote IH-RFQ-2611-P01 on your offer and all correspondence' },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------------------------------
// Supplier PO, house layout, from SupplierSafeLine rows.

export const PO_LINES: readonly SupplierSafeLine[] = [
  {
    lineNo: 1,
    ourRef: 'Ref 2611-06',
    partNumber: 'CVT-3-600',
    description: 'Control valve trim 3″ Class 600',
    qty: '2',
    uom: 'SET',
    unitPrice: '8,150.00',
    amount: '16,300.00',
  },
]

export const PO_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'po',
  eyebrow: 'Purchase order',
  title: 'Purchase order',
  no: 'INDUS/PO10001',
  meta: [
    { label: 'Date', value: '24 Nov 2026' },
    { label: 'Your offer', value: 'EVC-Q-0001' },
    { label: 'Currency', value: 'EUR' },
    { label: 'Deliver by', value: '6 Jan 2027' },
  ],
  footLabel: 'Control valve trims',
  party: [
    { label: 'Supplier', name: 'Example Valve Co', lines: ['Attn: Sales', 'Example Country'] },
    { label: 'Ordered by', ...owner('purchase@example.test') },
  ],
  subject: { text: 'PURCHASE ORDER — CONTROL VALVE TRIMS' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Item & description', 'Qty', 'Rate', 'Amount'],
      rows: poRows(PO_LINES),
    },
    {
      t: 'totals',
      words: 'Amounts in EUR. Quote INDUS/PO10001 on every document.',
      rows: [
        { label: 'Sub total', value: '16,300.00' },
        { label: 'Total (EUR)', value: '16,300.00', grand: true },
      ],
    },
    { t: 'section', n: 'T', title: 'Terms' },
    {
      t: 'terms',
      rows: [
        { label: 'Delivery', value: 'FCA your works' },
        { label: 'Payment', value: '30% advance; 70% before dispatch' },
        { label: 'Documents', value: 'EN 10204 3.1; packing list; commercial invoice' },
        { label: 'Marking', value: 'INDUS/PO10001 on every package' },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------------------------------
// Proforma, tax invoice and delivery note, house layout (client side).

const ORDER_LINE: ClientSafeLine = {
  lineNo: 1,
  partNumber: 'CVT-3-600',
  description: 'Control valve trim 3″ Class 600',
  qty: '6',
  uom: 'SET',
  unitPrice: '36,750.00',
  amount: '220,500.00',
  state: 'priced',
}

const CLIENT_ACCOUNTS = {
  label: 'Bill to',
  name: 'Sample Client LLC',
  lines: ['Attn: Accounts payable', 'Example City, UAE'],
}

export const PI_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'pi',
  eyebrow: 'Proforma invoice',
  title: 'Proforma invoice',
  no: 'INDUS/PI1001',
  meta: [
    { label: 'Date', value: '24 Nov 2026' },
    { label: 'Order', value: 'SAMPLE/PO-0001' },
    { label: 'Advance', value: '30%' },
    { label: 'Currency', value: 'USD' },
  ],
  footLabel: 'Advance',
  party: [CLIENT_ACCOUNTS, { label: 'Issued by', ...owner('sales@example.test') }],
  subject: { text: 'ADVANCE PAYMENT — 30% OF ORDER VALUE' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Description', 'Basis', 'Amount'],
      rows: [
        {
          cells: [
            { v: '1' },
            { v: 'Advance against SAMPLE/PO-0001', sub: 'Control valve trims' },
            { v: '30% of USD 220,500.00' },
            { v: '66,150.00' },
          ],
        },
      ],
    },
    {
      t: 'totals',
      words: 'Please pay to the account below and quote INDUS/PI1001.',
      rows: [
        { label: 'Advance', value: '66,150.00' },
        { label: 'Due now (USD)', value: '66,150.00', grand: true },
      ],
    },
    { t: 'section', n: 'P', title: 'Payment' },
    {
      t: 'terms',
      rows: [
        { label: 'Due', value: 'On receipt' },
        { label: 'Reference', value: 'INDUS/PI1001' },
      ],
    },
    { t: 'bank', disclaimer: DISCLAIMER, sign: OWNER_SIGN },
  ],
}

export const INVOICE_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'invoice',
  eyebrow: 'Tax invoice',
  title: 'Tax invoice',
  no: 'INDUS/INV10001',
  meta: [
    { label: 'Date', value: '12 Dec 2026' },
    { label: 'Order', value: 'SAMPLE/PO-0001' },
    { label: 'Delivery note', value: 'INDUS/DN1001' },
    { label: 'Currency', value: 'USD' },
  ],
  footLabel: 'Control valve trims',
  party: [
    { ...CLIENT_ACCOUNTS, lines: ['TRN on file', 'Example City, UAE'] },
    { label: 'Issued by', ...owner('sales@example.test') },
  ],
  subject: { text: 'TAX INVOICE — CONTROL VALVE TRIMS' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Item & description', 'Qty', 'Rate', 'Amount'],
      rows: houseClientRows([ORDER_LINE]),
    },
    {
      t: 'totals',
      words: 'VAT 5% shown in AED for the FTA. Advance INDUS/PI1001 deducted.',
      rows: [
        { label: 'Sub total', value: '220,500.00' },
        { label: 'VAT 5%', value: '11,025.00' },
        { label: 'Less advance', value: '(66,150.00)' },
        { label: 'Balance due (USD)', value: '165,375.00', grand: true },
      ],
    },
    { t: 'section', n: 'P', title: 'Payment' },
    {
      t: 'terms',
      rows: [
        { label: 'Due', value: '30 days from invoice' },
        { label: 'VAT in AED', value: '40,489.31 at 3.6725' },
      ],
    },
    { t: 'bank', disclaimer: DISCLAIMER, sign: OWNER_SIGN },
  ],
}

export const DN_HOUSE: HouseDocument = {
  layout: 'house',
  kind: 'dn',
  eyebrow: 'Delivery note',
  title: 'Delivery note',
  no: 'INDUS/DN1001',
  meta: [
    { label: 'Date', value: '10 Dec 2026' },
    { label: 'Order', value: 'SAMPLE/PO-0001' },
    { label: 'Packages', value: '3' },
    { label: 'Gross', value: '405 kg' },
  ],
  footLabel: 'Delivery',
  party: [
    {
      label: 'Deliver to',
      name: 'Sample Client LLC',
      lines: ['Stores, Example City', 'Example Emirate, UAE'],
    },
    {
      label: 'From',
      name: 'Example Trading LLC',
      lines: ['Unit 1, Example Street', 'sales@example.test'],
    },
  ],
  subject: { text: 'DELIVERY NOTE — CONTROL VALVE TRIMS' },
  blocks: [
    {
      t: 'table',
      cols: ['#', 'Description', 'Qty', 'Package'],
      rows: [
        {
          cells: [
            { v: '1' },
            { bold: ORDER_LINE.partNumber, v: ORDER_LINE.description },
            { v: `${ORDER_LINE.qty} ${ORDER_LINE.uom}` },
            { v: '1–3' },
          ],
        },
      ],
    },
    { t: 'section', n: 'R', title: 'Received by' },
    {
      t: 'terms',
      rows: [
        { label: 'Name', value: '' },
        { label: 'Signature and stamp', value: '' },
        { label: 'Date', value: '' },
      ],
    },
  ],
}

/** The four fixtures the task names: Estimate quotation, RFQ, PO and tax invoice. */
export const DOCUMENT_FIXTURES = {
  quotation: QUOTATION_ESTIMATE,
  rfq: RFQ_HOUSE,
  po: PO_HOUSE,
  invoice: INVOICE_HOUSE,
} as const

/** The letterhead each document goes out on (supplier documents from purchase@). */
export function letterheadFor(kind: HouseDocument['kind']): Letterhead {
  return kind === 'rfq' || kind === 'po' ? NEUTRAL_PURCHASE_LETTERHEAD : NEUTRAL_LETTERHEAD
}
