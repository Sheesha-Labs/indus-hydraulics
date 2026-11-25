import 'server-only'
import { opsDb } from '@indus/ops-db'
import { parseEmail } from './parse/email'
import { parseBytes, readStoredBytes } from './parse/index'
import type { ParsedDocument } from './parse/types'
import { loadUnits, type UnitRow } from './units'

/**
 * What action #5 reads (S08-T02): one intake file. Plain JSON, so it crosses Inngest steps; the bytes are NOT in
 * it — propose and verify read them again from Storage, so a 20 MB PDF never sits in step state.
 */
export interface ExtractInput {
  intakeFileId: string
  batchId: string
  filename: string
  kind: string
  sizeBytes: number | null
  sha256: string | null
  textHash: string | null
  file: { bucket: string; path: string } | null
  email: { bodyText: string | null; bodyTextHash: string | null; subject: string | null } | null
  /** The span source: the stored file, or the mail message for a body. */
  sourceId: string
  /** "Wednesday, 25 November 2026" (Dubai). */
  today: string
  /** ISO instant dates without a year are read against: the email's sent time, else now. */
  anchor: string
  units: UnitRow[]
}

export async function loadExtractInput(
  intakeFileId: string,
  now = new Date()
): Promise<ExtractInput> {
  const [f, units] = await Promise.all([
    opsDb.intakeFile.findUniqueOrThrow({
      where: { id: intakeFileId },
      select: {
        id: true,
        batchId: true,
        filename: true,
        kind: true,
        sizeBytes: true,
        storedFile: { select: { id: true, bucket: true, path: true, sha256: true } },
        batch: {
          select: {
            mailMessage: {
              select: { id: true, bodyText: true, bodyTextHash: true, subject: true, sentAt: true },
            },
          },
        },
      },
    }),
    loadUnits(),
  ])
  const mail = f.kind === 'email' ? f.batch.mailMessage : null
  if (f.kind === 'email' && !mail)
    throw new Error(`intake file ${intakeFileId} is an email body without a message`)
  if (f.kind !== 'email' && !f.storedFile)
    throw new Error(`intake file ${intakeFileId} has no stored file`)
  return {
    intakeFileId: f.id,
    batchId: f.batchId,
    filename: f.filename,
    kind: f.kind,
    sizeBytes: f.sizeBytes,
    sha256: f.storedFile?.sha256 ?? null,
    textHash: mail?.bodyTextHash ?? null,
    file: f.storedFile ? { bucket: f.storedFile.bucket, path: f.storedFile.path } : null,
    email: mail
      ? { bodyText: mail.bodyText, bodyTextHash: mail.bodyTextHash, subject: mail.subject }
      : null,
    sourceId: mail?.id ?? f.storedFile!.id,
    today: new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', dateStyle: 'full' }).format(
      now
    ),
    anchor: (f.batch.mailMessage?.sentAt ?? now).toISOString(),
    units,
  }
}

/** Parses the input's document: the email body, or the stored file's bytes (returned for PDF chunking). */
export async function loadExtractDocument(
  input: Pick<ExtractInput, 'email' | 'file' | 'filename'>
): Promise<{ doc: ParsedDocument; bytes: Uint8Array | null }> {
  if (input.email) return { doc: parseEmail(input.email), bytes: null }
  if (!input.file) return { doc: { kind: 'unreadable', detail: 'No file to read' }, bytes: null }
  const bytes = await readStoredBytes(input.file)
  if (!bytes)
    return { doc: { kind: 'unreadable', detail: 'The file is missing from storage' }, bytes: null }
  return { doc: await parseBytes(bytes, input.filename), bytes }
}
