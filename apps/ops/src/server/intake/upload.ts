import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { opsDb } from '@indus/ops-db'
import { emitEventOrThrow } from '../../inngest/emit'
import { SafeError } from '../../lib/safe-message'
import { getSetting } from '../settings/get'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'
import { sniff, type SniffedKind } from './parse/index'
import { TX_OPTIONS } from '../../lib/tx-options'

/**
 * Intake uploads (S08-T03, ADR-21, C19). Same pattern as S03's uploads: the browser asks for a signed upload URL,
 * PUTs the file straight to Storage (the bytes never pass through a server action), then asks Ops to record it.
 * Recording trusts nothing the browser said: the object is read back, its magic bytes decide its type (the
 * extension must agree), it is hashed while read, and only then `stored_file` and `intake_file` are written and
 * `ops/document.capture.requested` is sent. Keys never carry a client's name: `intake/<batch>/<uuid>.<ext>`; the
 * file's own name lives only in the `stored_file` row.
 */
export const CAPTURE_REQUESTED = 'ops/document.capture.requested' as const
export const CAPTURE_CANCELLED = 'ops/document.capture.cancelled' as const

/** Extension → what its bytes must sniff as, and the intake file kind. */
const ALLOWED: Record<
  string,
  { sniffs: SniffedKind[]; kind: 'pdf' | 'sheet' | 'docx' | 'image' | 'zip' }
> = {
  pdf: { sniffs: ['pdf'], kind: 'pdf' },
  png: { sniffs: ['image'], kind: 'image' },
  jpg: { sniffs: ['image'], kind: 'image' },
  jpeg: { sniffs: ['image'], kind: 'image' },
  webp: { sniffs: ['image'], kind: 'image' },
  heic: { sniffs: ['heic'], kind: 'image' },
  xlsx: { sniffs: ['xlsx'], kind: 'sheet' },
  xlsm: { sniffs: ['xlsx'], kind: 'sheet' },
  xls: { sniffs: ['xls'], kind: 'sheet' },
  csv: { sniffs: ['csv', 'text'], kind: 'sheet' },
  docx: { sniffs: ['docx'], kind: 'docx' },
  zip: { sniffs: ['zip'], kind: 'zip' },
}
export const INTAKE_EXTENSIONS = Object.keys(ALLOWED)

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

function extOf(name: string): string {
  return /\.([a-z0-9]{1,5})$/i.exec(name.trim())?.[1]?.toLowerCase() ?? ''
}

/** `intake/<batch>/<uuid>.<ext>`: never the file's name, which often carries the client's. */
export function intakeKey(batchId: string, filename: string): string {
  return `intake/${batchId}/${randomUUID()}.${extOf(filename)}`
}

export function isIntakeKey(batchId: string, key: string): boolean {
  return new RegExp(`^intake/${batchId}/${UUID}\\.[a-z0-9]{1,5}$`).test(key)
}

async function maxBytes(): Promise<number> {
  return (await getSetting('intake')).maxUploadMb * 1024 * 1024
}

/** Why a file is refused before a URL is issued, or null. */
export function intakeRefusal(f: { name: string; size: number }, max: number): string | null {
  if (!Number.isInteger(f.size) || f.size <= 0) return 'That file is empty.'
  if (f.size > max)
    return `Over ${Math.round(max / (1024 * 1024))} MB: send a smaller file or split it.`
  if (!ALLOWED[extOf(f.name)]) return 'Use PDF, PNG, JPEG, XLSX, XLS, CSV, DOCX or ZIP.'
  if (!f.name.trim() || f.name.length > 200) return 'Rename the file and try again.'
  return null
}

export type UploadSlot =
  { name: string; key: string; uploadUrl: string } | { name: string; error: string }

export async function createUploadSlots(
  batchId: string,
  files: ReadonlyArray<{ name: string; size: number }>
): Promise<UploadSlot[]> {
  const max = await maxBytes()
  const storage = getStorage()
  return Promise.all(
    files.map(async (f): Promise<UploadSlot> => {
      const why = intakeRefusal(f, max)
      if (why) return { name: f.name, error: why }
      const key = intakeKey(batchId, f.name)
      const { url } = await storage.createSignedUploadUrl(OPS_BUCKETS.uploads, key)
      return { name: f.name, key, uploadUrl: url }
    })
  )
}

const NOT_ARRIVED = 'The upload did not arrive. Try again.'

/** Reads the object back, checks size and magic bytes, hashes it. Deletes it and throws a SafeError on a refusal. */
export async function verifyIntakeObject(
  batchId: string,
  key: string,
  filename: string
): Promise<{ kind: string; mime: string; sizeBytes: number; sha256: string }> {
  if (!isIntakeKey(batchId, key)) throw new SafeError(NOT_ARRIVED)
  const spec = ALLOWED[extOf(key)]
  if (!spec || extOf(key) !== extOf(filename)) throw new SafeError(NOT_ARRIVED)
  const storage = getStorage()
  const stream = await storage.openRead(OPS_BUCKETS.uploads, key)
  if (!stream) throw new SafeError(NOT_ARRIVED)
  const max = await maxBytes()
  const hash = createHash('sha256')
  const parts: Uint8Array[] = []
  let size = 0
  const reader = stream.getReader()
  const refuse = async (message: string): Promise<never> => {
    await storage.remove(OPS_BUCKETS.uploads, key)
    throw new SafeError(message)
  }
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value?.length) continue
      size += value.length
      if (size > max) {
        await reader.cancel()
        return await refuse(`That file is over ${max / (1024 * 1024)} MB.`)
      }
      hash.update(value)
      if (parts.reduce((n, p) => n + p.length, 0) < 8_192) parts.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  if (size === 0) return refuse('That file is empty.')
  const head = new Uint8Array(Buffer.concat(parts.map((p) => Buffer.from(p))))
  const s = await sniff(head, filename)
  if (!spec.sniffs.includes(s.kind))
    return refuse(
      `${filename} is not what its name says (.${extOf(filename)}). Save it again and re-upload.`
    )
  return { kind: spec.kind, mime: s.mime, sizeBytes: size, sha256: hash.digest('hex') }
}

