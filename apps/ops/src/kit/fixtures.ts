// NEUTRAL sample data for the /_kit specimen and visual baselines. Nothing here comes from the handoff:
// no real company, person, address, bank or TRN (CLAUDE.md §12).
export const COMPANIES = {
  supplier: 'Example Valve Co',
  client: 'Sample Client LLC',
  other: 'Demo Bearings FZE',
} as const

export const PEOPLE = {
  owner: { name: 'Owner Example', initials: 'OE', role: 'Owner · sales@' },
  helper: { name: 'Helper Example', initials: 'HE', role: 'Helper · purchase@' },
  assistant: { name: 'Assistant', initials: 'AS', role: 'Works on Autopilot levels' },
} as const

export const REFS = {
  enquiry: 'ENQ-2026-0001',
  quotation: 'INDUS/Q10001',
  quotationRevised: 'INDUS/Q10001-R2',
  supplierRfq: 'IH-RFQ-2611-P01',
  order: 'SO-0001',
  po: 'INDUS/PO10001',
  clientRef: 'SAMPLE/PO-0001',
} as const

export const BANK = {
  name: 'TEST BANK',
  iban: 'AE00 0000 0000 0000 0000 000',
  trn: '000000000000000',
} as const

export const MONEY = {
  usd: { ccy: 'USD', amount: '12,400.00' },
  eur: { ccy: 'EUR', amount: '8,420.00' },
  negative: { ccy: 'AED', amount: '(1,283.00)' },
} as const

/** Timeline kit (K-08) samples. Dates are in the frozen visual-test year. */
export const TIMELINE = [
  {
    key: 't1',
    mark: 'done',
    date: '14 Sep',
    dateTime: '2026-09-14',
    title: 'Enquiry received',
    sub: `${REFS.clientRef} · 12 lines`,
    by: 'Assistant',
  },
  {
    key: 't2',
    mark: 'done',
    date: '15 Sep',
    dateTime: '2026-09-15',
    title: '4 supplier RFQs sent',
    sub: 'IH-RFQ-2611-P01, P02',
    by: 'Helper',
  },
  {
    key: 't3',
    mark: 'warn',
    date: '22 Sep',
    dateTime: '2026-09-22',
    title: `${COMPANIES.supplier} chased twice`,
    sub: 'No reply',
    by: 'Assistant',
  },
  {
    key: 't4',
    mark: 'current',
    date: '23 Sep',
    dateTime: '2026-09-23',
    title: 'Quotation sent',
    sub: `${REFS.quotation} · 11 of 12 lines`,
    by: 'Owner',
  },
  { key: 't5', mark: 'todo', date: '30 Sep', dateTime: '2026-09-30', title: 'Client deadline' },
] as const

/** The two Timeline marks the L1 sample does not show. */
export const TIMELINE_MORE = [
  { key: 'm1', mark: 'bad', date: '2 Oct', dateTime: '2026-10-02', title: 'PO overdue' },
  {
    key: 'm2',
    mark: 'assistant',
    date: '3 Oct',
    dateTime: '2026-10-03',
    title: 'Chaser drafted',
  },
] as const

export const ACTIVITY = [
  {
    key: 'a1',
    time: '09:12',
    mark: 'assistant',
    text: `Assistant captured ${COMPANIES.supplier} offer (4 of 5 lines)`,
  },
  { key: 'a2', time: '09:40', mark: 'person', text: 'Owner approved 5 RFQs' },
  { key: 'a3', time: '10:05', mark: 'warn', text: `${COMPANIES.other}: second chaser sent` },
  { key: 'a4', time: '10:31', mark: 'neutral', text: `${COMPANIES.client} replied on line 4` },
  { key: 'a5', time: '11:02', mark: 'open', text: 'Next touch set for 14 Oct' },
] as const

