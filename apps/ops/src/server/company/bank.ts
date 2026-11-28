import 'server-only'
import { randomUUID } from 'node:crypto'
import {
  clientDocumentApprovalGate,
  formatIban,
  ibanValid,
  parseBankBlock,
  type DocKind,
  type GateResult,
  type ParsedBankBlock,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { recordSupplierFile, verifySupplierObject } from '../directory/document-files'
import { parsePdf } from '../intake/parse/pdf'
import { settingSubjectId } from '../settings/subject-id'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * Indus's own bank accounts and the bank block (S11-T07, architecture §9.1 item 1). The block a client document
 * prints is the Owner's real one, read from one of his own Zoho estimates (uploaded to private storage, never
 * the repository), reviewed and confirmed by him. Until a block is confirmed, client documents print "Bank
 * details to follow" and cannot be approved (clientDocumentApprovalGate). Owner only, checked by the actions and
 * again here. Any edit of a confirmed account's printed lines un-confirms it.
 */
const PREFIX = 'company/estimate'
const subjectId = (id: string) => settingSubjectId(`own_bank_account.${id}`)
type Owner = { id: string; role: string }
const mustBeOwner = (u: Owner) => {
  if (u.role !== 'owner') throw new SafeError('Only the Owner changes the bank block.')
}

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(2).max(120),
  accountName: z.string().trim().min(2).max(160),
  currency: z.string().length(3).toUpperCase(),
  iban: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, '').toUpperCase())
    .refine(ibanValid, 'That IBAN does not pass its check digits.'),
  swift: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'A SWIFT code has 8 or 11 characters.')
    .nullable(),
  branch: z.string().trim().max(120).nullable(),
  printLines: z.array(z.string().trim().min(1).max(160)).min(1).max(8),
})
export type BankAccountInput = z.infer<typeof bankAccountSchema>

export interface BankAccountView {
  id: string
  bankName: string
  accountName: string
  currency: string
  ibanShown: string
  swift: string | null
  branch: string | null
  printLines: string[]
  source: string | null
  confirmedAt: Date | null
  confirmedByName: string | null
  isDefaultForCcy: boolean
  showOnDocuments: boolean
}

export async function listOwnBankAccounts(): Promise<BankAccountView[]> {
  const rows = await opsDb.ownBankAccount.findMany({
    where: { archivedAt: null },
    orderBy: [{ currency: 'asc' }, { isDefaultForCcy: 'desc' }, { bankName: 'asc' }],
  })
  const ids = [...new Set(rows.map((r) => r.confirmedById).filter((x): x is string => !!x))]
  const users = ids.length
    ? await opsDb.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
    : []
  return rows.map((r) => ({
    id: r.id,
    bankName: r.bankName,
    accountName: r.accountName,
    currency: r.currency,
    ibanShown: formatIban(r.iban),
    swift: r.swift,
    branch: r.branch,
    printLines: r.printLines,
    source: r.source,
    confirmedAt: r.confirmedAt,
    confirmedByName: users.find((u) => u.id === r.confirmedById)?.name ?? null,
    isDefaultForCcy: r.isDefaultForCcy,
    showOnDocuments: r.showOnDocuments,
  }))
}

export async function createEstimateUpload(f: { name: string; size: number }) {
  if (!/\.pdf$/i.test(f.name.trim())) throw new SafeError('Use the estimate as a PDF.')
  if (!Number.isInteger(f.size) || f.size <= 0) throw new SafeError('That file is empty.')
  if (f.size > 20 * 1024 * 1024) throw new SafeError('That file is over 20 MB.')
  const key = `${PREFIX}/${randomUUID()}.pdf`
  const { url } = await getStorage().createSignedUploadUrl(OPS_BUCKETS.uploads, key)
  return { key, uploadUrl: url }
}

/**
 * Read the bank block from an uploaded estimate: verify and record the file, extract its text, run the
 * deterministic parser. Returns the fields for the Owner to review; nothing is saved to an account yet.
 */
export async function parseZohoEstimateBankBlock(
  upload: { key: string; filename: string },
  user: Owner
): Promise<{ fileId: string; block: ParsedBankBlock }> {
  mustBeOwner(user)
  const v = await verifySupplierObject(PREFIX, upload.key, upload.filename)
  if (v.mime !== 'application/pdf') throw new SafeError('Use the estimate as a PDF.')
  const stream = await getStorage().openRead(OPS_BUCKETS.uploads, upload.key)
  if (!stream) throw new SafeError('The upload did not arrive. Try again.')
  const parsed = await parsePdf(new Uint8Array(await new Response(stream).arrayBuffer()))
  if (parsed.kind !== 'pdf' || !parsed.hasTextLayer)
    throw new SafeError('That PDF has no text to read. Use the estimate as Zoho saved it.')
  const block = parseBankBlock(parsed.pages.map((p) => p.text).join('\n'))
  if (!block) throw new SafeError('No bank block was found in that estimate.')
  const fileId = await opsDb.$transaction((tx) =>
    recordSupplierFile(tx, v, upload.filename, 'upload', user.id)
  )
  return { fileId, block }
}

/**
 * Create or update an account with the reviewed block. A change to a confirmed account's printed lines or IBAN
 * takes its confirmation away: the Owner confirms again.
 */
