import 'server-only'
import { randomUUID } from 'node:crypto'
import { opsDb, type Prisma } from '@indus/ops-db'
import { COMPANY_DOC_KINDS, USED_IN } from '../../lib/company-docs'
import { z } from 'zod'
export { COMPANY_DOC_KINDS, COMPANY_DOC_LABEL, USED_IN } from '../../lib/company-docs'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { recordSupplierFile, verifySupplierObject } from '../directory/document-files'
import { getSettingEntry } from '../settings/get'
import { settingSubjectId } from '../settings/subject-id'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * Indus's own documents (S11-T07, board 213): trade licence, VAT certificate, ISO certificates, bank letter,
 * company profile, past performance letters. They are compliance_document rows with no company (companyId
 * NULL); the nightly reminders (S10-T08, C18) already notify at 60, 30 and 7 days and link here. Files go to the
 * private uploads bucket under `company/docs/` (decision: the supplier-document upload checks are reused; the
 * bucket is as private as ops-company). Replacing a document archives the old row and notes the link.
 */
const PREFIX = 'company/docs'
const subjectId = (id: string) => settingSubjectId(`company_document.${id}`)

export const companyDocSchema = z.object({
  kind: z.enum(COMPANY_DOC_KINDS),
  title: z.string().trim().min(1).max(120),
  number: z.string().trim().max(80).nullable(),
  issuer: z.string().trim().max(120).nullable(),
  expiresAt: z.iso.date().nullable(),
  usedIn: z.array(z.enum(USED_IN)).max(USED_IN.length),
})
export type CompanyDocInput = z.infer<typeof companyDocSchema>

export async function createCompanyDocUpload(f: { name: string; size: number }) {
  const ext = /\.(pdf|png|jpe?g)$/i.exec(f.name.trim())?.[1]?.toLowerCase()
  if (!ext) throw new SafeError('Use a PDF, PNG or JPEG file.')
  if (!Number.isInteger(f.size) || f.size <= 0) throw new SafeError('That file is empty.')
  if (f.size > 20 * 1024 * 1024) throw new SafeError('That file is over 20 MB.')
  const key = `${PREFIX}/${randomUUID()}.${ext}`
  const { url } = await getStorage().createSignedUploadUrl(OPS_BUCKETS.uploads, key)
  return { key, uploadUrl: url }
}

const dateOf = (s: string | null) => (s ? new Date(`${s}T00:00:00Z`) : null)

/**
 * Add an Indus document, or replace one (`replaces`): the old row is archived and the new one notes which it
 * replaced, so the history stays. The upload is verified before the transaction (no connection held while it
 * reads the object).
 */
export async function saveCompanyDocument(
  input: CompanyDocInput & {
    upload: { key: string; filename: string } | null
    replaces?: string | null
  },
  user: { id: string }
): Promise<{ id: string }> {
  const verified = input.upload
    ? await verifySupplierObject(PREFIX, input.upload.key, input.upload.filename)
    : null
  return opsDb.$transaction(async (tx) => {
    const old = input.replaces
      ? await tx.complianceDocument.findFirst({
          where: { id: input.replaces, companyId: null, archivedAt: null },
          select: { id: true, title: true, fileId: true },
        })
      : null
    if (input.replaces && !old) throw new SafeError('That document is no longer here.')
    const fileId = verified
      ? await recordSupplierFile(tx, verified, input.upload!.filename, 'upload', user.id)
      : (old?.fileId ?? null)
    const created = await tx.complianceDocument.create({
      data: {
        companyId: null,
        kind: input.kind,
        title: input.title,
        number: input.number,
        issuer: input.issuer,
        expiresAt: dateOf(input.expiresAt),
        usedIn: input.usedIn,
        fileId,
        status: 'received',
        remindersSentDays: [],
        ...(old ? { note: `Replaces ${old.title} (${old.id})` } : {}),
      },
      select: { id: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: user.id },
        subjectType: 'settings',
        subjectId: subjectId(created.id),
        changes: [
          {
            field: 'company_document',
            before: old ? { replaces: old.id } : null,
            after: { kind: input.kind, title: input.title, expiresAt: input.expiresAt },
            kind: 'documents',
          },
        ],
      },
      async (t) => {
        if (old)
          await t.complianceDocument.update({
            where: { id: old.id },
            data: { archivedAt: new Date() },
          })
      }
    )
    return created
  })
}

