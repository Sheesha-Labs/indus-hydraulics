/**
 * Which contacts may receive mail (S10-T01, 06-map-schema §8.4, ADR-07). Pure. A contact found only in a directory
 * listing is never used for sending: it must be verified on the company's own page, seen in real mail, entered by a
 * person or imported from history. Bounced, archived and inactive contacts are out too.
 */

export type ContactRefusal = 'no_email' | 'directory_only' | 'bounced' | 'archived' | 'inactive'

export interface SendableInput {
  email: string | null
  sourceKind: string
  status: string
  archivedAt: Date | string | null
  bouncedAt?: Date | string | null
}

export const CONTACT_REFUSAL_TEXT: Record<ContactRefusal, string> = {
  no_email: 'has no email address',
  directory_only: 'was found only in a directory listing, not verified',
  bounced: 'is bouncing',
  archived: 'is archived',
  inactive: 'is marked as not to be used',
}

/** Why this contact cannot receive mail, or null when it can. */
export function contactRefusal(c: SendableInput): ContactRefusal | null {
  if (!c.email || !c.email.includes('@')) return 'no_email'
  if (c.archivedAt) return 'archived'
  if (c.sourceKind === 'directory_only') return 'directory_only'
  if (c.status === 'bouncing' || c.bouncedAt) return 'bounced'
  if (c.status !== 'active') return 'inactive'
  return null
}

export function isSendableContact(c: SendableInput): boolean {
  return contactRefusal(c) === null
}

/**
 * The contact to write to among a company's contacts, for a set of preferred roles (e.g. Quality then Sales for a
 * document reminder): the preferred contact in the first role that has a sendable one, else any sendable contact.
 */
export function pickSendableContact<
  T extends SendableInput & { role: string | null; isPreferred: boolean },
>(contacts: readonly T[], roles: readonly string[] = []): T | null {
  const ok = contacts.filter(isSendableContact)
  const byRole = (role: string) =>
    ok.filter((c) => (c.role ?? '').toLowerCase() === role.toLowerCase())
  for (const role of roles) {
    const list = byRole(role)
    const pick = list.find((c) => c.isPreferred) ?? list[0]
    if (pick) return pick
  }
  return ok.find((c) => c.isPreferred) ?? ok[0] ?? null
}
