/**
 * One-off: fill in `media.bytes` for rows that were inserted without a size.
 *
 * WHAT IS ACTUALLY WRONG WITH THESE ROWS
 *
 * Every affected row is a `document` whose `storagePath` is a THIRD-PARTY URL
 * — DuPont for the Molykote datasheets, Sealfast for the coupling sheets.
 * Nothing was ever uploaded for them, so there is no object in our buckets to
 * read a size back from. Two producers inserted them:
 *
 *   - `import-molykote-content.ts`, which links each sheet at its DuPont URL
 *     on purpose so a superseded sheet is never served from our storage.
 *   - `addProductDocument`, the legacy URL-based attach in the products admin.
 *
 * Both hard-coded `bytes: 0`. Both are fixed now; this script repairs what
 * they already wrote.
 *
 * WHAT `bytes` MEANS AFTERWARDS, AND WHAT IT DOES NOT
 *
 * For these rows it is the real size of a file on someone else's server. That
 * is the right number for the per-row size in the library, which currently
 * shows a dash. It is NOT storage we pay for and NOT space that deleting the
 * row would reclaim, so `/admin/media`'s "reclaimable" figure will start
 * counting bytes that cannot in fact be reclaimed. Deciding whether that
 * total should exclude externally-hosted rows is a product question and is
 * deliberately left alone here — this script only stops the column lying
 * about the file being of unknown size.
 *
 * HOW IT RESOLVES A PATH
 *
 * All four `storagePath` shapes are handled, via `parseMediaStoragePath`:
 *
 *   supabase-public  →  list the object in the bucket, read `metadata.size`
 *   bucket-key       →  same
 *   bare-key         →  same, tried against each known bucket in turn
 *   external-url     →  HEAD the host, falling back to a one-byte ranged GET
 *
 * Distinct paths are resolved once and applied to every row that shares them
 * — `storagePath` is deliberately not unique and 227 rows already share one
 * with another row, so measuring per row would be several times the requests
 * for the same answers.
 *
 * SAFETY
 *
 * Read-and-update only. Nothing is deleted, no object is touched, and no row
 * is trashed. Rows that cannot be resolved are left exactly as they are and
 * listed at the end. A dry run is the default; `--apply` is required to write.
 *
 * Usage:
 *   pnpm --filter @indus/db tsx src/scripts/backfill-media-bytes.ts [--apply]
 *     [--limit=N] [--concurrency=N] [--timeout-ms=N] [--verbose]
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { parseMediaStoragePath, measureRemoteBytes, type MediaStorageRef } from '@indus/domain'

const db = new PrismaClient()

const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/** Mirrors `STORAGE_BUCKETS` in apps/web/src/lib/supabase-admin.ts. */
const BUCKETS = ['product-images', 'product-documents'] as const

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase credentials
 * only live in the web app's env file. Anything already exported wins.
 * Same loader as `import-molykote-content.ts`.
 */
function loadWebEnv(): void {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]!
    if (process.env[key]) continue
    process.env[key] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

/** Why a path could not be turned into a size. Drives the closing report. */
type Failure =
  /** Resolvable, reached, and the thing it names is not there. Orphaned. */
  | { reason: 'orphaned'; detail: string }
  /** Reached, present, but nobody would tell us how big it is. */
  | { reason: 'unmeasurable'; detail: string }
  /** No answer at all. Retryable — re-run before drawing any conclusion. */
  | { reason: 'unreachable'; detail: string }
  /** Not a shape we can address: empty, or a bare key in no known bucket. */
  | { reason: 'unresolvable'; detail: string }

type Resolution = { ok: true; bytes: number; via: string } | ({ ok: false } & Failure)

/** The two fields of a Supabase storage listing this script reads. */
interface StorageObject {
  name: string
  metadata: { size?: number } | null
}

/**
 * Size of an object in one of our buckets.
 *
 * `list` with a `search`, then an exact-name match — the same approach as
 * `finaliseMediaUpload`. `search` is a prefix filter, not an equality test, so
 * `sheet.pdf` also returns `sheet.pdf.bak`; taking the first hit would report
 * a neighbouring file's size. Hence the explicit `o.name === name`.
 */
