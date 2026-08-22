/**
 * Build the datasource URL, overriding `connection_limit` from
 * `DATABASE_CONNECTION_LIMIT` and widening `pool_timeout` during `next build`.
 *
 * Lives in its own module so it can be unit-tested. `index.ts` constructs a
 * PrismaClient at import time, so a test importing it would open a real
 * connection — which is why this logic used to be untested.
 *
 * ── connection_limit ──
 *
 * The base `DATABASE_URL` carries `connection_limit=1` to keep the storefront
 * safe under high concurrency; the console sets `DATABASE_CONNECTION_LIMIT=10`
 * so Prisma can fan out through pgbouncer instead of serialising.
 *
 * `5` was the original recommendation and turned out too low: the RFQ detail
 * page (`apps/web/src/app/admin/(shell)/rfqs/[code]/page.tsx`) fans out 6+
 * parallel queries per request and exhausted the pool with P2024 "Timed out
 * fetching a new connection" on 2026-05-04. Raise it again if a future page
 * adds more parallel queries.
 *
 * ── pool_timeout, build phase only ──
 *
 * `next build` static-generates 454 pages across 9 worker PROCESSES, each with
 * its own PrismaClient and its own pool of `connection_limit`. That is up to
 * ~90 concurrent checkouts against one pgbouncer, so a worker regularly waits
 * longer than Prisma's 10s default and the build dies with P2024 — observed on
 * roughly every other run.
 *
 * Waiting is the right answer during a build: throughput matters, latency does
 * not, and nobody is watching a page render. Hence a longer timeout rather than
 * a smaller pool, which would only slow the build without removing the cliff.
 *
 * Deliberately scoped to the build phase. At request time a 60s wait for a
 * connection is a hung page, and failing fast is correct.
 *
 * ── connection_limit, build phase only ──
 *
 * The same 9-workers-with-their-own-pool arithmetic is also what makes builds
 * fail when several run at once, and that failure looks nothing like the one
 * above. 9 workers × `connection_limit=10` is up to 90 CLIENT connections
 * against Supavisor, whose cap is 200 across the whole project. One build fits
 * comfortably. Two are at 180. Three, or two plus the live site's own
 * functions, and the pooler starts refusing:
 *
 *     FATAL: (EMAXCONN) max client connections reached, limit: 200
 *
 * That is not a Prisma timeout and no `pool_timeout` helps — the connection is
 * refused, not queued. It killed a production deploy and two preview builds on
 * 2026-08-22, and it recurs whenever branches happen to build together, which
 * with a dozen open worktrees is most of the time.
 *
 * So the build gets a SMALL pool rather than the request-time one. It can
 * afford to: the 60s timeout above means a worker that wants a connection
 * queues instead of failing, and nobody is watching a build render. 9 × 4 = 36
 * per build lets five builds run together inside the cap with room for the
 * live site, against two before.
 *
 * The cap only ever lowers. A URL that already asks for fewer keeps its own
 * number — raising it would be this fix causing the thing it prevents.
 */

/**
 * Per-worker pool depth during `next build`. See the note above for the
 * arithmetic; override with `DATABASE_BUILD_CONNECTION_LIMIT` if the build
 * starts spending real time queueing.
 */
const BUILD_CONNECTION_LIMIT = 4
export function buildDatasourceUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const isProductionBuild = env.NEXT_PHASE === 'phase-production-build'
  const limit = env.DATABASE_CONNECTION_LIMIT

  if (!limit && !isProductionBuild) return undefined

  const base = env.DATABASE_URL
  if (!base) return undefined

  try {
    const url = new URL(base)
    if (limit) url.searchParams.set('connection_limit', limit)
    if (isProductionBuild) {
      // An override that does not parse to a positive number falls back to the
      // default rather than disabling the cap. `DATABASE_BUILD_CONNECTION_LIMIT=`
      // set to empty in a dashboard is not a request for an unbounded pool, and
      // failing open on a typo is how this class of outage comes back.
      const requested = Number(env.DATABASE_BUILD_CONNECTION_LIMIT)
      const cap = Number.isFinite(requested) && requested > 0 ? requested : BUILD_CONNECTION_LIMIT
      const current = Number(url.searchParams.get('connection_limit'))
      // Only ever lowers, and only from a number we can read. An absent or
      // unparseable limit is Prisma's own default, which we cannot see here.
      if (Number.isFinite(current) && current > cap) {
        url.searchParams.set('connection_limit', String(cap))
      }
    }
    // Only ever widened for the build, and an explicit pool_timeout already on
    // the URL is left alone.
    if (isProductionBuild && !url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', env.DATABASE_POOL_TIMEOUT ?? '60')
    }
    return url.toString()
  } catch {
    // Malformed DATABASE_URL — let Prisma deal with it.
    return undefined
  }
}
