/**
 * Create the Owner account (once). Refuses if an active Owner exists.
 *
 *   bun scripts/create-owner.ts --email <workspace address> --name "<full name>" --initials <XX>
 *
 * Connects with DIRECT_URL. Before touching a non-local database it checks that
 * no Vercel build is running (owner rule: a build and a script on the shared
 * pooler can exhaust it). Prints the new user's id only.
 */
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { PrismaClient } from '@indus/ops-db'

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, initials: { type: 'string' } },
})
const email = values.email?.trim().toLowerCase()
const name = values.name?.trim()
const initials = values.initials?.trim().toUpperCase()
const domain = (process.env.GOOGLE_WORKSPACE_DOMAIN ?? 'indushydraulics.me').toLowerCase()

if (!email || !name || !initials) throw new Error('--email, --name and --initials are required')
if (!email.endsWith('@' + domain)) throw new Error(`The email must be an @${domain} address`)
if (initials.length > 3) throw new Error('--initials must be at most 3 letters')

const url = process.env.DIRECT_URL
if (!url) throw new Error('DIRECT_URL is not set')
const host = new URL(url).hostname
if (!['localhost', '127.0.0.1'].includes(host)) {
  const out = execFileSync('vercel', ['api', '/v6/deployments?state=BUILDING&limit=5'], {
    encoding: 'utf8',
  })
  const building =
    (JSON.parse(out.slice(out.indexOf('{'))) as { deployments?: unknown[] }).deployments ?? []
  if (building.length) throw new Error('A Vercel build is running. Wait for it to finish.')
}

const db = new PrismaClient({ datasources: { db: { url } } })
try {
  const owner = await db.user.findFirst({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  if (owner) throw new Error('An active Owner already exists')
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, name, initials, role: 'owner', status: 'active' },
      select: { id: true },
    })
    await tx.authEvent.create({ data: { userId: created.id, kind: 'invite_accepted' } })
    return created
  })
  console.log(user.id)
} finally {
  await db.$disconnect()
}
