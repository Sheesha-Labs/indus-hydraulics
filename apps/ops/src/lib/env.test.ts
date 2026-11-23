import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EnvError, parseEnv } from './env'

const KEY = Buffer.alloc(32, 7).toString('base64')
const SECRET_VALUE = 'x'.repeat(40)
const PRODUCTION = {
  APP_ENV: 'production',
  INNGEST_EVENT_KEY: 'evt',
  INNGEST_SIGNING_KEY: 'sig',
  OPS_AUTH_SECRET: SECRET_VALUE,
  OPS_TOKEN_KEYS: JSON.stringify({ k1: KEY }),
  OPS_TOKEN_KEY_ACTIVE: 'k1',
  DATABASE_URL: 'postgresql://ops_app@db.example.test:6543/postgres',
  NEXT_PUBLIC_OPS_BASE_URL: 'https://operations.example.test',
  GOOGLE_OPS_CLIENT_ID: 'client',
  GOOGLE_OPS_CLIENT_SECRET: 'client-secret-value',
}

function thrown(fn: () => unknown): string {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(EnvError)
    return (error as Error).message
  }
  throw new Error('expected an EnvError')
}

describe('parseEnv', () => {
  it('accepts a complete production environment', () => {
    expect(parseEnv(PRODUCTION).APP_ENV).toBe('production')
  })

  it('lists every missing production variable by name', () => {
    const message = thrown(() => parseEnv({ APP_ENV: 'production' }))
    for (const name of [
      'INNGEST_EVENT_KEY',
      'OPS_AUTH_SECRET',
      'DATABASE_URL',
      'GOOGLE_OPS_CLIENT_SECRET',
    ]) {
      expect(message).toContain(name)
    }
  })

  it('never prints a value', () => {
    const message = thrown(() =>
      parseEnv({ ...PRODUCTION, OPS_TOKEN_KEY_ACTIVE: 'k9', OPS_AUTH_SECRET: SECRET_VALUE })
    )
    expect(message).toContain('OPS_TOKEN_KEY_ACTIVE')
    expect(message).not.toContain(SECRET_VALUE)
    expect(message).not.toContain(KEY)
    expect(message).not.toContain('client-secret-value')
  })

  it('tolerates missing keys outside production', () => {
    expect(parseEnv({ APP_ENV: 'preview' }).APP_ENV).toBe('preview')
    expect(parseEnv({}).APP_ENV).toBe('local')
  })

  it('refuses test-only switches and a localhost base URL in production', () => {
    expect(thrown(() => parseEnv({ ...PRODUCTION, OPS_E2E_AUTH: '1' }))).toContain('OPS_E2E_AUTH')
    expect(thrown(() => parseEnv({ ...PRODUCTION, OPS_KIT: '1' }))).toContain('OPS_KIT')
    expect(
      thrown(() => parseEnv({ ...PRODUCTION, OPS_E2E_MAIL_SINK: join(tmpdir(), 'sink') }))
    ).toContain('OPS_E2E_MAIL_SINK')
    expect(
      thrown(() => parseEnv({ ...PRODUCTION, OPS_SESSION_REVOCATION_TTL_MS: '2000' }))
    ).toContain('OPS_SESSION_REVOCATION_TTL_MS')
    expect(parseEnv({ OPS_SESSION_REVOCATION_TTL_MS: '2000' }).OPS_SESSION_REVOCATION_TTL_MS).toBe(
      2000
    )
    // System mail is optional in production: without a key nothing is sent and rows say failed.
    expect(parseEnv(PRODUCTION).RESEND_OPS_API_KEY).toBeUndefined()
    expect(
      thrown(() => parseEnv({ ...PRODUCTION, NEXT_PUBLIC_OPS_BASE_URL: 'http://localhost:3100' }))
    ).toContain('localhost')
  })

  it('validates token keys and a short auth secret by name', () => {
    expect(thrown(() => parseEnv({ OPS_TOKEN_KEYS: '{"k1":"short"}' }))).toContain('OPS_TOKEN_KEYS')
    expect(thrown(() => parseEnv({ OPS_AUTH_SECRET: 'too-short' }))).toContain('OPS_AUTH_SECRET')
  })

  it('treats empty strings as unset', () => {
    expect(parseEnv({ APP_ENV: 'local', SENTRY_DSN: '' }).SENTRY_DSN).toBeUndefined()
  })
})
