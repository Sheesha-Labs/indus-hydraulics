import { describe, expect, it } from 'vitest'
import { engineCandidates, pinQueryEngine, VERCEL_ENGINE_FILE } from './query-engine'

const APP = '/var/task/apps/ops'
const TRACED = `/var/task/packages/ops-db/generated/client/${VERCEL_ENGINE_FILE}`

describe('pinQueryEngine', () => {
  it('on Vercel, points Prisma at the traced engine when the process runs from the app folder', () => {
    const env: NodeJS.ProcessEnv = { VERCEL: '1' }
    expect(pinQueryEngine(env, APP, (p) => p === TRACED)).toBe(TRACED)
    expect(env.PRISMA_QUERY_ENGINE_LIBRARY).toBe(TRACED)
  })

  it('also finds it when the process runs from the function root', () => {
    const env: NodeJS.ProcessEnv = { VERCEL: '1' }
    expect(pinQueryEngine(env, '/var/task', (p) => p === TRACED)).toBe(TRACED)
  })

  it('does nothing off Vercel', () => {
    const env: NodeJS.ProcessEnv = {}
    expect(pinQueryEngine(env, APP, () => true)).toBeUndefined()
    expect(env.PRISMA_QUERY_ENGINE_LIBRARY).toBeUndefined()
  })

  it('never overrides an explicit PRISMA_QUERY_ENGINE_LIBRARY', () => {
    const env: NodeJS.ProcessEnv = { VERCEL: '1', PRISMA_QUERY_ENGINE_LIBRARY: '/custom' }
    expect(pinQueryEngine(env, APP, () => true)).toBeUndefined()
    expect(env.PRISMA_QUERY_ENGINE_LIBRARY).toBe('/custom')
  })

  it('leaves the variable unset when no candidate exists, so Prisma reports its own search', () => {
    const env: NodeJS.ProcessEnv = { VERCEL: '1' }
    expect(pinQueryEngine(env, APP, () => false)).toBeUndefined()
    expect(env.PRISMA_QUERY_ENGINE_LIBRARY).toBeUndefined()
  })

  it('only ever names the rhel engine file', () => {
    for (const path of engineCandidates(APP)) expect(path.endsWith(VERCEL_ENGINE_FILE)).toBe(true)
  })
})
