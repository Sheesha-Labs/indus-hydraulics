/**
 * Create the seven private Ops Storage buckets (architecture C29, ADR-21). Run once per Supabase project
 * (production at the S03 sprint close); safe to run again.
 *
 *   SUPABASE_URL=… SUPABASE_SECRET_KEY=… bun scripts/create-buckets.ts            (from apps/ops)
 *   … bun scripts/create-buckets.ts --dry-run                                     (prints the plan only)
 *
 * Rules (src/server/storage/buckets.ts `planBuckets`, unit-tested):
 *   - a missing bucket is created PRIVATE with its size limit (25 MB ops-mail, 20 MB the rest, C19) and,
 *     for ops-company, the allowed types image/png and image/jpeg;
 *   - an existing private bucket is left exactly as it is: never updated, never emptied, objects untouched;
 *   - an existing PUBLIC bucket of ours stops the run (exit 1) without changing anything.
 * Prints a table of bucket names and actions; never prints a key, a URL with a token, or an object.
 */
import { parseArgs } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { formatBucketPlan, planBuckets } from '../src/server/storage/buckets'

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY are required.')
  process.exit(2)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: existing, error } = await supabase.storage.listBuckets()
if (error || !existing) {
  console.error('Could not list buckets. Check the URL and the secret key.')
  process.exit(2)
}

const plan = planBuckets(existing.map((b) => ({ name: b.name, public: b.public })))
console.log(formatBucketPlan(plan))

const refused = plan.filter((r) => r.action === 'refuse')
if (refused.length) {
  console.error(
    `\nStopped: ${refused.map((r) => r.name).join(', ')} is public. Nothing was created.`
  )
  process.exit(1)
}
if (values['dry-run']) {
  console.log('\nDry run: nothing created.')
  process.exit(0)
}

let failed = 0
for (const row of plan) {
  if (row.action !== 'create') continue
  const { error: createError } = await supabase.storage.createBucket(row.name, {
    public: row.spec.public,
    fileSizeLimit: row.spec.fileSizeLimit,
    ...(row.spec.allowedMimeTypes ? { allowedMimeTypes: [...row.spec.allowedMimeTypes] } : {}),
  })
  if (createError) {
    failed += 1
    console.error(`${row.name}: create failed`)
  } else {
    console.log(`${row.name}: created (private)`)
  }
}
process.exit(failed ? 1 : 0)
