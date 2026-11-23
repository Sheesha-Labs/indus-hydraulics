import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ENV_NAMES, EnvError, parseEnv } from './env'

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

  describe('S04 Gmail and send keys', () => {
    it('validates OPS_TOKEN_KEYS: bad JSON, a 31-byte key, an active id that is not a key', () => {
      expect(thrown(() => parseEnv({ OPS_TOKEN_KEYS: '{not json' }))).toContain('OPS_TOKEN_KEYS')
      const short = JSON.stringify({ k1: Buffer.alloc(31, 1).toString('base64') })
      expect(thrown(() => parseEnv({ OPS_TOKEN_KEYS: short }))).toContain('OPS_TOKEN_KEYS')
      expect(
        thrown(() =>
          parseEnv({ OPS_TOKEN_KEYS: JSON.stringify({ k1: KEY }), OPS_TOKEN_KEY_ACTIVE: 'k2' })
        )
      ).toContain('OPS_TOKEN_KEY_ACTIVE')
    })

    it('refuses OPS_SEND_ALLOWLIST in production and parses it elsewhere', () => {
      expect(
        thrown(() => parseEnv({ ...PRODUCTION, OPS_SEND_ALLOWLIST: 'test@example.test' }))
      ).toContain('OPS_SEND_ALLOWLIST must not be set in production')
      expect(
        parseEnv({ OPS_SEND_ALLOWLIST: ' A@example.test, b@example.test ,' }).OPS_SEND_ALLOWLIST
      ).toEqual(['a@example.test', 'b@example.test'])
      expect(thrown(() => parseEnv({ OPS_SEND_ALLOWLIST: 'not-an-email' }))).toContain(
        'OPS_SEND_ALLOWLIST'
      )
    })

    it('checks the Pub/Sub topic shape, the push audience and the invoker email', () => {
      expect(
        parseEnv({ GMAIL_PUBSUB_TOPIC: 'projects/indus-operations/topics/gmail-push' })
          .GMAIL_PUBSUB_TOPIC
      ).toBe('projects/indus-operations/topics/gmail-push')
      expect(thrown(() => parseEnv({ GMAIL_PUBSUB_TOPIC: 'gmail-push' }))).toContain(
        'GMAIL_PUBSUB_TOPIC'
      )
      expect(thrown(() => parseEnv({ GMAIL_PUSH_AUDIENCE: 'not a url' }))).toContain(
        'GMAIL_PUSH_AUDIENCE'
      )
      expect(thrown(() => parseEnv({ GMAIL_PUSH_SA_EMAIL: 'invoker' }))).toContain(
        'GMAIL_PUSH_SA_EMAIL'
      )
    })

    it('needs at least 32 bytes in OPS_STATE_SECRET', () => {
      expect(thrown(() => parseEnv({ OPS_STATE_SECRET: 'short' }))).toContain('OPS_STATE_SECRET')
      expect(
        parseEnv({ OPS_STATE_SECRET: Buffer.alloc(32, 9).toString('base64') }).OPS_STATE_SECRET
      ).toBeTruthy()
      expect(parseEnv({ OPS_STATE_SECRET: 'y'.repeat(32) }).OPS_STATE_SECRET).toBeTruthy()
    })

    it('boots in production without the Gmail keys (optional at boot, decision S04-T01)', () => {
      expect(parseEnv(PRODUCTION).GMAIL_PUBSUB_TOPIC).toBeUndefined()
    })
  })

  it('apps/ops/.env.example lists exactly the variables env.ts reads', () => {
    const example = readFileSync(join(import.meta.dir, '../../.env.example'), 'utf8')
    const listed = [...example.matchAll(/^([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]).sort()
    expect(listed).toEqual([...ENV_NAMES].sort())
  })
})