export async function archiveCompanyDocument(
  tx: Prisma.TransactionClient,
  id: string,
  user: { id: string }
): Promise<void> {
  const d = await tx.complianceDocument.findFirst({
    where: { id, companyId: null, archivedAt: null },
    select: { id: true },
  })
  if (!d) throw new SafeError('That document is no longer here.')
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'settings',
      subjectId: subjectId(id),
      changes: [{ field: 'company_document.archived', before: false, after: true, kind: 'documents' }],
    },
    (t) => t.complianceDocument.update({ where: { id }, data: { archivedAt: new Date() } })
  )
}

export type DocStatus =
  | { tone: 'ok'; label: 'Valid' | 'Current' }
  | { tone: 'warn'; label: string }
  | { tone: 'bad'; label: 'Expired' }

/** Valid (has an expiry in more than 30 days), Current (no expiry), "n days" (≤ 30), Expired. */
export function companyDocStatus(expiresAt: Date | null, now = new Date()): DocStatus {
  if (!expiresAt) return { tone: 'ok', label: 'Current' }
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const days = Math.round((expiresAt.getTime() - today) / 86_400_000)
  if (days < 0) return { tone: 'bad', label: 'Expired' }
  if (days <= 30) return { tone: 'warn', label: `${days} day${days === 1 ? '' : 's'}` }
  return { tone: 'ok', label: 'Valid' }
}

export interface CompanyDocRow {
  id: string
  kind: (typeof COMPANY_DOC_KINDS)[number]
  title: string
  detail: string
  expiresAt: Date | null
  usedIn: string[]
  fileId: string | null
  status: DocStatus
}

export async function listCompanyDocuments(): Promise<CompanyDocRow[]> {
  const rows = await opsDb.complianceDocument.findMany({
    where: { companyId: null, archivedAt: null },
    orderBy: [{ createdAt: 'asc' }],
    select: {
      id: true,
      kind: true,
      title: true,
      number: true,
      issuer: true,
      expiresAt: true,
      usedIn: true,
      fileId: true,
      file: { select: { pageCount: true, mimeType: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    kind: (COMPANY_DOC_KINDS as readonly string[]).includes(r.kind)
      ? (r.kind as CompanyDocRow['kind'])
      : 'other',
    title: r.title,
    detail:
      [r.issuer, r.number].filter(Boolean).join(' · ') ||
      (r.file?.mimeType === 'application/pdf'
        ? `PDF${r.file.pageCount ? ` · ${r.file.pageCount} pages` : ''}`
        : '—'),
    expiresAt: r.expiresAt,
    usedIn: r.usedIn,
    fileId: r.fileId,
    status: companyDocStatus(r.expiresAt),
  }))
}


/**
 * Board 213's letterhead images: the company.assets setting with its version (ImageSlot saves against it), the
 * stored names of the logo and stamp, and the Owner's and the Helper's signatures (as in the setup wizard).
 */
export async function letterheadAssets(): Promise<{
  version: number
  logo: string | null
  stamp: string | null
  signatures: { userId: string; firstName: string; file: string | null }[]
}> {
  const [entry, team] = await Promise.all([
    getSettingEntry('company.assets'),
    opsDb.user.findMany({
      where: { removedAt: null, status: 'active' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, role: true },
    }),
  ])
  const a = entry.value
  const ids = [a.logoFileId, a.stampFileId, ...Object.values(a.signatures)].filter(
    (x): x is string => !!x
  )
  const files = ids.length
    ? await opsDb.storedFile.findMany({ where: { id: { in: ids } }, select: { id: true, filename: true } })
    : []
  const name = (id: string | null | undefined, fallback: string) =>
    id ? (files.find((f) => f.id === id)?.filename ?? fallback) : null
  const people = [team.find((u) => u.role === 'owner'), team.find((u) => u.role === 'helper')].filter(
    (u): u is (typeof team)[number] => !!u
  )
  return {
    version: entry.version,
    logo: name(a.logoFileId, 'logo'),
    stamp: name(a.stampFileId, 'stamp'),
    signatures: people.map((u) => ({
      userId: u.id,
      firstName: u.name.split(/\s+/)[0] ?? u.name,
      file: name(a.signatures[u.id], 'signature'),
    })),
  }
}
