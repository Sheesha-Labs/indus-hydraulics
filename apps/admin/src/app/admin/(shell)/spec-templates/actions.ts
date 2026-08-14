'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import {
  deriveFieldKey,
  planTemplateSwitch,
  validateRequiredFields,
} from '@indus/domain'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

// ── Slug helpers ────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `template-${Date.now()}`
  )
}

async function uniqueTemplateSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base)
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await db.specTemplate.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

async function uniqueFieldKey(templateId: string, base: string, ignoreId?: string): Promise<string> {
  const baseKey = deriveFieldKey(base)
  let key = baseKey
  let n = 1
  while (true) {
    const existing = await db.specTemplateField.findUnique({
      where: { templateId_key: { templateId, key } },
    })
    if (!existing || existing.id === ignoreId) return key
    n += 1
    key = `${baseKey}_${n}`
  }
}

// ── Template CRUD ───────────────────────────────────────────────────────────

const CreateTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : '')),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
})

export async function createSpecTemplate(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CreateTemplateSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug') ?? '',
      description: formData.get('description') ?? '',
    })

    const slug = await uniqueTemplateSlug(parsed.slug || parsed.name)
    const tpl = await db.specTemplate.create({
      data: { name: parsed.name, slug, description: parsed.description },
    })

    revalidatePath(`/admin/spec-templates`)
    return ok({ id: tpl.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
})

