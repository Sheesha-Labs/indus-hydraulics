/**
 * Where the Ops seeds may write (S02-T03). Pure, so the refusal rules are unit-tested without a database.
 *
 * - A local host (localhost, 127.0.0.1, ::1) is always allowed.
 * - Any other host is refused, unless `SEED_ALLOW_REMOTE=1` AND `SEED_DEMO` is unset: demo people never
 *   reach a hosted database, whatever else is set.
 * - A libpq `host=` query parameter would override the URL's host, so it is refused outright.
 */

export const LOCAL_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '::1']

export type SeedEnv = Readonly<Record<string, string | undefined>>

export type SeedDecision =
  { ok: true; host: string; local: boolean; demo: boolean } | { ok: false; reason: string }

/** The host a Postgres URL connects to, or null when it does not parse. */
export function databaseHost(url: string): string | null {
  try {
    const host = new URL(url).hostname
    return host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host
  } catch {
    return null
  }
}

export function decideSeed(url: string | undefined, env: SeedEnv): SeedDecision {
  if (!url) return { ok: false, reason: 'DATABASE_URL is not set' }
  if (/[?&]host=/i.test(url)) return { ok: false, reason: 'host= query parameters are refused' }
  const host = databaseHost(url)
  if (!host) return { ok: false, reason: 'DATABASE_URL does not parse' }
  const local = LOCAL_HOSTS.includes(host)
  const demo = env.SEED_DEMO === '1'
  if (local) return { ok: true, host, local, demo }
  if (env.SEED_ALLOW_REMOTE === '1' && env.SEED_DEMO === undefined)
    return { ok: true, host, local, demo: false }
  return {
    ok: false,
    reason:
      env.SEED_DEMO === undefined
        ? `refusing host '${host}': not local (set SEED_ALLOW_REMOTE=1 to seed a hosted database)`
        : `refusing host '${host}': SEED_DEMO never runs against a hosted database`,
  }
}

/** Local only, no exceptions (the parity seed writes handoff sample names). */
export function decideLocalOnly(url: string | undefined): SeedDecision {
  if (!url) return { ok: false, reason: 'DATABASE_URL is not set' }
  if (/[?&]host=/i.test(url)) return { ok: false, reason: 'host= query parameters are refused' }
  const host = databaseHost(url)
  if (!host) return { ok: false, reason: 'DATABASE_URL does not parse' }
  return LOCAL_HOSTS.includes(host)
    ? { ok: true, host, local: true, demo: false }
    : { ok: false, reason: `refusing host '${host}': local databases only` }
}
