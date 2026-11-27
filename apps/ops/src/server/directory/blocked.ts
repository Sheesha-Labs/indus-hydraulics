import 'server-only'
import { normaliseCompanyName, normaliseDomain, registrableDomain } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { ibanHash } from './iban-seal'

/**
 * Is this counterparty a blocked supplier? (S10-T01, ADR-13, board 131). Research (S13), RFQ drafting (S12) and the
 * mail pipeline ask before they suggest or write to anyone. Matched on the normalised company name or an alias, the
 * registrable domain, the phone in E.164 digits, and the IBAN (HMAC, never in clear). One predicate for every caller.
 */
export interface CounterpartyProbe {
  name?: string | null
  domain?: string | null
  phone?: string | null
  iban?: string | null
}

export type MatchedOn = 'name' | 'domain' | 'phone' | 'iban'

export interface BlockedResult {
  blocked: boolean
  companyId?: string
  companyName?: string
  matchedOn: MatchedOn[]
}

/** "+971 (4) 123-4567" and "00971 4 1234567" → "97141234567". */
export function phoneDigits(p: string | null | undefined): string | null {
  if (!p) return null
  const d = p
    .replace(/[^\d+]/g, '')
    .replace(/^00/, '+')
    .replace(/^\+/, '')
  return d.length >= 7 ? d : null
}

type Db = Pick<Prisma.TransactionClient, 'company' | 'supplierBankAccount'>

export async function isBlockedCounterparty(
  p: CounterpartyProbe,
  db: Db = opsDb
): Promise<BlockedResult> {
  const blocked = await db.company.findMany({
    where: { supplierProfile: { tier: 'blocked' } },
    select: {
      id: true,
      name: true,
      aliases: true,
      domains: true,
      primaryDomain: true,
      phone: true,
    },
  })
  if (!blocked.length) return { blocked: false, matchedOn: [] }
  const name = normaliseCompanyName(p.name)
  const domain = registrableDomain(normaliseDomain(p.domain))
  const phone = phoneDigits(p.phone)
  const hash = p.iban ? ibanHash(p.iban) : null
  const byIban = hash
    ? new Set(
        (
          await db.supplierBankAccount.findMany({
            where: { ibanHash: hash, supplierId: { in: blocked.map((b) => b.id) } },
            select: { supplierId: true },
          })
        ).map((r) => r.supplierId)
      )
    : new Set<string>()
  for (const b of blocked) {
    const on: MatchedOn[] = []
    if (name && [b.name, ...b.aliases].some((n) => normaliseCompanyName(n) === name))
      on.push('name')
    if (domain && (b.primaryDomain === domain || b.domains.includes(domain))) on.push('domain')
    if (phone && phoneDigits(b.phone) === phone) on.push('phone')
    if (byIban.has(b.id)) on.push('iban')
    if (on.length) return { blocked: true, companyId: b.id, companyName: b.name, matchedOn: on }
  }
  return { blocked: false, matchedOn: [] }
}

/** For selectors (S12 RFQ drafts, S13 research, S24 POs): throws a safe sentence when the supplier is blocked. */
export async function assertNotBlocked(
  supplierId: string,
  db: Pick<Prisma.TransactionClient, 'supplierProfile'> = opsDb
) {
  const p = await db.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true, blockReason: true, company: { select: { name: true } } },
  })
  if (p?.tier === 'blocked') {
    const { SafeError } = await import('../../lib/safe-message')
    throw new SafeError(
      `${p.company.name} is blocked${p.blockReason ? ` (${p.blockReason.replace(/_/g, ' ')})` : ''} and cannot be added.`
    )
  }
}
