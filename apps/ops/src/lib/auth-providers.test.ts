import { describe, expect, it } from 'vitest'
import { buildProviders, testProviderAllowed } from './auth-providers'

const none = async () => null
// Auth.js keeps a provider's configured id in `options` until it resolves them.
const ids = (env: Parameters<typeof buildProviders>[0]) =>
  buildProviders(env, none).map(
    (p) => (p as unknown as { options?: { id?: string } }).options?.id ?? p.id
  )

describe('auth providers', () => {
  it('production has Google only, whatever else is set', () => {
    expect(ids({ APP_ENV: 'production' })).toEqual(['google'])
    expect(ids({ APP_ENV: 'production', OPS_E2E_AUTH: '1' })).toEqual(['google'])
    expect(testProviderAllowed({ APP_ENV: 'production', OPS_E2E_AUTH: '1' })).toBe(false)
  })

  it('adds the test provider only outside production with OPS_E2E_AUTH=1', () => {
    expect(ids({ APP_ENV: 'local', OPS_E2E_AUTH: '1' })).toEqual(['google', 'ops-test'])
    expect(ids({ APP_ENV: 'ci', OPS_E2E_AUTH: '1' })).toEqual(['google', 'ops-test'])
    expect(ids({ APP_ENV: 'local' })).toEqual(['google'])
    expect(ids({ APP_ENV: 'preview', OPS_E2E_AUTH: '0' })).toEqual(['google'])
  })
})
