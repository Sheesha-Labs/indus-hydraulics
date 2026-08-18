/**
 * Where a `Media.storagePath` actually points, and how big the thing it points
 * at is.
 *
 * Two separate jobs, deliberately in one module because they are always used
 * together: you cannot measure a file until you know which of the four shapes
 * the path is, and knowing the shape is only ever useful in order to go and
 * read something.
 *
 * `parseMediaStoragePath` is pure and lives here rather than in the media
 * library because it answers a storage question, not a presentation one —
 * `mediaThumbnailSrc` in `media-library.ts` deliberately refuses to normalise
 * these shapes, since ~40 storefront call sites depend on the current
 * arrangement. This does not change what any of them read; it only lets a
 * caller that needs the bucket and key ask for them once instead of
 * re-implementing the regex, which `apps/web/src/lib/supabase-admin.ts` and
 * `apps/web/src/lib/supabase.ts` currently do with two different and
 * incompatible answers for a bare key.
 *
 * `measureRemoteBytes` takes an injected `fetch` so it is testable and so the
 * caller owns the timeout policy. It is the honest analogue, for an
 * externally-hosted file, of the storage re-list that `finaliseMediaUpload`
 * does after an upload: never trust a declared size, go and read the real one.
 */

/** A path we minted, pointing into one of our own Supabase buckets. */
export interface OwnedStorageRef {
  kind: 'supabase-public' | 'bucket-key'
  bucket: string
  key: string
}

/** A key with no bucket in it. The caller has to supply candidate buckets. */
export interface BareKeyRef {
  kind: 'bare-key'
  key: string
}

/** An absolute URL on a host that is not our Supabase project. */
export interface ExternalUrlRef {
  kind: 'external-url'
  url: string
  host: string
}

/** Empty, or something we cannot classify at all. */
export interface UnknownRef {
  kind: 'unknown'
  raw: string
}

export type MediaStorageRef = OwnedStorageRef | BareKeyRef | ExternalUrlRef | UnknownRef

/** Public-object URLs look like `…/storage/v1/object/public/<bucket>/<key>`. */
const SUPABASE_PUBLIC = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/

/**
 * Classifies a `storagePath` into one of the four shapes the column holds.
 *
 * The order of the tests is the whole correctness argument:
 *
 *   1. A Supabase public URL is checked BEFORE the generic-URL case, because
 *      it is a URL too — testing `http` first would file every one of our own
 *      public images under `external-url` and send the caller out over the
 *      network to measure a file it could have read from the bucket.
 *   2. The bucket-prefixed case is guarded on not starting with `http`, so a
 *      third-party URL never has `https:` read as a bucket name. This is the
 *      bug that `supabase.ts` still has: it slices on the first `/` without
 *      that guard and would ask for bucket `https:`.
 *   3. A path with no slash at all is a bare key. `supabase-admin.ts` returns
 *      a null bucket for these and `supabase.ts` returns the raw string; both
 *      are silent no-ops rather than an answer, which is why this exists.
 */
export function parseMediaStoragePath(storagePath: string): MediaStorageRef {
  const raw = storagePath.trim()
  if (!raw) return { kind: 'unknown', raw: storagePath }

  const publicMatch = raw.match(SUPABASE_PUBLIC)
  if (publicMatch) {
    return { kind: 'supabase-public', bucket: publicMatch[1]!, key: publicMatch[2]! }
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      return { kind: 'external-url', url: raw, host: new URL(raw).host }
    } catch {
      return { kind: 'unknown', raw: storagePath }
    }
  }

  const slash = raw.indexOf('/')
  if (slash > 0) return { kind: 'bucket-key', bucket: raw.slice(0, slash), key: raw.slice(slash + 1) }

  return { kind: 'bare-key', key: raw }
}

/** True when the path names an object in one of our own buckets. */
export function isOwnedStorageRef(ref: MediaStorageRef): ref is OwnedStorageRef {
  return ref.kind === 'supabase-public' || ref.kind === 'bucket-key'
}

// ── Measuring a remote file ─────────────────────────────────────────────────

