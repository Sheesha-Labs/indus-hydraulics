import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import { env, type OpsEnv } from '../lib/env'

/**
 * The Why? drawer's read (S04, P06 112): one evidence row with its reasons, the source span with the
 * matched text, the code checks, the confidence, its sources and the value's history.
 *
 * S02 stub: no query. Outside production it returns one neutral fixture for FIXTURE_EVIDENCE_ID so the
 * shell has something to open; anything else, and everything in production, is null → the not-found
 * state. S06 replaces the body with the `assistant_action` proposal + `source_span` read.
 */

export const evidenceIdSchema = z.uuid()

/** The neutral fixture (a UUIDv7-shaped constant, never a real row). */
export const FIXTURE_EVIDENCE_ID = '00000000-0000-7000-8000-00000000e001'

export interface EvidenceView {
  id: string
  /** "Line 1 · AED 125.00 from Example Valve Co". */
  title: string
  reasons: Array<{ text: string; evidence?: { label: string; evidenceId: string } }>
  source?: {
    kind: 'PDF' | 'XLS' | 'MAIL'
    name: string
    meta: string
    text: string
    /** The exact text matched inside `text`. */
    mark: string
    /** "Line 1 · unit price". */
    foot: string
    /** Opens the original (the document viewer at the span, S06). */
    href: string
  }
  checks: Array<{ key: string; mark: 'ok' | 'warn' | 'bad'; text: string; right: string }>
  confidence: { level: 'Sure' | 'Likely' | 'Unsure'; reason?: string }
  sources: Array<{ key: string; label: string; meta: string }>
  history: Array<{ key: string; time: string; text: string }>
}

const FIXTURE: EvidenceView = {
  id: FIXTURE_EVIDENCE_ID,
  title: 'Line 1 · AED 125.00 from Example Valve Co',
  reasons: [
    {
      text: 'Read from Example Valve Co’s quote of 14 Nov, item 1.',
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
  source: {
    kind: 'PDF',
    name: 'EXV-Q-10001.pdf',
    meta: 'Example Valve Co · 14 Nov',
    text: 'Item 1: 6205 C3, quoting AED 125.00 per piece, ex-stock, valid 30 days.',
    mark: 'AED 125.00',
    foot: 'Line 1 · unit price',
    href: '/search?q=EXV-Q-10001',
  },
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
  sources: [
    { key: 'quote', label: 'EXV-Q-10001.pdf', meta: 'Supplier quote · page 1' },
    { key: 'mail', label: 'RE: RFQ IH-RFQ-2611-P01', meta: 'Email · purchase@ · 14 Nov' },
  ],
  history: [],
}

export function evidenceFixture(id: string, appEnv: OpsEnv['APP_ENV']): EvidenceView | null {
  return appEnv !== 'production' && id === FIXTURE_EVIDENCE_ID ? FIXTURE : null
}

/** Null for an unknown id (and, in S02, for every id in production). */
export const getEvidence = cache(async (evidenceId: string): Promise<EvidenceView | null> => {
  if (!evidenceIdSchema.safeParse(evidenceId).success) return null
  return evidenceFixture(evidenceId, env().APP_ENV)
})
