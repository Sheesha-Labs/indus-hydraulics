/**
 * Parity seed (S02-T03): upserts the people the design-parity runs need, from a JSON file OUTSIDE the
 * repository, into a LOCAL database only. The handoff's sample names never enter the repo (CLAUDE.md §12):
 * Ayush writes the file from the handoff, and this script only reads it.
 *
 *   OPS_PARITY_SEED="$OPS_HOME/parity-seed/users.json" \
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:54329/postgres \
 *   bun packages/ops-db/scripts/seed-parity.ts
 *
 * JSON shape (an array; every field required unless marked):
 *
 *   [
 *     {
 *       "email": string,            // the sign-in address (the ops-test provider signs in by email)
 *       "name": string,             // as the boards print it
 *       "initials": string,         // 1–3 letters
 *       "role": "owner" | "helper",
 *       "canSeeMargins": boolean    // optional, default false
 *     }
 *   ]
 *
 * Refuses any host that is not localhost / 127.0.0.1 / ::1 (no override), a path inside the repository, and
 * a file that does not match the shape. Idempotent (upsert by email); one active Owner, as in seed.ts.
 */
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { PrismaClient } from '#ops-client'
import { upsertUsers, type SeedUser } from '../src/seed'
import { decideLocalOnly } from '../src/seed-guard'

const REPO = resolve(dirname(new URL(import.meta.url).pathname), '..', '..', '..')

function fail(message: string): never {
  console.error(`ops parity seed: ${message}`)
  process.exit(1)
}

export function parseParityUsers(raw: unknown): SeedUser[] {
  if (!Array.isArray(raw)) throw new Error('the file must hold a JSON array')
  return raw.map((u, i) => {
    const r = u as Record<string, unknown>
    const where = `entry ${i + 1}`
    if (typeof r.email !== 'string' || !r.email.includes('@'))
      throw new Error(`${where}: email missing`)
    if (typeof r.name !== 'string' || !r.name.trim()) throw new Error(`${where}: name missing`)
    if (typeof r.initials !== 'string' || !/^[A-Za-z]{1,3}$/.test(r.initials))
      throw new Error(`${where}: initials must be 1–3 letters`)
    if (r.role !== 'owner' && r.role !== 'helper')
      throw new Error(`${where}: role must be owner or helper`)
    if (r.canSeeMargins !== undefined && typeof r.canSeeMargins !== 'boolean')
      throw new Error(`${where}: canSeeMargins must be true or false`)
    return {
      email: r.email.trim().toLowerCase(),
      name: r.name.trim(),
      initials: r.initials.toUpperCase(),
      role: r.role,
      canSeeMargins: r.canSeeMargins === true,
    }
  })
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  const decision = decideLocalOnly(url)
  if (!decision.ok) fail(decision.reason)
  const file = process.env.OPS_PARITY_SEED
  if (!file) fail('OPS_PARITY_SEED is not set (a JSON file outside the repository)')
  let path: string
  try {
    path = realpathSync(file)
  } catch {
    fail(`cannot read ${file}`)
  }
  if (!relative(realpathSync(REPO), path).startsWith('..'))
    fail('OPS_PARITY_SEED points inside the repository; keep sample names outside it')
  let users: SeedUser[]
  try {
    users = parseParityUsers(JSON.parse(readFileSync(path, 'utf8')))
  } catch (e) {
    fail(e instanceof Error ? e.message : 'the file does not parse')
  }
  const db = new PrismaClient({ datasources: { db: { url: url! } } })
  try {
    for (const r of await upsertUsers(db, users)) console.log(`ops parity seed: ${r.result}`)
  } finally {
    await db.$disconnect()
  }
}

if (import.meta.main) await main()
