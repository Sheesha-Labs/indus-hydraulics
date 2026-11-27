import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import type { Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { sniff } from '../intake/parse/index'
import { getSetting } from '../settings/get'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * Supplier document files (S10-T04/T06, ADR-21, C19): a signed upload URL into ops-uploads, the browser PUTs the
 * file, then the server reads it back, sniffs its magic bytes (PDF, PNG, JPEG only; the extension must agree), caps
 * it at the intake limit (20 MB), hashes it and only then records `stored_file`. Keys carry ids only:
 * `supplier/<supplierId>/<scope>[/<requestId>]/<uuid>.<ext>`; the person's file name lives in the stored_file row.
 */
export type SupplierFileScope = 'documents' | 'request' | 'price-list' | 'bank'

const EXT_SNIFF: Record<string, 'pdf' | 'image'> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
}
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const UUID_RE = new RegExp(`^${UUID}$`)
const NOT_ARRIVED = 'The upload did not arrive. Try again.'

const extOf = (name: string) => /\.([a-z0-9]{1,5})$/i.exec(name.trim())?.[1]?.toLowerCase() ?? ''

export function supplierFilePrefix(
  supplierId: string,
  scope: SupplierFileScope,
  requestId?: string
): string {
  if (!UUID_RE.test(supplierId) || (requestId && !UUID_RE.test(requestId)))
    throw new Error('unsafe supplier file path')
  return requestId
    ? `supplier/${supplierId}/${scope}/${requestId}`
    : `supplier/${supplierId}/${scope}`
}

export function isSupplierFileKey(prefix: string, key: string): boolean {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped}/${UUID}\\.(pdf|png|jpe?g)$`).test(key)
}

async function maxBytes(): Promise<number> {
  return (await getSetting('intake')).maxUploadMb * 1024 * 1024
}

/** Why a file is refused before a URL is issued, or null. */
export function supplierFileRefusal(f: { name: string; size: number }, max: number): string | null {
  if (!Number.isInteger(f.size) || f.size <= 0) return 'That file is empty.'
  if (f.size > max) return `That file is over ${Math.round(max / (1024 * 1024))} MB.`
  if (!EXT_SNIFF[extOf(f.name)]) return 'Use a PDF, PNG or JPEG file.'
  if (!f.name.trim() || f.name.length > 200) return 'Rename the file and try again.'
  return null
}

export async function createSupplierUpload(prefix: string, f: { name: string; size: number }) {
  const refused = supplierFileRefusal(f, await maxBytes())
  if (refused) throw new SafeError(refused)
  const key = `${prefix}/${randomUUID()}.${extOf(f.name)}`
  const { url } = await getStorage().createSignedUploadUrl(OPS_BUCKETS.uploads, key)
  return { key, uploadUrl: url }
}

export interface VerifiedSupplierFile {
  key: string
  mime: string
  sizeBytes: number
  sha256: string
}

/** Read the object back and prove what it is; deletes it and throws a SafeError when it is not. No DB call. */
export async function verifySupplierObject(
  prefix: string,
  key: string,
  filename: string
): Promise<VerifiedSupplierFile> {
  if (!isSupplierFileKey(prefix, key)) throw new SafeError(NOT_ARRIVED)
  const want = EXT_SNIFF[extOf(key)]
  if (!want || EXT_SNIFF[extOf(filename)] !== want) throw new SafeError(NOT_ARRIVED)
  const storage = getStorage()
  const stream = await storage.openRead(OPS_BUCKETS.uploads, key)
  if (!stream) throw new SafeError(NOT_ARRIVED)
  const max = await maxBytes()
  const refuse = async (message: string): Promise<never> => {
    await storage.remove(OPS_BUCKETS.uploads, key)
    throw new SafeError(message)
  }
  const hash = createHash('sha256')
  const head: Uint8Array[] = []
  let headLen = 0
  let size = 0
  const reader = stream.getReader()
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
      if (headLen < 8_192) {
        head.push(value)
        headLen += value.length
      }
    }
  } finally {
    reader.releaseLock()
  }
  if (size === 0) return refuse('That file is empty.')
  const s = await sniff(new Uint8Array(Buffer.concat(head.map((p) => Buffer.from(p)))), filename)
  if (s.kind !== want || (want === 'image' && !['image/png', 'image/jpeg'].includes(s.mime)))
    return refuse('That file is not the PDF or image it says it is.')
  return { key, mime: s.mime, sizeBytes: size, sha256: hash.digest('hex') }
}

export async function recordSupplierFile(
  db: Pick<Prisma.TransactionClient, 'storedFile'>,
  v: VerifiedSupplierFile,
  filename: string,
  source: 'upload' | 'client_portal',
  uploadedById: string | null
): Promise<string> {
  const row = await db.storedFile.create({
    data: {
      bucket: OPS_BUCKETS.uploads,
      path: v.key,
      filename: filename.trim().slice(0, 200) || 'document',
      mimeType: v.mime,
      sizeBytes: v.sizeBytes,
      sha256: v.sha256,
      source,
      uploadedById,
    },
    select: { id: true },
  })
  return row.id
}
