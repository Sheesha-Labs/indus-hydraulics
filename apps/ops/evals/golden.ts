/**
 * The private golden set (S05-T04): real mail labelled by Ayush, kept ONLY in the private `ops-evals` bucket.
 * loadGolden copies `golden/<suite>.jsonl` to $TMPDIR/ops-evals for the run and reads it from there; nothing
 * is ever written under the repository (the folder is git-ignored as a second guard).
 *
 * Needs OPS_EVALS_BUCKET_READ=1 and the storage credentials of a local .env (CLAUDE.md §13.6).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { OPS_BUCKETS } from '../src/server/storage/buckets'
import { getStorage } from '../src/server/storage/storage'

export const GOLDEN_DIR = join(tmpdir(), 'ops-evals')

export async function loadGolden<T>(suite: 'classify' | 'link'): Promise<T[]> {
  if (process.env.OPS_EVALS_BUCKET_READ !== '1') {
    throw new Error('Set OPS_EVALS_BUCKET_READ=1 to read the private golden set (local runs only)')
  }
  const key = `golden/${suite}.jsonl`
  const stream = await getStorage().openRead(OPS_BUCKETS.evals, key)
  if (!stream)
    throw new Error(`No ${key} in the ops-evals bucket yet: run scripts/upload-golden.ts first`)
  const text = await new Response(stream).text()
  mkdirSync(GOLDEN_DIR, { recursive: true })
  const local = join(GOLDEN_DIR, `${suite}.jsonl`)
  writeFileSync(local, text)
  return readFileSync(local, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T)
}