export const GANTT = {
  axis: ['16 Sep', '23', '30', '7 Oct', '14', '21', '28', '4 Nov', '11', '18', '25'],
  today: 4.5,
  rows: [
    {
      key: 'g1',
      title: COMPANIES.supplier,
      sub: 'INDUS/PO10001 · 2 lines',
      bars: [
        { start: 0, end: 3, kind: 'done', label: 'Advance' },
        { start: 3, end: 8, kind: 'plan', label: 'Production' },
      ],
      milestones: [{ at: 8, kind: 'due', label: 'Inspection' }],
    },
    {
      key: 'g2',
      title: COMPANIES.other,
      sub: 'INDUS/PO10002 · 3 lines',
      bars: [
        { start: 0, end: 2, kind: 'done', label: 'Advance' },
        { start: 2, end: 9.5, kind: 'slip', label: 'Production · slipped 1 wk' },
      ],
      milestones: [{ at: 9.5, kind: 'warn', label: 'Inspection' }],
    },
    {
      key: 'g3',
      title: 'Example Instruments Co',
      sub: 'INDUS/PO10003 · 1 line',
      bars: [{ start: 1, end: 5, kind: 'late', label: 'Production · late' }],
      milestones: [
        { at: 5, kind: 'due', label: 'Ready' },
        { at: 7, kind: 'open', label: 'Freight' },
      ],
    },
  ],
} as const

export const DIFF = {
  wasLabel: 'Quotation R1',
  nowLabel: 'Revision R2',
  rows: [
    { field: 'Line 3 unit price', was: '48.50', now: '46.20' },
    { field: 'Line 4', was: 'Price to follow', now: '—', same: true },
    { field: 'Delivery', was: 'DAP site · 6 wks', now: 'DAP site · 5 wks' },
    { field: 'Validity', was: 'As stated per line', now: 'As stated per line', same: true },
  ],
} as const

export const STEPS = ['Company', 'Mailboxes', 'History', 'Money', 'Assistant'] as const

/** Chart kit (K-12) samples. */
export const BARS = [
  {
    key: 'b1',
    label: COMPANIES.client,
    value: 142300,
    display: 'USD 142,300',
    tone: 'acc',
    sub: '3 quotations',
  },
  {
    key: 'b2',
    label: COMPANIES.other,
    value: 64900,
    display: 'AED 64,900',
    tone: 'acc',
    sub: '1 quotation',
  },
  { key: 'b3', label: 'Example Trading LLC', value: 43500, display: 'AED 43,500', tone: 'acc' },
  {
    key: 'b4',
    label: 'Sample Works LLC',
    value: 28600,
    display: 'USD 28,600',
    tone: 'n',
    sub: 'draft',
  },
] as const

export const OUTCOMES = [
  { key: 'won', label: 'Won', value: 9, display: '9', tone: 'acc' },
  { key: 'price', label: 'Lost on price', value: 4, display: '4', tone: 'bad' },
  { key: 'silent', label: 'Lost, no reply', value: 2, display: '2', tone: 'n' },
  { key: 'regret', label: 'Regretted', value: 3, display: '3', tone: 'warn' },
] as const

export const MARGIN = {
  x: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      key: 'margin',
      label: 'Margin %',
      tone: 'acc',
      values: [15.4, 14.8, 16.1, 13.2, 12.5, 14.0, 13.7],
    },
    {
      key: 'guardrail',
      label: 'Guardrail',
      tone: 'bad',
      values: [12, 12, 12, 12, 12, 12, 12],
      dashed: true,
    },
  ],
} as const

export const OVERDUE = {
  columns: ['Owner', 'Helper', 'Assistant'],
  rows: [
    { key: 'q', label: 'Quotations', values: [3, 0, 1] },
    { key: 'r', label: 'Supplier RFQs', values: [0, 2, 4] },
    { key: 'p', label: 'Payments', values: [2, 0, 0] },
    { key: 'd', label: 'Documents', values: [1, 3, 2] },
  ],
} as const

/** Rates for the Money/FX/VAT samples (AED per unit). */
export const FX = { USD: '3.6725', EUR: '3.9789', GBP: '4.6678' } as const

export const LINES = [
  { pn: 'VLV-1001', description: 'Gate valve, 2", class 300', qty: '4 ea' },
  { pn: 'BRG-6316-C3', description: 'Deep groove ball bearing, C3', qty: '24 ea' },
  { pn: 'GSK-2001', description: 'Spiral wound gasket, 3", class 600', qty: '40 ea' },
] as const

