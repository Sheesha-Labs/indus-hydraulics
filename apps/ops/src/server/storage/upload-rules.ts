import { OPS_BUCKETS, type OpsBucket } from './buckets'

/**
 * The pure rules of an upload (ADR-21, C19): which kinds of file Ops takes, in which bucket, what a
 * stored object is called, and how the first bytes prove what a file is. No I/O; `uploads.ts` applies
 * them around Storage and the database.
 */

export type UploadMime = 'image/png' | 'image/jpeg'

export type UploadKindSpec = {
  bucket: OpsBucket
  /** The types a person may upload for this kind; the magic bytes must agree. */
  mimes: readonly UploadMime[]
  label: string
}

/** Setup 1 (board 79): the logo takes PNG or JPEG; the stamp and signatures PNG (transparent). */
export const UPLOAD_KINDS = {
  logo: { bucket: OPS_BUCKETS.company, mimes: ['image/png', 'image/jpeg'], label: 'Logo' },
  stamp: { bucket: OPS_BUCKETS.company, mimes: ['image/png'], label: 'Stamp' },
  signature: { bucket: OPS_BUCKETS.company, mimes: ['image/png'], label: 'Signature' },
} as const satisfies Record<string, UploadKindSpec>

export type UploadKind = keyof typeof UPLOAD_KINDS

export const UPLOAD_KIND_KEYS = Object.keys(UPLOAD_KINDS) as UploadKind[]

const EXT: Record<UploadMime, readonly string[]> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
}

/** The bytes needed to recognise every type Ops takes. */
export const SNIFF_BYTES = 16

/** PNG 89 50 4E 47 0D 0A 1A 0A; JPEG FF D8 FF. Null when the bytes are neither. */
export function sniffMime(head: Uint8Array): UploadMime | null {
  const at = (i: number) => head[i]
  if (
    head.length >= 8 &&
    at(0) === 0x89 &&
    at(1) === 0x50 &&
    at(2) === 0x4e &&
    at(3) === 0x47 &&
    at(4) === 0x0d &&
    at(5) === 0x0a &&
    at(6) === 0x1a &&
    at(7) === 0x0a
  ) {
    return 'image/png'
  }
  if (head.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'image/jpeg'
  return null
}

/**
 * A safe object name from a person's file name: ASCII letters, digits and single hyphens, lower case,
 * at most 60 characters, never empty ("file"). The extension is NOT taken from the name: it comes from
 * the declared type, so `logo.png.exe` cannot keep `.exe`.
 */
export function slugFilename(name: string): string {
  const base = name.replace(/\.[a-z0-9]{1,5}$/i, '')
  const slug = base
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return slug || 'file'
}

/** The extension for a type, keeping the person's spelling when it is one of the type's own. */
export function extensionFor(mime: UploadMime, filename: string): string {
  const own = /\.([a-z0-9]+)$/i.exec(filename)?.[1]?.toLowerCase()
  const allowed = EXT[mime]
  return own && allowed.includes(own) ? own : allowed[0]!
}

/** A path segment Ops chose (a record type, a uuid, a kind): lower-case letters, digits, hyphens. */
const SEGMENT = /^[a-z0-9][a-z0-9-]{0,63}$/

/** `company-profile/logo`, `company-profile/signature/<userId>`. */
export function objectPrefix(parts: readonly string[]): string {
  for (const p of parts) {
    if (!SEGMENT.test(p)) throw new Error(`unsafe storage path segment: ${JSON.stringify(p)}`)
  }
  return parts.join('/')
}

/** `<prefix>/<uuid>-<slug>.<ext>`. */
export function objectKey(prefix: string, id: string, filename: string, mime: UploadMime): string {
  return `${prefix}/${id}-${slugFilename(filename)}.${extensionFor(mime, filename)}`
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

/** True when `key` is one `objectKey(prefix, …)` could have produced: no `..`, no other prefix. */
export function isKeyUnder(prefix: string, key: string): boolean {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped}/${UUID}-[a-z0-9-]{1,60}\\.[a-z0-9]{1,5}$`).test(key)
}

export type UploadRequest = {
  kind: UploadKind
  filename: string
  size: number
  mime: string
}

/** Why a requested upload is refused before a URL is issued, or null. Sentences for the person. */
export function uploadRefusal(req: UploadRequest, maxUploadMb: number): string | null {
  const spec = UPLOAD_KINDS[req.kind]
  if (!Number.isInteger(req.size) || req.size <= 0) return 'That file is empty.'
  if (req.size > maxUploadMb * 1024 * 1024) return `That file is over ${maxUploadMb} MB.`
  if (!(spec.mimes as readonly string[]).includes(req.mime)) {
    return `${spec.label}: use ${spec.mimes.map((m) => (m === 'image/png' ? 'PNG' : 'JPEG')).join(' or ')}.`
  }
  if (req.filename.trim().length === 0 || req.filename.length > 200)
    return 'Rename the file and try again.'
  return null
}
