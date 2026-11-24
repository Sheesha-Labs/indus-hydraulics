import { z } from 'zod'
import { boundedReturnDate } from '../../mail/mail-states'

/**
 * Model outputs for the S05-T07 mail states, and the code checks that decide what of them stands.
 */
const reason = z.strictObject({
  text: z.string().min(1).max(300),
  quote: z.string().min(1).max(400),
})

/** ooo-facts@1 (Haiku): the return date and a named stand-in, both quoted from the auto-reply. */
export const oooFactsSchema = z.strictObject({
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  alternateContact: z
    .strictObject({ name: z.string().min(1).max(120), email: z.string().min(3).max(254) })
    .nullable(),
  reasons: z.array(reason).max(3),
})
export type OooFactsOutput = z.infer<typeof oooFactsSchema>

/** translate-mail@1 (Haiku): an English rendering of the sender's words. */
export const translateSchema = z.strictObject({
  language: z.string().min(2).max(40),
  english: z.string().min(1).max(8_000),
})
export type TranslateOutput = z.infer<typeof translateSchema>

/** ask-open-copy@1 and resend-alternate-contact@1 (Sonnet): a short note, no figures. */
export const shortNoteSchema = z.strictObject({
  note: z.string().min(1).max(600),
})
export type ShortNoteOutput = z.infer<typeof shortNoteSchema>

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * What of the model's out-of-office facts stands (S05-T07): the return date only inside today..today+120 and
 * only when one of its quotes is found in the email; the alternate only when its address is written in the
 * email verbatim (case aside) and is a plausible address that is not the sender's own.
 */
export function verifyOooFacts(
  out: OooFactsOutput,
  body: string,
  today: string,
  senderAddress: string
): {
  returnDate: string | null
  alternate: { name: string; email: string } | null
  resolvedQuotes: number
} {
  const text = norm(body)
  const resolved = out.reasons.filter((r) => text.includes(norm(r.quote)))
  const returnDate = resolved.length ? boundedReturnDate(out.returnDate, today) : null
  let alternate: { name: string; email: string } | null = null
  const a = out.alternateContact
  if (a) {
    const email = a.email.trim()
    const plausible = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)
    if (
      plausible &&
      body.toLowerCase().includes(email.toLowerCase()) &&
      email.toLowerCase() !== senderAddress.toLowerCase()
    ) {
      alternate = { name: a.name.trim(), email: email.toLowerCase() }
    }
  }
  return { returnDate, alternate, resolvedQuotes: resolved.length }
}

/**
 * A drafted note may not carry a figure, an address or a link of its own (numbers are code's, ADR-08 §4): any
 * digit, '@' or URL fails it.
 */
export function noteIsClean(note: string): boolean {
  return !/\d/.test(note) && !/@/.test(note) && !/https?:|www\./i.test(note)
}

/**
 * A drafted note with placeholders that code fills (`{files}`, `{name}`): clean when, with the placeholders
 * taken out, it has no figure, address or link, and every required placeholder appears exactly once.
 */
export function checkNote(
  note: string,
  required: readonly string[]
): { ok: boolean; why?: string } {
  for (const p of required) {
    const n = note.split(`{${p}}`).length - 1
    if (n !== 1) return { ok: false, why: `The note must name {${p}} once` }
  }
  let bare = note
  for (const p of required) bare = bare.split(`{${p}}`).join('')
  if (/[{}]/.test(bare)) return { ok: false, why: 'The note has an unknown placeholder' }
  if (!noteIsClean(bare))
    return { ok: false, why: 'The note carries a figure, an address or a link' }
  return { ok: true }
}

export function fillNote(note: string, values: Readonly<Record<string, string>>): string {
  return note.replace(/\{([a-z]+)\}/g, (m, k: string) => values[k] ?? m)
}
