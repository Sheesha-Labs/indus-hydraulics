import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { opsDb, type Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { getSetting } from '../settings/get'
import { getStorage } from './storage'
import {
  SNIFF_BYTES,
  UPLOAD_KINDS,
  isKeyUnder,
  objectKey,
  objectPrefix,
  sniffMime,
  uploadRefusal,
  type UploadKind,
  type UploadMime,
} from './upload-rules'

/**
 * Uploads (ADR-21, C19): the browser asks for a signed upload URL (`createUpload`), PUTs the file
 * straight to Storage, then asks Ops to record it (`confirmUpload`). The bytes never pass through a
 * server action or a route body of ours, so the Vercel request-size limit never applies and a large
 * file never sits in a function's memory as a form post.
 *
 * `confirmUpload` trusts nothing the browser said: it reads the object back, checks the magic bytes
 * against the type the key was issued for (PNG 89 50 4E 47, JPEG FF D8 FF), deletes the object on a
 * mismatch or when it is over the size limit, hashes it while streaming, and only then inserts
 * `stored_file`.
 */

export type UploadTarget = {
  kind: UploadKind
  /** The record the file belongs to, as path segments: `company-profile`, or `order` + its id. */
  recordType: string
  recordId?: string | undefined
}

export type CreateUploadInput = UploadTarget & { filename: string; size: number; mime: string }

export type CreatedUpload = { bucket: string; key: string; uploadUrl: string }

function prefixOf(t: UploadTarget): string {
  return objectPrefix([t.recordType, ...(t.recordId ? [t.recordId] : []), t.kind])
}

async function maxUploadMb(): Promise<number> {
  return (await getSetting('intake')).maxUploadMb
}

/** Validate a requested upload and issue its signed upload URL. Refusals are SafeErrors. */
export async function createUpload(input: CreateUploadInput): Promise<CreatedUpload> {
  const max = await maxUploadMb()
  const refused = uploadRefusal(input, max)
  if (refused) throw new SafeError(refused)
  const bucket = UPLOAD_KINDS[input.kind].bucket
  const key = objectKey(prefixOf(input), randomUUID(), input.filename, input.mime as UploadMime)
  const { url } = await getStorage().createSignedUploadUrl(bucket, key)
  return { bucket, key, uploadUrl: url }
}

const MIME_BY_EXT: Record<string, UploadMime> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export type VerifiedObject = {
  bucket: string
  key: string
  mime: UploadMime
  sizeBytes: number
  sha256: string
}

const NOT_ARRIVED = 'The upload did not arrive. Try again.'

/**
 * Read the uploaded object back and prove what it is. Deletes the object and throws a SafeError when
 * the first bytes are not the type it was issued for, or when it is larger than the limit. No database
 * call: run it before opening a transaction (ADR-04).
 */
export async function verifyUploadedObject(
  target: UploadTarget,
  key: string
): Promise<VerifiedObject> {
  const spec = UPLOAD_KINDS[target.kind]
  if (!isKeyUnder(prefixOf(target), key)) throw new SafeError(NOT_ARRIVED)
  const declared = MIME_BY_EXT[key.slice(key.lastIndexOf('.') + 1)]
  if (!declared || !(spec.mimes as readonly string[]).includes(declared)) {
    throw new SafeError(NOT_ARRIVED)
  }

  const storage = getStorage()
  const max = (await maxUploadMb()) * 1024 * 1024
  const stream = await storage.openRead(spec.bucket, key)
  if (!stream) throw new SafeError(NOT_ARRIVED)

  const reject = async (message: string): Promise<never> => {
    await storage.remove(spec.bucket, key)
    throw new SafeError(message)
  }

  const hash = createHash('sha256')
  const head = new Uint8Array(SNIFF_BYTES)
  let headLen = 0
  let size = 0
  let sniffed = false
  const reader = stream.getReader()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value || value.length === 0) continue
      if (headLen < SNIFF_BYTES) {
        const take = value.subarray(0, SNIFF_BYTES - headLen)
        head.set(take, headLen)
        headLen += take.length
      }
      if (!sniffed && headLen >= SNIFF_BYTES) {
        sniffed = true
        if (sniffMime(head) !== declared) {
          await reader.cancel()
          return await reject(
            `That file is not a ${declared === 'image/png' ? 'PNG' : 'JPEG'} image.`
          )
        }
      }
      size += value.length
      if (size > max) {
        await reader.cancel()
        return await reject(`That file is over ${max / (1024 * 1024)} MB.`)
      }
      hash.update(value)
    }
  } finally {
    reader.releaseLock()
  }
  if (size === 0) return reject('That file is empty.')
  if (!sniffed && sniffMime(head.subarray(0, headLen)) !== declared) {
    return reject(`That file is not a ${declared === 'image/png' ? 'PNG' : 'JPEG'} image.`)
  }
  return { bucket: spec.bucket, key, mime: declared, sizeBytes: size, sha256: hash.digest('hex') }
}

type FileDb = { storedFile: Pick<Prisma.TransactionClient['storedFile'], 'create'> }

/** Insert the `stored_file` row for a verified object (source `upload`). */
export async function recordStoredFile(
  db: FileDb,
  object: VerifiedObject,
  filename: string,
  uploadedById: string
): Promise<{ fileId: string; filename: string }> {
  const name = filename.trim().slice(0, 200) || 'file'
  const row = await db.storedFile.create({
    data: {
      bucket: object.bucket,
      path: object.key,
      filename: name,
      mimeType: object.mime,
      sizeBytes: object.sizeBytes,
      sha256: object.sha256,
      source: 'upload',
      uploadedById,
    },
    select: { id: true, filename: true },
  })
  return { fileId: row.id, filename: row.filename }
}

/** Verify the uploaded object and record it. Returns the new `stored_file` id. */
export async function confirmUpload(
  target: UploadTarget,
  key: string,
  filename: string,
  uploadedById: string
): Promise<{ fileId: string; filename: string }> {
  const object = await verifyUploadedObject(target, key)
  return recordStoredFile(opsDb, object, filename, uploadedById)
}
