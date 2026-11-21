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
