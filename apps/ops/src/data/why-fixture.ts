import 'server-only'
import type { OpsEnv } from '../lib/env'
import type { WhyView } from './why'

/** The neutral S04 shell fixture (a UUIDv7-shaped constant, never a real row; never in production). */
export const FIXTURE_EVIDENCE_ID = '00000000-0000-7000-8000-00000000e001'

const FIXTURE: WhyView = {
  id: FIXTURE_EVIDENCE_ID,
  eyebrow: 'Why?',
  title: 'Line 1 · AED 125.00 from Example Valve Co',
  initialTab: 'reasons',
  activeSpan: 'quote',
  reasons: [
    {
      text: 'Read from the supplier’s quote of 14 Nov, item 1.',
      evidence: { label: 'EXV-Q-10001', evidenceId: FIXTURE_EVIDENCE_ID },
    },
    {
      text: 'Part number matched as 6205-C3 (written 6205 C3 in the quote).',
      evidence: { label: 'Part 6205-C3', evidenceId: FIXTURE_EVIDENCE_ID },
    },
    {
      text: 'Within 3% of the last two quotes for this part.',
      evidence: { label: 'Price history', evidenceId: FIXTURE_EVIDENCE_ID },
    },
  ],
  alternatives: [],
  checks: [
    { key: 'ccy', mark: 'ok', text: 'Currency read as AED', right: 'header' },
    { key: 'unit', mark: 'ok', text: 'Unit is per piece', right: 'line text' },
    {
      key: 'validity',
      mark: 'warn',
      text: 'Validity 30 days is shorter than the client’s 45',
      right: 'terms',
    },
  ],
  confidence: { level: 'Sure' },
  footnote: null,
  spans: [
    {
      key: 'quote',
      reasonIndex: 0,
      sourceKind: 'pdf',
      fileType: 'PDF',
      doc: 'EXV-Q-10001.pdf',
      meta: 'Example Valve Co · 14 Nov',
      text: 'Item 1: 6205 C3, quoting AED 125.00 per piece, ex-stock, valid 30 days.',
      match: 'AED 125.00',
      location: 'Line 1 · unit price',
      openHref: '/search?q=EXV-Q-10001',
      changed: false,
      pageOnly: false,
    },
    {
      key: 'mail',
      reasonIndex: null,
      sourceKind: 'email',
      fileType: 'MAIL',
      doc: 'RE: RFQ IH-RFQ-2611-P01',
      meta: 'Email · purchase@ · 14 Nov',
      text: 'Please find our quotation attached.',
      match: 'quotation attached',
      location: 'Paragraph 1',
      openHref: '/search?q=IH-RFQ-2611-P01',
      changed: false,
      pageOnly: false,
    },
  ],
  noQuote: null,
  history: [],
  // Opens the form in the shell fixture; saving answers "That action is no longer here".
  correction: {
    actionRef: 'A-FIXTURE-0000',
    label: 'Unit price',
    valueType: 'text',
    current: 'AED 125.00',
    choices: [],
    consequence: 'Changing it re-prices the line and records “Overridden by” you in History.',
    search: null,
  },
  overridden: null,
}

export function evidenceFixture(id: string, appEnv: OpsEnv['APP_ENV']): WhyView | null {
  return appEnv !== 'production' && id === FIXTURE_EVIDENCE_ID ? FIXTURE : null
}

