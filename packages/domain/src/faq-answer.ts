/**
 * Product FAQ answers — a restricted inline-link syntax.
 *
 * Answers are stored as plain text in `product_faqs.answer` and rendered with
 * `whitespace-pre-wrap`. From 2026-11 they may also carry internal links in
 * markdown form, `[link text](/path)`, so an answer can point at the matching
 * ferrule, a guide or the size table. Nothing else in markdown is honoured.
 *
 * Only same-origin paths are links: the href must start with a single `/`
 * (not `//`, which is protocol-relative) and use URL-safe characters. Any
 * other bracket pair — an external URL, `javascript:`, a stray `[1]` — is left
 * exactly as typed, as text. That makes the parser safe to run on every
 * existing answer, none of which was written with links in mind.
 *
 * The FAQPage JSON-LD gets `faqAnswerPlainText()`: link text kept, markup gone,
 * so the structured data says the same words the reader sees.
 */

export type FaqAnswerSegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }

// [text](/path) — text without brackets or newlines, path same-origin only.
const LINK = /\[([^\[\]\n]{1,200})\]\((\/(?!\/)[A-Za-z0-9\-._~/?#=&%+]*)\)/g

/** Split an answer into text and internal-link segments, in order. */
export function parseFaqAnswer(answer: string): FaqAnswerSegment[] {
  const out: FaqAnswerSegment[] = []
  let last = 0
  for (const m of answer.matchAll(LINK)) {
    const start = m.index ?? 0
    if (start > last) out.push({ kind: 'text', text: answer.slice(last, start) })
    out.push({ kind: 'link', text: m[1]!, href: m[2]! })
    last = start + m[0].length
  }
  if (last < answer.length) out.push({ kind: 'text', text: answer.slice(last) })
  return out
}

/** The answer as a reader sees it: link text kept, link markup removed. */
export function faqAnswerPlainText(answer: string): string {
  return parseFaqAnswer(answer)
    .map((s) => s.text)
    .join('')
}

/** Every internal path an answer links to, for link-checking before a write. */
export function faqAnswerLinks(answer: string): string[] {
  return parseFaqAnswer(answer).flatMap((s) => (s.kind === 'link' ? [s.href] : []))
}
