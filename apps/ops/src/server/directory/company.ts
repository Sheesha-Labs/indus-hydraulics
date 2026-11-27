import 'server-only'
import { normaliseDomain, registrableDomain } from '@indus/ops-core'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'

/**
 * Companies (S10-T01, 06-map-schema §8.4, architecture §4.3). One `company` table carries clients, suppliers and
 * forwarders; the roles decide which profile rows exist (a forwarder is a supplier of type forwarder). No soft
 * delete: archivedAt and mergedIntoId. Every write records its fields in activity through writeTracked.
 */

export type Tx = Prisma.TransactionClient
export type Actor = { kind: $Enums.ActorKind; id?: string | null; actionId?: string | null }

export interface CompanyRoles {
  client?: boolean
  supplier?: boolean
  forwarder?: boolean
}

export interface CreateCompanyInput {
  name: string
  legalName?: string | null
  roles: CompanyRoles
  domains?: string[]
  aliases?: string[]
  country?: string | null
  city?: string | null
  website?: string | null
  industry?: string | null
  phone?: string | null
  notes?: string | null
  source?: $Enums.CompanySource
  supplierType?: $Enums.SupplierType
}

/** Registrable, de-duplicated, lower-case domains; the website's domain joins them. */
export function cleanDomains(domains: readonly (string | null | undefined)[]): string[] {
  const out = new Set<string>()
  for (const d of domains) {
    const r = registrableDomain(normaliseDomain(d))
    if (r) out.add(r)
  }
  return [...out]
}

function cleanAliases(aliases: readonly string[] | undefined, name: string): string[] {
  const seen = new Set<string>([name.trim().toLowerCase()])
  const out: string[] = []
  for (const a of aliases ?? []) {
    const t = a.trim()
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase())
      out.push(t)
    }
  }
  return out
}

/** Create a company with the profile rows for its roles, in the caller's transaction. */
export async function createCompany(
  tx: Tx,
  i: CreateCompanyInput,
  actor: Actor
): Promise<{ id: string }> {
  const name = i.name.trim()
  if (!name) throw new SafeError('Write the company name.')
  if (!i.roles.client && !i.roles.supplier && !i.roles.forwarder)
    throw new SafeError('Choose client, supplier or forwarder.')
  const domains = cleanDomains([...(i.domains ?? []), i.website])
  const isSupplier = !!(i.roles.supplier || i.roles.forwarder)
  const data = {
    name,
    legalName: i.legalName?.trim() || null,
    isClient: !!i.roles.client,
    isSupplier,
    country: i.country?.toUpperCase() || null,
    city: i.city?.trim() || null,
    website: i.website?.trim() || null,
    primaryDomain: domains[0] ?? null,
    domains,
    aliases: cleanAliases(i.aliases, name),
    industry: i.industry?.trim() || null,
    phone: i.phone?.trim() || null,
    notes: i.notes?.trim() || null,
    source: i.source ?? 'manual',
  }
  const created = await tx.company.create({ data, select: { id: true } })
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'company',
      subjectId: created.id,
      changes: [
        { field: 'company', before: null, after: { name, roles: i.roles }, kind: 'contact' },
      ],
      note: 'Company created',
    },
    async (t) => {
      if (i.roles.client) await t.clientProfile.create({ data: { companyId: created.id } })
      if (isSupplier)
        await t.supplierProfile.create({
          data: {
            companyId: created.id,
            type: i.roles.forwarder ? 'forwarder' : (i.supplierType ?? 'unknown'),
          },
        })
    }
  )
  return created
}

const UPDATABLE = [
  'name',
  'legalName',
  'country',
  'city',
  'website',
  'industry',
  'phone',
  'notes',
  'trn',
] as const
export type CompanyPatch = Partial<Record<(typeof UPDATABLE)[number], string | null>>

/** Update facts with a version check on updatedAt (the form sends the value it was shown). */
export async function updateCompany(
  tx: Tx,
  id: string,
  patch: CompanyPatch,
  actor: Actor,
  expectedUpdatedAt?: string
): Promise<void> {
  const before = await tx.company.findUnique({
    where: { id },
    select: { ...Object.fromEntries(UPDATABLE.map((k) => [k, true])), updatedAt: true },
  })
  if (!before) throw new SafeError('That company is no longer here.')
  if (expectedUpdatedAt && (before.updatedAt as Date).toISOString() !== expectedUpdatedAt)
    throw new SafeError('Someone changed this company a moment ago. Reload to see the latest.')
  const data: Record<string, string | null> = {}
  for (const k of UPDATABLE) {
    if (k in patch) {
      const v = patch[k]
      const t = typeof v === 'string' ? v.trim() || null : null
      data[k] = k === 'country' && t ? t.toUpperCase() : t
    }
  }
  if (data.name === null) throw new SafeError('Write the company name.')
  const b = before as unknown as Record<string, unknown>
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'company',
      subjectId: id,
      changes: Object.entries(data).map(([field, after]) => ({
        field,
        before: b[field] ?? null,
        after,
        kind: 'contact' as const,
      })),
    },
    (t) => t.company.update({ where: { id }, data })
  )
}

