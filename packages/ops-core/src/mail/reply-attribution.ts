import { parseReference, type ReferenceKind } from '../reference/parse-reference'

/**
 * Which of our records a message answers (S05-T03), adapted from the website's reply attribution (copied,
 * not imported). The rule is unchanged: a unique confident match, or nothing. A mis-attributed reply files a
 * supplier's price against the wrong enquiry, silently, so a best guess is never returned.
 *
 * Priority, highest first:
 *   1. IH-RFQ-YYMM-Pnn   our supplier RFQ (the most specific: one trade group of one enquiry)
 *   2. ENQ-YYYY-NNNN     our enquiry
 *   3. INDUS/Q<n>[-R<n>] our quotation
 *   4. SO-NNNN           our sales order
 *   5. INDUS/PO<n>       our supplier PO
 *
 * New text (the subject and the body above any quoted part) is read before quoted text: an older reference
 * quoted further down never beats a newer one written in the reply. Within one tier, two DIFFERENT references
 * of the same rank return null; the same reference written several times is one match.
 */

export interface FoundReference {
  kind: ReferenceKind
  canonical: string
  rank: number
  source: 'subject' | 'new_text' | 'quoted'
}

export interface FindReferenceResult {
  match: FoundReference | null
  /** Every distinct canonical reference seen, for the Why? panel and the Unsure pile. */
  candidates: string[]
  /** Why there is no match when references were seen: two of the same rank in the same tier. */
  ambiguous: boolean
}

const PATTERNS: ReadonlyArray<{ rank: number; re: RegExp }> = [
  { rank: 1, re: /\bIH[\s-]?RFQ[\s-]?\d{4}[\s-]?P\s?\d{2,3}\b/gi },
  { rank: 2, re: /\bENQ[\s-]?\d{4}[\s-]?\d{4}\b/gi },
  { rank: 3, re: /\bINDUS\s*\/?\s*Q\s*-?\s*\d{4,}(?:\s*-\s*R\d+)?\b/gi },
  { rank: 4, re: /\bSO[\s-]?\d{4}(?:[\s-]?[A-Z])?\b/g },
  { rank: 5, re: /\bINDUS\s*\/?\s*PO\s*-?\s*\d{4,}(?:\s*-\s*R\d+)?\b/gi },
]

const QUOTE_HEADER = [
  /^On .{4,200} wrote:\s*$/i,
  /^-{2,}\s*(Original Message|Forwarded message|Ursprüngliche Nachricht|Message d'origine|Mensaje original|Messaggio originale)\s*-{2,}/i,
  /^(Le|El|Il|Am|Op) .{4,200} (a écrit|escribió|ha scritto|schrieb|schreef)\s?:\s*$/i,
  /^Am .{4,200} schrieb .{1,200}:\s*$/i,
  /^在.{2,200}写道[:：]\s*$/,
]

/** "From: …" followed within three lines by "Sent:"/"Date:" (Outlook's reply header), in a few languages. */
function isOutlookHeader(lines: readonly string[], i: number): boolean {
  if (!/^\*?(From|De|Von|Da|Van|发件人)\s*:/i.test(lines[i]!.trim())) return false
  return lines
    .slice(i + 1, i + 4)
    .some((l) =>
      /^\*?(Sent|Date|Envoyé|Gesendet|Enviado|Inviato|Verzonden|发送时间)\s*:/i.test(l.trim())
    )
}

/** Splits a plain-text body into what the sender wrote now and what they quoted. */
export function splitQuoted(text: string): { fresh: string; quoted: string } {
  const lines = text.replace(/\r/g, '').split('\n')
  const fresh: string[] = []
  const quoted: string[] = []
  let inQuote = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (!inQuote && (QUOTE_HEADER.some((re) => re.test(trimmed)) || isOutlookHeader(lines, i)))
      inQuote = true
    if (inQuote || trimmed.startsWith('>')) quoted.push(line)
    else fresh.push(line)
  }
  return { fresh: fresh.join('\n'), quoted: quoted.join('\n') }
}

function refsIn(text: string): Array<{ rank: number; kind: ReferenceKind; canonical: string }> {
  const out: Array<{ rank: number; kind: ReferenceKind; canonical: string }> = []
  for (const { rank, re } of PATTERNS) {
    const r = new RegExp(re.source, re.flags)
    for (let m = r.exec(text); m; m = r.exec(text)) {
      const parsed = parseReference(m[0].replace(/\s+/g, ' '))
      if (parsed && parsed.match === 'known_format')
        out.push({ rank, kind: parsed.kind, canonical: parsed.canonical })
    }
  }
  return out
}

export function findReference(text: string | null, subject: string | null): FindReferenceResult {
  const { fresh, quoted } = splitQuoted(text ?? '')
  const tiers: Array<{ source: FoundReference['source']; refs: ReturnType<typeof refsIn> }> = [
    { source: 'subject', refs: refsIn(subject ?? '') },
    { source: 'new_text', refs: refsIn(fresh) },
    { source: 'quoted', refs: refsIn(quoted) },
  ]
  const candidates = [...new Set(tiers.flatMap((t) => t.refs.map((r) => r.canonical)))].sort()

  // Subject and new text are one tier (both written now); the subject decides only a tie it alone breaks.
  const now = [...tiers[0]!.refs, ...tiers[1]!.refs]
  for (const [source, refs] of [
    ['new', now],
    ['quoted', tiers[2]!.refs],
  ] as const) {
    if (refs.length === 0) continue
    const top = Math.min(...refs.map((r) => r.rank))
    const distinct = [...new Set(refs.filter((r) => r.rank === top).map((r) => r.canonical))]
    if (distinct.length > 1) return { match: null, candidates, ambiguous: true }
    const hit = refs.find((r) => r.canonical === distinct[0])!
    const where: FoundReference['source'] =
      source === 'quoted'
        ? 'quoted'
        : tiers[0]!.refs.some((r) => r.canonical === hit.canonical)
          ? 'subject'
          : 'new_text'
    return { match: { ...hit, source: where }, candidates, ambiguous: false }
  }
  return { match: null, candidates, ambiguous: false }
}
