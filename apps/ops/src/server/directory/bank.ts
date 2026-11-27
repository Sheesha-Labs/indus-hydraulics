import 'server-only'
import {
  callbackRefusal,
  findIbans,
  ibanLast4,
  isValidIban,
  maskedIban,
  normaliseIban,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import { AccessError, type OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { getSettingIn } from '../settings/get'
import { ibanHash, sealIban } from './iban-seal'

/**
 * Supplier bank details (S10-T05/T07; architecture §4.11, C21). An IBAN is validated (mod-97), sealed with the S04 key
 * ring (AAD supplier_iban:<supplierId>), hashed for the blocked match, and only its last 4 kept in clear. A new
 * account is pending until the Owner records a genuine call-back to a number from the registry or a verified record
 * (never one from the email); then it is verified and payments stay blocked for the cooling-off (24 h). The
 * previous verified account in that currency is superseded. A not-genuine call-back rejects it.
 */
type Tx = Prisma.TransactionClient

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(1, 'Write the bank name.').max(160),
  accountName: z.string().trim().min(1, 'Write the account name.').max(200),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Use a three-letter currency code.')
    .optional(),
  iban: z.string().trim().min(15).max(42),
  swift: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/, 'A SWIFT code has 8 or 11 characters.')
    .optional(),
  nameMatchesRegistry: z.boolean().optional(),
  letterMatchesIban: z.boolean().optional(),
})
export type BankAccountInput = z.infer<typeof bankAccountSchema>

export async function addSupplierBankAccount(
  tx: Tx,
  supplierId: string,
  i: BankAccountInput,
  actor: { kind: 'user' | 'assistant'; id?: string | null; actionId?: string | null },
  extra: { requestedViaMessageId?: string | null; riskFlags?: Prisma.InputJsonValue } = {}
): Promise<{ id: string; last4: string }> {
  if (!isValidIban(i.iban))
    throw new SafeError('That IBAN does not check out. Copy it again from the bank letter.')
  const iban = normaliseIban(i.iban)
  const row = await tx.supplierBankAccount.create({
    data: {
      supplierId,
      bankName: i.bankName,
      accountName: i.accountName,
      currency: i.currency ?? null,
      ibanEnc: sealIban(iban, supplierId),
      ibanLast4: ibanLast4(iban),
      ibanHash: ibanHash(iban),
      swift: i.swift?.toUpperCase() ?? null,
      status: 'pending_verification',
      nameMatchesRegistry: i.nameMatchesRegistry ?? null,
      letterMatchesIban: i.letterMatchesIban ?? null,
      requestedViaMessageId: extra.requestedViaMessageId ?? null,
      requestedAt: new Date(),
      ...(extra.riskFlags ? { riskFlags: extra.riskFlags } : {}),
    },
    select: { id: true, ibanLast4: true },
  })
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'company',
      subjectId: supplierId,
      // Never the IBAN: the bank, the last 4 and the state only.
      changes: [
        {
          field: 'bankAccount',
          before: null,
          after: { bank: i.bankName, last4: row.ibanLast4, status: 'pending_verification' },
          kind: 'money',
          sensitive: true,
        },
      ],
      note: 'Bank details recorded: payments blocked until a call-back',
    },
    async () => undefined
  )
  return { id: row.id, last4: row.ibanLast4 }
}

export const callbackSchema = z.object({
  accountId: z.uuid(),
  numberSource: z.enum(['registry', 'verified_record', 'other']),
  numberDialled: z.string().trim().min(3).max(40),
  spokeTo: z.string().trim().min(1, 'Who did you speak to?').max(120),
  spokeToRole: z.string().trim().max(80).optional(),
  calledAt: z.iso.datetime({ offset: true }).optional(),
  outcome: z.enum(['genuine', 'not_genuine']),
})
export type CallbackInput = z.infer<typeof callbackSchema>

