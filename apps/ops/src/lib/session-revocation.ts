import { env } from './env'

/**
 * The proxy's view of revoked sessions (C42, S03-T02). Used by src/proxy.ts (Node runtime). No
 * `server-only` import: the proxy bundle is not a React Server Component and that package throws
 * outside one.
 *
 * The proxy must never query per request (ADR-04: the pooler is shared with the storefront). It holds
 * the set of revoked, unexpired session ids in module memory and refreshes it at most once per TTL
 * (default 60 s; `OPS_SESSION_REVOCATION_TTL_MS` shortens it outside production only):
 *
 *   - one query per refresh: `SELECT id FROM ops.user_session WHERE "revokedAt" IS NOT NULL AND
 *     expires > now()` (the partial index `user_session_revokedAt_idx` serves it);
 *   - a single refresh in flight: concurrent requests after the TTL await the same promise;
 *   - on a database error the previous set is kept, the error is logged and the next attempt waits
 *     a full TTL (an outage must not turn into one query per request). Failing open is acceptable
 *     because `requireOpsUser` re-checks the session row on every page and server action.
 *
 * A revocation therefore reaches pages within one TTL on each instance, and server actions at once.
 */
export const DEFAULT_REVOCATION_TTL_MS = 60_000

export type RevocationCache = {
  isRevoked: (sid: string) => Promise<boolean>
  /** Test hook: how many refreshes ran (successful or not). */
  readonly refreshes: number
}

export function createRevocationCache(deps: {
  load: () => Promise<readonly string[]>
  ttlMs: number
  now?: () => number
  onError?: (error: unknown) => void
}): RevocationCache {
  const now = deps.now ?? Date.now
  let revoked: ReadonlySet<string> = new Set()
  let loadedAt = Number.NEGATIVE_INFINITY
  let inflight: Promise<void> | null = null
  let refreshes = 0

  async function refresh(): Promise<void> {
    refreshes += 1
    try {
      revoked = new Set(await deps.load())
    } catch (error) {
      deps.onError?.(error)
    } finally {
      loadedAt = now()
      inflight = null
    }
  }

  return {
    async isRevoked(sid) {
      if (now() - loadedAt >= deps.ttlMs) {
        inflight ??= refresh()
        await inflight
      }
      return revoked.has(sid)
    },
    get refreshes() {
      return refreshes
    },
  }
}

async function loadRevokedSessionIds(): Promise<string[]> {
  // Imported on first use, so public requests never load the database client.
  const { opsDb } = await import('@indus/ops-db')
  const rows = await opsDb.userSession.findMany({
    where: { revokedAt: { not: null }, expires: { gt: new Date() } },
    select: { id: true },
  })
  return rows.map((r) => r.id)
}

let shared: RevocationCache | undefined

function sharedCache(): RevocationCache {
  shared ??= createRevocationCache({
    load: loadRevokedSessionIds,
    ttlMs: env().OPS_SESSION_REVOCATION_TTL_MS ?? DEFAULT_REVOCATION_TTL_MS,
    onError: (error) => {
      // The driver message may name the host; the error's name is enough to find it in the logs.
      console.error(
        'session revocation refresh failed; keeping the previous set',
        error instanceof Error ? error.name : 'unknown'
      )
    },
  })
  return shared
}

/** Is this session id revoked? At most one database query per TTL per instance. */
export function isSessionRevoked(sid: string): Promise<boolean> {
  return sharedCache().isRevoked(sid)
}

/** Test hook: forget the module cache (a new TTL is read from the environment next time). */
export function resetRevocationCacheForTests(): void {
  shared = undefined
}
