import { z } from 'zod'

/**
 * Every environment variable Indus Operations reads (10-architecture §7.3), as
 * far as S00 needs. Parsed once. Errors name the missing or invalid VARIABLES,
 * never their values.
 */
const tokenKeys = z.string().transform((raw, ctx) => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>)
      const valid = entries.every(
        ([, v]) => typeof v === 'string' && Buffer.from(v, 'base64').length === 32
      )
      if (entries.length > 0 && valid) return parsed as Record<string, string>
    }
  } catch {
    // fall through
  }
  ctx.addIssue({ code: 'custom', message: 'must be a JSON object of base64 32-byte keys' })
  return z.NEVER
})

/** A secret of at least 32 bytes: base64 that decodes to ≥ 32 bytes, or a raw string of ≥ 32 characters. */
const stateSecret = z.string().refine(
  (raw) => {
    if (raw.length >= 44 && /^[A-Za-z0-9+/=_-]+$/.test(raw))
      return Buffer.from(raw, 'base64').length >= 32
    return raw.length >= 32
  },
  { message: 'must be at least 32 bytes' }
)

const schema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  APP_ENV: z.enum(['production', 'preview', 'local', 'ci', 'test']).default('local'),
  NEXT_PUBLIC_OPS_BASE_URL: z.string().url().optional(),
  OPS_AUTH_SECRET: z.string().min(32).optional(),
  AUTH_TRUST_HOST: z.string().optional(),
  GOOGLE_OPS_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_OPS_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_WORKSPACE_DOMAIN: z.string().min(1).default('indushydraulics.me'),
  OPS_TOKEN_KEYS: tokenKeys.optional(),
  OPS_TOKEN_KEY_ACTIVE: z.string().min(1).optional(),
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
  OPS_READ_ONLY: z.enum(['0', '1']).optional(),
  OPS_E2E_AUTH: z.enum(['0', '1']).optional(),
  OPS_KIT: z.enum(['0', '1']).optional(),
  // S03-T01: system mail (Resend, C26). Optional everywhere: without a key every system email is
  // recorded as failed and nothing is sent, so production boots before the key exists.
  RESEND_OPS_API_KEY: z.string().min(1).optional(),
  // Comma list of internal addresses that may receive system mail outside production (ADR-07).
  OPS_TEST_RECIPIENTS: z.string().min(1).optional(),
  // Test only, refused in production: a directory where each system email is also written as JSON.
  OPS_E2E_MAIL_SINK: z.string().min(1).optional(),
  // S03-T05: Supabase Storage for the private ops-* buckets (ADR-21, C29). Optional so production
  // boots before the key exists; without them an upload is refused with a safe sentence, and
  // outside production a local-disk stand-in is used (src/server/storage/local-storage.ts).
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  // S03-T02. Test only, refused in production: how long the proxy keeps its set of revoked sessions
  // (default 60 000 ms, lib/session-revocation.ts). Tests shorten it to see a revocation sooner.
  OPS_SESSION_REVOCATION_TTL_MS: z.coerce.number().int().min(100).max(600_000).optional(),
  // S03-T07. Test only, refused in production: a local OIDC issuer (oauth2-mock-server) that stands in
  // for Google in e2e, so the real signIn callback (hd, email_verified, invite matching) is exercised.
  OPS_E2E_GOOGLE_ISSUER: z.string().url().optional(),
  // S04-T01 (ADR-06, 08-map-integrations §1.4, docs/gmail-setup.md). Optional at boot (decision): production
  // boots before Pub/Sub exists; without them the mailbox connect flow and the push endpoint refuse with a
  // plain sentence and /api/health reports Gmail as not configured.
  GMAIL_PUBSUB_TOPIC: z
    .string()
    .regex(/^projects\/[a-z0-9-]+\/topics\/[A-Za-z0-9._-]+$/)
    .optional(),
  GMAIL_PUSH_AUDIENCE: z.string().url().optional(),
  GMAIL_PUSH_SA_EMAIL: z.string().email().optional(),
  // HMAC key for the mailbox OAuth `state` (single-use, 10 minutes). At least 32 bytes once decoded.
  OPS_STATE_SECRET: stateSecret.optional(),
  // ops_maint through the transaction pooler (purge jobs only). Required in production from the sprint
  // that ships the first purge job; optional until then.
  OPS_MAINT_DATABASE_URL: z.string().min(1).optional(),
  // Comma list of internal test addresses. Outside production every send to anyone else is recorded as
  // suppressed_preview (ADR-07, ADR-31). REFUSED in production.
  OPS_SEND_ALLOWLIST: z
    .string()
    .transform((raw, ctx) => {
      const list = raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
      if (!list.every((e) => z.string().email().safeParse(e).success)) {
        ctx.addIssue({ code: 'custom', message: 'must be a comma list of email addresses' })
        return z.NEVER
      }
      return list
    })
    .optional(),
})