/** Overlay kit (K-10) samples. */
export const OVERLAY = {
  block: {
    title: `Block ${COMPANIES.supplier}?`,
    text: `New RFQs and POs to ${COMPANIES.supplier} stop. Open quotes stay on file and still show in Compare, marked Blocked.`,
    consequences: [
      `2 open RFQs on ${REFS.enquiry} are withdrawn with a short note`,
      `${REFS.po} stays open; payments need your call-back first`,
      'You can unblock from the supplier page',
    ],
    confirm: 'Block supplier',
  },
  why: {
    eyebrow: 'Why?',
    title: 'Why this supplier for line 5',
    tabs: [{ label: 'Reasons' }, { label: 'Sources · 3' }, { label: 'History' }],
    sections: [
      {
        heading: 'Lowest landed cost',
        text: `AED 1,000.00 per set against ${COMPANIES.other} at AED 1,100.00, using the locked EUR rate of 2 Oct.`,
      },
      {
        heading: 'Lead time fits',
        text: '5 weeks from order; the client needs delivery by 10 Dec.',
      },
      { heading: 'Past orders', text: '3 orders in 2026, all on time, no inspection holds.' },
    ],
  },
  toasts: [
    {
      kind: 'success',
      title: `Quotation ${REFS.quotationRevised} sent to ${COMPANIES.client}`,
      action: 'Undo',
    },
    { kind: 'running', title: 'Sending 5 RFQs from purchase@…', action: 'Undo' },
    { kind: 'error', title: 'Couldn’t reach Zoho Books', action: 'Retry' },
  ],
  moreToasts: [
    { kind: 'info', title: 'History import paused at 40%; it resumes at 18:00' },
    { kind: 'warning', title: 'purchase@ sends are held while the Assistant is paused' },
    { kind: 'success', title: '5 RFQs go from purchase@ at 10:47', action: 'Undo 4:59' },
  ],
  menu: [
    { type: 'item', label: 'Open' },
    { type: 'item', label: 'Open in new tab', shortcut: '⌘↵' },
    { type: 'separator' },
    { type: 'item', label: 'Link to enquiry…' },
    { type: 'item', label: 'Move to…' },
    { type: 'item', label: 'Merge with…' },
    { type: 'separator' },
    { type: 'group', label: 'Assistant' },
    { type: 'item', label: 'Explain this', shortcut: '?' },
    { type: 'item', label: 'Undo last action', shortcut: '⌘Z' },
    { type: 'separator' },
    { type: 'item', label: 'Delete draft', danger: true },
  ],
  menuStates: [
    { type: 'item', label: 'Approve and send', shortcut: '⌘↵' },
    { type: 'item', label: 'Send quotation', disabled: true },
    { type: 'item', label: 'Open the A4 RFQ', href: '#overlay-menu' },
    { type: 'separator' },
    { type: 'item', label: 'Cancel order', danger: true },
  ],
  popover: {
    title: 'Landed cost',
    text: [
      'Supplier price + freight + insurance + duty + bank and FX, in AED at the locked rate.',
      'Default % fills any part you have not entered.',
    ],
    action: 'Open landed-cost breakdown',
  },
  tooltip: 'Assistant · running',
} as const

/** The moment the specimen reads as "now" (the visual tests freeze the browser clock at the same instant). */
export const KIT_NOW = new Date('2026-11-20T06:00:00Z')

// ---- Table kit (K-03): the kit's six presets with neutral names and illustrative figures ----

export interface SampleLine {
  n: string
  part: string
  brand?: string
  desc: string
  descSub?: string
  qty: string
  uom: string
  supplier: string
  /** Decimal strings; '' when not priced. */
  unit: string
  total: string
  state: 'Quoted' | 'Alternative offered' | 'To source' | 'Partial'
  flag?: boolean
}

