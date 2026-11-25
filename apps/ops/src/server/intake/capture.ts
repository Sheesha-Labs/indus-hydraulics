import 'server-only'
import { opsDb } from '@indus/ops-db'
import { actionRequestEvent, type ActionRequestedData } from '../assistant/request'
import { tooLowResolution } from './parse/image'
import { parseBytes, readStoredBytes } from './parse/index'
import { expandZip } from './parse/zip'
import { bumpIntake } from './live'
import { addExpandedFile } from './upload'
import { TX_OPTIONS } from '../../lib/tx-options'

/**
 * The steps of `ops.capture.document` (S08-T03), each a short database touch or a database-free read, so the
 * function never holds a connection across parsing or the model (ADR-04). Progress is written at most once per
 * step: Detecting layout → Reading n pages → Ready / Needs attention.
 */
export interface CaptureStart {
  skip: boolean
  batchId: string
  kind: string
  file: { bucket: string; path: string; filename: string; sizeBytes: number } | null
  sha256: string | null
  userId: string | null
}

export async function startCapture(intakeFileId: string): Promise<CaptureStart> {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: intakeFileId },
    select: {
      status: true,
      batchId: true,
      kind: true,
      uploadedById: true,
      batch: { select: { status: true } },
      storedFile: {
        select: { bucket: true, path: true, filename: true, sizeBytes: true, sha256: true },
      },
    },
  })
  const none = {
    skip: true,
    batchId: f?.batchId ?? '',
    kind: '',
    file: null,
    sha256: null,
    userId: null,
  }
  if (!f || f.batch.status !== 'open' || !['queued', 'extracting'].includes(f.status)) return none
  await opsDb.$transaction(async (tx) => {
    await tx.intakeFile.update({
      where: { id: intakeFileId },
      data: { status: 'extracting', progressPct: 5, progressNote: 'Detecting layout' },
    })
    await bumpIntake(f.batchId, tx)
  }, TX_OPTIONS)
  return {
    skip: false,
    batchId: f.batchId,
    kind: f.kind,
    file: f.storedFile
      ? {
          bucket: f.storedFile.bucket,
          path: f.storedFile.path,
          filename: f.storedFile.filename,
          sizeBytes: f.storedFile.sizeBytes,
        }
      : null,
    sha256: f.storedFile?.sha256 ?? null,
    userId: f.uploadedById,
  }
}

export interface Inspection {
  pageCount: number | null
  /** Shown in the row's meta: "4 pages", "96 dpi scan", "table found". */
  note: string
  failure: { kind: string; note: string; meta?: string } | null
  zip: { expand: boolean; entries: number } | null
  /** A spreadsheet: mapped in code (S08-T05, board 35), never sent to the model. */
  sheet?: boolean
}

/** No database: reads the file once to catch what the model must never be sent (encrypted, unreadable, a coarse scan). */
export async function inspectFile(file: NonNullable<CaptureStart['file']>): Promise<Inspection> {
  const bytes = await readStoredBytes(file)
  if (!bytes)
    return {
      pageCount: null,
      note: '',
      failure: { kind: 'unreadable', note: 'The file is missing from storage' },
      zip: null,
    }
  const doc = await parseBytes(bytes, file.filename)
  switch (doc.kind) {
    case 'password_protected':
      return {
        pageCount: null,
        note: '',
        failure: {
          kind: 'password_protected',
          note: 'Password-protected: ask the client for an open copy',
        },
        zip: null,
      }
    case 'unreadable':
      return {
        pageCount: null,
        note: '',
        failure: { kind: 'unreadable', note: doc.detail },
        zip: null,
      }
    case 'unsupported':
      return {
        pageCount: null,
        note: '',
        failure: { kind: 'unsupported', note: doc.detail },
        zip: null,
      }
    case 'zip':
      return {
        pageCount: null,
        note: `${doc.entries.length} files`,
        failure:
          doc.decision === 'store_only'
            ? {
                kind: 'unsupported',
                note: 'Archive not expanded: it is too large or compresses too far',
              }
            : null,
        zip: { expand: doc.decision === 'expand', entries: doc.entries.length },
      }
    case 'image':
      if (tooLowResolution(doc))
        return {
          pageCount: 1,
          note: doc.dpi ? `${doc.dpi} dpi scan` : 'low resolution',
          failure: {
            kind: 'unreadable',
            note: 'Image too low resolution to read reliably',
            meta: doc.dpi ? `${doc.dpi} dpi scan` : 'low resolution',
          },
          zip: null,
        }
      return { pageCount: 1, note: 'photo or scan', failure: null, zip: null }
    case 'pdf':
      return {
        pageCount: doc.pageCount,
        note: `${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}${doc.hasTextLayer ? '' : ' · scanned'}`,
        failure: null,
        zip: null,
      }
    case 'sheet':
      return {
        pageCount: doc.grid.sheets.length,
        note: `${doc.grid.sheets.length} sheet${doc.grid.sheets.length === 1 ? '' : 's'}`,
        failure: null,
        zip: null,
        sheet: true,
      }
    default:
      return { pageCount: 1, note: '', failure: null, zip: null }
  }
}

