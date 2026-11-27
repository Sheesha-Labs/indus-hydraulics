import 'server-only'
import {
  decideCompanyMatch,
  domainOf,
  isFreeMail,
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