async function sizeInBucket(
  sb: SupabaseClient,
  bucket: string,
  key: string
): Promise<{ found: true; bytes: number | null } | { found: false; error: string | null }> {
  const slash = key.lastIndexOf('/')
  const folder = slash > 0 ? key.slice(0, slash) : ''
  const name = key.slice(slash + 1)
  const { data, error } = await sb.storage.from(bucket).list(folder, { limit: 100, search: name })
  if (error) return { found: false, error: error.message }
  // Typed at the call site rather than inferred: this package has no types for
  // `@supabase/supabase-js` on its own tsconfig path, so `data` lands as
  // implicit `any[]` and the callback parameter with it.
  const object = (data as StorageObject[] | null)?.find((o) => o.name === name)
  if (!object) return { found: false, error: null }
  const size = object.metadata?.size
  return { found: true, bytes: typeof size === 'number' && size > 0 ? size : null }
}

async function resolve1(
  ref: MediaStorageRef,
  sb: SupabaseClient,
  timeoutMs: number
): Promise<Resolution> {
  switch (ref.kind) {
    case 'supabase-public':
    case 'bucket-key': {
      const hit = await sizeInBucket(sb, ref.bucket, ref.key)
      if (!hit.found) {
        return hit.error
          ? { ok: false, reason: 'unreachable', detail: `storage list: ${hit.error}` }
          : { ok: false, reason: 'orphaned', detail: `no object at ${ref.bucket}/${ref.key}` }
      }
      return hit.bytes === null
        ? { ok: false, reason: 'unmeasurable', detail: 'object has no size in its metadata' }
        : { ok: true, bytes: hit.bytes, via: `storage:${ref.bucket}` }
    }

    case 'bare-key': {
      // No bucket in the path, so try each one. First exact hit wins.
      const errors: string[] = []
      for (const bucket of BUCKETS) {
        const hit = await sizeInBucket(sb, bucket, ref.key)
        if (hit.found && hit.bytes !== null) return { ok: true, bytes: hit.bytes, via: `storage:${bucket}` }
        if (!hit.found && hit.error) errors.push(`${bucket}: ${hit.error}`)
      }
      return errors.length
        ? { ok: false, reason: 'unreachable', detail: errors.join('; ') }
        : { ok: false, reason: 'orphaned', detail: `bare key in no known bucket: ${ref.key}` }
    }

    case 'external-url': {
      const measured = await measureRemoteBytes(ref.url, { fetchImpl: fetch as never, timeoutMs })
      if (measured.ok) return { ok: true, bytes: measured.bytes, via: `http:${ref.host}` }
      return measured.reason === 'missing'
        ? { ok: false, reason: 'orphaned', detail: `${ref.host} says ${measured.detail}` }
        : { ok: false, reason: measured.reason, detail: measured.detail }
    }

    case 'unknown':
      return { ok: false, reason: 'unresolvable', detail: `unrecognised path ${JSON.stringify(ref.raw)}` }
  }
}

