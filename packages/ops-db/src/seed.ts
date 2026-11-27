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

/**
 * S03-T05: the demo Owner has seen the first-run welcome, so Today opens on Today for every e2e and visual
 * test that signs in as the Owner (otherwise Today redirects to /welcome until "Start setup" is pressed).
 * The welcome-once redirect itself is covered by apps/ops/src/server/setup/progress.db.test.ts; the
 * welcome page still opens directly at /welcome.
 */
export async function markDemoWelcomeSeen(db: PrismaClient): Promise<void> {
  const owner = await db.user.findUnique({
    where: { email: 'owner@example.test' },
    select: { id: true },
  })
  if (!owner) return
  await db.tipState.upsert({
    where: { userId_tipKey: { userId: owner.id, tipKey: 'welcome.seen' } },
    create: { userId: owner.id, tipKey: 'welcome.seen' },
    update: {},
  })
}

/**
 * S10-T06 · the trade taxonomy: structure only (names and order), idempotent by slug. No brand, no supplier and no
 * margin (defaultMarginPct is the Owner's, set in Settings › Pricing, S34). Structural, so it runs on every seed,
 * production included (SEED_ALLOW_REMOTE=1, SEED_DEMO unset).
 */
export const TRADE_TAXONOMY: ReadonlyArray<readonly [string, readonly string[]]> = [
  [
    'Hydraulics',
    [
      'Hydraulic hose',
      'Hose fittings',
      'Adapters',
      'Quick couplings',
      'Cylinders',
      'Pumps and motors',
      'Hydraulic valves',
      'Filters',
    ],
  ],
  [
    'Valves',
    [
      'Ball valves',
      'Gate valves',
      'Globe valves',
      'Butterfly valves',
      'Check valves',
      'Control valves',
      'Actuators',
    ],
  ],
  ['Bearings and power transmission', []],
  ['Instrumentation', ['Gauges', 'Transmitters', 'Level instruments']],
  ['Pneumatics', []],
  ['Seals and gaskets', []],
  ['Pipes, tubes and flanges', []],
  ['Lifting and rigging', []],
  ['Industrial hose', []],
  ['Lubrication', []],
  ['Marine', []],
]

const slugOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export async function seedTrades(db: PrismaClient): Promise<{ created: number }> {
  let created = 0
  for (const [i, [name, children]] of TRADE_TAXONOMY.entries()) {
    // By slug, else a trade a person already named the same (kept as it is).
    const before =
      (await db.trade.findUnique({ where: { slug: slugOf(name) }, select: { id: true } })) ??
      (await db.trade.findUnique({ where: { name }, select: { id: true } }))
    const parent =
      before ??
      (await db.trade.create({
        data: { name, slug: slugOf(name), position: i + 1 },
        select: { id: true },
      }))
    if (!before) created++
    for (const [j, child] of children.entries()) {
      const slug = `${slugOf(name)}-${slugOf(child)}`
      const had =
        (await db.trade.findUnique({ where: { slug }, select: { id: true } })) ??
        (await db.trade.findUnique({ where: { name: child }, select: { id: true } }))
      if (had) continue
      await db.trade.create({ data: { name: child, slug, parentId: parent.id, position: j + 1 } })
      created++
    }
  }
  return { created }
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
    const trades = await seedTrades(db)
    console.log(`ops seed (${decision.host}): trade taxonomy, ${trades.created} created`)
    if (!decision.demo) return
    for (const r of await upsertUsers(db, DEMO_USERS))
      console.log(`ops seed: ${r.email} ${r.result}`)
    await markDemoWelcomeSeen(db)
  } finally {
    await db.$disconnect()
  }
}

if (import.meta.main) await main()
