import { describe, expect, it } from 'vitest'
import { buildProviders, mockGoogleIssuer, testProviderAllowed } from './auth-providers'

const none = async () => null
const refuse = async (): Promise<never> => {
  throw new Error('not used')
}
// Auth.js keeps a provider's configured id in `options` until it resolves them.
const ids = (env: Parameters<typeof buildProviders>[0]) =>
  buildProviders(env, none, refuse).map(
    (p) => (p as unknown as { options?: { id?: string } }).options?.id ?? p.id
  )

describe('auth providers', () => {
  it('production has Google and password + authenticator only, whatever else is set', () => {
    expect(ids({ APP_ENV: 'production' })).toEqual(['google', 'ops-password'])
    expect(ids({ APP_ENV: 'production', OPS_E2E_AUTH: '1' })).toEqual(['google', 'ops-password'])
    expect(testProviderAllowed({ APP_ENV: 'production', OPS_E2E_AUTH: '1' })).toBe(false)
  })

  it('adds the test provider only outside production with OPS_E2E_AUTH=1', () => {
    expect(ids({ APP_ENV: 'local', OPS_E2E_AUTH: '1' })).toEqual([
      'google',
      'ops-password',
      'ops-test',
    ])
    expect(ids({ APP_ENV: 'ci', OPS_E2E_AUTH: '1' })).toEqual([
      'google',
      'ops-password',
      'ops-test',
    ])
    expect(ids({ APP_ENV: 'local' })).toEqual(['google', 'ops-password'])
    expect(ids({ APP_ENV: 'preview', OPS_E2E_AUTH: '0' })).toEqual(['google', 'ops-password'])
  })

  it('points Google at the e2e issuer only outside production', () => {
    const issuer = 'http://localhost:8089'
    expect(mockGoogleIssuer({ APP_ENV: 'production', OPS_E2E_GOOGLE_ISSUER: issuer })).toBeNull()
    expect(mockGoogleIssuer({ APP_ENV: 'local' })).toBeNull()
    expect(mockGoogleIssuer({ APP_ENV: 'local', OPS_E2E_GOOGLE_ISSUER: `${issuer}/` })).toBe(issuer)
    const google = (env: Parameters<typeof buildProviders>[0]) =>
      (
        buildProviders(env, none, refuse)[0] as unknown as {
          options: { issuer?: string; clientId?: string }
        }
      ).options
    expect(
      google({ APP_ENV: 'production', OPS_E2E_GOOGLE_ISSUER: issuer, GOOGLE_OPS_CLIENT_ID: 'real' })
    ).toMatchObject({
      clientId: 'real',
    })
    expect(google({ APP_ENV: 'production', OPS_E2E_GOOGLE_ISSUER: issuer }).issuer).toBeUndefined()
    expect(google({ APP_ENV: 'local', OPS_E2E_GOOGLE_ISSUER: issuer })).toMatchObject({
      issuer,
      clientId: 'ops-e2e',
    })
  })
})
