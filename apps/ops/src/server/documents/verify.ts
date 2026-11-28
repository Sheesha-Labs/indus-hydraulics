import 'server-only'
import { opsDb } from '@indus/ops-db'
import { isOpsBucket } from '../storage/buckets'
import { getStorage } from '../storage/storage'
import { sha256OfBytes } from './hash'

/**
 * Re-verify an issued file before it is attached to an email or downloaded (S11-T04, exported for S17): the
 * object's bytes must hash to the SHA-256 recorded when it was rendered. A mismatch means the object changed
 * under us (or was replaced); the caller refuses to send it.
 */
export type FileCheck =
  | { ok: true; sha256: string; bytes: Uint8Array }
  | { ok: false; reason: 'missing' | 'purged' | 'tampered'; expected?: string; actual?: string }

export async function verifyIssuedFile(fileId: string): Promise<FileCheck> {
  const row = await opsDb.storedFile.findUnique({
    where: { id: fileId },
    select: { bucket: true, path: true, sha256: true, purgedAt: true },
  })
  if (!row || !isOpsBucket(row.bucket)) return { ok: false, reason: 'missing' }
  if (row.purgedAt) return { ok: false, reason: 'purged' }
  const stream = await getStorage().openRead(row.bucket, row.path)
  if (!stream) return { ok: false, reason: 'missing' }
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  const actual = sha256OfBytes(bytes)
  return actual === row.sha256
    ? { ok: true, sha256: actual, bytes }
    : { ok: false, reason: 'tampered', expected: row.sha256, actual }
}
