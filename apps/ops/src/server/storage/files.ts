import 'server-only'
import { opsDb } from '@indus/ops-db'
import { isOpsBucket } from './buckets'
import { getStorage } from './storage'

/** Signed read URLs live one minute (ADR-21): long enough to load, too short to share. */
export const SIGNED_URL_SECONDS = 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * A 60-second signed URL for a stored file, or null when the id is not a file, the file was purged,
 * it sits outside the Ops buckets, or the object is gone. The caller has already checked the session.
 */
export async function signedUrlForFile(id: string): Promise<string | null> {
  if (!UUID.test(id)) return null
  const row = await opsDb.storedFile.findUnique({
    where: { id },
    select: { bucket: true, path: true, purgedAt: true },
  })
  if (!row || row.purgedAt || !isOpsBucket(row.bucket)) return null
  return getStorage().createSignedUrl(row.bucket, row.path, SIGNED_URL_SECONDS)
}

/**
 * A stored file as /api/files serves it (S11-T04): where it lives, its name, and the kinds of the documents it
 * belongs to (for the role check). One query.
 */
export async function fileForServing(id: string) {
  if (!UUID.test(id)) return null
  const row = await opsDb.storedFile.findUnique({
    where: { id },
    select: {
      bucket: true,
      path: true,
      filename: true,
      mimeType: true,
      purgedAt: true,
      documentVersions: { select: { document: { select: { kind: true } } } },
    },
  })
  if (!row || row.purgedAt || !isOpsBucket(row.bucket)) return null
  return {
    bucket: row.bucket,
    path: row.path,
    filename: row.filename,
    mimeType: row.mimeType,
    kinds: [...new Set(row.documentVersions.map((v) => v.document.kind))],
  }
}
