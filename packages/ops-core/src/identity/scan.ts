/**
 * The deterministic half of the identifier check (ADR-13; S09-T06 first use, S12 adds the model half). Pure.
 *
 *   buildSupplierDenyList   every way a supplier can be named: names, aliases, domains (and their first label),
 *                           contact emails, supplier refs. Client-bound text must contain none of them.
 *   scanText                whole-word, case-insensitive hits of a deny list in a text.
 *   scanMoney               amounts and margin words, which never go in a regret or a question to a client.
 *
 * A deterministic hit hard-blocks approval (CLAUDE.md §10.3).
 */

export interface DenyTerm {
  term: string
  /** What it is, for the reason shown: "supplier name", "supplier domain" … */
  kind: string
}

export interface ScanHit {
  term: string
  kind: string
  index: number
}

/** Generic words a company name may contain that must never trigger a hit on their own. */
const GENERIC = new Set([
  'co',
  'company',
  'llc',
  'ltd',
  'limited',
  'inc',
  'gmbh',
  'spa',
  'srl',
  'trading',
  'industries',
  'industrial',
  'international',
  'group',
  'services',
  'engineering',
  'the',
  'and',
  'fze',
  'fzco',
  'est',
  'corp',
  'corporation',
  'sample',
  'example',
])

const norm = (s: string) => s.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()

export interface SupplierIdentity {
  name: string
  aliases?: readonly string[]
  domains?: readonly string[]
  emails?: readonly string[]
  refs?: readonly string[]
}

export function buildSupplierDenyList(suppliers: readonly SupplierIdentity[]): DenyTerm[] {
  const out = new Map<string, DenyTerm>()
  const add = (term: string | null | undefined, kind: string) => {
    if (!term) return
    const t = norm(term)
    if (t.length < 3 || GENERIC.has(t)) return
    if (!out.has(t)) out.set(t, { term: t, kind })
  }
  for (const s of suppliers) {
    add(s.name, 'supplier name')
    // A distinctive first word ("Kestrel" of "Kestrel Valve Co") names the supplier too.
    const first = norm(s.name).split(' ')[0]
    if (first && first.length >= 4 && !GENERIC.has(first)) add(first, 'supplier name')
    for (const a of s.aliases ?? []) add(a, 'supplier alias')
    for (const d of s.domains ?? []) {
      add(d, 'supplier domain')
      const label = norm(d).split('.')[0]
      if (label && label.length >= 4 && !GENERIC.has(label)) add(label, 'supplier domain')
    }
    for (const e of s.emails ?? []) add(e, 'supplier email')
    for (const r of s.refs ?? []) add(r, 'supplier reference')
  }
  return [...out.values()]
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Whole-word hits (word characters on neither side), case-insensitive, in text order. */
export function scanText(text: string, deny: readonly DenyTerm[]): ScanHit[] {
  const hay = norm(text)
  const hits: ScanHit[] = []
  for (const d of deny) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(d.term)}(?=$|[^\\p{L}\\p{N}])`, 'gu')
    for (let m = re.exec(hay); m; m = re.exec(hay))
      hits.push({ term: d.term, kind: d.kind, index: m.index + m[1]!.length })
  }
  return hits.sort((a, b) => a.index - b.index)
}

const MONEY =
  /(?:\b(?:USD|AED|EUR|GBP|SAR|QAR|OMR|KWD|BHD|INR|CNY|JPY|CHF)\s?\d[\d,]*(?:\.\d+)?|[$€£]\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:dollars|dirhams|euros|pounds)\b)/gi
const MARGIN = /\b(?:margin|mark-?up|our cost|landed cost|buying price)\b/gi

/** Amounts and margin words in a client-bound text: a regret or a question never states a price. */
export function scanMoney(text: string): ScanHit[] {
  const hits: ScanHit[] = []
  for (const re of [MONEY, MARGIN]) {
    re.lastIndex = 0
    for (let m = re.exec(text); m; m = re.exec(text))
      hits.push({ term: m[0], kind: re === MONEY ? 'amount' : 'margin', index: m.index })
  }
  return hits.sort((a, b) => a.index - b.index)
}