export async function updateSpecTemplate(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateTemplateSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') ?? '',
    })

    const slug = await uniqueTemplateSlug(parsed.slug, parsed.id)

    await db.specTemplate.update({
      where: { id: parsed.id },
      data: { name: parsed.name, slug, description: parsed.description },
    })

    revalidatePath(`/admin/spec-templates`)
    revalidatePath(`/admin/spec-templates/${parsed.id}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteSpecTemplate(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)

    const productCount = await db.product.count({ where: { specTemplateId: id } })
    if (productCount > 0) {
      return fail(
        'PRECONDITION_FAILED',
        `Cannot delete: ${productCount} product${productCount === 1 ? '' : 's'} use this template`,
        { _: ['Detach the products first (or pick a different template for them)'] },
      )
    }
    // Categories that default to this template will have defaultSpecTemplateId
    // set to NULL by the FK ON DELETE SET NULL — that's fine; the storefront
    // just won't pre-fill the template for new products in that category.
    await db.specTemplate.delete({ where: { id } })
    revalidatePath(`/admin/spec-templates`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Field CRUD ──────────────────────────────────────────────────────────────

const FieldType = z.enum(['text', 'number', 'boolean', 'select'])

// `options` arrives as a single textarea separated by newlines.
const optionsFromText = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || !v.trim()) return null
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 100)
  })
  .transform((arr) => (arr && arr.length ? arr : null))

const AddFieldSchema = z.object({
  templateId: z.string().uuid(),
  label: z.string().trim().min(1, 'Label is required').max(120),
  key: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : '')),
  unit: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  dataType: FieldType.default('text'),
  options: optionsFromText,
  helpText: z.string().trim().max(500).optional().transform((v) => (v && v.length ? v : null)),
  isRequired: z.boolean().default(false),
  isKeyFeature: z.boolean().default(false),
  isQuickSpec: z.boolean().default(false),
  group: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : null)),
})

export async function addTemplateField(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = AddFieldSchema.parse({
      templateId: formData.get('templateId'),
      label: formData.get('label'),
      key: formData.get('key') ?? '',
      unit: formData.get('unit') ?? '',
      dataType: formData.get('dataType') ?? 'text',
      options: formData.get('options') ?? '',
      helpText: formData.get('helpText') ?? '',
      isRequired: formData.get('isRequired') === 'on',
      isKeyFeature: formData.get('isKeyFeature') === 'on',
      isQuickSpec: formData.get('isQuickSpec') === 'on',
      group: formData.get('group') ?? '',
    })

    if (parsed.dataType === 'select' && (!parsed.options || parsed.options.length === 0)) {
      return fail('VALIDATION', 'Select fields require at least one option', {
        options: ['Add one option per line'],
      })
    }

    const key = await uniqueFieldKey(parsed.templateId, parsed.key || parsed.label)

    const max = await db.specTemplateField.aggregate({
      where: { templateId: parsed.templateId },
      _max: { position: true },
    })

    await db.specTemplateField.create({
      data: {
        templateId: parsed.templateId,
        key,
        label: parsed.label,
        unit: parsed.unit,
        dataType: parsed.dataType,
        options: (parsed.options ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        helpText: parsed.helpText,
        isRequired: parsed.isRequired,
        isKeyFeature: parsed.isKeyFeature,
        isQuickSpec: parsed.isQuickSpec,
        group: parsed.group,
        position: (max._max.position ?? -1) + 1,
      },
    })

    revalidatePath(`/admin/spec-templates/${parsed.templateId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateFieldSchema = AddFieldSchema.extend({
  id: z.string().uuid(),
})

export async function updateTemplateField(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateFieldSchema.parse({
      id: formData.get('id'),
      templateId: formData.get('templateId'),
      label: formData.get('label'),
      key: formData.get('key') ?? '',
      unit: formData.get('unit') ?? '',
      dataType: formData.get('dataType') ?? 'text',
      options: formData.get('options') ?? '',
      helpText: formData.get('helpText') ?? '',
      isRequired: formData.get('isRequired') === 'on',
      isKeyFeature: formData.get('isKeyFeature') === 'on',
      isQuickSpec: formData.get('isQuickSpec') === 'on',
      group: formData.get('group') ?? '',
    })

    if (parsed.dataType === 'select' && (!parsed.options || parsed.options.length === 0)) {
      return fail('VALIDATION', 'Select fields require at least one option', {
        options: ['Add one option per line'],
      })
    }

    // Field key is immutable once any ProductSpec references it.
    const existing = await db.specTemplateField.findUnique({
      where: { id: parsed.id },
      include: { _count: { select: { productSpecs: true } } },
    })
    if (!existing) return fail('NOT_FOUND', 'Field not found')

    const referenced = existing._count.productSpecs > 0
    const submittedKey = parsed.key ? deriveFieldKey(parsed.key) : existing.key
    if (referenced && submittedKey !== existing.key) {
      return fail(
        'PRECONDITION_FAILED',
        `Cannot change the field key — ${existing._count.productSpecs} product${existing._count.productSpecs === 1 ? '' : 's'} reference this field. Delete the field and re-create it instead.`,
        { key: ['Locked: in use by products'] },
      )
    }
    const finalKey = referenced
      ? existing.key
      : submittedKey === existing.key
        ? existing.key
        : await uniqueFieldKey(parsed.templateId, submittedKey, parsed.id)

    // Update the field AND cascade label/unit/group/isFilterable changes to every
    // ProductSpec row that links to this field — keeps the storefront's flat
    // ProductSpec table in sync with the template's source-of-truth metadata.
    await db.$transaction([
      db.specTemplateField.update({
        where: { id: parsed.id },
        data: {
          key: finalKey,
          label: parsed.label,
          unit: parsed.unit,
          dataType: parsed.dataType,
          options: (parsed.options ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          helpText: parsed.helpText,
          isRequired: parsed.isRequired,
          isKeyFeature: parsed.isKeyFeature,
          isQuickSpec: parsed.isQuickSpec,
          group: parsed.group,
        },
      }),
      db.productSpec.updateMany({
        where: { templateFieldId: parsed.id },
        data: {
          label: parsed.label,
          unit: parsed.unit,
          group: parsed.group ?? 'General',
          isFilterable: parsed.isQuickSpec,
        },
      }),
    ])

    revalidatePath(`/admin/spec-templates/${parsed.templateId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteTemplateField(
  fieldId: string,
  templateId: string,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(fieldId)
    z.string().uuid().parse(templateId)

    // Existing ProductSpec rows have ON DELETE SET NULL on templateFieldId,
    // so they survive but become "additional specs" in the product editor.
    await db.specTemplateField.delete({ where: { id: fieldId } })
    revalidatePath(`/admin/spec-templates/${templateId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function reorderTemplateField(
  fieldId: string,
  direction: 'up' | 'down',
  templateId: string,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(fieldId)
    z.string().uuid().parse(templateId)
    const fields = await db.specTemplateField.findMany({
      where: { templateId },
      orderBy: { position: 'asc' },
    })
    const idx = fields.findIndex((f) => f.id === fieldId)
    if (idx === -1) return fail('NOT_FOUND', 'Field not found')
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= fields.length) return ok(undefined)

    const a = fields[idx]!
    const b = fields[swapIdx]!
    await db.$transaction([
      db.specTemplateField.update({ where: { id: a.id }, data: { position: b.position } }),
      db.specTemplateField.update({ where: { id: b.id }, data: { position: a.position } }),
    ])
    revalidatePath(`/admin/spec-templates/${templateId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product attachment (used by the Product editor's Specs tab) ────────────

export async function setProductSpecTemplate(
  productId: string,
  templateId: string | null,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(productId)
    if (templateId !== null) z.string().uuid().parse(templateId)

    // Strategy on switch:
    // 1. Read the product's current template-driven specs *with* their old field's
    //    `key` so we can match on key rather than the fragile label string.
    // 2. Update the product's template pointer.
    // 3. For each NEW template field, look up the old spec whose old field had the
    //    same key — re-link, preserving the typed value. (Handles renames + lets
    //    splitting/merging templates keep values intact.)
    // 4. Any old spec that didn't match becomes a free-form "additional spec"
    //    (templateFieldId → null). Nothing gets deleted; nothing silently lost.

    await db.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: productId },
        select: { specTemplateId: true },
      })
      if (!current) throw new Error('Product not found')

      // 1 — read existing template-driven specs with their old field's key.
      const oldLinkedSpecs = await tx.productSpec.findMany({
        where: { productId, templateFieldId: { not: null } },
        include: { templateField: { select: { key: true } } },
      })
      const specsById = new Map(oldLinkedSpecs.map((s) => [s.id, s]))

      // 2 — set the product's template pointer.
      await tx.product.update({
        where: { id: productId },
        data: { specTemplateId: templateId },
      })

      // 3 — compute the relink/orphan plan via the pure helper.
      const newFields = templateId
        ? await tx.specTemplateField.findMany({
            where: { templateId },
            select: { id: true, key: true, label: true, unit: true, group: true, isQuickSpec: true },
          })
        : []

      const plan = planTemplateSwitch(
        oldLinkedSpecs
          .filter((s) => s.templateField)
          .map((s) => ({ id: s.id, oldKey: s.templateField!.key })),
        newFields.map((f) => ({ id: f.id, key: f.key })),
      )

      // 4 — apply the plan: relinks first (with cascaded label/unit/group/isFilterable).
      const fieldById = new Map(newFields.map((f) => [f.id, f]))
      for (const r of plan.relink) {
        const f = fieldById.get(r.newFieldId)
        const spec = specsById.get(r.specId)
        if (!f || !spec) continue
        await tx.productSpec.update({
          where: { id: r.specId },
          data: {
            templateFieldId: f.id,
            label: f.label,
            unit: f.unit,
            group: f.group ?? spec.group,
            isFilterable: f.isQuickSpec,
          },
        })
      }
      // ...then orphan the rest (templateFieldId → null).
      for (const orphanId of plan.orphan) {
        await tx.productSpec.update({
          where: { id: orphanId },
          data: { templateFieldId: null },
        })
      }
    })

    revalidatePath(`/admin/products/${productId}/edit`)
    revalidatePath(`/admin/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const SaveValuesSchema = z.object({
  productId: z.string().uuid(),
})

export async function saveProductSpecValues(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = SaveValuesSchema.parse({
      productId: formData.get('productId'),
    })

    // Form encodes one input per template field as `field:<fieldId>` = value.
    const updates: Array<{ fieldId: string; value: string }> = []
    for (const [name, value] of formData.entries()) {
      if (!name.startsWith('field:')) continue
      const fieldId = name.slice('field:'.length)
      if (typeof value !== 'string') continue
      updates.push({ fieldId, value: value.trim() })
    }

    if (updates.length === 0) return ok(undefined)

    // Load all relevant fields in one query for typed coercion + group/label/unit defaults.
    const fields = await db.specTemplateField.findMany({
      where: { id: { in: updates.map((u) => u.fieldId) } },
    })
    const fieldsById = new Map(fields.map((f) => [f.id, f]))

    // Server-side required-field check (browser-level `required` is bypassable).
    const requiredCheck = validateRequiredFields(
      updates,
      fields.map((f) => ({ id: f.id, label: f.label, isRequired: f.isRequired })),
    )
    if (!requiredCheck.ok) {
      return fail(
        'VALIDATION',
        `Required field${requiredCheck.missingLabels.length === 1 ? '' : 's'} cannot be empty: ${requiredCheck.missingLabels.join(', ')}`,
        { _: requiredCheck.missingLabels.map((l) => `${l} is required`) },
      )
    }

    await db.$transaction(async (tx) => {
      // Existing ProductSpec rows for this product, indexed by templateFieldId.
      const existing = await tx.productSpec.findMany({
        where: { productId: parsed.productId, templateFieldId: { in: updates.map((u) => u.fieldId) } },
      })
      const existingByFieldId = new Map(existing.map((s) => [s.templateFieldId!, s]))

      const max = await tx.productSpec.aggregate({
        where: { productId: parsed.productId },
        _max: { position: true },
      })
      let nextPosition = (max._max.position ?? -1) + 1

      for (const u of updates) {
        const f = fieldsById.get(u.fieldId)
        if (!f) continue
        const row = existingByFieldId.get(u.fieldId)
        if (u.value === '') {
          // Empty → delete the row (clears the value rather than leaving an empty cell).
          if (row) await tx.productSpec.delete({ where: { id: row.id } })
          continue
        }
        const data = {
          group: f.group ?? 'General',
          label: f.label,
          value: u.value,
          unit: f.unit,
          isFilterable: f.isQuickSpec,
        }
        if (row) {
          await tx.productSpec.update({ where: { id: row.id }, data })
        } else {
          await tx.productSpec.create({
            data: {
              productId: parsed.productId,
              templateFieldId: f.id,
              position: nextPosition++,
              ...data,
            },
          })
        }
      }
    })

    revalidatePath(`/admin/products/${parsed.productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
