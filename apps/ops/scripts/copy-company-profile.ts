/**
 * Copy the company's legal details ONCE from the website's settings into Indus Operations
 * (S03-T05, P01). After this, Ops owns the values: Setup 1 shows them tagged "Copied from previous
 * setup — check" until the Owner confirms them, and nothing in Ops reads the website's row again.
 *
 *   OPS_MIGRATION_URL=<postgres role URL> bun scripts/copy-company-profile.ts           (from apps/ops)
 *   … bun scripts/copy-company-profile.ts --dry-run       (checks and prints field names; writes nothing)
 *
 * Reads public.store_settings (legalName, vatTrn, registeredAddressLines, contactPhone, name, and website
 * if the column exists) over OPS_MIGRATION_URL, which must be the `postgres` role: ops_app has no rights
 * on `public`. Writes ops.settings_entry 'company.profile' (version-checked, copiedFrom 'website',
 * confirmedAt null) and one activity_event, in one transaction.
 *
 * Refusal rules: src/server/setup/copy-profile.ts (unit-tested). Before touching a non-local database it
 * checks that no Vercel build is running (a build and a script on the shared pooler can exhaust it).
 * Prints only the NAMES of the fields copied, never a value.
 */
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { PrismaClient, type Prisma } from '@indus/ops-db'
import { SETTINGS } from '../src/server/settings/registry'
import { settingSubjectId } from '../src/server/settings/subject-id'
import { isLocalHost, migrationUrlRefusal, planProfileCopy } from '../src/server/setup/copy-profile'

const KEY = 'company.profile'

function stop(message: string, code = 1): never {
  console.error(message)
  process.exit(code)
}

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } })

const url = process.env.OPS_MIGRATION_URL
const urlRefusal = migrationUrlRefusal(url)
if (urlRefusal || !url) stop(urlRefusal ?? 'OPS_MIGRATION_URL is not set.', 2)

if (!isLocalHost(url)) {
  const out = execFileSync('vercel', ['api', '/v6/deployments?state=BUILDING&limit=5'], {
    encoding: 'utf8',
  })
  const building =
    (JSON.parse(out.slice(out.indexOf('{'))) as { deployments?: unknown[] }).deployments ?? []
  if (building.length) stop('A Vercel build is running. Wait for it to finish, then run again.')
}

const db = new PrismaClient({ datasources: { db: { url } } })
try {
  const entry = await db.settingsEntry.findUnique({
    where: { key: KEY },
    select: { value: true, version: true },
  })
  if (!entry) stop(`${KEY} is missing: apply the settings_defaults_seed migration first.`)
  const current = SETTINGS[KEY].schema.safeParse(entry.value)
  if (!current.success) stop(`${KEY} does not match its schema; fix it in Settings first.`)

  // to_jsonb: a column the website does not have (website) is simply absent, never an error.
  const rows = await db.$queryRaw<{ row: Record<string, unknown> }[]>`
    SELECT to_jsonb(s) AS row FROM public.store_settings s ORDER BY s.id LIMIT 1`
  const plan = planProfileCopy(current.data, rows[0]?.row ?? null)
  if (!plan.ok) stop(plan.reason)

  console.log(`Fields to copy: ${plan.copied.join(', ')}`)
  if (values['dry-run']) {
    console.log('Dry run: nothing written.')
    process.exit(0)
  }

  await db.$transaction(async (tx) => {
    const { count } = await tx.settingsEntry.updateMany({
      where: { key: KEY, version: entry.version },
      data: { value: plan.profile as Prisma.InputJsonValue, version: { increment: 1 } },
    })
    if (count !== 1) throw new Error(`${KEY} changed while copying; run again.`)
    await tx.activityEvent.create({
      data: {
        actorKind: 'system',
        subjectType: 'settings',
        subjectId: settingSubjectId(KEY),
        kind: 'settings',
        field: KEY,
        note: `Copied once from the website settings: ${plan.copied.join(', ')}`,
        before: entry.value as Prisma.InputJsonValue,
        after: plan.profile as Prisma.InputJsonValue,
      },
    })
  })
  console.log(`Copied into ${KEY} (copiedFrom: website, unconfirmed). Check them on Setup 1.`)
} finally {
  await db.$disconnect()
}