export const SAMPLE_LINES: SampleLine[] = [
  {
    n: '1',
    part: 'BRG-6316-C3',
    brand: 'Demo',
    desc: 'Deep groove ball bearing, C3',
    qty: '24',
    uom: 'ea',
    supplier: 'Demo Bearings FZE',
    unit: '108.40',
    total: '2601.60',
    state: 'Quoted',
  },
  {
    n: '2',
    part: 'BRG-22220-K',
    brand: 'Sample',
    desc: 'Spherical roller bearing, tapered bore',
    qty: '8',
    uom: 'ea',
    supplier: 'Example Seals Co',
    unit: '364.50',
    total: '2916.00',
    state: 'Quoted',
  },
  {
    n: '3',
    part: 'FLT-10-220',
    brand: 'Example',
    desc: 'Return filter element 10 µm',
    descSub: 'Offered FLT-10-228 · not equivalent until you decide',
    qty: '40',
    uom: 'ea',
    supplier: 'Sample Filters',
    unit: '44.10',
    total: '1764.00',
    state: 'Alternative offered',
    flag: true,
  },
  {
    n: '4',
    part: 'SWT-1105410',
    brand: 'Demo',
    desc: 'Limit switch, roller lever',
    qty: '12',
    uom: 'ea',
    supplier: '',
    unit: '',
    total: '',
    state: 'To source',
  },
  {
    n: '5',
    part: 'CVT-3-600',
    desc: 'Control valve trim 3″ Class 600',
    qty: '2',
    uom: 'set',
    supplier: 'Example Valve Co',
    unit: '8150.00',
    total: '16300.00',
    state: 'Quoted',
  },
  {
    n: '6',
    part: 'BV-2-300-RF',
    desc: 'Ball valve 2″ Class 300 RF',
    qty: '6',
    uom: 'ea',
    supplier: 'Sample Valves LLC',
    unit: '1120.00',
    total: '6720.00',
    state: 'Partial',
  },
]
export const SAMPLE_LINES_SUBTOTAL = '30301.60'

export interface SampleLanded {
  key: string
  component: string
  basis: string
  eur: string
  aed: string
  mute?: boolean
}

export const SAMPLE_LANDED: SampleLanded[] = [
  {
    key: 'price',
    component: 'Supplier price, ex-works',
    basis: 'Example Valve Co quote EV-26-0001',
    eur: '8150.00',
    aed: '32428.04',
  },
  {
    key: 'freight',
    component: 'Freight to Dubai',
    basis: 'Air consolidation · 42 kg',
    eur: '610.00',
    aed: '2427.13',
  },
  { key: 'insurance', component: 'Insurance', basis: '0.3% of CIF', eur: '26.28', aed: '104.57' },
  { key: 'duty', component: 'Duty', basis: 'Re-export, 0%', eur: '', aed: '0.00', mute: true },
  { key: 'bank', component: 'Bank charges and FX', basis: '0.6%', eur: '48.90', aed: '194.57' },
]
export const SAMPLE_LANDED_TOTAL = { eur: '8835.18', aed: '35154.31' }

export interface SampleQuotation {
  no: string
  client: string
  enquiry: string
  value: string
  ccy: string
  sent: string
  status?: 'Evaluating' | 'Received' | 'No reply'
  next: string
  prob: string
  superseded?: boolean
}

export const SAMPLE_QUOTATIONS: SampleQuotation[] = [
  {
    no: REFS.quotationRevised,
    client: COMPANIES.client,
    enquiry: REFS.enquiry,
    value: '157500',
    ccy: 'USD',
    sent: '2026-10-02T08:00:00Z',
    status: 'Evaluating',
    next: '14 Oct · call buyer',
    prob: '60%',
  },
  {
    no: 'INDUS/Q10002',
    client: COMPANIES.client,
    enquiry: REFS.enquiry,
    value: '12400',
    ccy: 'USD',
    sent: '2026-10-01T08:00:00Z',
    status: 'Received',
    next: '8 Oct',
    prob: '60%',
  },
  {
    no: 'INDUS/Q10003',
    client: 'Demo Trading LLC',
    enquiry: 'ENQ-2026-0002',
    value: '71800',
    ccy: 'AED',
    sent: '2026-09-30T08:00:00Z',
    status: 'No reply',
    next: '7 Oct · chaser 1',
    prob: '30%',
  },
  {
    no: REFS.quotation,
    client: COMPANIES.client,
    enquiry: REFS.enquiry,
    value: '161200',
    ccy: 'USD',
    sent: '2026-09-23T08:00:00Z',
    next: '',
    prob: '',
    superseded: true,
  },
]

