'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { type SeoEntityType } from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { withSeoAudit } from '../../../../../lib/seo-audit'
import { generateSuggestion as callAi, type AiSuggestField } from '../../../../../lib/ai'

/**
 * AI Suggest server actions.
 *
 * Flow:
 *   1. generateSuggestion → calls Anthropic, writes pending AiSuggestion row
 *      after a quota check; returns the row id + output for the drawer.
 *   2. acceptSuggestion → applies the value to the entity field via
 *      withSeoAudit, marks the row accepted.
 *   3. rejectSuggestion → marks the row rejected, no entity write.
 *
 * All three are RBAC-gated as AI_GENERATE.
 *
 * Quota: AiUsageQuota row per staff user, default $50/mo. We check
 * `spentThisMonthMicros < monthlyUsdCapMicros` before issuing the call,
 * then increment after the call returns.
 */

// ── generateSuggestion ─────────────────────────────────────────────────────

const FIELD_TO_KIND: Record<AiSuggestField, 'meta_title' | 'meta_description' | 'focus_keywords' | 'alt_text' | 'long_description'> = {
  seoTitle: 'meta_title',
  seoDescription: 'meta_description',
  focusKeyword: 'focus_keywords',
  altText: 'alt_text',
  longDescription: 'long_description',
}

const GenerateInputSchema = z.object({
  entityType: z.enum(['product', 'category', 'brand', 'industry', 'cms_page', 'blog_post']),
  entityId: z.string().uuid(),
  field: z.enum(['seoTitle', 'seoDescription', 'focusKeyword', 'altText', 'longDescription']),
})

export async function generateSuggestion(
  input: z.input<typeof GenerateInputSchema>,
): Promise<
  Result<{
    suggestionId: string
    output: string
    costUsdMicros: number
    cacheHitRatio: number | null
  }>
> {
  try {
    const session = requireRole(await auth(), ROLES.AI_GENERATE)
    const parsed = GenerateInputSchema.parse(input)

    // Quota gate — fail closed.
    const quota = await ensureQuota(session.user.id)
    if (quota.spentThisMonthMicros >= quota.monthlyUsdCapMicros) {
      return fail(
        'PRECONDITION_FAILED',
        `Monthly AI quota exhausted ($${(quota.monthlyUsdCapMicros / 1_000_000).toFixed(2)}). Ask an admin to raise it on /seo/ai/quota.`,
      )
    }

    const kind = FIELD_TO_KIND[parsed.field]
    const template = await db.aiPromptTemplate.findFirst({
      where: { kind, entityType: parsed.entityType, isActive: true },
    })
    if (!template) {
      return fail(
        'NOT_FOUND',
        `No active prompt template for ${kind} on ${parsed.entityType}. Run pnpm db:seed.`,
      )
    }

    const ctx = await loadContext(parsed.entityType, parsed.entityId, parsed.field)
    if (!ctx) return fail('NOT_FOUND', 'Entity not found')

    const result = await callAi({
      field: parsed.field,
      systemPrompt: template.systemPrompt,
      userTemplate: template.userTemplate,
      context: ctx,
      model: 'quality',
      maxTokens: template.maxTokens,
    })

    const totalInput = result.inputTokens + result.cacheReadInputTokens + result.cacheCreationInputTokens
    const cacheHitRatio =
      totalInput > 0 ? result.cacheReadInputTokens / totalInput : null

    const suggestion = await db.$transaction(async (tx) => {
      const row = await tx.aiSuggestion.create({
        data: {
          entityType: parsed.entityType,
          entityId: parsed.entityId,
          field: parsed.field,
          templateId: template.id,
          model: result.model,
          inputContext: ctx as Prisma.InputJsonValue,
          output: result.output,
          status: 'pending',
          costUsdMicros: result.costUsdMicros,
          cacheHitRatio,
          inputTokens: result.inputTokens + result.cacheReadInputTokens + result.cacheCreationInputTokens,
          outputTokens: result.outputTokens,
          createdById: session.user.id,
        },
      })
      await tx.aiUsageQuota.update({
        where: { staffUserId: session.user.id },
        data: { spentThisMonthMicros: { increment: result.costUsdMicros } },
      })
      return row
    })

    return ok({
      suggestionId: suggestion.id,
      output: result.output,
      costUsdMicros: result.costUsdMicros,
      cacheHitRatio,
    })
  } catch (err) {
    return failFromError(err)
  }
}