export async function saveOwnBankAccount(
  tx: Prisma.TransactionClient,
  input: BankAccountInput & { id?: string | null; sourceFileId?: string | null },
  user: Owner
): Promise<{ id: string; unconfirmed: boolean }> {
  mustBeOwner(user)
  const before = input.id
    ? await tx.ownBankAccount.findFirst({ where: { id: input.id, archivedAt: null } })
    : null
  if (input.id && !before) throw new SafeError('That account is no longer here.')
  const changed =
    !!before &&
    (before.iban !== input.iban ||
      before.printLines.join('\n') !== input.printLines.join('\n') ||
      before.currency !== input.currency)
  const data = {
    bankName: input.bankName,
    accountName: input.accountName,
    currency: input.currency,
    iban: input.iban,
    swift: input.swift,
    branch: input.branch,
    printLines: input.printLines,
    ...(input.sourceFileId
      ? { source: 'zoho_estimate', sourceFileId: input.sourceFileId }
      : before
        ? {}
        : { source: 'manual' }),
    ...(changed
      ? { confirmedAt: null, confirmedById: null, signoffStatus: 'awaiting' as const }
      : {}),
  }
  const id = before?.id ?? randomUUID()
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'settings',
      subjectId: subjectId(id),
      // Never the IBAN itself in the history: the last four only.
      changes: [
        {
          field: 'own_bank_account',
          before: before
            ? { bankName: before.bankName, currency: before.currency, iban: `…${before.iban.slice(-4)}` }
            : null,
          after: { bankName: input.bankName, currency: input.currency, iban: `…${input.iban.slice(-4)}` },
          kind: 'money',
          sensitive: true,
        },
      ],
    },
    (t) =>
      before
        ? t.ownBankAccount.update({ where: { id }, data })
        : t.ownBankAccount.create({ data: { id, ...data, showOnDocuments: true } })
  )
  return { id, unconfirmed: changed && !!before?.confirmedAt }
}

/**
 * "Confirm bank block": the Owner confirms the printed lines; the account is shown on documents and becomes
 * the default for its currency.
 */
export async function confirmBankBlock(
  tx: Prisma.TransactionClient,
  accountId: string,
  user: Owner
): Promise<void> {
  mustBeOwner(user)
  const a = await tx.ownBankAccount.findFirst({ where: { id: accountId, archivedAt: null } })
  if (!a) throw new SafeError('That account is no longer here.')
  if (!a.printLines.length) throw new SafeError('Review the printed lines first.')
  if (!ibanValid(a.iban)) throw new SafeError('That IBAN does not pass its check digits.')
  const now = new Date()
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'settings',
      subjectId: subjectId(a.id),
      changes: [
        {
          field: 'own_bank_account.confirmed',
          before: a.confirmedAt ? 'confirmed' : 'unconfirmed',
          after: 'confirmed',
          kind: 'money',
          sensitive: true,
        },
      ],
    },
    async (t) => {
      await t.ownBankAccount.updateMany({
        where: { currency: a.currency, isDefaultForCcy: true, NOT: { id: a.id } },
        data: { isDefaultForCcy: false },
      })
      await t.ownBankAccount.update({
        where: { id: a.id },
        data: {
          confirmedAt: now,
          confirmedById: user.id,
          signoffStatus: 'signed_off',
          showOnDocuments: true,
          isDefaultForCcy: true,
          source: a.source ?? 'manual',
        },
      })
    }
  )
}

export async function archiveOwnBankAccount(
  tx: Prisma.TransactionClient,
  accountId: string,
  user: Owner
): Promise<void> {
  mustBeOwner(user)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'settings',
      subjectId: subjectId(accountId),
      changes: [{ field: 'own_bank_account.archived', before: false, after: true, kind: 'money' }],
    },
    (t) =>
      t.ownBankAccount.update({
        where: { id: accountId },
        data: { archivedAt: new Date(), isDefaultForCcy: false },
      })
  )
}

/** The gate for a client document's approval (S17, S24, S26 call this before they approve). */
export async function bankGateFor(kind: DocKind, currency: string | null): Promise<GateResult> {
  const accounts = await opsDb.ownBankAccount.findMany({
    where: { archivedAt: null },
    select: { currency: true, confirmedAt: true, showOnDocuments: true, archivedAt: true },
  })
  return clientDocumentApprovalGate({ kind, currency, ownBankAccounts: accounts })
}

/** For Settings home (212, S34): how many documents expire soon or have expired, and the bank block state. */
export async function getCompanyDocumentsStatus(): Promise<{
  expiringSoon: number
  expired: number
  bankBlockConfirmed: boolean
}> {
  const now = new Date()
  const soon = new Date(now.getTime() + 30 * 86_400_000)
  const [expiringSoon, expired, confirmed] = await opsDb.$transaction([
    opsDb.complianceDocument.count({
      where: { companyId: null, archivedAt: null, expiresAt: { gte: now, lte: soon } },
    }),
    opsDb.complianceDocument.count({
      where: { companyId: null, archivedAt: null, expiresAt: { lt: now } },
    }),
    opsDb.ownBankAccount.count({ where: { archivedAt: null, confirmedAt: { not: null } } }),
  ])
  return { expiringSoon, expired, bankBlockConfirmed: confirmed > 0 }
}
