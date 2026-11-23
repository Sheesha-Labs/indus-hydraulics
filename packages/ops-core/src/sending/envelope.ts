/**
 * The envelope of one outbound email (S04-T06, 08-map-integrations §1.9): who it goes to, from which mailbox
 * role, and the header Ops reconciles by. Pure.
 */

/** The header an ambiguous send is reconciled by: its value is the outbound row id. */
export const OUTBOUND_HEADER = 'X-Indus-Outbound'

export type Envelope = { to: string[]; cc: string[]; bcc: string[] }

const ADDRESS = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]+$/

export function isAddress(value: string): boolean {
  return ADDRESS.test(value.trim())
}

/**
 * Lower-cased, trimmed, de-duplicated across to → cc → bcc (an address keeps its first position), with the
 * sending mailbox itself removed from every list. Throws when nothing is left in `to` or an address is invalid.
 */
export function normaliseEnvelope(input: Envelope, fromAddress: string): Envelope {
  const self = fromAddress.trim().toLowerCase()
  const seen = new Set<string>([self])
  const clean = (list: readonly string[]) => {
    const out: string[] = []
    for (const raw of list) {
      const a = raw.trim().toLowerCase()
      if (!a) continue
      if (!isAddress(a)) throw new Error(`Not an email address: ${a}`)
      if (seen.has(a)) continue
      seen.add(a)
      out.push(a)
    }
    return out
  }
  const to = clean(input.to)
  const cc = clean(input.cc)
  const bcc = clean(input.bcc)
  if (to.length === 0) throw new Error('An email needs at least one recipient')
  return { to, cc, bcc }
}

export function allRecipients(e: Envelope): string[] {
  return [...e.to, ...e.cc, ...e.bcc]
}

/** True when the alias is in the mailbox's verified send-as list (re-checked at send time, board 87). */
export function aliasAllowed(alias: string, sendAsAliases: readonly string[]): boolean {
  const a = alias.trim().toLowerCase()
  return sendAsAliases.some((s) => s.trim().toLowerCase() === a)
}
