/**
 * Build the Ops datasource URL. Copied from packages/db/src/datasource-url.ts and kept the same
 * in behaviour (override from `DATABASE_CONNECTION_LIMIT`, build-phase pool cap and timeout),
 * with the Ops defaults of architecture C3 on top:
 *
 *   connection_limit = 1    when the URL does not say otherwise
 *   pool_timeout     = 20   when the URL does not say otherwise (60 during `next build`)
 *
 * ── Why 1 and 20 ──
 *
 * Ops shares the Supavisor tenant (200 client connections) with the storefront, which has hit
 * EMAXCONN more than once after a deploy. Ops's whole budget is 15 pooler clients at peak
 * (ADR-04), so every serverless instance holds ONE connection and queues for up to 20 s
 * instead of opening more. The role itself is capped server-side too
 * (`ALTER ROLE ops_app CONNECTION LIMIT 15`, migration 1), but that caps backends, not pooler
 * clients; this is the cap that matters.
 *
 * Unlike the website helper, this one returns a URL whenever `DATABASE_URL` parses, because
 * the defaults must apply even when nothing overrides them. An explicit value already on the
 * URL always wins, so a deliberate `connection_limit=2` is never silently lowered or raised
 * here (outside the build cap, which only ever lowers).
 *
 * Lives in its own module so it can be unit-tested: `index.ts` constructs a PrismaClient at
 * import time, and a test importing it would open a real connection.
 *
 * ── Build phase ──
 *
 * `next build` runs many worker processes, each with its own PrismaClient and pool. The build
 * caps each pool at `BUILD_CONNECTION_LIMIT` (only ever lowering) and widens `pool_timeout` to
 * 60 s, exactly as packages/db does. Ops pages should not touch the database at build at all
 * (ADR-04: CI builds with a dead URL); this is the backstop if one does.
 */

/** Ops runtime default per serverless instance (C3). */
export const OPS_CONNECTION_LIMIT = 1

/** Ops runtime wait for a pooled connection, seconds (C3). */
export const OPS_POOL_TIMEOUT = 20

/** Per-worker pool depth during `next build`; override with `DATABASE_BUILD_CONNECTION_LIMIT`. */
const BUILD_CONNECTION_LIMIT = 4

export function buildDatasourceUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const isProductionBuild = env.NEXT_PHASE === 'phase-production-build'
  const limit = env.DATABASE_CONNECTION_LIMIT

  const base = env.DATABASE_URL
  if (!base) return undefined

  try {
    const url = new URL(base)
    if (limit) url.searchParams.set('connection_limit', limit)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', String(OPS_CONNECTION_LIMIT))
    }
    if (isProductionBuild) {
      // An override that does not parse to a positive number falls back to the default rather
      // than disabling the cap. Failing open on a dashboard typo is how pool outages come back.
      const requested = Number(env.DATABASE_BUILD_CONNECTION_LIMIT)
      const cap = Number.isFinite(requested) && requested > 0 ? requested : BUILD_CONNECTION_LIMIT
      const current = Number(url.searchParams.get('connection_limit'))
      if (Number.isFinite(current) && current > cap) {
        url.searchParams.set('connection_limit', String(cap))
      }
    }
    // An explicit pool_timeout already on the URL is left alone.
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set(
        'pool_timeout',
        isProductionBuild ? (env.DATABASE_POOL_TIMEOUT ?? '60') : String(OPS_POOL_TIMEOUT)
      )
    }
    return url.toString()
  } catch {
    // Malformed DATABASE_URL — let Prisma deal with it.
    return undefined
  }
}