async function requestCapture(intakeFileId: string, sha256: string): Promise<void> {
  await emitEventOrThrow({
    name: CAPTURE_REQUESTED,
    id: `capture:${intakeFileId}:${sha256}`,
    data: { intakeFileId },
  })
}

/** Records a verified upload: stored_file (source upload) + intake_file (queued), then asks for capture. */
export async function confirmIntakeUpload(input: {
  batchId: string
  key: string
  filename: string
  userId: string
  parentFileId?: string | null
}): Promise<{ intakeFileId: string }> {
  const obj = await verifyIntakeObject(input.batchId, input.key, input.filename)
  const name = input.filename.trim().slice(0, 200)
  const file = await opsDb.$transaction(async (tx) => {
    const stored = await tx.storedFile.create({
      data: {
        bucket: OPS_BUCKETS.uploads,
        path: input.key,
        filename: name,
        mimeType: obj.mime,
        sizeBytes: obj.sizeBytes,
        sha256: obj.sha256,
        source: 'upload',
        uploadedById: input.userId,
      },
      select: { id: true },
    })
    const f = await tx.intakeFile.create({
      data: {
        batchId: input.batchId,
        storedFileId: stored.id,
        filename: name,
        kind: obj.kind,
        sizeBytes: obj.sizeBytes,
        uploadedById: input.userId,
        parentFileId: input.parentFileId ?? null,
        progressNote: 'Waiting',
      },
      select: { id: true },
    })
    await tx.intakeBatch.update({
      where: { id: input.batchId },
      data: { version: { increment: 1 } },
    })
    return f
  }, TX_OPTIONS)
  await requestCapture(file.id, obj.sha256)
  return { intakeFileId: file.id }
}

/** "Paste email text": stored as a text file and read like an email body. */
export async function pasteIntakeText(input: {
  batchId: string
  text: string
  userId: string
}): Promise<{ intakeFileId: string }> {
  const text = input.text.trim()
  if (!text) throw new SafeError('Paste the email text first.')
  if (text.length > 200_000)
    throw new SafeError('That is too long to paste: upload it as a file instead.')
  const bytes = new TextEncoder().encode(text)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const key = `intake/${input.batchId}/${randomUUID()}.txt`
  await getStorage().upload(OPS_BUCKETS.uploads, key, bytes, 'text/plain; charset=utf-8')
  const file = await opsDb.$transaction(async (tx) => {
    const stored = await tx.storedFile.create({
      data: {
        bucket: OPS_BUCKETS.uploads,
        path: key,
        filename: 'Pasted email text',
        mimeType: 'text/plain',
        sizeBytes: bytes.length,
        sha256,
        source: 'upload',
        uploadedById: input.userId,
      },
      select: { id: true },
    })
    return tx.intakeFile.create({
      data: {
        batchId: input.batchId,
        storedFileId: stored.id,
        filename: 'Pasted email text',
        kind: 'paste',
        sizeBytes: bytes.length,
        uploadedById: input.userId,
        progressNote: 'Waiting',
      },
      select: { id: true },
    })
  }, TX_OPTIONS)
  await requestCapture(file.id, sha256)
  return { intakeFileId: file.id }
}

/** A file Ops expanded out of an archive: written server-side, then queued like an upload. */
export async function addExpandedFile(input: {
  batchId: string
  parentFileId: string
  name: string
  bytes: Uint8Array
  userId: string | null
}): Promise<{ intakeFileId: string } | { refused: string }> {
  const ext = extOf(input.name)
  const spec = ALLOWED[ext]
  if (!spec || spec.kind === 'zip') return { refused: `${input.name}: not a file intake reads` }
  const s = await sniff(input.bytes, input.name)
  if (!spec.sniffs.includes(s.kind)) return { refused: `${input.name} is not what its name says` }
  const key = intakeKey(input.batchId, input.name)
  await getStorage().upload(OPS_BUCKETS.uploads, key, input.bytes, s.mime)
  const sha256 = createHash('sha256').update(input.bytes).digest('hex')
  const file = await opsDb.$transaction(async (tx) => {
    const stored = await tx.storedFile.create({
      data: {
        bucket: OPS_BUCKETS.uploads,
        path: key,
        filename: input.name.slice(0, 200),
        mimeType: s.mime,
        sizeBytes: input.bytes.length,
        sha256,
        source: 'upload',
        uploadedById: input.userId,
      },
      select: { id: true },
    })
    return tx.intakeFile.create({
      data: {
        batchId: input.batchId,
        storedFileId: stored.id,
        parentFileId: input.parentFileId,
        filename: input.name.slice(0, 200),
        kind: spec.kind,
        sizeBytes: input.bytes.length,
        uploadedById: input.userId,
        progressNote: 'Waiting',
      },
      select: { id: true },
    })
  }, TX_OPTIONS)
  await requestCapture(file.id, sha256)
  return { intakeFileId: file.id }
}
