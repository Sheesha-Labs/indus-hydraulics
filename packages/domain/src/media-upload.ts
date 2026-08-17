/**
 * Upload rules for the media library — what may be uploaded, and where it
 * lands.
 *
 * Pure and I/O-free so the same rules run in three places: the browser, before
 * the operator sits through an upload; the server, before it issues a signed
 * URL; and the server again, after the bytes have landed. The client copy is
 * advisory — it exists to fail fast, never to be trusted.
 *
 * Two rules here are security boundaries rather than conveniences, and both
 * follow the precedent set by the RFQ attachment signer:
 *
 *   - The extension comes from the DECLARED CONTENT TYPE, never from the
 *     supplied filename. A filename is untrusted input and is kept only as a
 *     display label.
 *   - The storage key is minted server-side and re-verified on finalise, so a
 *     caller cannot point a new database row at an object it does not own.
 */

export type MediaUploadKind = 'image' | 'document' | 'cad'

/** 25 MB, matching the RFQ attachment ceiling and the bucket's own limit. */
export const MAX_MEDIA_UPLOAD_BYTES = 25 * 1024 * 1024

/**
 * Accepted types, mapped to the extension used on disk.
 *
 * Deliberately an allowlist. SVG is excluded: it is an executable document
 * that a browser will happily run scripts from, and it would be served from
 * the public bucket on our own origin.
 */
export const MEDIA_UPLOAD_TYPES: Record<string, { ext: string; kind: MediaUploadKind }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image' },
  'image/png': { ext: 'png', kind: 'image' },
  'image/webp': { ext: 'webp', kind: 'image' },
  'image/avif': { ext: 'avif', kind: 'image' },
  'image/gif': { ext: 'gif', kind: 'image' },
  'application/pdf': { ext: 'pdf', kind: 'document' },
  'model/step': { ext: 'step', kind: 'cad' },
  'application/step': { ext: 'step', kind: 'cad' },
  'model/iges': { ext: 'iges', kind: 'cad' },
}

/** For the file input's `accept`, so the picker filters before anyone chooses. */
export const MEDIA_UPLOAD_ACCEPT = Object.keys(MEDIA_UPLOAD_TYPES).join(',')

/** Operator-facing list, used in the dropzone hint and in error copy. */
export const MEDIA_UPLOAD_ACCEPT_LABEL = 'JPG, PNG, WebP, AVIF, GIF, PDF, STEP or IGES'

export interface UploadCandidate {
  filename: string
  contentType: string
  bytes: number
}

export type UploadCheck = { ok: true; kind: MediaUploadKind; ext: string } | { ok: false; message: string }

/**
 * Whether a file may be uploaded at all.
 *
 * Messages are written for the person holding the file, not for a log — they
 * say what was wrong and what would work instead.
 */
export function checkMediaUpload(file: UploadCandidate): UploadCheck {
  if (file.bytes <= 0) {
    return { ok: false, message: `"${file.filename}" is empty.` }
  }
  if (file.bytes > MAX_MEDIA_UPLOAD_BYTES) {
    const mb = (file.bytes / 1024 / 1024).toFixed(1)
    return {
      ok: false,
      message: `"${file.filename}" is ${mb} MB — keep it under ${MAX_MEDIA_UPLOAD_BYTES / 1024 / 1024} MB.`,
    }
  }
  // Normalised because browsers append parameters, e.g. "text/plain; charset=…".
  const type = file.contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  const match = MEDIA_UPLOAD_TYPES[type]
  if (!match) {
    return {
      ok: false,
      message: `"${file.filename}" is not a type we accept. Use ${MEDIA_UPLOAD_ACCEPT_LABEL}.`,
    }
  }
  return { ok: true, kind: match.kind, ext: match.ext }
}

/**
 * Where an upload lands.
 *
 * `library/YYYY-MM/<uuid>.<ext>`. Dated so a bucket listing stays navigable at
 * thousands of objects, and uuid-named because the display name lives in the
 * database — an operator's filename never becomes a path, so there is nothing
 * to sanitise, collide, or traverse with.
 *
 * The folder shown in the library is derived from usage, not from this path.
 * They are deliberately unrelated: a file's storage location is permanent, and
 * what references it is not.
 */
export function mediaStorageKey(opts: { uuid: string; ext: string; now: Date }): string {
  const month = `${opts.now.getUTCFullYear()}-${String(opts.now.getUTCMonth() + 1).padStart(2, '0')}`
  return `library/${month}/${opts.uuid}.${opts.ext}`
}

/**
 * Re-checks that a key has the shape this server mints.
 *
 * Called on finalise, before a database row is written against a
 * client-supplied key. Without it, a caller who can reach the action could
 * point a new `media` row at any object in the bucket — including one it
 * should not be able to read — and the library would then happily serve it.
 */
export function isMintedMediaKey(key: string): boolean {
  return MINTED_KEY.test(key)
}

/**
 * The extension is an alternation of the extensions we actually issue, not a
 * generic `[a-z0-9]{2,5}` — that earlier form accepted `…/<uuid>.pngx`,
 * because "pngx" is a plausible-looking four-character extension. Deriving it
 * from the type map means the check can never drift from what we mint.
 *
 * Shape is only half the guarantee. `finaliseMediaUpload` also lists the
 * object to confirm the bytes actually landed and to re-measure them, so a
 * well-formed key naming an object that does not exist is refused.
 */
const MINTED_KEY = new RegExp(
  `^library/\\d{4}-\\d{2}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(?:${[
    ...new Set(Object.values(MEDIA_UPLOAD_TYPES).map((t) => t.ext)),
  ].join('|')})$`
)

/**
 * A sensible starting alt text, offered but never auto-saved.
 *
 * `HP001_brass-fitting.png` becomes `HP001 brass fitting`. It is a prompt, not
 * an answer — real alt text describes the picture, and a filename rarely does.
 * Bazar captures nothing at upload, which is why every asset there has none.
 */
export function suggestAltFromFilename(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '')
  return stem
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}
