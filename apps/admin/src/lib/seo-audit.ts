import { db } from '@indus/db'
import { Prisma } from '@indus/db'
import { diffSnapshots } from '@indus/domain'

/**
 * Transactional wrapper for any SEO-affecting write.
 *
 * The contract:
 *   1. `fn` runs inside a Prisma `$transaction`.
 *   2. After `fn` resolves, we diff `before` vs `after` (filtered to the
 *      bookkeeping-free fields by the domain `diffSnapshots` helper) and
 *      insert one `SeoAuditLog` row per changed field — INSIDE the same
 *      transaction.
 *   3. If `fn` throws, no audit rows are written and the entity update
 *      rolls back. There is never a partial state.
 *
 * Pass:
 *   - `entityType` — Prisma model identifier ('product', 'category', …) or
 *     a pseudo-entity for global SEO state ('global:seo_setting',
 *     'redirect', 'global:robots').
 *   - `entityId` — uuid for real entities, null for singletons like
 *     `SeoSetting`.
 *   - `before` / `after` — the SEO-relevant slice of the entity before
 *     and after `fn`. The drawer captures `before` from the original load
 *     and constructs `after` from the parsed form data.
 *   - `actorId` — staff user id from the session.
 *   - `reason` — optional. 'reverted' when a revert action invoked us.
 *
 * Returns whatever `fn` returned, so callers can keep their existing
 * shape:
 *
 *   await withSeoAudit({...}, async (tx) => {
 *     await tx.product.update({ where: { id }, data: ... })
 *   })
 */

export type SeoAuditEntityType =
  | 'product'
  | 'category'
  | 'brand'
  | 'industry'
  | 'cms_page'
  | 'blog_post'
  | 'global:seo_setting'
  | 'global:robots'
  | 'redirect'

type Tx = Prisma.TransactionClient

export async function withSeoAudit<T>(
  opts: {
    entityType: SeoAuditEntityType
    entityId: string | null
    before: Record<string, unknown>
    after: Record<string, unknown>
    actorId: string | null
    reason?: string
  },
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.$transaction(async (tx) => {
    const result = await fn(tx)
    const entries = diffSnapshots(opts.before, opts.after)
    if (entries.length > 0) {
      await tx.seoAuditLog.createMany({
        data: entries.map((entry) => ({
          entityType: opts.entityType,
          entityId: opts.entityId,
          field: entry.field,
          before: entry.before === undefined ? null : (entry.before as Prisma.InputJsonValue),
          after: entry.after === undefined ? null : (entry.after as Prisma.InputJsonValue),
          actorId: opts.actorId,
          reason: opts.reason ?? null,
        })),
      })
    }
    return result
  })
}
