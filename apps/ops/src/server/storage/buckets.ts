/**
 * The Supabase Storage buckets of Indus Operations (architecture C29, ADR-21): the ONLY place a bucket
 * name is written. Every caller names a bucket through `OPS_BUCKETS.<x>`; `bucket-names.guard.test.ts`
 * fails the build on a string literal passed to `storage.from(…)`, on a bucket name written anywhere
 * else, and on any storefront bucket name in Ops code.
 *
 * Pure (no server-only): `scripts/create-buckets.ts` imports it outside Next.
 */

export const OPS_BUCKETS = {
  mail: 'ops-mail',
  documents: 'ops-documents',
  uploads: 'ops-uploads',
  company: 'ops-company',
  imports: 'ops-imports',
  evals: 'ops-evals',
  backup: 'ops-backup',
} as const

export type OpsBucketKey = keyof typeof OPS_BUCKETS
export type OpsBucket = (typeof OPS_BUCKETS)[OpsBucketKey]

export const OPS_BUCKET_NAMES = Object.values(OPS_BUCKETS) as readonly OpsBucket[]

export function isOpsBucket(name: string): name is OpsBucket {
  return (OPS_BUCKET_NAMES as readonly string[]).includes(name)
}

/**
 * The website's buckets. Ops never reads or writes them (its own buckets only, ADR-21); the guard test
 * fails on any of these names in Ops code outside this file.
 */
export const STOREFRONT_BUCKETS = [
  'product-images',
  'product-documents',
  'quotes',
  'blog-images',
  'industry-images',
  'service-images',
] as const

const MB = 1024 * 1024

export type BucketSpec = {
  /** Always false: every Ops bucket is private; files are served through 60-second signed URLs. */
  public: false
  /** C19: 25 MB for mail attachments (Gmail's own ceiling), 20 MB for everything else. */
  fileSizeLimit: number
  /** Storage refuses any other type at upload. Null: no bucket-level restriction (checked per kind). */
  allowedMimeTypes: readonly string[] | null
}

export const BUCKET_SPECS: Readonly<Record<OpsBucket, BucketSpec>> = {
  'ops-mail': { public: false, fileSizeLimit: 25 * MB, allowedMimeTypes: null },
  'ops-documents': { public: false, fileSizeLimit: 20 * MB, allowedMimeTypes: null },
  'ops-uploads': { public: false, fileSizeLimit: 20 * MB, allowedMimeTypes: null },
  'ops-company': {
    public: false,
    fileSizeLimit: 20 * MB,
    allowedMimeTypes: ['image/png', 'image/jpeg'],
  },
  'ops-imports': { public: false, fileSizeLimit: 20 * MB, allowedMimeTypes: null },
  'ops-evals': { public: false, fileSizeLimit: 20 * MB, allowedMimeTypes: null },
  'ops-backup': { public: false, fileSizeLimit: 20 * MB, allowedMimeTypes: null },
}

/** What the project already has, as `storage.listBuckets()` reports it. */
export type ExistingBucket = { name: string; public: boolean }

export type BucketPlanRow =
  | { name: OpsBucket; action: 'create'; spec: BucketSpec }
  | { name: OpsBucket; action: 'exists' }
  /** A bucket of ours that is PUBLIC: the script stops and changes nothing (a person decides). */
  | { name: OpsBucket; action: 'refuse'; reason: string }

/**
 * What `create-buckets.ts` will do: create each missing bucket with its spec, leave each existing
 * private one exactly as it is (never update, never touch its objects), and refuse when one of ours
 * is public. Pure, so the refusal rules are unit-tested.
 */
export function planBuckets(existing: readonly ExistingBucket[]): BucketPlanRow[] {
  const byName = new Map(existing.map((b) => [b.name, b]))
  return OPS_BUCKET_NAMES.map((name): BucketPlanRow => {
    const found = byName.get(name)
    if (!found) return { name, action: 'create', spec: BUCKET_SPECS[name] }
    if (found.public) {
      return {
        name,
        action: 'refuse',
        reason: 'exists and is PUBLIC; make it private in the dashboard, then run again',
      }
    }
    return { name, action: 'exists' }
  })
}

/** The printed table: name, action, limit, types. Never prints a key or an object. */
export function formatBucketPlan(rows: readonly BucketPlanRow[]): string {
  const lines = rows.map((r) => {
    const spec = BUCKET_SPECS[r.name]
    const limit = `${spec.fileSizeLimit / MB} MB`
    const types = spec.allowedMimeTypes?.join(', ') ?? 'any'
    const what = r.action === 'refuse' ? `REFUSED: ${r.reason}` : r.action
    return [r.name.padEnd(14), what.padEnd(10), limit.padEnd(6), types].join('  ')
  })
  return [
    ['bucket'.padEnd(14), 'action'.padEnd(10), 'limit'.padEnd(6), 'types'].join('  '),
    ...lines,
  ].join('\n')
}
