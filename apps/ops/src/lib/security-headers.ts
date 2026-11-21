/**
 * Response headers for every Ops response (§2.4, ADR-05, ADR-16).
 *
 * Console pages get a nonce CSP with 'strict-dynamic'; Next.js reads the nonce
 * from the request's Content-Security-Policy header and stamps it on its own
 * scripts. Client document pages (/q, /d, /s, /u) never reach Supabase from the
 * browser, never send a referrer and are never cached.
 */
export type HeaderKind = 'console' | 'client'

export type HeaderEnv = {
  supabaseUrl?: string | undefined
  sentryDsn?: string | undefined
  dev?: boolean | undefined
}

function origin(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** The ingest host of a Sentry DSN (https://key@o123.ingest.sentry.io/456 → https://o123.ingest.sentry.io). */
function sentryOrigin(dsn: string | undefined): string | null {
  if (!dsn) return null
  try {
    const u = new URL(dsn)
    return `${u.protocol}//${u.host}`
  } catch {
    return null
  }
}

export function buildCsp(nonce: string, kind: HeaderKind, env: HeaderEnv = {}): string {
  const supabase = origin(env.supabaseUrl)
  const sentry = sentryOrigin(env.sentryDsn)
  const script = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
  // React Refresh evaluates code in development only.
  if (env.dev) script.push("'unsafe-eval'")
  const img = ["'self'", 'data:', 'blob:', ...(supabase ? [supabase] : [])]
  const connect = [
    "'self'",
    ...(kind === 'console' && supabase ? [supabase] : []),
    ...(sentry ? [sentry] : []),
  ]
  return [
    "default-src 'self'",
    `script-src ${script.join(' ')}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src ${img.join(' ')}`,
    `connect-src ${connect.join(' ')}`,
    "frame-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self' https://accounts.google.com",
    "object-src 'none'",
    ...(env.dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

export function buildHeaders({
  nonce,
  kind,
  env = {},
}: {
  nonce: string
  kind: HeaderKind
  env?: HeaderEnv
}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': buildCsp(nonce, kind, env),
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': kind === 'client' ? 'no-referrer' : 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  }
  if (kind === 'client') headers['Cache-Control'] = 'private, no-store'
  return headers
}