async function arrays(tx: Tx, id: string) {
  const c = await tx.company.findUnique({
    where: { id },
    select: { domains: true, aliases: true, primaryDomain: true, name: true },
  })
  if (!c) throw new SafeError('That company is no longer here.')
  return c
}

export async function addDomain(tx: Tx, id: string, domain: string, actor: Actor): Promise<void> {
  const d = cleanDomains([domain])[0]
  if (!d) throw new SafeError('That is not a domain, e.g. example.com.')
  const c = await arrays(tx, id)
  if (c.domains.includes(d)) return
  const owner = await tx.company.findFirst({
    where: { id: { not: id }, mergedIntoId: null, archivedAt: null, domains: { has: d } },
    select: { name: true },
  })
  if (owner) throw new SafeError(`${d} already belongs to ${owner.name}. Merge the two instead.`)
  const domains = [...c.domains, d]
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'company',
      subjectId: id,
      changes: [{ field: 'domains', before: c.domains, after: domains, kind: 'contact' }],
    },
    (t) =>
      t.company.update({ where: { id }, data: { domains, primaryDomain: c.primaryDomain ?? d } })
  )
}

export async function removeDomain(
  tx: Tx,
  id: string,
  domain: string,
  actor: Actor
): Promise<void> {
  const c = await arrays(tx, id)
  const domains = c.domains.filter((x) => x !== domain.toLowerCase())
  if (domains.length === c.domains.length) return
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'company',
      subjectId: id,
      changes: [{ field: 'domains', before: c.domains, after: domains, kind: 'contact' }],
    },
    (t) =>
      t.company.update({
        where: { id },
        data: {
          domains,
          primaryDomain:
            c.primaryDomain === domain.toLowerCase() ? (domains[0] ?? null) : c.primaryDomain,
        },
      })
  )
}

export async function addAlias(tx: Tx, id: string, alias: string, actor: Actor): Promise<void> {
  const c = await arrays(tx, id)
  const aliases = cleanAliases([...c.aliases, alias], c.name)
  if (aliases.length === c.aliases.length) return
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'company',
      subjectId: id,
      changes: [{ field: 'aliases', before: c.aliases, after: aliases, kind: 'contact' }],
    },
    (t) => t.company.update({ where: { id }, data: { aliases } })
  )
}

/** Turn roles on (profiles are created) or off (the flag clears; profiles and history stay). */
export async function setRoles(
  tx: Tx,
  id: string,
  roles: CompanyRoles,
  actor: Actor
): Promise<void> {
  const c = await tx.company.findUnique({
    where: { id },
    select: { isClient: true, isSupplier: true, clientProfile: true, supplierProfile: true },
  })
  if (!c) throw new SafeError('That company is no longer here.')
  const isClient = roles.client ?? c.isClient
  const isSupplier = roles.supplier ?? roles.forwarder ?? c.isSupplier
  if (!isClient && !isSupplier) throw new SafeError('A company keeps at least one role.')
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'company',
      subjectId: id,
      changes: [
        { field: 'isClient', before: c.isClient, after: isClient, kind: 'contact' },
        { field: 'isSupplier', before: c.isSupplier, after: isSupplier, kind: 'contact' },
      ],
    },
    async (t) => {
      await t.company.update({ where: { id }, data: { isClient, isSupplier } })
      if (isClient && !c.clientProfile) await t.clientProfile.create({ data: { companyId: id } })
      if (isSupplier && !c.supplierProfile)
        await t.supplierProfile.create({
          data: { companyId: id, type: roles.forwarder ? 'forwarder' : 'unknown' },
        })
    }
  )
}

/** Archive (never delete): the company leaves lists and matching; its history stays. */
export async function archiveCompany(tx: Tx, id: string, actor: Actor): Promise<void> {
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'company',
      subjectId: id,
      changes: [
        { field: 'archivedAt', before: null, after: new Date().toISOString(), kind: 'status' },
      ],
    },
    (t) => t.company.update({ where: { id }, data: { archivedAt: new Date() } })
  )
}

/** Root-client convenience for scripts and tests: one transaction. */
export function createCompanyNow(i: CreateCompanyInput, actor: Actor) {
  return opsDb.$transaction((tx) => createCompany(tx, i, actor))
}