// ── acceptSuggestion ───────────────────────────────────────────────────────

export async function acceptSuggestion(
  suggestionId: string,
  /** Optional: admin can edit the value before accepting (Edit-then-Accept). */
  overrideOutput?: string | null,
): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.AI_GENERATE)
    z.string().uuid().parse(suggestionId)

    const sug = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!sug) return fail('NOT_FOUND', 'Suggestion not found')
    if (sug.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Suggestion is already ${sug.status}`)
    }

    const value =
      typeof overrideOutput === 'string' && overrideOutput.trim().length > 0
        ? overrideOutput.trim()
        : sug.output

    // Map AiSuggestion.field to the entity column. altText / longDescription
    // would need bespoke handling (image alt is per-Media row; long description
    // is descriptionLong on Product). v1 supports the three column-level fields.
    const fieldToColumn: Partial<Record<string, string>> = {
      seoTitle: 'seoTitle',
      seoDescription: 'seoDescription',
      focusKeyword: 'focusKeyword',
    }
    const column = fieldToColumn[sug.field]
    if (!column) {
      return fail(
        'PRECONDITION_FAILED',
        `Auto-accept for "${sug.field}" not yet supported — copy the value manually.`,
      )
    }

    // Read before-snapshot for the audit, then update + mark suggestion in one
    // transaction inside withSeoAudit.
    const before = await readEntityField(sug.entityType as SeoEntityType, sug.entityId, column)
    if (before === undefined) return fail('NOT_FOUND', 'Entity not found')

    await withSeoAudit(
      {
        entityType: sug.entityType as SeoEntityType,
        entityId: sug.entityId,
        before: { [column]: before },
        after: { [column]: value },
        actorId: session.user.id,
        reason: 'ai_accepted',
      },
      async (tx) => {
        await writeEntityField(tx, sug.entityType as SeoEntityType, sug.entityId, column, value, session.user.id)
        await tx.aiSuggestion.update({
          where: { id: suggestionId },
          data: { status: 'accepted', reviewedAt: new Date() },
        })
        // Supersede earlier pending suggestions for the same entity+field
        // so the editor doesn't see stale options.
        await tx.aiSuggestion.updateMany({
          where: {
            entityType: sug.entityType,
            entityId: sug.entityId,
            field: sug.field,
            status: 'pending',
            id: { not: suggestionId },
          },
          data: { status: 'superseded', reviewedAt: new Date() },
        })
      },
    )

    revalidatePath('/admin/seo/ai/runs')
    revalidatePath('/admin/seo/inspector')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── rejectSuggestion ───────────────────────────────────────────────────────

export async function rejectSuggestion(suggestionId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.AI_GENERATE)
    z.string().uuid().parse(suggestionId)
    const sug = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!sug) return fail('NOT_FOUND', 'Suggestion not found')
    if (sug.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Suggestion is already ${sug.status}`)
    }
    await db.aiSuggestion.update({
      where: { id: suggestionId },
      data: { status: 'rejected', reviewedAt: new Date() },
    })
    revalidatePath('/admin/seo/ai/runs')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Find or create the staff user's quota row. Quota resets monthly — if the
 * current month doesn't match `resetAt`'s month, zero out the spend.
 */
async function ensureQuota(staffUserId: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const existing = await db.aiUsageQuota.findUnique({ where: { staffUserId } })
  if (!existing) {
    return db.aiUsageQuota.create({
      data: {
        staffUserId,
        monthlyUsdCapMicros: 50_000_000,
        spentThisMonthMicros: 0,
        resetAt: monthStart,
      },
    })
  }
  if (existing.resetAt < monthStart) {
    return db.aiUsageQuota.update({
      where: { staffUserId },
      data: { spentThisMonthMicros: 0, resetAt: monthStart },
    })
  }
  return existing
}

/**
 * Build the per-entity context that gets interpolated into the user
 * template. The fields here mirror the variable names defined in
 * `packages/domain/src/seo/ai-prompts.ts` (`PromptContext`).
 */
