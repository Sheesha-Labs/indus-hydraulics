import 'server-only'
import { applyTemplate, type DocKind, type DocumentData } from '@indus/ops-core'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { renderDocumentPdf } from '@indus/ops-pdf'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'
import { loadLetterhead } from './assets'
import { pdfPageCount, sha256OfBytes } from './hash'
import { documentKey, downloadName } from './keys'
import { mailboxRoleFor, RECORD_KIND } from './kinds'
import { getActiveTemplate } from './templates'

/**
 * Issuing a document (S11-T04, ADR-14): render once, store the PDF immutably with its SHA-256, and from then on
 * every email, client page and download uses that file.
 *
 *   1. letterhead and images are read (no transaction)
 *   2. the PDF is rendered outside any transaction: no connection is held while it renders (§7.4)
 *   3. the bytes go to ops-documents at a key carrying the number and the SHA prefix; an existing object at
 *      that key is an error, never overwritten
 *   4. one transaction writes stored_file, document (approved, issuedAt) and document_version 1 (the data
 *      snapshot, template, SHA-256, renderedAt); the trigger makes the file immutable from then on
 *
 * The template (S11-T05): when the caller names none, the kind's published template is applied to `data` here
 * (its block order and switches; the caller built the columns with templateOptions) and recorded on the
 * version. A caller that names a template (a reissue of a snapshot) passes data it has already applied.
 *
 * The number is allocated by the caller in its own approving transaction (S17 quotation approval, S24 order
 * documents); this never allocates. `data` is built by the caller from a ClientSafe* or SupplierSafe* input
 * (mappers.ts), so it cannot carry the other audience's fields.
 */
export type DocumentActor =
  | { kind: 'user'; id: string }
  | { kind: 'system' }
  | { kind: 'assistant'; actionId?: string | null }

export interface IssueInput {
  kind: DocKind
  data: DocumentData
  number: string
  revision?: number
  subjectType: $Enums.RecordType
  subjectId: string
  enquiryId?: string | null
  orderId?: string | null
  companyId?: string | null
  templateId?: string | null
  currency?: string | null
  /** The signatory whose signature image is drawn (client documents). */
  signerId?: string | null
  actor: DocumentActor
  now?: Date
}

export interface Issued {
  documentId: string
  fileId: string
  sha256: string
  key: string
}

export class DocumentKeyTaken extends Error {
  constructor(readonly key: string) {
    super(`An issued document already exists at ${key}`)
  }
}

const actorCols = (a: DocumentActor) => ({
  createdByKind: a.kind as $Enums.ActorKind,
  createdById: a.kind === 'user' ? a.id : null,
})

/** Render, store and record. `extra` runs inside the recording transaction (reissue marks the old one there). */
export async function issueDocument(
  i: IssueInput,
  extra?: {
    supersedesId?: string
    reissueReason?: $Enums.ReissueReason
    reissueNote?: string | null
    inTransaction?: (tx: Prisma.TransactionClient, documentId: string) => Promise<void>
  }
): Promise<Issued> {
  const now = i.now ?? new Date()
  const revision = i.revision ?? 1
  const recordKind = RECORD_KIND[i.kind]

  const active = i.templateId === undefined ? await getActiveTemplate(i.kind) : null
  const data = active ? applyTemplate(i.data, active.definition) : i.data
  const templateId = active ? active.id : (i.templateId ?? null)

  const { letterhead, assets } = await loadLetterhead({
    role: mailboxRoleFor(i.kind),
    currency: i.currency ?? null,
    signerId: i.signerId ?? null,
  })
  const bytes = await renderDocumentPdf(data, letterhead, assets, { draft: false })
  const sha256 = sha256OfBytes(bytes)
  const key = documentKey({ kind: recordKind, issuedAt: now, number: i.number, revision, sha256 })

  const { existed } = await getStorage().upload(
    OPS_BUCKETS.documents,
    key,
    bytes,
    'application/pdf'
  )
  if (existed) throw new DocumentKeyTaken(key)

  try {
    return await opsDb.$transaction(async (tx) => {
      const file = await tx.storedFile.create({
        data: {
          bucket: OPS_BUCKETS.documents,
          path: key,
          filename: downloadName(i.number, revision),
          mimeType: 'application/pdf',
          sizeBytes: bytes.length,
          sha256,
          pageCount: pdfPageCount(bytes),
          source: 'generated',
          uploadedById: i.actor.kind === 'user' ? i.actor.id : null,
        },
        select: { id: true },
      })
      const doc = await tx.document.create({
        data: {
          kind: recordKind,
          direction: 'produced',
          number: i.number,
          revision,
          status: 'approved',
          issuedAt: now,
          subjectType: i.subjectType,
          subjectId: i.subjectId,
          enquiryId: i.enquiryId ?? null,
          orderId: i.orderId ?? null,
          companyId: i.companyId ?? null,
          currentVersion: 1,
          ...(extra?.supersedesId ? { supersedesId: extra.supersedesId } : {}),
          ...(extra?.reissueReason ? { reissueReason: extra.reissueReason } : {}),
          ...(extra?.reissueNote ? { reissueNote: extra.reissueNote } : {}),
        },
        select: { id: true },
      })
      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          version: 1,
          fileId: file.id,
          templateId,
          dataSnapshot: data as unknown as Prisma.InputJsonValue,
          sha256,
          renderedAt: now,
          ...actorCols(i.actor),
        },
      })
      if (extra?.inTransaction) await extra.inTransaction(tx, doc.id)
      await tx.activityEvent.create({
        data: {
          actorKind: i.actor.kind as $Enums.ActorKind,
          actorId: i.actor.kind === 'user' ? i.actor.id : null,
          ...(i.actor.kind === 'assistant' && i.actor.actionId
            ? { actionId: i.actor.actionId }
            : {}),
          enquiryId: i.enquiryId ?? null,
          subjectType: 'document',
          subjectId: doc.id,
          kind: 'documents',
          field: 'status',
          ...(extra?.supersedesId ? { before: { supersedes: extra.supersedesId } } : {}),
          after: { status: 'approved', number: i.number, revision, sha256 },
          note: `${data.title} ${i.number}${revision > 1 ? ` · R${revision}` : ''} issued`,
        },
      })
      return { documentId: doc.id, fileId: file.id, sha256, key }
    })
  } catch (error) {
    // Nothing references the object yet: take it back so a retry can store it again.
    await getStorage()
      .remove(OPS_BUCKETS.documents, key)
      .catch(() => undefined)
    throw error
  }
}
