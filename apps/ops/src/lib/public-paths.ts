/**
 * Which requests the proxy lets through without a session (ADR-05, §2.4).
 *
 * Default-deny: a path is public only if it matches an explicit allowlist entry,
 * and every public route verifies its own caller (a signed link token, a webhook
 * signature, the Pub/Sub JWT, Auth.js itself). The website's matcher-level `api`
 * exemption is what once produced the `/admin/api/auth` redirect loop, so nothing
 * here is exempted by the matcher except static assets.
 *
 * Matching is by path segment, never substring: `/sign-inx`, `/qa` and
 * `/api/inngestx` are protected.
 */
export type PathKind =
  'static' | 'public-page' | 'public-api' | 'kit' | 'protected-page' | 'protected-api'

export type PathEnv = { appEnv?: string | undefined; opsKit?: string | undefined }

/** Exact paths and segment prefixes, each a whole path or whole leading segments. */
const STATIC_PREFIXES = ['/_next/static', '/_next/image']
const STATIC_EXACT = ['/favicon.ico', '/robots.txt']
const PUBLIC_PAGE_PREFIXES = ['/sign-in', '/q', '/d', '/s', '/u']
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/files']
const PUBLIC_API_EXACT = [
  '/api/inngest',
  '/api/gmail/push',
  '/api/zoho/webhook',
  '/api/webhooks/resend',
  '/api/health/live',
]

/**
 * Decode percent-escapes and resolve `.`/`..` segments the way a router would,
 * so `/q/..%2Ftoday` or `/sign-in/%2e%2e/today` cannot borrow a public prefix.
 */
export function normalisePath(raw: string): string {
  let decoded = raw
  for (let i = 0; i < 3; i++) {
    let next: string
    try {
      next = decodeURIComponent(decoded)
    } catch {
      break
    }
    if (next === decoded) break
    decoded = next
  }
  const out: string[] = []
  for (const segment of decoded.replace(/\\/g, '/').split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      out.pop()
      continue
    }
    out.push(segment)
  }
  return '/' + out.join('/')
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + '/')
}

export function classify(pathname: string, env: PathEnv = {}): PathKind {
  const path = normalisePath(pathname)

  if (STATIC_EXACT.includes(path)) return 'static'
  if (STATIC_PREFIXES.some((p) => matchesPrefix(path, p))) return 'static'

  if (matchesPrefix(path, '/_kit')) {
    const open = env.appEnv !== 'production' && env.opsKit === '1'
    return open ? 'kit' : 'protected-page'
  }

  if (PUBLIC_API_EXACT.includes(path)) return 'public-api'
  if (PUBLIC_API_PREFIXES.some((p) => matchesPrefix(path, p))) return 'public-api'
  if (PUBLIC_PAGE_PREFIXES.some((p) => matchesPrefix(path, p))) return 'public-page'

  return matchesPrefix(path, '/api') ? 'protected-api' : 'protected-page'
}

/** Client-facing document pages get their own, stricter header set (ADR-16). */
export function isClientPage(pathname: string): boolean {
  const path = normalisePath(pathname)
  return ['/q', '/d', '/s', '/u'].some((p) => matchesPrefix(path, p))
}
