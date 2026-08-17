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
 */
export function buildDatasourceUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const isProductionBuild = env.NEXT_PHASE === 'phase-production-build'
  const limit = env.DATABASE_CONNECTION_LIMIT

  if (!limit && !isProductionBuild) return undefined

  const base = env.DATABASE_URL
  if (!base) return undefined

  try {
    const url = new URL(base)
    if (limit) url.searchParams.set('connection_limit', limit)
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
