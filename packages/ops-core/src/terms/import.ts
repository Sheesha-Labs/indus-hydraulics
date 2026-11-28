import { isTermsCategory, type TermsCategory } from './resolve'
import { parseVariables, type TermsVariable } from './variables'

/**
 * "Import from offer" (S11-T06): the deterministic parts. Code finds the terms section of an offer's text and its
 * number; the model only splits that section into clauses; code then checks every candidate (a known category,
 * known variables only, sane length). Candidates are proposals: a person accepts each one.
 */

const HEADINGS =
  /^\s*(terms\s*(&|and)\s*conditions|terms\s+of\s+(sale|offer|supply)|commercial\s+terms|terms|notes)\s*:?\s*$/im

/** The offer's terms section: from its heading to the end (the signature block is where offers end). */
export function locateTermsSection(text: string, max = 6000): string | null {
  const m = HEADINGS.exec(text)
  if (!m || m.index === undefined) return null
  const rest = text.slice(m.index + m[0].length)
  const end =
    /^\s*(authori[sz]ed\s+signature|for\s+and\s+on\s+behalf|yours\s+(faithfully|sincerely))/im.exec(
      rest
    )
  const section = (end ? rest.slice(0, end.index) : rest).trim()
  return section ? section.slice(0, max) : null
}

/** "INDUS/Q26941" or "INDUS/Q26941-R2" in the offer's text. */
export function offerRefIn(text: string): string | null {
  return /\bINDUS\/Q\d{3,7}(?:-R\d{1,2})?\b/.exec(text)?.[0] ?? null
}

export interface RawCandidate {
  category: string
  title: string
  body: string
}

export interface CheckedCandidate {
  category: TermsCategory
  title: string
  body: string
  variables: TermsVariable[]
}

/**
 * Keep only usable candidates: a known category (else Documents), a body of 3–600 characters, and only known
 * variables (an unknown `{name}` is written out as plain text, never kept as a slot). At most 40.
 */
export function checkCandidates(raw: readonly RawCandidate[]): CheckedCandidate[] {
  const out: CheckedCandidate[] = []
  for (const r of raw.slice(0, 40)) {
    const body0 = r.body.replace(/\s+/g, ' ').trim()
    if (body0.length < 3 || body0.length > 600) continue
    const { unknown } = parseVariables(body0)
    const body = unknown.reduce((b, n) => b.split(`{${n}}`).join(n.replace(/_/g, ' ')), body0)
    out.push({
      category: isTermsCategory(r.category) ? r.category : 'documents',
      title: r.title.replace(/\s+/g, ' ').trim().slice(0, 80) || 'Imported clause',
      body,
      variables: parseVariables(body).names,
    })
  }
  return out
}