/** Owner only (checked here as well as in the action). */
export async function recordBankCallback(
  tx: Tx,
  i: CallbackInput,
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<{ status: 'verified' | 'rejected'; coolingOffUntil: string | null }> {
  if (user.role !== 'owner') throw new AccessError('forbidden')
  const acc = await tx.supplierBankAccount.findUnique({
    where: { id: i.accountId },
    select: {
      id: true,
      supplierId: true,
      status: true,
      currency: true,
      requestedViaMessageId: true,
      supersededAt: true,
      supplier: { select: { phone: true, supplierProfile: { select: { registryPhone: true } } } },
    },
  })
  if (!acc || acc.supersededAt) throw new SafeError('That bank account is no longer here.')
  if (acc.status !== 'pending_verification')
    throw new SafeError('This bank account has already been decided.')
  const numbersInEmail = acc.requestedViaMessageId
    ? await phonesInMessage(tx, acc.requestedViaMessageId)
    : []
  const refused = callbackRefusal({
    numberSource: i.numberSource,
    numberDialled: i.numberDialled,
    numbersInEmail,
    registryPhone: acc.supplier.supplierProfile?.registryPhone ?? acc.supplier.phone ?? null,
  })
  if (refused) throw new SafeError(refused)
  const { coolingOffHours } = await getSettingIn(tx, 'suppliers.trust')
  const calledAt = i.calledAt ? new Date(i.calledAt) : now
  const genuine = i.outcome === 'genuine'
  const coolingOffUntil = genuine ? new Date(now.getTime() + coolingOffHours * 3_600_000) : null
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: acc.supplierId,
      changes: [
        {
          field: 'bankAccount.status',
          before: 'pending_verification',
          after: genuine ? 'verified' : 'rejected',
          kind: 'money',
          sensitive: true,
        },
      ],
      note: genuine
        ? `Call-back genuine (${i.numberSource === 'registry' ? 'registry number' : 'verified record'}); payments blocked until ${coolingOffUntil!.toISOString()}`
        : 'Call-back: the change was not genuine',
    },
    async (t) => {
      if (genuine)
        await t.supplierBankAccount.updateMany({
          where: {
            supplierId: acc.supplierId,
            status: 'verified',
            supersededAt: null,
            id: { not: acc.id },
            ...(acc.currency ? { currency: acc.currency } : {}),
          },
          data: { status: 'superseded', supersededAt: now },
        })
      await t.supplierBankAccount.update({
        where: { id: acc.id },
        data: {
          status: genuine ? 'verified' : 'rejected',
          callbackNumber: i.numberDialled,
          callbackNumberSource: i.numberSource,
          callbackSpokeTo: i.spokeTo,
          callbackSpokeToRole: i.spokeToRole ?? null,
          callbackAt: calledAt,
          callbackRecordedById: user.id,
          callbackGenuine: genuine,
          callbackOutcome: i.outcome,
          verifiedAt: genuine ? now : null,
          coolingOffUntil,
        },
      })
    }
  )
  return {
    status: genuine ? 'verified' : 'rejected',
    coolingOffUntil: coolingOffUntil?.toISOString() ?? null,
  }
}

/** Phone numbers written in the message that asked for the change (never to be dialled). */
export async function phonesInMessage(
  db: Pick<Tx, 'mailMessage'>,
  messageId: string
): Promise<string[]> {
  const m = await db.mailMessage.findUnique({
    where: { id: messageId },
    select: { bodyText: true },
  })
  return [...(m?.bodyText ?? '').matchAll(/(?:\+|00)?\d[\d\s().-]{6,}\d/g)].map((x) => x[0])
}

/** Board 51/132 bank card data: never the IBAN; the last 4, the bank, the state and the call-back record. */
export async function bankSummary(
  supplierId: string,
  db: Pick<Tx, 'supplierBankAccount' | 'user'> = opsDb
) {
  const rows = await db.supplierBankAccount.findMany({
    where: { supplierId, supersededAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      bankName: true,
      accountName: true,
      currency: true,
      ibanLast4: true,
      swift: true,
      status: true,
      nameMatchesRegistry: true,
      letterMatchesIban: true,
      callbackAt: true,
      callbackSpokeTo: true,
      callbackSpokeToRole: true,
      callbackNumber: true,
      callbackNumberSource: true,
      callbackRecordedById: true,
      coolingOffUntil: true,
      requestedViaMessageId: true,
    },
  })
  const recorders = await db.user.findMany({
    where: {
      id: { in: rows.flatMap((r) => (r.callbackRecordedById ? [r.callbackRecordedById] : [])) },
    },
    select: { id: true, name: true },
  })
  return rows.map((r) => ({
    ...r,
    recordedBy: recorders.find((u) => u.id === r.callbackRecordedById)?.name ?? null,
  }))
}

/** A text with every valid IBAN in it replaced by its masked form ("•••• 3456"), for showing an email. */
export function maskIbans(text: string): string {
  let out = text
  for (const iban of findIbans(text)) {
    const spaced = new RegExp(iban.split('').join('[ -]?'), 'gi')
    out = out.replace(spaced, maskedIban(iban.slice(-4)))
  }
  return out
}
