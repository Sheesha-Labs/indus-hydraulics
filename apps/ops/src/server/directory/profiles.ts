import 'server-only'
import { z } from 'zod'
import { opsDb } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access-core'
import { AccessError } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import type { Tx } from './company'

/**
 * Client and supplier profiles (S10-T01, T02): one Zod schema per field group, so each form section saves on its own
 * with a version check. Owner-only fields are refused server-side whatever the form sent: a client's credit hold, a
 * supplier's registry switchboard (the number a bank call-back dials). Supplier tiers change only through the trust
 * actions (approval.ts, block.ts, promote_supplier); bank details only through bank.ts.
 */

const ccy = z.string().regex(/^[A-Z]{3}$/, 'Use a three-letter currency code, e.g. USD.')
const text = (max: number) => z.string().trim().max(max).nullable().optional()
const uuid = z.string().uuid().nullable().optional()

export const CLIENT_GROUPS = {
  commercial: z.strictObject({
    vendorCode: text(60),
    quotingCurrency: ccy,
    paymentTermsText: text(200),
    vatTreatmentDefault: z
      .enum(['export_zero_rated', 'local_standard', 'mixed'])
      .nullable()
      .optional(),
    termsPresetId: uuid,
  }),
  followUp: z.strictObject({
    followUpCadenceId: uuid,
    partialFollowUp: z.enum(['supplementary', 'revision', 'ask_each_time']),
  }),
  acknowledgement: z.strictObject({ acknowledgeEnquiries: z.boolean() }),
  credit: z
    .strictObject({ creditHold: z.boolean(), creditHoldReason: text(300) })
    .refine((v) => !v.creditHold || !!v.creditHoldReason, {
      message: 'Say why the client is on credit hold.',
      path: ['creditHoldReason'],
    }),
} as const
export type ClientGroup = keyof typeof CLIENT_GROUPS
const CLIENT_OWNER_ONLY: ReadonlySet<ClientGroup> = new Set(['credit'])

export const SUPPLIER_GROUPS = {
  facts: z.strictObject({
    type: z.enum([
      'manufacturer',
      'principal',
      'oem',
      'distributor',
      'stockist',
      'trader',
      'local_shop',
      'forwarder',
      'marketplace',
      'unknown',
    ]),
    regions: z.array(z.string().trim().min(1).max(40)).max(20),
    timezone: text(60),
    quotesCurrency: ccy.nullable().optional(),
    registryNo: text(80),
    taxId: text(80),
    foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
    staffCount: z.number().int().min(0).max(10_000_000).nullable().optional(),
    introducedBy: text(120),
    address: text(400),
  }),
  registry: z.strictObject({ registryPhone: text(40) }),
} as const
export type SupplierGroup = keyof typeof SUPPLIER_GROUPS
const SUPPLIER_OWNER_ONLY: ReadonlySet<SupplierGroup> = new Set(['registry'])

type Who = Pick<OpsUser, 'id' | 'role'>

export async function updateClientProfile<G extends ClientGroup>(
  tx: Tx,
  companyId: string,
  group: G,
  raw: unknown,
  user: Who,
  expectedUpdatedAt?: string
): Promise<void> {
  if (CLIENT_OWNER_ONLY.has(group) && user.role !== 'owner') throw new AccessError('forbidden')
  const parsed = CLIENT_GROUPS[group].safeParse(raw)
  if (!parsed.success) throw new SafeError(parsed.error.issues[0]?.message ?? 'Check the values.')
  const v = parsed.data as Record<string, unknown>
  const before = await tx.clientProfile.findUnique({ where: { companyId } })
  if (!before) throw new SafeError('That client is no longer here.')
  if (expectedUpdatedAt && before.updatedAt.toISOString() !== expectedUpdatedAt)
    throw new SafeError('Someone changed this client a moment ago. Reload to see the latest.')
  const data: Record<string, unknown> = { ...v }
  if (group === 'credit') {
    data.creditHoldSince = v.creditHold
      ? before.creditHold
        ? before.creditHoldSince
        : new Date()
      : null
    if (!v.creditHold) data.creditHoldReason = null
  }
  const b = before as unknown as Record<string, unknown>
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: companyId,
      changes: Object.keys(v).map((field) => ({
        field: `client.${field}`,
        before: b[field] ?? null,
        after: data[field] ?? null,
        kind: group === 'credit' ? ('money' as const) : ('terms' as const),
      })),
    },
    (t) => t.clientProfile.update({ where: { companyId }, data })
  )
}

export async function updateSupplierProfile<G extends SupplierGroup>(
  tx: Tx,
  companyId: string,
  group: G,
  raw: unknown,
  user: Who,
  expectedVersion?: number
): Promise<void> {
  if (SUPPLIER_OWNER_ONLY.has(group) && user.role !== 'owner') throw new AccessError('forbidden')
  const parsed = SUPPLIER_GROUPS[group].safeParse(raw)
  if (!parsed.success) throw new SafeError(parsed.error.issues[0]?.message ?? 'Check the values.')
  const v = parsed.data as Record<string, unknown>
  const before = await tx.supplierProfile.findUnique({ where: { companyId } })
  if (!before) throw new SafeError('That supplier is no longer here.')
  if (expectedVersion !== undefined && before.version !== expectedVersion)
    throw new SafeError('Someone changed this supplier a moment ago. Reload to see the latest.')
  const b = before as unknown as Record<string, unknown>
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: companyId,
      changes: Object.keys(v).map((field) => ({
        field: `supplier.${field}`,
        before: b[field] ?? null,
        after: v[field] ?? null,
        kind: 'supplier' as const,
      })),
    },
    async (t) => {
      const { count } = await t.supplierProfile.updateMany({
        where: { companyId, version: before.version },
        data: { ...v, version: { increment: 1 } },
      })
      if (count === 0)
        throw new SafeError('Someone changed this supplier a moment ago. Reload to see the latest.')
    }
  )
}

/** The client profile with its company facts (one query); the page adds lists and stats (data/clients.ts). */
export function getClientProfile(companyId: string) {
  return opsDb.clientProfile.findUnique({
    where: { companyId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          legalName: true,
          city: true,
          country: true,
          industry: true,
          website: true,
          domains: true,
          aliases: true,
          mergedIntoId: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      termsPreset: { select: { id: true, name: true } },
      followUpCadence: { select: { id: true, name: true } },
    },
  })
}

/** The supplier profile with company facts (one query). No bank field: bank.ts owns those. */
export function getSupplierProfile(companyId: string) {
  return opsDb.supplierProfile.findUnique({
    where: { companyId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          legalName: true,
          city: true,
          country: true,
          website: true,
          phone: true,
          primaryDomain: true,
          domains: true,
          aliases: true,
          mergedIntoId: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })
}
