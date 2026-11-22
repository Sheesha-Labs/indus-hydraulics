/**
 * Neutral local seed for Indus Operations (S02-T03): `bun run --filter @indus/ops-db db:seed`.
 *
 *   SEED_DEMO=1 DATABASE_URL=postgresql://postgres:postgres@localhost:54329/postgres bun run --filter @indus/ops-db db:seed
 *
 * Idempotent: every row is an upsert on its natural key, so running it twice changes nothing the second
 * time. Refusal rules (seed-guard.ts): local hosts only, unless SEED_ALLOW_REMOTE=1 with SEED_DEMO unset;
 * demo people are written only with SEED_DEMO=1, which is therefore local only.
 *
 * With SEED_DEMO=1 it creates the two demo users the e2e and visual tests sign in as (the `ops-test`
 * provider): owner@example.test (Owner Example, OE) and helper@example.test (Helper Example, HE,
 * canSeeMargins false). Nothing else yet: screens add their fixtures in later sprints.
 *
 * The local database enforces one active Owner, so an existing active Owner under another address is left
 * as it is and the demo Owner is skipped (the run says so).
 */
import { PrismaClient } from '#ops-client'
import { decideSeed } from './seed-guard'

export interface SeedUser {
  email: string
  name: string
  initials: string
  role: 'owner' | 'helper'
  canSeeMargins: boolean
}

export const DEMO_USERS: readonly SeedUser[] = [
  {
    email: 'owner@example.test',
    name: 'Owner Example',
    initials: 'OE',
    role: 'owner',
    // The Owner sees margins whatever the flag says (can()); the column keeps its default.
    canSeeMargins: false,
  },
  {
    email: 'helper@example.test',
    name: 'Helper Example',
    initials: 'HE',
    role: 'helper',
    canSeeMargins: false,
  },
]

/** Upsert people by email, active. Returns what happened to each, for the run's log. */
export async function upsertUsers(
  db: PrismaClient,
  users: readonly SeedUser[]
): Promise<Array<{ email: string; result: 'upserted' | 'skipped: another active Owner exists' }>> {
  const out: Array<{ email: string; result: 'upserted' | 'skipped: another active Owner exists' }> =
    []
  for (const u of users) {
    if (u.role === 'owner') {
      const other = await db.user.findFirst({
        where: { role: 'owner', status: 'active', NOT: { email: u.email } },
        select: { id: true },
      })
      if (other) {
        out.push({ email: u.email, result: 'skipped: another active Owner exists' })
        continue
      }
    }
    const fields = {
      name: u.name,
      initials: u.initials,
      role: u.role,
      status: 'active' as const,
      canSeeMargins: u.canSeeMargins,
    }
    await db.user.upsert({
      where: { email: u.email },
      update: fields,
      create: { email: u.email, ...fields },
    })
    out.push({ email: u.email, result: 'upserted' })
  }
  return out
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  const decision = decideSeed(url, process.env)
  if (!decision.ok) {
    console.error(`ops seed: ${decision.reason}`)
    process.exit(1)
  }
  const db = new PrismaClient({ datasources: { db: { url: url! } } })
  try {
    if (!decision.demo) {
      console.log(`ops seed (${decision.host}): nothing to seed without SEED_DEMO=1 yet.`)
      return
    }
    for (const r of await upsertUsers(db, DEMO_USERS))
      console.log(`ops seed: ${r.email} ${r.result}`)
  } finally {
    await db.$disconnect()
  }
}

if (import.meta.main) await main()
