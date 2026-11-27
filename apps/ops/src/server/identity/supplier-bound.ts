import 'server-only'
import { buildSupplierDenyList, scanText, type DenyTerm, type ScanHit } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'

/**
 * The identifier check for supplier-bound mail sent outside an enquiry (S10: the document request, its reminders,
 * the bank-change warning; ADR-13, CLAUDE.md §10). The deterministic half only (S12 adds the model half and the gate
 * hook): no client's name, alias, domain or contact address may appear in the text. A hit refuses the approval; a
 * pass is stored on the outbound row, which the send gate reads (step 10) until S12's hook replaces it.
 */
type Db = Pick<Prisma.TransactionClient, 'company'>

export async function clientDenyList(db: Db = opsDb): Promise<DenyTerm[]> {
  const clients = await db.company.findMany({
    where: { isClient: true, mergedIntoId: null },
    select: {
      name: true,
      aliases: true,
      domains: true,
      contacts: { where: { email: { not: null } }, select: { email: true } },
    },
  })
  return buildSupplierDenyList(
    clients.map((c) => ({
      name: c.name,
      aliases: c.aliases,
      domains: c.domains,
      emails: c.contacts.map((k) => k.email!),
    }))
  ).map((t) => ({ term: t.term, kind: t.kind.replace('supplier', 'client') }))
}

export interface SupplierBoundCheck {
  passed: boolean
  method: 'deterministic'
  hits: ScanHit[]
  at: string
}

/** Scan a supplier-bound email; `exempt` terms are the recipient's own (a supplier that is also a client). */
export async function checkSupplierBound(
  text: string,
  opts: { exempt?: readonly string[] } = {},
  db: Db = opsDb
): Promise<SupplierBoundCheck> {
  const exempt = new Set((opts.exempt ?? []).map((e) => e.toLowerCase()))
  const deny = (await clientDenyList(db)).filter((t) => !exempt.has(t.term))
  const hits = scanText(text, deny)
  return { passed: hits.length === 0, method: 'deterministic', hits, at: new Date().toISOString() }
}

/** The person-facing reason for a failed check, or null. */
export function supplierBoundReason(c: SupplierBoundCheck): string | null {
  if (c.passed) return null
  const first = c.hits[0]!
  return `This email to a supplier contains a ${first.kind} (“${first.term}”). Client details never go to a supplier.`
}
