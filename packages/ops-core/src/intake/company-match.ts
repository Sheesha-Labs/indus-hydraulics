import { domainOf } from '../mail/headers'

/**
 * Who sent this enquiry (board 16, S09-T04; ADR-12): the decision over three kinds of evidence, each found by
 * its own lookup. Pure. Several companies standing is Unsure: a person chooses, nothing is guessed.
 *
 *   contact_email   the sender's address is a contact of the company (strongest)
 *   sender_domain   the sender's domain is the company's (never a public webmail domain)
 *   letterhead      the issuer name printed on the document is ≥ 0.8 similar to the company's name or an alias
 */

export type MatchBasis = 'contact_email' | 'sender_domain' | 'letterhead'

export interface MatchEvidence {
  companyId: string
  companyName: string
  basis: MatchBasis
  contactId?: string | null
  /** 0–1 for letterhead; 1 for exact evidence. */
  score: number
}

export type CompanyMatch =
  | {
      kind: 'sure'
      companyId: string
      companyName: string
      contactId: string | null
      basis: MatchBasis[]
    }
  | {
      kind: 'unsure'
      candidates: Array<{ companyId: string; companyName: string; why: string }>
    }
  | { kind: 'none' }

const WHY: Record<MatchBasis, string> = {
  contact_email: 'the sender is a contact',
  sender_domain: 'the sender’s domain',
  letterhead: 'the letterhead name',
}

export const LETTERHEAD_MIN = 0.8

export function isFreeMail(email: string | null | undefined, freeMail: readonly string[]): boolean {
  const d = email ? domainOf(email) : null
  return !!d && freeMail.includes(d)
}

/**
 * The decision. Evidence for one company only → Sure (all its bases). Evidence for several: a contact-email
 * match decides alone when it names one company; otherwise Unsure with up to three candidates, strongest first.
 */
export function decideCompanyMatch(evidence: readonly MatchEvidence[]): CompanyMatch {
  const usable = evidence.filter((e) => e.basis !== 'letterhead' || e.score >= LETTERHEAD_MIN)
  if (!usable.length) return { kind: 'none' }
  const by = new Map<string, MatchEvidence[]>()
  for (const e of usable) by.set(e.companyId, [...(by.get(e.companyId) ?? []), e])
  const pick = (id: string) => {
    const ev = by.get(id)!
    const order: MatchBasis[] = ['contact_email', 'sender_domain', 'letterhead']
    return {
      kind: 'sure' as const,
      companyId: id,
      companyName: ev[0]!.companyName,
      contactId: ev.find((e) => e.contactId)?.contactId ?? null,
      basis: order.filter((b) => ev.some((e) => e.basis === b)),
    }
  }
  if (by.size === 1) return pick([...by.keys()][0]!)
  const byContact = [...by.entries()].filter(([, ev]) =>
    ev.some((e) => e.basis === 'contact_email')
  )
  if (byContact.length === 1) return pick(byContact[0]![0])
  const rank = (ev: MatchEvidence[]) =>
    ev.reduce(
      (n, e) => n + (e.basis === 'contact_email' ? 3 : e.basis === 'sender_domain' ? 2 : e.score),
      0
    )
  return {
    kind: 'unsure',
    candidates: [...by.entries()]
      .sort(
        (a, b) =>
          rank(b[1]) - rank(a[1]) || a[1][0]!.companyName.localeCompare(b[1][0]!.companyName)
      )
      .slice(0, 3)
      .map(([id, ev]) => ({
        companyId: id,
        companyName: ev[0]!.companyName,
        why: [...new Set(ev.map((e) => WHY[e.basis]))].join(' and '),
      })),
  }
}

/** "Matched on letterhead and sender j.doe@example.test" (board 16). */
export function matchSentence(basis: readonly MatchBasis[], sender: string | null): string {
  const parts: string[] = []
  if (basis.includes('letterhead')) parts.push('letterhead')
  if (basis.includes('contact_email') || basis.includes('sender_domain'))
    parts.push(sender ? `sender ${sender}` : 'sender')
  return parts.length ? `Matched on ${parts.join(' and ')}` : 'Matched'
}
