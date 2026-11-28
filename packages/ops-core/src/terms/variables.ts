/**
 * Offer-term variables (S11-T06, board 39). A clause body is controlled wording with `{name}` slots; the slots
 * are filled from the preset, the enquiry or a change on one order, then the clause prints in upper case as on
 * the Zoho estimates clients already receive. Only these names exist: an unknown one is an error, so a typo
 * can never print "{advnce_pct}" on a quotation.
 */
export const TERMS_VARIABLES = [
  'advance_pct',
  'balance_days',
  'days',
  'site',
  'incoterm',
  'port',
  'weeks',
  'valid_weeks',
  'origin',
  'delivery_date',
] as const
export type TermsVariable = (typeof TERMS_VARIABLES)[number]

/** Numeric variables take a whole number (percent, days, weeks); the rest are text. */
export const NUMERIC_VARIABLES: ReadonlySet<TermsVariable> = new Set([
  'advance_pct',
  'balance_days',
  'days',
  'weeks',
  'valid_weeks',
])

export type TermsValues = Partial<Record<string, string | number>>

const SLOT = /\{([a-z_][a-z0-9_]*)\}/g

export const isTermsVariable = (n: string): n is TermsVariable =>
  (TERMS_VARIABLES as readonly string[]).includes(n)

/** The variables a body uses, in order of first use, and any name that is not a variable. */
export function parseVariables(body: string): { names: TermsVariable[]; unknown: string[] } {
  const names: TermsVariable[] = []
  const unknown: string[] = []
  for (const m of body.matchAll(SLOT)) {
    const n = m[1]!
    if (isTermsVariable(n)) {
      if (!names.includes(n)) names.push(n)
    } else if (!unknown.includes(n)) unknown.push(n)
  }
  return { names, unknown }
}

/** Why a value cannot fill a variable, or null. */
export function variableValueError(name: TermsVariable, v: string | number): string | null {
  const s = String(v).trim()
  if (!s) return `Fill {${name}}.`
  if (NUMERIC_VARIABLES.has(name)) {
    if (!/^\d{1,4}$/.test(s)) return `{${name}} is a whole number.`
    if (name === 'advance_pct' && Number(s) > 100) return '{advance_pct} is at most 100.'
  }
  if (s.length > 80) return `{${name}} is too long.`
  return null
}

export type RenderedClause = { ok: true; text: string } | { ok: false; error: string }

/**
 * Fill the slots, then upper-case the whole clause (values included: "30% ADVANCE …"). Unknown variables and
 * missing or malformed values are errors, never printed.
 */
export function renderClause(body: string, values: TermsValues): RenderedClause {
  const { names, unknown } = parseVariables(body)
  if (unknown.length) return { ok: false, error: `{${unknown[0]}} is not a variable.` }
  for (const n of names) {
    const v = values[n]
    if (v === undefined || v === null) return { ok: false, error: `Fill {${n}}.` }
    const bad = variableValueError(n, v)
    if (bad) return { ok: false, error: bad }
  }
  const text = body.replace(SLOT, (_m, n: string) => String(values[n]).trim())
  return { ok: true, text: text.replace(/\s+/g, ' ').trim().toUpperCase() }
}