export async function noteReading(
  intakeFileId: string,
  batchId: string,
  i: Inspection
): Promise<void> {
  const pages = i.pageCount ?? 1
  await opsDb.$transaction(async (tx) => {
    await tx.intakeFile.update({
      where: { id: intakeFileId },
      data: {
        pageCount: i.pageCount,
        progressPct: 25,
        progressNote: pages > 1 ? `Reading ${pages} pages` : `Reading page 1 of 1`,
      },
    })
    await bumpIntake(batchId, tx)
  }, TX_OPTIONS)
}

export async function failFile(
  intakeFileId: string,
  batchId: string,
  failure: NonNullable<Inspection['failure']>
): Promise<void> {
  await opsDb.$transaction(async (tx) => {
    await tx.intakeFile.updateMany({
      where: { id: intakeFileId, status: { in: ['queued', 'extracting'] } },
      data: {
        status: 'needs_attention',
        progressPct: 100,
        progressNote: failure.note,
        failureKind: failure.kind,
        failureNote: failure.meta ?? failure.note,
      },
    })
    await bumpIntake(batchId, tx)
  }, TX_OPTIONS)
}

/** An archive within the limits: each entry becomes its own queued file; the archive row itself is done. */
export async function expandArchive(
  intakeFileId: string,
  start: CaptureStart
): Promise<{ added: number; refused: string[] }> {
  const bytes = start.file ? await readStoredBytes(start.file) : null
  const entries = bytes ? await expandZip(bytes) : []
  const refused: string[] = []
  let added = 0
  for (const e of entries) {
    const r = await addExpandedFile({
      batchId: start.batchId,
      parentFileId: intakeFileId,
      name: e.name,
      bytes: e.bytes,
      userId: start.userId,
    })
    if ('refused' in r) refused.push(r.refused)
    else added += 1
  }
  await opsDb.$transaction(async (tx) => {
    await tx.intakeFile.update({
      where: { id: intakeFileId },
      data: {
        status: 'ready',
        progressPct: 100,
        progressNote: `Expanded into ${added} file${added === 1 ? '' : 's'}${refused.length ? ` · ${refused.length} skipped` : ''}`,
        linesFound: 0,
      },
    })
    await bumpIntake(start.batchId, tx)
  }, TX_OPTIONS)
  return { added, refused }
}

/** The extract_lines run for a file, as the event data the runner takes. */
export function extractRequest(intakeFileId: string, sha256: string | null): ActionRequestedData {
  return actionRequestEvent({
    actionKey: 'extract_lines',
    subjectType: 'intake_file',
    subjectId: intakeFileId,
    trigger: 'intake.capture',
    origin: 'live',
    sourceVersion: sha256 ?? intakeFileId,
  }).data
}

/** After the run: a file the run left in "extracting" (refused, failed, budget) needs a person. */
export async function finishCapture(
  intakeFileId: string,
  batchId: string,
  outcome: { state?: string; skipped?: string } | null
): Promise<string> {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: intakeFileId },
    select: { status: true },
  })
  if (!f || f.status !== 'extracting') return f?.status ?? 'gone'
  const note =
    outcome?.skipped === 'budget'
      ? 'Not read: the monthly AI budget is spent'
      : outcome?.skipped
        ? `Not read: ${outcome.skipped.replaceAll('_', ' ')}`
        : 'The Assistant could not read this file'
  await failFile(intakeFileId, batchId, { kind: 'failed', note })
  return 'needs_attention'
}
