import { db } from '@indus/db'

/**
 * Serve the `redirects` table.
 *
 * The table has been fully CRUD-managed from /admin/seo/redirects since the SEO
 * console shipped — including a one-click "add a redirect for this 404" flow —
 * but nothing ever read it at runtime. Only the hardcoded `redirects()` array
 * in next.config.ts was honoured, so every redirect a staff member created did
 * nothing and the 404 it was meant to fix kept 404ing.
 *
 * This runs in the proxy, which in Next 16 defaults to the Node.js runtime.
 *
 * It deliberately does NOT run from `not-found.tsx`, which looks like the
 * cheaper place (only 404s pay for it). That was tried and does not work:
 * `redirect()` in a streaming render emits a client-side meta tag instead of an
 * HTTP redirect, so the response stays 404 with no Location header — useless to
 * a crawler, which is the entire audience for a redirect.
 *
 * The per-request cost is a Map lookup, not a query. The whole active table is
 * small (single digits today) and is cached in module scope for CACHE_TTL_MS,
 * so a busy instance issues at most one query a minute.
 *
 * next.config.ts still owns the structural, build-time moves (category splits,
 * the BOP services migration). This is for the ones staff add while the site is
 * running.
 */

export type ResolvedRedirect = {
  id: string
  toPath: string
  statusCode: number
}

const CACHE_TTL_MS = 60_000

let cache: Map<string, ResolvedRedirect> | null = null
let cachedAt = 0
let inFlight: Promise<Map<string, ResolvedRedirect>> | null = null

/** Trailing slashes are not significant; `/p/foo/` and `/p/foo` are one path. */
export function normalisePath(path: string): string {
  const trimmed = path.split('?')[0]?.split('#')[0] ?? path
  if (trimmed.length > 1 && trimmed.endsWith('/')) return trimmed.slice(0, -1)
  return trimmed
}

async function loadMap(): Promise<Map<string, ResolvedRedirect>> {
  const rows = await db.redirect
    .findMany({
      where: { isActive: true },
      select: { id: true, fromPath: true, toPath: true, statusCode: true },
    })
    .catch(() => [])

  const map = new Map<string, ResolvedRedirect>()
  for (const r of rows) {
    if (!r.fromPath?.startsWith('/') || !r.toPath) continue
    const from = normalisePath(r.fromPath)
    // A redirect to itself is a loop — drop it rather than send a visitor round
    // forever.
    if (normalisePath(r.toPath) === from) continue
    map.set(from, { id: r.id, toPath: r.toPath, statusCode: r.statusCode })
  }
  return map
}

async function getMap(): Promise<Map<string, ResolvedRedirect>> {
  const now = Date.now()
  if (cache && now - cachedAt < CACHE_TTL_MS) return cache
  // Collapse a stampede: many concurrent requests share one refresh.
  if (!inFlight) {
    inFlight = loadMap()
      .then((m) => {
        cache = m
        cachedAt = Date.now()
        return m
      })
      .finally(() => {
        inFlight = null
      })
  }
  // On a refresh failure keep serving the previous map rather than 404ing.
  return inFlight.catch(() => cache ?? new Map())
}

/** Find an active redirect for `path`, or null — the common case. */
export async function findRedirect(
  path: string | null | undefined,
): Promise<ResolvedRedirect | null> {
  if (!path || !path.startsWith('/')) return null
  const map = await getMap()
  if (map.size === 0) return null
  return map.get(normalisePath(path)) ?? null
}

/**
 * Record that a redirect was followed. Best-effort and deliberately not
 * awaited by the caller: a slow or failed counter must never delay or break a
 * working redirect.
 */
export function recordRedirectHit(id: string): void {
  void db.redirect
    .update({ where: { id }, data: { hits: { increment: 1 }, lastHitAt: new Date() } })
    .catch(() => {})
}

/** Test seam — drops the module-scope cache. */
export function __resetRedirectCache(): void {
  cache = null
  cachedAt = 0
  inFlight = null
}
