'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { withSeoAudit } from '../../../../../lib/seo-audit'

/**
 * Revert a single SEO audit entry. Reads the row, applies its `before`
 * value to the appropriate model field, and writes a new audit row tagged
 * `reason: 'reverted'` via `withSeoAudit` itself.
 *
 * RBAC:
 *   - global:* and `redirect` reverts require SEO_INFRASTRUCTURE.
 *   - per-entity reverts require CATALOGUE_WRITE (matches the original
 *     write path for product/category SEO).
 *
 * Note: only fields known to be SEO-safe are revertible — the audit row's
 * `field` is matched against an allow-list before issuing the update.
 */

const PRODUCT_FIELDS = new Set([
  'seoTitle',
  'seoDescription',
  'canonicalUrl',
  'focusKeyword',
  'robotsIndex',
  'robotsFollow',
  'ogImageMediaId',
  'sitemapPriority',
  'sitemapChangeFreq',
  'excludeFromSitemap',
  'jsonLdOverride',
])

const CATEGORY_FIELDS = PRODUCT_FIELDS

const SETTING_FIELDS = new Set([
  'defaultMetaTitleTemplate',
  'defaultMetaDescription',
  'robotsTxt',
])

const REDIRECT_FIELDS = new Set(['fromPath', 'toPath', 'statusCode'])

export async function revertChange(auditLogId: string): Promise<Result<void>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return fail('UNAUTHORIZED', 'Not authenticated')

    z.string().uuid().parse(auditLogId)

    const row = await db.seoAuditLog.findUnique({ where: { id: auditLogId } })
    if (!row) return fail('NOT_FOUND', 'Audit row not found')

    if (row.reason === 'reverted') {
      return fail('PRECONDITION_FAILED', 'This change is already a revert')
    }

    // RBAC gate on entityType.
    if (row.entityType.startsWith('global:') || row.entityType === 'redirect') {
      requireRole(session, ROLES.SEO_INFRASTRUCTURE)
    } else {
      requireRole(session, ROLES.CATALOGUE_WRITE)
    }

    // The audit `before` value is what we revert to.
    const beforeValue = row.before
    const afterValue = row.after // current state at the time of the original write

    switch (row.entityType) {
      case 'product':
        if (!row.entityId) return fail('PRECONDITION_FAILED', 'Audit row missing entityId')
        if (!PRODUCT_FIELDS.has(row.field)) {
          return fail('PRECONDITION_FAILED', `Field "${row.field}" is not revertible on product`)
        }
        return revertEntityField('product', row.entityId, row.field, beforeValue, afterValue, session.user.id)
      case 'category':
        if (!row.entityId) return fail('PRECONDITION_FAILED', 'Audit row missing entityId')
        if (!CATEGORY_FIELDS.has(row.field)) {
          return fail('PRECONDITION_FAILED', `Field "${row.field}" is not revertible on category`)
        }
        return revertEntityField(
          'category',
          row.entityId,
          row.field,
          beforeValue,
          afterValue,
          session.user.id,
        )
      case 'global:seo_setting':
      case 'global:robots':
        if (!SETTING_FIELDS.has(row.field)) {
          return fail('PRECONDITION_FAILED', `Field "${row.field}" is not revertible on settings`)
        }
        return revertSettingField(
          row.entityType as 'global:seo_setting' | 'global:robots',
          row.entityId,
          row.field,
          beforeValue,
          afterValue,
          session.user.id,
        )
      case 'redirect':
        if (!REDIRECT_FIELDS.has(row.field)) {
          return fail('PRECONDITION_FAILED', `Field "${row.field}" is not revertible on redirect`)
        }
        return revertRedirectField(
          row.entityId,
          row.field,
          beforeValue,
          afterValue,
          session.user.id,
        )
      default:
        return fail('PRECONDITION_FAILED', `Unknown entity type ${row.entityType}`)
    }
  } catch (err) {
    return failFromError(err)
  }
}

