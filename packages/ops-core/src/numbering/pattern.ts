/**
 * Number patterns (S11-T08, ADR-15, C6). A pattern is data (Settings › Numbering): literal text plus tokens. The
 * database formats with ops.format_number (the one place numbers are made); this is the same grammar in
 * TypeScript, to validate a pattern before it is saved, to show what a number will look like, and to read
 * numbers back out of mail subjects and file names (the continuity evidence).
 *
 *   {n}            the counter, unpadded (padTo pads it)        INDUS/Q{n}         → INDUS/Q26941
 *   {nn} {nnnn}    the counter, zero-padded to that width       IH-RFQ-{yymm}-P{nn} → IH-RFQ-2611-P07
 *   {yyyy} {yy}    the scope's year                             ENQ-{yyyy}-{nnnn}  → ENQ-2026-0412
 *   {mm} {dd}      the scope's month / day
 *   {yymm}         a month scope as written                     2611
 *   {parent}       a parent ref (per-parent sequences)
 *   {enq4}         the last four digits of the parent ref       SO-{enq4}          → SO-0412
 *
 * A pattern can never name a counterparty ({supplier}, {client}, …): numbers go to both sides (CLAUDE.md §10).
 */
export type ScopeKind = 'global' | 'year' | 'month' | 'day' | 'parent'

const TOKENS = ['yyyy', 'yy', 'mm', 'dd', 'yymm', 'parent', 'enq4'] as const
const COUNTERPARTY =
  /^(supplier|client|customer|company|buyer|vendor|maker|principal|contact|site|vessel|project)/

export function validatePattern(pattern: string, scopeKind: ScopeKind): string[] {
  const errors: string[] = []
  if (!pattern.trim()) return ['Write a pattern.']
  if (pattern.length > 40) errors.push('Keep the pattern under 40 characters.')
  const literal = pattern.replace(/\{[^}]*\}/g, '')
  if (/[^A-Z0-9/-]/.test(literal))
    errors.push('Use capital letters, digits, "/" and "-" outside the {tokens}.')
  const tokens = [...pattern.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]!)
  if (/[{}]/.test(literal)) errors.push('A { has no matching }.')
  let counters = 0
  for (const t of tokens) {
    if (/^n+$/.test(t)) {
      counters++
      continue
    }
    if (COUNTERPARTY.test(t)) {
      errors.push(`{${t}} would print a counterparty in the number; numbers go to both sides.`)
      continue
    }
    if (!(TOKENS as readonly string[]).includes(t)) {
      errors.push(`{${t}} is not a token.`)
      continue
    }
    const needs: Record<string, ScopeKind[]> = {
      yyyy: ['year', 'month', 'day'],
      yy: ['year', 'month', 'day'],
      mm: ['month', 'day'],
      dd: ['day'],
      yymm: ['month'],
      parent: ['parent'],
      enq4: ['parent'],
    }
    if (!needs[t]!.includes(scopeKind))
      errors.push(`{${t}} needs a ${needs[t]!.join(' or ')} sequence; this one is ${scopeKind}.`)
  }
  // A per-parent sequence may be the parent's own number (SO-{enq4}); every other has exactly one counter.
  if (counters > 1 || (counters === 0 && scopeKind !== 'parent'))
    errors.push('A pattern has exactly one counter: {n}, {nn}, {nnn} or {nnnn}.')
  return errors
}

/** Fill a pattern as ops.format_number does. Throws on a scope the kind cannot take. */
export function formatNumber(
  pattern: string,
  value: number | bigint,
  scope: string,
  scopeKind: ScopeKind,
  padTo = 0
): string {
  let out = pattern
  let yy: string | null = null
  let mm: string | null = null
  let dd: string | null = null
  switch (scopeKind) {
    case 'global':
      if (scope) throw new RangeError('a global sequence takes the empty scope')
      break
    case 'year':
      if (!/^\d{4}$/.test(scope)) throw new RangeError('year scope must be yyyy')
      yy = scope.slice(2)
      out = out.replaceAll('{yyyy}', scope)
      break
    case 'month':
      if (!/^\d{4}$/.test(scope)) throw new RangeError('month scope must be yymm')
      yy = scope.slice(0, 2)
      mm = scope.slice(2)
      out = out.replaceAll('{yymm}', scope)
      break
    case 'day': {
      const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(scope)
      if (!m) throw new RangeError('day scope must be yy-mm-dd')
      ;[yy, mm, dd] = [m[1]!, m[2]!, m[3]!]
      break
    }
    case 'parent':
      if (!scope) throw new RangeError('a parent-scoped sequence needs the parent ref')
      out = out
        .replaceAll('{parent}', scope)
        .replaceAll('{enq4}', scope.replace(/\D/g, '').slice(-4))
      break
  }
  if (yy) out = out.replaceAll('{yyyy}', `20${yy}`).replaceAll('{yy}', yy)
  if (mm) out = out.replaceAll('{mm}', mm)
  if (dd) out = out.replaceAll('{dd}', dd)
  out = out.replace(/\{(n+)\}/g, (_m, ns: string) => {
    const width = ns.length === 1 ? Math.max(padTo, 1) : ns.length
    return String(value).padStart(width, '0')
  })
  if (/\{[a-z0-9]+\}/.test(out))
    throw new RangeError(`pattern ${pattern} has a token the scope cannot fill`)
  return out
}

/**
 * Read a number back: the counter value and the scope part, when `text` holds a number in this pattern (a
 * subject line, a file name). Revision and shipment suffixes ("-R2", "-01") are ignored. Null otherwise.
 */
export function parseNumber(
  pattern: string,
  text: string
): { value: number; formatted: string; scope: string } | null {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  let scopeGroup = ''
  const re = pattern.replace(/\{([^}]*)\}|[^{]+/g, (part, tok?: string) => {
    if (tok === undefined) return esc(part)
    if (/^n$/.test(tok)) return '(?<n>\\d{1,9})'
    if (/^n+$/.test(tok)) return `(?<n>\\d{${tok.length},9})`
    if (tok === 'yyyy') return (scopeGroup = '(?<yyyy>\\d{4})')
    if (tok === 'yymm') return (scopeGroup = '(?<yymm>\\d{4})')
    if (tok === 'yy') return '(?<yy>\\d{2})'
    if (tok === 'mm' || tok === 'dd') return `(?<${tok}>\\d{2})`
    if (tok === 'enq4') return '(?<enq4>\\d{4})'
    return '(?<parent>[A-Z0-9/-]+?)'
  })
  void scopeGroup
  const m = new RegExp(`(?<![A-Z0-9/])${re}(?![0-9])`).exec(text.toUpperCase())
  if (!m?.groups?.n) return null
  const g = m.groups
  const scope = g.yyyy ?? g.yymm ?? (g.yy && g.mm && g.dd ? `${g.yy}-${g.mm}-${g.dd}` : '')
  return { value: Number(g.n), formatted: m[0], scope }
}

/**
 * The printed number of a revision (ADR-15): R1 has no suffix; later ones add the sequence's revision pattern
 * ("-R{n}" → "-R2"). A sequence without one (the tax invoice) never revises.
 */
export function revisedNumber(
  base: string,
  revision: number,
  revisionPattern: string | null
): string {
  if (revision <= 1) return base
  if (!revisionPattern) throw new RangeError('this document never revises; issue a new number')
  return (
    base +
    revisionPattern.replace(/\{(n+)\}/g, (_m, ns: string) =>
      String(revision).padStart(ns.length, '0')
    )
  )
}
