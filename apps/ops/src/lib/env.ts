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
})

export type OpsEnv = z.infer<typeof schema>

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