export type OpsEnv = z.infer<typeof schema>

/** Every variable name the schema reads (kept in step with apps/ops/.env.example by env.test.ts). */
export const ENV_NAMES = Object.keys(schema.shape) as (keyof OpsEnv)[]

const PRODUCTION_REQUIRED = [
  'INNGEST_EVENT_KEY',
  'OPS_AUTH_SECRET',
  'OPS_TOKEN_KEYS',
  'OPS_TOKEN_KEY_ACTIVE',
  'DATABASE_URL',
  'NEXT_PUBLIC_OPS_BASE_URL',
  'GOOGLE_OPS_CLIENT_ID',
  'GOOGLE_OPS_CLIENT_SECRET',
  'INNGEST_SIGNING_KEY',
] as const

export class EnvError extends Error {
  constructor(problems: string[]) {
    super(`Indus Operations environment is not valid: ${problems.join('; ')}`)
    this.name = 'EnvError'
  }
}

/** Parse and check an environment. Pure: pass process.env or a test object. */
export function parseEnv(source: Record<string, string | undefined>): OpsEnv {
  // Empty strings are "unset", as Vercel and .env files produce them.
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && v !== '')
  )
  const result = schema.safeParse(cleaned)
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((i) => String(i.path[0])))]
    throw new EnvError(names.map((n) => `${n} is invalid`))
  }
  const env = result.data
  const problems: string[] = []
  if (
    env.OPS_TOKEN_KEYS &&
    env.OPS_TOKEN_KEY_ACTIVE &&
    !(env.OPS_TOKEN_KEY_ACTIVE in env.OPS_TOKEN_KEYS)
  ) {
    problems.push('OPS_TOKEN_KEY_ACTIVE is not a key of OPS_TOKEN_KEYS')
  }
  if (env.APP_ENV === 'production') {
    const missing = PRODUCTION_REQUIRED.filter((name) => env[name] === undefined)
    if (missing.length) problems.push(`missing in production: ${missing.join(', ')}`)
    if (env.OPS_E2E_AUTH === '1') problems.push('OPS_E2E_AUTH must not be set in production')
    if (env.OPS_KIT === '1') problems.push('OPS_KIT must not be set in production')
    if (env.OPS_E2E_MAIL_SINK) problems.push('OPS_E2E_MAIL_SINK must not be set in production')
    if (env.OPS_E2E_GOOGLE_ISSUER)
      problems.push('OPS_E2E_GOOGLE_ISSUER must not be set in production')
    if (env.OPS_SEND_ALLOWLIST) problems.push('OPS_SEND_ALLOWLIST must not be set in production')
    if (env.OPS_SESSION_REVOCATION_TTL_MS !== undefined) {
      problems.push('OPS_SESSION_REVOCATION_TTL_MS must not be set in production')
    }
    if (env.NEXT_PUBLIC_OPS_BASE_URL?.includes('localhost')) {
      problems.push('NEXT_PUBLIC_OPS_BASE_URL points at localhost in production')
    }
  }
  if (problems.length) throw new EnvError(problems)
  return env
}

let cached: OpsEnv | undefined

export function env(): OpsEnv {
  cached ??= parseEnv(process.env)
  return cached
}

/** Called once at server boot (src/instrumentation.ts). */
export function assertBootEnv(): void {
  env()
}