/** Bounded fan-out. The hosts are third parties; do not hammer them. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const i = next++
        if (i >= items.length) return
        out[i] = await fn(items[i]!, i)
      }
    })
  )
  return out
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let v = bytes / 1024
  let u = 0
  while (v >= 1024 && u < units.length - 1) { v /= 1024; u++ }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[u]}`
}

async function main(): Promise<void> {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const apply = argv.includes('--apply')
  const verbose = argv.includes('--verbose')
  const num = (flag: string, fallback: number): number => {
    const a = argv.find((x) => x.startsWith(`${flag}=`))
    const n = a ? Number(a.split('=')[1]) : NaN
    return Number.isFinite(n) && n > 0 ? n : fallback
  }
  const limit = num('--limit', Infinity)
  const concurrency = num('--concurrency', 6)
  const timeoutMs = num('--timeout-ms', 20_000)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const sb = createClient(url, key, { auth: { persistSession: false } })

  // Trashed rows are included on purpose: they are restorable, so leaving them
  // sizeless would just move the problem to whenever someone restores one.
  const rows = await db.media.findMany({
    where: { bytes: 0 },
    select: { id: true, kind: true, storagePath: true, originalFilename: true, deletedAt: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`[backfill] ${rows.length} media rows with bytes = 0${apply ? '' : '  (DRY RUN — pass --apply to write)'}`)
  if (rows.length === 0) return

  // One request per distinct path, not per row.
  const byPath = new Map<string, typeof rows>()
  for (const r of rows) {
    const list = byPath.get(r.storagePath)
    if (list) list.push(r)
    else byPath.set(r.storagePath, [r])
  }
  const paths = [...byPath.keys()].slice(0, limit === Infinity ? undefined : limit)
  console.log(`[backfill] ${paths.length} distinct storage paths to resolve, concurrency ${concurrency}`)

  const shapes = new Map<string, number>()
  for (const p of paths) {
    const k = parseMediaStoragePath(p).kind
    shapes.set(k, (shapes.get(k) ?? 0) + 1)
  }
  console.log(`[backfill] shapes: ${[...shapes].map(([k, n]) => `${k}=${n}`).join(', ')}`)

  let done = 0
  const results = await mapLimit(paths, concurrency, async (path) => {
    const res = await resolve1(parseMediaStoragePath(path), sb, timeoutMs)
    done++
    if (done % 10 === 0) console.log(`[backfill] resolved ${done}/${paths.length}…`)
    if (verbose) {
      console.log(res.ok ? `  ok   ${fmt(res.bytes).padStart(9)}  ${path}` : `  FAIL ${res.reason.padEnd(12)} ${path}`)
    }
    return { path, res }
  })

  // ── apply ────────────────────────────────────────────────────────────────
  let rowsUpdated = 0
  let pathsResolved = 0
  let bytesRecorded = 0
  const failures: { path: string; rows: number; f: Failure }[] = []

  for (const { path, res } of results) {
    const affected = byPath.get(path)!
    if (!res.ok) {
      failures.push({ path, rows: affected.length, f: res })
      continue
    }
    pathsResolved++
    bytesRecorded += res.bytes * affected.length
    if (apply) {
      // Re-assert `bytes: 0` in the filter so a row someone fixed while this
      // was running is left alone rather than overwritten.
      const updated = await db.media.updateMany({
        where: { id: { in: affected.map((r) => r.id) }, bytes: 0 },
        data: { bytes: res.bytes },
      })
      rowsUpdated += updated.count
    } else {
      rowsUpdated += affected.length
    }
  }

  // ── report ───────────────────────────────────────────────────────────────
  const byReason = new Map<Failure['reason'], { paths: number; rows: number }>()
  for (const f of failures) {
    const cur = byReason.get(f.f.reason) ?? { paths: 0, rows: 0 }
    byReason.set(f.f.reason, { paths: cur.paths + 1, rows: cur.rows + f.rows })
  }

  console.log('\n─────────────────────────────────────────────')
  console.log(`[backfill] ${apply ? 'APPLIED' : 'DRY RUN'}`)
  console.log(`  rows with bytes = 0          ${rows.length}`)
  console.log(`  distinct paths attempted     ${paths.length}`)
  console.log(`  paths resolved               ${pathsResolved}`)
  console.log(`  rows ${apply ? 'updated                 ' : 'that would be updated   '} ${rowsUpdated}`)
  console.log(`  total size now recorded      ${fmt(bytesRecorded)}`)
  console.log(`  paths unresolved             ${failures.length} (${rows.length - rowsUpdated} rows left at 0)`)
  for (const [reason, n] of byReason) {
    console.log(`    ${reason.padEnd(14)} ${n.paths} paths / ${n.rows} rows`)
  }

  if (failures.length) {
    // Orphans first — a row pointing at something that is not there is a
    // finding in its own right, not just a backfill miss.
    const order: Failure['reason'][] = ['orphaned', 'unmeasurable', 'unreachable', 'unresolvable']
    console.log('\n[backfill] unresolved paths:')
    for (const reason of order) {
      const group = failures.filter((f) => f.f.reason === reason)
      if (!group.length) continue
      console.log(`\n  ${reason.toUpperCase()} — ${group.length} paths / ${group.reduce((a, b) => a + b.rows, 0)} rows`)
      for (const g of group) {
        console.log(`    ${String(g.rows).padStart(3)} row(s)  ${g.f.detail}`)
        console.log(`             ${g.path}`)
        for (const r of byPath.get(g.path)!.slice(0, 3)) {
          console.log(`             · ${r.id}  ${r.originalFilename}${r.deletedAt ? '  [in trash]' : ''}`)
        }
        if (byPath.get(g.path)!.length > 3) console.log(`             · …and ${byPath.get(g.path)!.length - 3} more`)
      }
    }
  }

  if (!apply) console.log('\n[backfill] nothing written. Re-run with --apply to commit.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