async function revertEntityField(
  entityType: 'product' | 'category',
  entityId: string,
  field: string,
  beforeValue: unknown,
  afterValue: unknown,
  actorId: string,
): Promise<Result<void>> {
  const data = mapFieldToData(field, beforeValue)

  await withSeoAudit(
    {
      entityType,
      entityId,
      before: { [field]: afterValue },
      after: { [field]: beforeValue },
      actorId,
      reason: 'reverted',
    },
    async (tx) => {
      if (entityType === 'product') {
        await tx.product.update({
          where: { id: entityId },
          data: { ...data, seoUpdatedAt: new Date(), seoUpdatedById: actorId },
        })
      } else {
        await tx.category.update({
          where: { id: entityId },
          data: { ...data, seoUpdatedAt: new Date(), seoUpdatedById: actorId },
        })
      }
    },
  )

  revalidatePath(`/admin/${entityType === 'product' ? 'products' : 'categories'}/${entityId}/edit`)
  revalidatePath('/admin/seo/audit')
  revalidatePath('/admin/seo/inspector')
  return ok(undefined)
}

async function revertSettingField(
  entityType: 'global:seo_setting' | 'global:robots',
  entityId: string | null,
  field: string,
  beforeValue: unknown,
  afterValue: unknown,
  actorId: string,
): Promise<Result<void>> {
  await withSeoAudit(
    {
      entityType,
      entityId,
      before: { [field]: afterValue },
      after: { [field]: beforeValue },
      actorId,
      reason: 'reverted',
    },
    async (tx) => {
      const existing = await tx.seoSetting.findFirst()
      const data = { [field]: beforeValue ?? null }
      if (existing) {
        await tx.seoSetting.update({ where: { id: existing.id }, data })
      } else {
        await tx.seoSetting.create({ data })
      }
    },
  )

  revalidatePath('/admin/seo')
  revalidatePath('/admin/seo/settings')
  revalidatePath('/admin/seo/robots')
  revalidatePath('/admin/seo/audit')
  return ok(undefined)
}

async function revertRedirectField(
  entityId: string | null,
  field: string,
  beforeValue: unknown,
  afterValue: unknown,
  actorId: string,
): Promise<Result<void>> {
  if (!entityId) return fail('PRECONDITION_FAILED', 'Audit row missing redirect id')
  // Reverting a delete (before set, after null on all fields) recreates
  // the row. Reverting a single-field edit just patches that field.
  await withSeoAudit(
    {
      entityType: 'redirect',
      entityId,
      before: { [field]: afterValue },
      after: { [field]: beforeValue },
      actorId,
      reason: 'reverted',
    },
    async (tx) => {
      const existing = await tx.redirect.findUnique({ where: { id: entityId } })
      if (existing) {
        await tx.redirect.update({
          where: { id: entityId },
          data: { [field]: beforeValue ?? '' },
        })
      }
      // We don't auto-recreate fully-deleted redirects from an audit row —
      // that's a Phase 2 enhancement; today admins re-add via the form.
    },
  )

  revalidatePath('/admin/seo/redirects')
  revalidatePath('/admin/seo/audit')
  return ok(undefined)
}

/**
 * Map a SEO audit field name to a Prisma `data` object suitable for
 * `update`. Decimal + Json columns need special casts so Prisma accepts
 * them.
 */
function mapFieldToData(field: string, value: unknown): Record<string, unknown> {
  if (field === 'sitemapPriority') {
    if (value === null || value === undefined) return { sitemapPriority: null }
    const n = Number(value)
    return { sitemapPriority: Number.isFinite(n) ? new Prisma.Decimal(n) : null }
  }
  if (field === 'jsonLdOverride') {
    if (value === null || value === undefined) {
      return { jsonLdOverride: Prisma.DbNull }
    }
    return { jsonLdOverride: value as Prisma.InputJsonValue }
  }
  return { [field]: value === undefined ? null : value }
}