export type RemoteSize =
  | { ok: true; bytes: number }
  /** Reached the host; it says there is nothing there. An orphaned link. */
  | { ok: false; reason: 'missing'; detail: string }
  /** Reachable and present, but no usable size — HEAD refused, no length. */
  | { ok: false; reason: 'unmeasurable'; detail: string }
  /** Never got an answer. Retryable; NOT evidence the file is gone. */
  | { ok: false; reason: 'unreachable'; detail: string }

// `| undefined` on the optional members is required, not noise: the package
// compiles with `exactOptionalPropertyTypes`, under which `headers?: X` refuses
// an explicit `undefined` and the HEAD call below passes exactly that.
type FetchLike = (
  url: string,
  init: {
    method: string
    redirect: 'follow'
    signal?: AbortSignal | undefined
    headers?: Record<string, string> | undefined
  }
) => Promise<{
  ok: boolean
  status: number
  headers: { get(name: string): string | null }
}>

function contentLength(headers: { get(name: string): string | null }): number | null {
  const raw = headers.get('content-length')
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null
}

/**
 * Reads a remote file's size without downloading it.
 *
 * HEAD first. When a host refuses HEAD — some CDNs answer 403 or 405 to it
 * while serving GET fine — fall back to a one-byte ranged GET and read the
 * total out of `Content-Range`. That costs a byte instead of the whole PDF,
 * which matters when the alternative is pulling ~200 KB × 76 files to learn
 * a number that is already in a header.
 *
 * A 404/410 is reported separately from a timeout on purpose. The first means
 * the row is orphaned and someone should look at it; the second means try
 * again later. Collapsing them would turn a flaky network into a false
 * orphan report, which is the kind of thing that gets a row deleted.
 */
export async function measureRemoteBytes(
  url: string,
  opts: { fetchImpl: FetchLike; timeoutMs?: number; signal?: AbortSignal }
): Promise<RemoteSize> {
  const { fetchImpl, timeoutMs = 20_000 } = opts

  const attempt = async (
    method: 'HEAD' | 'GET',
    headers?: Record<string, string>
  ): Promise<{ status: number; ok: boolean; headers: { get(n: string): string | null } }> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetchImpl(url, { method, redirect: 'follow', signal: controller.signal, headers })
    } finally {
      clearTimeout(timer)
    }
  }

  let headStatus = 0
  try {
    const head = await attempt('HEAD')
    headStatus = head.status
    if (head.status === 404 || head.status === 410) {
      return { ok: false, reason: 'missing', detail: `HTTP ${head.status}` }
    }
    if (head.ok) {
      const len = contentLength(head.headers)
      if (len !== null) return { ok: true, bytes: len }
    }
  } catch (err) {
    // Fall through to the ranged GET — a host that drops HEAD connections is
    // exactly the case the fallback exists for. If GET fails too, that error
    // is the one worth reporting.
    headStatus = -1
    void err
  }

  try {
    const ranged = await attempt('GET', { range: 'bytes=0-0' })
    if (ranged.status === 404 || ranged.status === 410) {
      return { ok: false, reason: 'missing', detail: `HTTP ${ranged.status}` }
    }
    // 206 carries `Content-Range: bytes 0-0/<total>`; a host that ignores the
    // range header answers 200 with the full `Content-Length`.
    const range = ranged.headers.get('content-range')
    const total = range?.match(/\/(\d+)\s*$/)?.[1]
    if (total) {
      const n = Number(total)
      if (Number.isFinite(n) && n > 0) return { ok: true, bytes: Math.trunc(n) }
    }
    if (ranged.status === 200) {
      const len = contentLength(ranged.headers)
      if (len !== null) return { ok: true, bytes: len }
    }
    return {
      ok: false,
      reason: 'unmeasurable',
      detail: `HEAD ${headStatus === -1 ? 'failed' : headStatus}, GET ${ranged.status}, no length`,
    }
  } catch (err) {
    return { ok: false, reason: 'unreachable', detail: err instanceof Error ? err.message : String(err) }
  }
}
