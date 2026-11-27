import 'server-only'
import {
  decideCompanyMatch,
  domainOf,
  isFreeMail,
  isFreeMailDomain,
  normaliseCompanyName,
  registrableDomain,
  LETTERHEAD_MIN,
  type CompanyMatch,
  type MatchEvidence,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { getSetting } from '../settings/get'

/**
 * Who sent this enquiry (S09-T04, board 16): three lookups, one query each, then the pure decision in ops-core
 * (several candidates is Unsure). A public webmail domain never identifies a company. Minimal now; Directory
 * (S10-T01) extends it with merged companies and look-alike names.
 */

type Db = Pick<Prisma.TransactionClient, 'contact' | 'company' | '$queryRaw'>

export interface MatchCompanyInput {
  letterheadName?: string | null
  senderEmail?: string | null
}

export async function matchCompany(i: MatchCompanyInput, db: Db = opsDb): Promise<CompanyMatch> {
  const { domains: freeMail } = await getSetting('qualify.free_mail_domains')
  const evidence: MatchEvidence[] = []
  const email = i.senderEmail?.trim().toLowerCase() || null

  if (email) {
    const contacts = await db.contact.findMany({
      where: {
        email: { equals: email, mode: 'insensitive' },
        archivedAt: null,
        company: { archivedAt: null, mergedIntoId: null },
      },
      select: { id: true, company: { select: { id: true, name: true } } },
      take: 5,
    })
    for (const c of contacts)
      evidence.push({
        companyId: c.company.id,
        companyName: c.company.name,
        basis: 'contact_email',
        contactId: c.id,
        score: 1,
      })
  }

  const domain = email ? domainOf(email) : null
  if (domain && !isFreeMail(email, freeMail)) {
    const companies = await db.company.findMany({
      where: {
        archivedAt: null,
        mergedIntoId: null,
        OR: [{ primaryDomain: domain }, { domains: { has: domain } }],
      },
      select: { id: true, name: true },
      take: 5,
    })
    for (const c of companies)
      evidence.push({ companyId: c.id, companyName: c.name, basis: 'sender_domain', score: 1 })
  }

  const name = i.letterheadName?.trim()
  if (name) {
    const rows = await db.$queryRaw<Array<{ id: string; name: string; score: number }>>(Prisma.sql`
      SELECT c.id, c.name,
             greatest(ops.trgm_similarity(lower(c.name), lower(${name})),
                      coalesce((SELECT max(ops.trgm_similarity(lower(a), lower(${name}))) FROM unnest(c.aliases) a), 0)
             )::float8 AS score
        FROM ops.company c
       WHERE c."archivedAt" IS NULL AND c."mergedIntoId" IS NULL
         AND greatest(ops.trgm_similarity(lower(c.name), lower(${name})),
                      coalesce((SELECT max(ops.trgm_similarity(lower(a), lower(${name}))) FROM unnest(c.aliases) a), 0)
             ) >= ${LETTERHEAD_MIN}
       ORDER BY score DESC, c.name
       LIMIT 4`)
    for (const r of rows)
      evidence.push({
        companyId: r.id,
        companyName: r.name,
        basis: 'letterhead',
        score: Number(r.score),
      })
  }

  return decideCompanyMatch(evidence)
}

// ── S10-T01: the one directory matcher for intake, mail linking and research ───────────────────────────────────

type DirDb = Pick<Prisma.TransactionClient, 'company' | 'contact' | '$queryRaw'>

export interface DirectoryMatch {
  companyId: string
  name: string
  isClient: boolean
  isSupplier: boolean
  blocked: boolean
  basis: 'contact_email' | 'sender_domain' | 'name'
}

/** Follow mergedIntoId to the surviving company (a chain is followed to its end, at most 10 hops). */
export async function resolveSurvivor(
  id: string,
  db: Pick<DirDb, 'company'> = opsDb
): Promise<string> {
  let current = id
  for (let hop = 0; hop < 10; hop++) {
    const c = await db.company.findUnique({
      where: { id: current },
      select: { mergedIntoId: true },
    })
    if (!c?.mergedIntoId) return current
    current = c.mergedIntoId
  }
  return current
}

async function describe(db: DirDb, ids: string[], basis: DirectoryMatch['basis']) {
  const survivors = [...new Set(await Promise.all(ids.map((id) => resolveSurvivor(id, db))))]
  if (survivors.length !== 1) return { survivors }
  const c = await db.company.findFirst({
    where: { id: survivors[0]!, archivedAt: null },
    select: {
      id: true,
      name: true,
      isClient: true,
      isSupplier: true,
      supplierProfile: { select: { tier: true } },
    },
  })
  if (!c) return { survivors: [] }
  return {
    survivors,
    match: {
      companyId: c.id,
      name: c.name,
      isClient: c.isClient,
      isSupplier: c.isSupplier,
      blocked: c.supplierProfile?.tier === 'blocked',
      basis,
    } satisfies DirectoryMatch,
  }
}

/**
 * The company an address belongs to: its contact first, else its registrable domain (never a public webmail
 * domain). Merged companies resolve to the survivor. A unique match or nothing: two companies for one domain is
 * ambiguous, and the caller treats it as Unsure (`ambiguous: true`).
 */
export async function matchCompanyBySender(
  email: string | null | undefined,
  db: DirDb = opsDb
): Promise<{ match: DirectoryMatch | null; ambiguous: boolean }> {
  const address = email?.trim().toLowerCase()
  if (!address || !address.includes('@')) return { match: null, ambiguous: false }
  const contacts = await db.contact.findMany({
    where: { email: { equals: address, mode: 'insensitive' }, archivedAt: null },
    select: { companyId: true },
    take: 5,
  })
  if (contacts.length) {
    const r = await describe(db, [...new Set(contacts.map((c) => c.companyId))], 'contact_email')
    if (r.match) return { match: r.match, ambiguous: false }
    if (r.survivors.length > 1) return { match: null, ambiguous: true }
  }
  const { domains: freeMail } = await getSetting('qualify.free_mail_domains')
  const domain = registrableDomain(domainOf(address))
  if (!domain || isFreeMailDomain(domain, freeMail)) return { match: null, ambiguous: false }
  const companies = await db.company.findMany({
    where: { archivedAt: null, OR: [{ primaryDomain: domain }, { domains: { has: domain } }] },
    select: { id: true },
    take: 5,
  })
  if (!companies.length) return { match: null, ambiguous: false }
  const r = await describe(
    db,
    companies.map((c) => c.id),
    'sender_domain'
  )
  return r.match
    ? { match: r.match, ambiguous: false }
    : { match: null, ambiguous: r.survivors.length > 1 }
}

/** The company with this name after normalisation (name or an alias); unique or nothing. */
export async function matchCompanyByName(
  name: string | null | undefined,
  db: DirDb = opsDb
): Promise<{ match: DirectoryMatch | null; ambiguous: boolean }> {
  const norm = normaliseCompanyName(name)
  if (!norm) return { match: null, ambiguous: false }
  const first = norm.split(' ')[0]!
  const candidates = await db.company.findMany({
    where: {
      archivedAt: null,
      OR: [{ name: { contains: first, mode: 'insensitive' } }, { aliases: { isEmpty: false } }],
    },
    select: { id: true, name: true, aliases: true },
    take: 200,
  })
  const ids = candidates
    .filter((c) => [c.name, ...c.aliases].some((n) => normaliseCompanyName(n) === norm))
    .map((c) => c.id)
  if (!ids.length) return { match: null, ambiguous: false }
  const r = await describe(db, ids, 'name')
  return r.match
    ? { match: r.match, ambiguous: false }
    : { match: null, ambiguous: r.survivors.length > 1 }
}
