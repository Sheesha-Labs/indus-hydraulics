import type { Legitimacy, Signal } from './signals'

/**
 * The decision half of the quick read (S09-T06, board 167, 171b states 1–3). Pure. The model weighs the signals and
 * suggests a path; code decides how sure the card is (ADR-08/§9.6: confidence is computed by code, never the
 * model's self-report). Sure only when no signal is bad and the model agrees with code's own reading.
 */

export type ReadConfidence = 'sure' | 'likely' | 'unsure'

export const QUALIFY_PATHS = [
  'quote_fully',
  'quote_partial',
  'ask_client_first',
  'regret',
  'ignore_spam',
] as const
export type QualifyPath = (typeof QUALIFY_PATHS)[number]

export interface ModelRead {
  legitimacy: { verdict: Legitimacy; confidence: ReadConfidence }
  fit: { confidence: ReadConfidence }
  suggestedPath: QualifyPath
  pathConfidence: ReadConfidence
  regretLineNos: number[]
  askLineNos: number[]
}

export interface QualifyVerdict {
  legitimacy: Legitimacy
  legitimacyConfidence: ReadConfidence
  fitConfidence: ReadConfidence
  suggestedPath: QualifyPath
  pathConfidence: ReadConfidence
  regretLineNos: number[]
  askLineNos: number[]
  /** Board 171b state 2: the card asks "Is this a real buyer?" instead of offering every path. */
  realBuyerQuestion: boolean
  /** Why code lowered the model's read, for the card's checks. */
  notes: string[]
}

const RANK: Record<ReadConfidence, number> = { unsure: 0, likely: 1, sure: 2 }
const lowest = (...c: ReadConfidence[]): ReadConfidence =>
  c.reduce<ReadConfidence>((a, b) => (RANK[b] < RANK[a] ? b : a), 'sure')

/** "Fit" from the share of lines in categories sourced before: ≥ 90 % Sure, ≥ 60 % Likely, else Unsure. */
export function fitConfidenceOf(fit: number, of: number): ReadConfidence {
  if (of === 0) return 'unsure'
  const r = fit / of
  return r >= 0.9 ? 'sure' : r >= 0.6 ? 'likely' : 'unsure'
}

/**
 * The domain's first label names the company ("sample-mining.example" for "Sample Mining Services"): letters
 * and digits only, the label contains the name's first word, or the name's initials, or the joined name starts
 * with the label. Null without both.
 */
export function domainMatchesName(domain: string | null, name: string | null): boolean | null {
  if (!domain || !name) return null
  const label = (domain.toLowerCase().split('.')[0] ?? '').replace(/[^a-z0-9]/g, '')
  const words = name
    .toLowerCase()
    .replace(/&/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w))
  if (!label || !words.length) return null
  const joined = words.join('')
  const initials = words.map((w) => w[0]).join('')
  return (
    (words[0]!.length >= 3 && label.includes(words[0]!)) ||
    joined.startsWith(label) ||
    (initials.length >= 2 && label.startsWith(initials))
  )
}
const STOP = new Set(['the', 'and', 'of', 'llc', 'ltd', 'fze', 'fzco', 'co', 'est', 'inc', 'plc'])

export function qualifyVerdict(i: {
  legitimacySignals: readonly Signal[]
  fitSignals: readonly Signal[]
  codeLegitimacy: Legitimacy
  fit: { fit: number; of: number }
  lineNos: readonly number[]
  model: ModelRead
}): QualifyVerdict {
  const notes: string[] = []
  const known = new Set(i.lineNos)
  const keep = (nos: readonly number[], what: string) => {
    const ok = [...new Set(nos)].filter((n) => known.has(n)).sort((a, b) => a - b)
    if (ok.length < new Set(nos).size) notes.push(`${what} named a line that is not on the enquiry`)
    return ok
  }
  const regretLineNos = keep(i.model.regretLineNos, 'The regret list')
  const askLineNos = keep(i.model.askLineNos, 'The question list')
  const anyBad = i.legitimacySignals.some((s) => s.mark === 'bad')
  const warns = i.legitimacySignals.filter((s) => s.mark === 'warn').length

  // A sign-in or "view document" link is spam whatever the model says (171b state 3, "Ignore (spam) · Sure").
  if (i.codeLegitimacy === 'spam')
    return {
      legitimacy: 'spam',
      legitimacyConfidence: 'sure',
      fitConfidence: lowest(fitConfidenceOf(i.fit.fit, i.fit.of), i.model.fit.confidence),
      suggestedPath: 'ignore_spam',
      pathConfidence: i.model.legitimacy.verdict === 'spam' ? 'sure' : 'likely',
      regretLineNos: [],
      askLineNos: [],
      realBuyerQuestion: false,
      notes:
        i.model.legitimacy.verdict === 'spam'
          ? notes
          : [...notes, 'A sign-in or “view document” link was found, so code reads it as spam'],
    }

  const agrees = i.model.legitimacy.verdict === i.codeLegitimacy
  if (!agrees)
    notes.push(`The model read ${i.model.legitimacy.verdict}; the signals read ${i.codeLegitimacy}`)
  const legitimacyConfidence: ReadConfidence = !agrees
    ? 'unsure'
    : anyBad || i.codeLegitimacy === 'suspicious'
      ? lowest('likely', i.model.legitimacy.confidence)
      : warns > 0
        ? lowest('likely', i.model.legitimacy.confidence)
        : i.model.legitimacy.confidence
  const fitConfidence = lowest(fitConfidenceOf(i.fit.fit, i.fit.of), i.model.fit.confidence)

  let path = i.model.suggestedPath
  if (path === 'ignore_spam') {
    // Without a spam signal, code never suggests ignoring a sender.
    notes.push('No spam signal was found, so ignoring is not suggested')
    path = 'ask_client_first'
  }
  if (path === 'quote_partial' && regretLineNos.length === 0) {
    notes.push('A partial quote needs the lines to regret')
    path = 'quote_fully'
  }
  if (path === 'quote_partial' && regretLineNos.length >= i.lineNos.length) {
    notes.push('Every line would be regretted')
    path = 'regret'
  }

  const realBuyerQuestion = i.codeLegitimacy === 'suspicious' || legitimacyConfidence === 'unsure'
  const pathConfidence = realBuyerQuestion
    ? 'unsure'
    : lowest(
        i.model.pathConfidence,
        legitimacyConfidence,
        path === 'quote_fully' || path === 'quote_partial' ? fitConfidence : 'sure',
        notes.length ? 'likely' : 'sure',
        i.fitSignals.some((s) => s.mark === 'bad') && path === 'quote_fully' ? 'likely' : 'sure'
      )

  return {
    legitimacy: i.codeLegitimacy === 'suspicious' ? 'suspicious' : i.model.legitimacy.verdict,
    legitimacyConfidence,
    fitConfidence,
    suggestedPath: path,
    pathConfidence,
    regretLineNos: path === 'quote_partial' ? regretLineNos : [],
    askLineNos: path === 'ask_client_first' ? askLineNos : [],
    realBuyerQuestion,
    notes,
  }
}
