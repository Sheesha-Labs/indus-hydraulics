import 'server-only'
import { randomUUID } from 'node:crypto'
import { checkDefaults, createClause, type ClauseInput } from './clauses'
import { isTermsCategory, type TermsCategory } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import '../assistant/actions/import-terms'
import { requestAction } from '../assistant/request'
import {
  recordSupplierFile,
  verifySupplierObject,
} from '../directory/document-files'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * "Import from offer" (S11-T06, board 39). The Owner uploads an INDUS/Q PDF Indus issued; it goes to the private
 * ops-uploads bucket (never the repository) under `terms-import/<uuid>.pdf`; the Assistant's import_terms reads it
 * into candidates; the Owner accepts (optionally edited), or skips, each candidate. Accepting creates a clause
 * with "From Offer <number>" as its source. Nothing is a clause before that.
 */
const PREFIX = 'terms-import'
const MAX_BYTES = 20 * 1024 * 1024

export async function createTermsImportUpload(f: { name: string; size: number }) {
  if (!/\.pdf$/i.test(f.name.trim())) throw new SafeError('Use the offer as a PDF.')
  if (!Number.isInteger(f.size) || f.size <= 0) throw new SafeError('That file is empty.')
  if (f.size > MAX_BYTES) throw new SafeError('That file is over 20 MB.')
  const key = `${PREFIX}/${randomUUID()}.pdf`
  const { url } = await getStorage().createSignedUploadUrl(OPS_BUCKETS.uploads, key)
  return { key, uploadUrl: url }
}

/** Verify the uploaded object, record it, open an import and ask the Assistant to read it. */
export async function startTermsImport(
  key: string,
  filename: string,
  user: { id: string }
): Promise<{ importId: string }> {
  const v = await verifySupplierObject(PREFIX, key, filename)
  const importId = await opsDb.$transaction(async (tx) => {
    const fileId = await recordSupplierFile(tx, v, filename, 'upload', user.id)
    const imp = await tx.termsImport.create({
      data: { fileId, createdById: user.id },
      select: { id: true },
    })
    return imp.id
  })
  await requestAction({
    actionKey: 'import_terms',
    subjectType: 'settings',
    subjectId: importId,
    trigger: 'person',
    origin: 'live',
    sourceVersion: 1,
    requestedById: user.id,
  })
  return { importId }
}

export interface ImportView {
  id: string
  status: string
  offerRef: string | null
  failureNote: string | null
  filename: string
  candidates: {
    id: string
    category: TermsCategory
    title: string
    body: string
    variables: string[]
    status: string
  }[]
}

/** The open imports (reading, ready or failed) with their candidates, newest first. */
export async function openImports(): Promise<ImportView[]> {
  const rows = await opsDb.termsImport.findMany({
    where: { status: { in: ['reading', 'ready', 'failed'] } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      status: true,
      offerRef: true,
      failureNote: true,
      createdAt: true,
      file: { select: { filename: true } },
      candidates: {
        orderBy: { position: 'asc' },
        select: { id: true, category: true, title: true, body: true, variables: true, status: true },
      },
    },
  })
  // A read that never finished (the job failed or was dropped) shows as failed after 10 minutes.
  const stale = Date.now() - 10 * 60_000
  return rows.map((r) => {
    const late = r.status === 'reading' && r.createdAt.getTime() < stale
    return {
    id: r.id,
    status: late ? 'failed' : r.status,
    offerRef: r.offerRef,
    failureNote: late ? 'Not read in time; try the import again' : r.failureNote,
    filename: r.file.filename,
    candidates: r.candidates.map((c) => ({
      ...c,
      category: isTermsCategory(c.category) ? c.category : 'documents',
    })),
    }
  })
}

/** Close an import once nothing is pending (or when the person dismisses it). */
async function closeIfDone(tx: Prisma.TransactionClient, importId: string) {
  const pending = await tx.termsImportCandidate.count({ where: { importId, status: 'pending' } })
  if (!pending)
    await tx.termsImport.update({ where: { id: importId }, data: { status: 'closed' } })
}

/** Accept a candidate as a new clause (the person's edits applied), "From Offer <number>". */
export async function acceptCandidate(
  tx: Prisma.TransactionClient,
  candidateId: string,
  edits: {
    category?: ClauseInput['category'] | undefined
    title?: string | undefined
    body?: string | undefined
    defaults?: ClauseInput['defaults'] | undefined
  },
  user: { id: string }
): Promise<{ code: string }> {
  const c = await tx.termsImportCandidate.findUnique({
    where: { id: candidateId },
    select: {
      status: true,
      importId: true,
      category: true,
      title: true,
      body: true,
      import: { select: { offerRef: true } },
    },
  })
  if (!c || c.status !== 'pending') throw new SafeError('That candidate was already decided.')
  const body = edits.body ?? c.body
  const category = edits.category ?? (isTermsCategory(c.category) ? c.category : 'documents')
  checkDefaults(body, edits.defaults ?? {})
  const clause = await createClause(
    tx,
    {
      category,
      title: edits.title ?? c.title,
      body,
      defaults: edits.defaults ?? {},
      approvalRule: null,
      locked: false,
      sourceRef: c.import.offerRef ? `From Offer ${c.import.offerRef}` : 'From an imported offer',
    },
    { kind: 'user', id: user.id }
  )
  await tx.termsImportCandidate.update({
    where: { id: candidateId },
    data: { status: 'accepted', clauseId: clause.id, decidedById: user.id, decidedAt: new Date() },
  })
  await closeIfDone(tx, c.importId)
  return { code: clause.code }
}

export async function skipCandidate(
  tx: Prisma.TransactionClient,
  candidateId: string,
  user: { id: string }
): Promise<void> {
  const c = await tx.termsImportCandidate.findUnique({
    where: { id: candidateId },
    select: { status: true, importId: true },
  })
  if (!c || c.status !== 'pending') throw new SafeError('That candidate was already decided.')
  await tx.termsImportCandidate.update({
    where: { id: candidateId },
    data: { status: 'skipped', decidedById: user.id, decidedAt: new Date() },
  })
  await closeIfDone(tx, c.importId)
}

export async function dismissImport(tx: Prisma.TransactionClient, importId: string, user: { id: string }) {
  await tx.termsImportCandidate.updateMany({
    where: { importId, status: 'pending' },
    data: { status: 'skipped', decidedById: user.id, decidedAt: new Date() },
  })
  await tx.termsImport.update({ where: { id: importId }, data: { status: 'closed' } })
}
