import type { Prisma } from '@indus/db'
import { normalisePath } from './redirects'

type Tx = Prisma.TransactionClient

/**
 * Record a 301 for a slug that just moved, and keep the redirect graph flat.
 *
 * Renaming an entity's slug silently 404s every link to the old URL until a
 * human notices it in the 404 log. Callers that rename a slug should call this
 * inside the same transaction as the rename, so the redirect and the new slug
 * land together or not at all.
 *
 * Three writes, in this order:
 *
 *   1. Drop any redirect *away from* the destination. The destination is a
 *      live route again, and `proxy.ts` already lets a live route win over a
 *      redirect row — but leaving the row behind means the chains report
 *      flags a conflict that no longer exists.
 *   2. Repoint anything that pointed *at* the old path. Without this, a second
 *      rename builds `a → b → c` and every visitor pays two hops. Doing it
 *      here means the graph is never more than one hop deep, so the chains
 *      report stays empty instead of accumulating work for an admin to flatten
 *      by hand.
 *   3. Upsert `from → to`. Upsert rather than create because `fromPath` is
 *      unique and the path may have been redirected once already.
 *
 * Step 1 runs before step 2 so a straight swap (`a → b` then renaming `b`
 * back to `a`) cannot leave a self-referential row behind.
 */
export async function recordSlugRedirect(
  tx: Tx,
  opts: { fromPath: string; toPath: string; statusCode?: number; notes?: string },
): Promise<void> {
  const fromPath = normalisePath(opts.fromPath)
  const toPath = normalisePath(opts.toPath)

  // Nothing moved. A row here would be a self-loop, which `loadMap` drops at
  // read time anyway.
  if (fromPath === toPath) return

  const statusCode = opts.statusCode ?? 301

  await tx.redirect.deleteMany({ where: { fromPath: toPath } })

  await tx.redirect.updateMany({
    where: { toPath: fromPath, isActive: true },
    data: { toPath },
  })

  await tx.redirect.upsert({
    where: { fromPath },
    update: { toPath, statusCode, isActive: true, notes: opts.notes ?? null },
    create: { fromPath, toPath, statusCode, notes: opts.notes ?? null },
  })
}
