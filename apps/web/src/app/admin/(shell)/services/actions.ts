'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

/**
 * Editing a service case used to mean a commit.
 *
 * Twenty rows, a public route family at /services/[slug], and no screen — so
 * changing a headline or unpublishing a case meant a code change, a build and a
 * deployment, which on this project also means an empty ISR cache for ~1,790
 * URLs. See docs/deployment-budget.md.
 *
 * This covers what actually gets edited after a case is written: whether it is
 * published, how it reads on the index grid, the sort dimensions, and the SEO
 * fields. The article body (`bodyBlocks`) is deliberately NOT here — it has its
 * own typed block schema in @indus/domain/service-case-blocks and deserves the
 * treatment the blog editor got, not a JSON textarea.
 */

/** Every path that renders a case or a list of them. */
function revalidateServiceSurfaces(slug: string): void {
  revalidatePath('/services')
  revalidatePath(`/services/${slug}`)
  revalidatePath('/admin/services')
  // The index grid is prerendered and rolls up all published cases, so a
  // status or card change has to reach it as well as the case's own page.
  revalidatePath('/services/[slug]', 'page')
}

/** Mirrors `ServiceCaseCardTagStyle` in the schema — two values, not three. */
const CARD_TAG_STYLES = ['standard', 'oil'] as const

function emptyToNull(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))
}

function nullableInt() {
  return z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0), 'Must be a whole number')
}

const UpdateServiceCaseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  titleAccent: emptyToNull(120),
  deck: z.string().trim().min(1, 'Deck is required').max(1000),
  topicLabel: z.string().trim().min(1, 'Topic label is required').max(120),
  region: emptyToNull(120),
  caseDateLabel: emptyToNull(120),
  cardOneLiner: emptyToNull(400),
  cardTagLabel: z.string().trim().min(1, 'Card tag is required').max(60),
  cardTagStyle: z.enum(CARD_TAG_STYLES),
  cardDurationLabel: emptyToNull(60),
  durationDays: nullableInt(),
  savingsAmount: nullableInt(),
  seoTitle: emptyToNull(180),
  seoDescription: emptyToNull(320),
  robotsIndex: z.boolean(),
})

export async function updateServiceCase(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateServiceCaseSchema.parse({
      id: formData.get('id'),
      status: formData.get('status'),
      isFeatured: formData.get('isFeatured') === 'on',
      title: formData.get('title'),
      titleAccent: formData.get('titleAccent') ?? '',
      deck: formData.get('deck'),
      topicLabel: formData.get('topicLabel'),
      region: formData.get('region') ?? '',
      caseDateLabel: formData.get('caseDateLabel') ?? '',
      cardOneLiner: formData.get('cardOneLiner') ?? '',
      cardTagLabel: formData.get('cardTagLabel'),
      cardTagStyle: formData.get('cardTagStyle'),
      cardDurationLabel: formData.get('cardDurationLabel') ?? '',
      durationDays: formData.get('durationDays') ?? '',
      savingsAmount: formData.get('savingsAmount') ?? '',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      robotsIndex: formData.get('robotsIndex') === 'on',
    })

    const existing = await db.serviceCase.findUnique({
      where: { id: parsed.id },
      select: { slug: true, status: true, publishedAt: true },
    })
    if (!existing) return fail('NOT_FOUND', 'That case no longer exists.')

    // Publishing for the first time stamps the date the index sorts by; going
    // back to draft leaves it alone, so re-publishing keeps the original date
    // rather than jumping the case to the top of "most recent".
    const publishedAt =
      parsed.status === 'published' && existing.publishedAt === null
        ? new Date()
        : existing.publishedAt

    // Case of the Week is a single slot. Setting it here has to clear whoever
    // held it, or the index renders two featured cases and drops one from the
    // grid it was also meant to appear in.
    if (parsed.isFeatured) {
      await db.serviceCase.updateMany({
        where: { isFeatured: true, id: { not: parsed.id } },
        data: { isFeatured: false },
      })
    }

    const { id, ...fields } = parsed
    await db.serviceCase.update({
      where: { id },
      data: { ...fields, publishedAt, seoUpdatedAt: new Date() },
    })

    revalidateServiceSurfaces(existing.slug)
    return ok({ id })
  } catch (err) {
    return failFromError(err)
  }
}
