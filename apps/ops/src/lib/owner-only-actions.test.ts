import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { OpsRole, OpsUser } from './access-core'

/**
 * "A Helper calling any Owner-only action gets the defineAction refusal" (S03-T03, board 84).
 *
 * Imports EVERY module under src/ that builds an action with defineAction, then loops over the
 * registry defineAction keeps (`registeredActions()`): each action no Helper may run (a role list
 * without 'helper', or an Owner-only capability) is called as a Helper with every toggle on and an
 * input that would otherwise be valid enough to reach the handler. It must answer the forbidden
 * sentence, and the database must not be touched (the stand-in below throws on any use).
 *
 * A new Owner-only action is covered by being written: no list to keep here.
 */

const h = vi.hoisted(() => {
  const touched: string[] = []
  const trap: unknown = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'then') return undefined
        touched.push(String(prop))
        throw new Error(`database used: ${String(prop)}`)
      },
    }
  )
  const session = { user: null as OpsUser | null }
  return { touched, trap, session }
})

vi.mock('@indus/ops-db', () => ({ opsDb: h.trap, Prisma: {} }))
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('./env', () => ({
  env: () => ({
    APP_ENV: 'test',
    OPS_READ_ONLY: undefined,
    GOOGLE_WORKSPACE_DOMAIN: 'example.test',
  }),
}))
vi.mock('./auth', () => ({
  auth: async () => null,
  signIn: async () => undefined,
  signOut: async () => undefined,
}))
vi.mock('./access', async () => {
  const core = await import('./access-core')
  return {
    ...core,
    currentSessionId: async () => null,
    requireOwner: async () => {
      throw new core.AccessError('forbidden')
    },
    requireOpsUser: async (roles?: OpsRole[]) => {
      const user = h.session.user
      if (!user) throw new core.AccessError('unauthenticated')
      if (roles && !roles.includes(user.role)) throw new core.AccessError('forbidden')
      return user
    },
  }
})

const SRC = join(import.meta.dir, '..')

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(path)))
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(path)
  }
  return out
}

/** Every source module that calls defineAction( (except the wrapper itself). */
async function actionModules(): Promise<string[]> {
  const files = await walk(SRC)
  const hits: string[] = []
  for (const file of files) {
    if (file.endsWith('/lib/define-action.ts')) continue
    if (/\bdefineAction\(/.test(await readFile(file, 'utf8'))) hits.push(file)
  }
  return hits.sort()
}

const HELPER: OpsUser = {
  id: '01936f7e-0000-7000-8000-000000000002',
  email: 'helper@example.test',
  name: 'Helper Example',
  initials: 'HE',
  role: 'helper',
  // Every toggle on: an Owner-only action must refuse regardless.
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
}

const { registeredActions } = await import('./define-action')
const { SAFE_MESSAGES } = await import('./safe-message')

describe('every Owner-only action refuses a Helper', () => {
  let modules: string[] = []

  beforeAll(async () => {
    modules = await actionModules()
    for (const file of modules) await import(file)
    h.session.user = HELPER
  })

  it('finds the action modules and their actions', () => {
    expect(modules.length).toBeGreaterThan(0)
    const names = registeredActions().map((a) => a.name)
    // The team actions this task adds are Owner only; the settings and setup ones exist already.
    for (const name of [
      'team.invite',
      'team.invite_resend',
      'team.invite_revoke',
      'team.permissions',
      'team.remove',
      'team.transfer',
      'settings.signoff',
      'setup.company.save',
    ]) {
      expect(names).toContain(name)
    }
    console.info(
      `owner-only loop: ${registeredActions().filter((a) => a.ownerOnly).length} of ${names.length} actions in ${modules.length} modules: ${modules.map((m) => relative(SRC, m)).join(', ')}`
    )
  })

  it('answers the forbidden sentence for each, without touching the database', async () => {
    const ownerOnly = registeredActions().filter((a) => a.ownerOnly)
    expect(ownerOnly.length).toBeGreaterThanOrEqual(10)
    const results: Array<[string, unknown]> = []
    for (const action of ownerOnly) {
      // An empty object: defineAction refuses on the role before it parses input.
      results.push([action.name, await action.run({})])
    }
    for (const [name, result] of results) {
      expect({ name, result }).toEqual({
        name,
        result: { success: false, error: SAFE_MESSAGES.forbidden },
      })
    }
    expect(h.touched).toEqual([])
  })

  it('marks an action Owner-only by role or by an Owner-only capability', () => {
    const missed = registeredActions()
      .filter((a) => !a.roles.includes('helper') || a.capability === 'manage_team')
      .filter((a) => !a.ownerOnly)
      .map((a) => a.name)
    expect(missed).toEqual([])
    // A Helper-allowed action stays open to them (the loop above would refuse it otherwise).
    expect(registeredActions().find((a) => a.name === 'profile.update')?.ownerOnly).toBe(false)
  })
})