/** Three neutral suppliers for the Compare preset (one money column each). */
export const COMPARE_SUPPLIERS = ['Example Valve', 'Sample Valves', 'Demo Flow'] as const

export interface SampleCompare {
  key: string
  kind?: 'group'
  line: string
  qty?: string
  /** One per COMPARE_SUPPLIERS: a decimal string, '' for no offer, or a word ("No reply", "Regret"). */
  prices: [string, string, string]
  pick?: string
}

export const SAMPLE_COMPARE: SampleCompare[] = [
  { key: 'g', kind: 'group', line: 'Landed cost per unit · AED', prices: ['', '', ''] },
  {
    key: 'c1',
    line: 'Control valve trim 3″ Class 600',
    qty: '2 sets',
    prices: ['17640.20', '18912.60', 'No reply'],
    pick: 'Example Valve',
  },
  {
    key: 'c2',
    line: 'Ball valve 2″ Class 300 RF',
    qty: '6 ea',
    prices: ['', '4780.50', '4612.40'],
    pick: 'Demo Flow',
  },
  {
    key: 'c3',
    line: 'Gate valve 4″ Class 150',
    qty: '4 ea',
    prices: ['6150.00', 'Regret', '6420.00'],
    pick: 'Example Valve',
  },
]

export interface SampleHistory {
  key: string
  date: string
  supplier: string
  ref: string
  ccy: string
  price: string
  lead: string
}

export const SAMPLE_HISTORY: SampleHistory[] = [
  {
    key: 'h1',
    date: '2026-11-14T08:00:00Z',
    supplier: 'Example Bearings Trading LLC',
    ref: 'EB-Q-10002',
    ccy: 'AED',
    price: '405.00',
    lead: 'Ex-stock',
  },
  {
    key: 'h2',
    date: '2026-09-02T08:00:00Z',
    supplier: 'Demo Instruments',
    ref: 'DI-26-0001',
    ccy: 'JPY',
    price: '15400',
    lead: '4 weeks',
  },
  {
    key: 'h3',
    date: '2026-06-18T08:00:00Z',
    supplier: 'Example Bearings Trading LLC',
    ref: 'EB-Q-10001',
    ccy: 'AED',
    price: '392.00',
    lead: 'Ex-stock',
  },
]

export interface SampleSupplier {
  key: string
  name: string
  sub?: string
  type: string
  tier: 'Principal' | 'Approved' | 'Trial' | 'Contact only'
  country: string
  reply: string
  win: string
  flag?: boolean
}

export const SAMPLE_SUPPLIERS: SampleSupplier[] = [
  {
    key: 's1',
    name: 'Example Valve Co',
    type: 'Principal · Japan',
    tier: 'Principal',
    country: 'Japan',
    reply: '1.4 d',
    win: '46%',
  },
  {
    key: 's2',
    name: 'Sample Valves LLC',
    sub: 'Bank change · payments blocked',
    type: 'Manufacturer',
    tier: 'Approved',
    country: 'Spain',
    reply: '2.1 d',
    win: '33%',
    flag: true,
  },
  {
    key: 's3',
    name: 'Demo Hydraulics FZE',
    type: 'Manufacturer',
    tier: 'Trial',
    country: 'India',
    reply: '0.9 d',
    win: '',
  },
  {
    key: 's4',
    name: 'Example Automation Co',
    type: 'Distributor',
    tier: 'Contact only',
    country: 'Oman',
    reply: '',
    win: '',
  },
]

/**
 * Mail kit (K-06) samples. Invented people on example domains only: no real mailbox, person, company or
 * email content. Our own mailboxes are shown as sales@ / purchase@ on an example domain too.
 */
export const MAIL = {
  mailboxes: { sales: 'sales@ops-sample.example', purchase: 'purchase@ops-sample.example' },
  supplier: { name: 'Pat Example', address: 'pat@example-valve.example' },
  client: { name: 'Sam Sample', address: 'buyer@sample-client.example' },
  unknown: { name: 'Info Desk', address: 'info@unknown-sender.example' },
} as const

