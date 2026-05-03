import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Build the datasource URL, optionally overriding (or adding) the
 * `connection_limit` query param using `DATABASE_CONNECTION_LIMIT` env var.
 *
 * Why: storefront and admin share this package, but they want different
 * connection limits. The base `DATABASE_URL` is set with `connection_limit=1`
 * to keep storefront safe under high concurrency. Admin (low concurrency, lots
 * of dashboard queries per request) sets `DATABASE_CONNECTION_LIMIT=10` to let
 * Prisma fan-out queries through pgbouncer instead of serialising them.
 *
 * Empirical note: `5` was the original recommendation but turned out too low.
 * The RFQ detail page (`apps/admin/src/app/(shell)/rfqs/[code]/page.tsx`)
 * fans out 6+ parallel queries per request — rfq with deep includes,
 * staffUser.findMany, storeSettings, plus middleware auth + session
 * callback — and exhausted the pool, causing P2024 "Timed out fetching a new
 * connection" errors on 2026-05-04. Bumped to 10 in production. If a future
 * page adds even more parallel queries, raise the recommendation again.
 *
 * Returns `undefined` when no override is set, so Prisma falls back to its
 * default of reading `DATABASE_URL` directly — preserving prior behaviour.
 */
function buildDatasourceUrl(): string | undefined {
  const limit = process.env.DATABASE_CONNECTION_LIMIT
  if (!limit) return undefined

  const base = process.env.DATABASE_URL
  if (!base) return undefined

  try {
    const url = new URL(base)
    url.searchParams.set('connection_limit', limit)
    return url.toString()
  } catch {
    // If DATABASE_URL is malformed, fall back to letting Prisma handle it.
    return undefined
  }
}

const datasourceUrl = buildDatasourceUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export { Prisma }
export type { Redirect, SeoSetting, StoreSettings, EmailTemplate } from '@prisma/client'
