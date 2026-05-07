import { Prisma, type PrismaClient } from '@prisma/client'
import type { SpecTemplatePayload } from './types'

type Tx = PrismaClient | Prisma.TransactionClient

export type SpecTemplateUpsertResult = {
  id: string
  slug: string
  outcome: 'created' | 'updated'
  fieldsCreated: number
  fieldsUpdated: number
}

/**
 * Upsert a SpecTemplate (by slug) and synchronise its fields. Field upserts
 * are keyed on the schema's `(templateId, key)` UNIQUE constraint, so
 * re-running the importer with edited fields just updates the existing row.
 *
 * Important: a `key` is immutable once any ProductSpec references it — the
 * `validateRequiredFields` helper from @indus/domain depends on stable keys
 * for required-field checks. If you need to rename a key, do it via the
 * admin's spec-template editor (which handles the cascade), NOT by editing
 * the data file.
 *
 * What this DOES NOT do:
 *   - Delete fields no longer in the data file. We only upsert; orphan fields
 *     stay in the DB. Use the admin UI to delete.
 *
 * Why: a 1000-product batch should never silently delete a field that some
 * other product is referencing.
 */
export async function upsertSpecTemplate(
  payload: SpecTemplatePayload,
  tx: Tx,
): Promise<SpecTemplateUpsertResult> {
  const existing = await tx.specTemplate.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  })

  const tplData = {
    name: payload.name,
    description: payload.description ?? null,
    position: payload.position,
  }

  let templateId: string
  let outcome: 'created' | 'updated'
  if (existing) {
    const updated = await tx.specTemplate.update({
      where: { id: existing.id },
      data: tplData,
      select: { id: true },
    })
    templateId = updated.id
    outcome = 'updated'
  } else {
    const created = await tx.specTemplate.create({
      data: { slug: payload.slug, ...tplData },
      select: { id: true },
    })
    templateId = created.id
    outcome = 'created'
  }

  // Per-field upsert. The (templateId, key) unique constraint lets us
  // use Prisma's compound `where`.
  let fieldsCreated = 0
  let fieldsUpdated = 0
  for (const field of payload.fields) {
    const existingField = await tx.specTemplateField.findUnique({
      where: { templateId_key: { templateId, key: field.key } },
      select: { id: true },
    })
    // SpecTemplateField.options is `Json?` in Prisma — for null we have to use
    // `Prisma.JsonNull`, not the raw `null` literal, or Prisma rejects the type.
    const fieldData = {
      label: field.label,
      unit: field.unit ?? null,
      dataType: field.dataType,
      options:
        field.options && field.options.length > 0
          ? (field.options as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      helpText: field.helpText ?? null,
      isRequired: field.isRequired,
      isKeyFeature: field.isKeyFeature,
      isQuickSpec: field.isQuickSpec,
      group: field.group ?? null,
      position: field.position,
    }
    if (existingField) {
      await tx.specTemplateField.update({
        where: { id: existingField.id },
        data: fieldData,
      })
      fieldsUpdated += 1
    } else {
      await tx.specTemplateField.create({
        data: { templateId, key: field.key, ...fieldData },
      })
      fieldsCreated += 1
    }
  }

  return {
    id: templateId,
    slug: payload.slug,
    outcome,
    fieldsCreated,
    fieldsUpdated,
  }
}