/**
 * Assistant kit (K-05) samples. Invented proposals on the neutral refs; every figure is made up. The L1
 * mirror's texts keep the sheet's line counts (the parity check fails on a height difference over 2px).
 */
export const ASSISTANT = {
  rfq: {
    id: 'A-26-11-20-0001',
    type: 'Send supplier RFQs',
    record: `${REFS.enquiry} · ${REFS.supplierRfq}`,
    level: 'Asks you',
    headline: `Send ${REFS.supplierRfq} to 5 suppliers for 6 bearing lines.`,
    why: [
      {
        text: '6 of the 9 enquiry lines are bearings; the 3 gauge lines go separately as P02.',
        evidence: { label: 'Lines tab', evidenceId: 'ev-lines-0001' },
      },
      {
        text: `${COMPANIES.supplier} and ${COMPANIES.other} quoted the same sizes on ${REFS.enquiry} in September.`,
        evidence: { label: '2 past quotes', evidenceId: 'ev-quotes-0001' },
      },
      {
        text: 'Client wants prices by 2 Oct, so suppliers get 5 working days.',
        evidence: { label: 'Client email', evidenceId: 'ev-mail-0001' },
      },
    ],
    preview: {
      title: 'Preview · email 1 of 5',
      lines: [
        { key: 'to', text: 'To quotes@examplevalve.example · Cc sales@' },
        {
          key: 'subject',
          kind: 'bold',
          text: `RFQ ${REFS.supplierRfq} — Bearings · 6 lines · reply by 30 Sep`,
        },
        {
          key: 'body',
          kind: 'muted',
          text: 'Dear Sales team, please quote for the 6 lines in the attached RFQ, in AED, with stock and lead time per line…',
        },
        { key: 'open', kind: 'link', text: 'Open all 5 emails and the A4 RFQ ↗', href: '#k05' },
      ],
    },
    checks: [
      { key: 'ids', mark: 'ok', text: 'Client identifiers: none found', right: '6 fields' },
      { key: 'ccy', mark: 'ok', text: 'Currency asked: AED for local suppliers', right: '2 of 5' },
      { key: 'new', mark: 'warn', text: `First email to ${COMPANIES.other}`, right: 'research' },
    ],
    confidence: {
      level: 'Likely',
      reason: `${COMPANIES.other}’s range comes from its website, not a past quote.`,
    },
    onApprove:
      '5 emails go from purchase@ with the Helper’s signature, Cc sales@, in 5 minutes. Reply-by 30 Sep; chasers start 1 Oct.',
  },
  chase: {
    id: 'A-26-11-20-0002',
    type: 'Chase suppliers',
    record: 'IH-RFQ-2611-P02',
    level: 'Does it, tells you',
    headline: `Chase ${COMPANIES.supplier} a second time on line 4.`,
    note: 'Sent 10:05',
  },
  relay: {
    id: 'A-26-11-20-0003',
    type: 'Relay supplier questions',
    headline: `Ask ${COMPANIES.client} 3 questions from 2 suppliers`,
    note: 'answer from the datasheet instead',
  },
  quotation: {
    id: 'A-26-11-20-0004',
    type: 'Send quotation',
    record: REFS.quotationRevised,
    level: 'Locked · you send',
    headline: `Send ${REFS.quotationRevised} to ${COMPANIES.client} for 11 of 12 lines.`,
    approveLabel: 'Review and send',
  },
  judgement: {
    id: 'A-26-11-20-0005',
    type: 'Judgement call',
    record: `${REFS.enquiry} · ${REFS.quotation}`,
    level: 'Asks you',
    headline: 'Quote line 4 at 9.5% (floor 12%).',
    why: [
      {
        text: 'The maker’s direct offer is about USD 3,100 each.',
        evidence: { label: 'Client email', evidenceId: 'ev-mail-0002' },
      },
      {
        text: `${COMPANIES.supplier} is the only quote; at 12% we would sell about 2% above that offer.`,
      },
    ],
    legend: 'Choose one',
    options: [
      {
        value: 'approve',
        title: 'Approve at 9.5%',
        sub: 'USD 3,080.00 each; quotation margin 16.8%.',
        suggested: true,
      },
      { value: 'keep', title: 'Keep 12% and risk losing the line', sub: 'USD 3,165.00 each.' },
      {
        value: 'ask',
        title: `Ask ${COMPANIES.supplier} for a better price first`,
        sub: 'The quotation waits up to 1 working day.',
        tag: 'Drafts the ask',
      },
    ],
    checks: [
      { key: 'floor', mark: 'warn', text: 'Margin 9.5% below the 12% floor', right: 'guardrail' },
      { key: 'paid', mark: 'ok', text: 'Client paid 6 of 6 invoices on time' },
    ],
    confidence: {
      level: 'Likely',
      reason: 'The maker’s figure is from the client’s email, not a document we have seen.',
    },
    onApprove:
      'Line 4 is repriced and the quotation card returns to Review; nothing reaches the client.',
  },
  qualify: {
    id: 'A-26-11-20-0006',
    type: 'Is it worth quoting?',
    record: REFS.enquiry,
    level: 'Asks you',
    headline: `Quote ${REFS.enquiry}: 9 of 12 lines are in our range.`,
    signals: [
      {
        key: 'fit',
        mark: 'ok',
        text: '9 of 12 lines match supplier ranges we hold',
        right: 'Lines',
      },
      { key: 'new', mark: 'warn', text: 'First enquiry from this client', right: 'Directory' },
      { key: 'due', mark: 'ok', text: 'Deadline leaves 8 working days', right: 'Client email' },
    ],
    toggle: {
      name: 'regret-rest',
      label: 'Send a polite regret for the 3 other lines',
      defaultOn: true,
    },
    aside: 'Regrets go from sales@ in the client’s thread and never name a supplier.',
    confidence: { level: 'Sure' },
  },
  regret: {
    id: 'A-26-11-20-0007',
    type: 'Regret',
    record: REFS.enquiry,
    level: 'Asks you',
    headline: `Send ${COMPANIES.client} a regret for lines 10 to 12.`,
    chipsLabel: 'Regret reason',
    chips: [
      { value: 'range', label: 'Outside our range' },
      { value: 'time', label: 'Not enough time' },
      { value: 'price', label: 'Cannot meet the target price' },
    ],
    chip: 'range',
    confidence: { level: 'Sure' },
  },
  unsure: {
    question: 'Is PN-10-228 an equivalent of PN-10-220?',
    reason: 'Seen on 3 RFQs; the maker lists them as different media.',
  },
  options: [
    {
      value: 'one',
      title: `${COMPANIES.supplier} for both valve lines`,
      sub: 'Lowest landed cost on 2 of 3 lines, 6 weeks.',
      suggested: true,
    },
    {
      value: 'split',
      title: 'Split line 5 and line 6 between two suppliers',
      sub: 'AED 1,240 more, 1 week sooner on line 6.',
    },
  ],
  source: {
    doc: 'EVC-Q-10001.pdf',
    meta: `${COMPANIES.supplier} · 14 Nov`,
    text: 'Item 1: BRG-6316-C3, quoting AED 418.00 per piece, ex-stock, valid for 30 days.',
    match: 'AED 418.00',
    location: 'Line 3 · unit price',
  },
  highlight: { text: 'Line 3 offered as PN-10-228 instead.', match: 'PN-10-228' },
} as const

/**
 * Shell kit (S02-T01): the two signed-in people and their sidebar badge counts. The Owner is "Owner Sample"
 * (not PEOPLE.owner's "Owner Example"): "Signed in as … · sales@" must stay on one line at 11.5px in the
 * 195px column, as the boards draw it; "Owner Example" is 7px too wide and would wrap.
 */
export const SHELL = {
  owner: {
    name: 'Owner Sample',
    initials: 'OS',
    role: 'owner',
    roleLabel: 'Owner',
    mailbox: 'sales@',
  },
  helper: {
    name: PEOPLE.helper.name,
    initials: PEOPLE.helper.initials,
    role: 'helper',
    roleLabel: 'Helper · sourcing',
    mailbox: 'purchase@',
  },
  ownerBadges: { today: 6, review: 14, mail: 3 },
  helperBadges: { today: 3, mail: 2 },
  websiteAdminHref: 'https://example.test/admin',
} as const