async function loadContext(
  entityType: SeoEntityType,
  entityId: string,
  field: AiSuggestField,
): Promise<Record<string, string> | null> {
  if (entityType === 'product') {
    const p = await db.product.findUnique({
      where: { id: entityId },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        specs: { take: 8, where: { isFilterable: true }, orderBy: { position: 'asc' } },
      },
    })
    if (!p) return null
    const topSpecs = p.specs
      .map((s) => `${s.label}: ${s.value}${s.unit ? ' ' + s.unit : ''}`)
      .join('; ')
    return {
      title: p.title,
      sku: p.sku,
      mpn: p.mpn ?? '',
      brand: p.brand?.name ?? '',
      categoryPath: p.category?.name ?? '',
      focusKeyword: p.focusKeyword ?? '',
      topSpecs,
      descriptionShort: p.descriptionShort ?? '',
    }
  }
  if (entityType === 'category') {
    const c = await db.category.findUnique({ where: { id: entityId } })
    if (!c) return null
    return {
      title: c.name,
      sku: c.slug,
      brand: '',
      categoryPath: c.name,
      focusKeyword: c.focusKeyword ?? '',
      descriptionShort: c.shortDescription ?? '',
      mpn: '',
      topSpecs: '',
    }
  }
  if (entityType === 'brand') {
    const b = await db.brand.findUnique({ where: { id: entityId } })
    if (!b) return null
    return {
      title: b.name,
      sku: b.slug,
      brand: b.name,
      categoryPath: '',
      focusKeyword: b.focusKeyword ?? '',
      descriptionShort: b.description ?? '',
      mpn: '',
      topSpecs: '',
    }
  }
  if (entityType === 'industry') {
    const i = await db.industry.findUnique({ where: { id: entityId } })
    if (!i) return null
    return {
      title: i.name,
      sku: i.slug,
      brand: '',
      categoryPath: i.name,
      focusKeyword: i.focusKeyword ?? '',
      descriptionShort: i.description ?? '',
      mpn: '',
      topSpecs: '',
    }
  }
  if (entityType === 'blog_post') {
    const p = await db.blogPost.findUnique({ where: { id: entityId } })
    if (!p) return null
    return {
      title: p.title,
      sku: p.slug,
      brand: '',
      categoryPath: 'Blog',
      focusKeyword: p.focusKeyword ?? '',
      descriptionShort: p.excerpt ?? '',
      mpn: '',
      topSpecs: '',
    }
  }
  if (entityType === 'cms_page') {
    const p = await db.cmsPage.findUnique({ where: { id: entityId } })
    if (!p) return null
    return {
      title: p.title,
      sku: p.slug,
      brand: '',
      categoryPath: '',
      focusKeyword: p.focusKeyword ?? '',
      descriptionShort: '',
      mpn: '',
      topSpecs: '',
    }
  }
  // Suppress unused-import warning for `field` while keeping the parameter
  // available for future per-field context tweaks.
  void field
  return null
}

async function readEntityField(
  entityType: SeoEntityType,
  entityId: string,
  column: string,
): Promise<unknown> {
  const select = { [column]: true }
  switch (entityType) {
    case 'product': {
      const r = await db.product.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    case 'category': {
      const r = await db.category.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    case 'brand': {
      const r = await db.brand.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    case 'industry': {
      const r = await db.industry.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    case 'blog_post': {
      const r = await db.blogPost.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    case 'cms_page': {
      const r = await db.cmsPage.findUnique({ where: { id: entityId }, select })
      return r ? (r as Record<string, unknown>)[column] : undefined
    }
    default:
      return undefined
  }
}

async function writeEntityField(
  tx: Prisma.TransactionClient,
  entityType: SeoEntityType,
  entityId: string,
  column: string,
  value: string,
  actorId: string,
): Promise<void> {
  const data = {
    [column]: value,
    seoUpdatedAt: new Date(),
    seoUpdatedById: actorId,
  } as Record<string, unknown>
  switch (entityType) {
    case 'product':
      await tx.product.update({ where: { id: entityId }, data })
      return
    case 'category':
      await tx.category.update({ where: { id: entityId }, data })
      return
    case 'brand':
      await tx.brand.update({ where: { id: entityId }, data })
      return
    case 'industry':
      await tx.industry.update({ where: { id: entityId }, data })
      return
    case 'blog_post':
      await tx.blogPost.update({ where: { id: entityId }, data })
      return
    case 'cms_page':
      await tx.cmsPage.update({ where: { id: entityId }, data })
      return
  }
}
