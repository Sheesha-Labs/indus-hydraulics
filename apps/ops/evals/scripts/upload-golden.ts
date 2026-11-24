/**
 * Upload Ayush's labelled golden set to the private ops-evals bucket (S05-T04).
 *
 *   (cd apps/ops && bun --preload ./evals/preload.ts evals/scripts/upload-golden.ts ~/Documents/"Indus Ops Console"/evals/golden/classify.jsonl)
 *
 * The file name decides the key (golden/classify.jsonl or golden/link.jsonl). Each line must parse as JSON with
 * an `id` and an `expect`. Storage never overwrites: upload a new version under a dated key if one exists.
 */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { OPS_BUCKETS } from '../../src/server/storage/buckets'
import { getStorage } from '../../src/server/storage/storage'

async function main(): Promise<void> {
  const file = process.argv[2]
  if (!file) throw new Error('usage: upload-golden.ts <classify.jsonl | link.jsonl>')
  const name = basename(file)
  if (!/^(classify|link)(-\d{4}-\d{2}-\d{2})?\.jsonl$/.test(name)) {
    throw new Error(
      'The file must be classify.jsonl or link.jsonl (optionally with a -YYYY-MM-DD suffix)'
    )
  }
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n').filter((l) => l.trim())
  for (const [n, l] of lines.entries()) {
    const row = JSON.parse(l) as { id?: unknown; expect?: unknown }
    if (typeof row.id !== 'string' || !('expect' in row))
      throw new Error(`line ${n + 1}: needs "id" and "expect"`)
  }
  const res = await getStorage().upload(
    OPS_BUCKETS.evals,
    `golden/${name}`,
    new TextEncoder().encode(text),
    'application/x-ndjson'
  )
  console.log(
    res.existed
      ? `golden/${name} already exists: upload a dated copy instead`
      : `uploaded ${lines.length} cases → golden/${name}`
  )
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
