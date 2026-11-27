import type { SystemPart } from '@indus/ops-ai'
import { z } from 'zod'

/**
 * Prompt for `supplier_reliability_summary` (S10-T03, board 129, Sonnet at low effort). Internal text for the
 * supplier profile: one short paragraph in plain words about how far to trust a supplier. The model gets the
 * computed figures as named placeholders only and never writes a number: code fills the placeholders and refuses a
 * paragraph with a bare digit (ADR-08). No names, no countries, no client anything.
 *
 * Versioned code; byte-stable system part.
 */
export const PROMPT_VERSION = 'supplier_summary@1'

const RULES = `You write one short paragraph for the internal profile of a supplier to an industrial trading company. It tells a buyer how far to trust this supplier when choosing who to ask for prices.

You are given figures by name only, for example {reply_days} or {lines_quoted}. Each placeholder you may use is listed with what it means. Code puts the real number in later.

Rules:
- Write two or three plain sentences, at most 60 words, in the style: "Replies in about {reply_days} days, quotes {lines_quoted} of lines asked, delivered late {late_count} of {po_count} times. Safe for routine lines; ask a second supplier when the deadline is short."
- Never write a digit or a number in words. Use only the placeholders listed, each at most once, in curly braces exactly as given.
- Use only the facts given. Do not invent prices, names, places, products or history.
- End with one sentence of practical advice that follows from the figures.
- If the figures are thin, say so plainly instead of judging.`

export const SYSTEM_PARTS: readonly SystemPart[] = [{ id: 'supplier-summary-rules', text: RULES }]

export const summarySchema = z.object({ paragraph: z.string().min(1).max(500) })
export type SummaryModelOut = z.infer<typeof summarySchema>

const MEANING: Record<string, string> = {
  reply_days: 'median days to reply to a request for quotation',
  reply_rate: 'share of requests answered',
  lines_quoted: 'share of the lines asked that they quoted',
  win_share: 'share of their quoted lines chosen on won orders',
  on_time: 'share of purchase orders ready on time',
  late_count: 'purchase orders late',
  po_count: 'purchase orders placed with them',
}

export function summaryUser(i: {
  available: readonly string[]
  type: string
  tier: string
  counts: string
}): string {
  return [
    `Supplier type: ${i.type}. Tier: ${i.tier}.`,
    `History: ${i.counts}.`,
    `Placeholders you may use:\n${i.available.map((p) => `- {${p}}: ${MEANING[p] ?? p}`).join('\n')}`,
  ].join('\n\n')
}
