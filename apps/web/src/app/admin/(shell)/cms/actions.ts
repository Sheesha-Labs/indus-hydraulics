'use server'

/**
 * Server actions for the homepage hero carousel surface
 * (cms/page.tsx ?tab=hero). One action per UI verb:
 *
 *   uploadHomeHeroSlide   — upload + create Media + create slide at end
 *   updateHomeHeroSlide   — update alt / isPublished
 *   moveHomeHeroSlide     — shift position up or down (swap with neighbour)
 *   deleteHomeHeroSlide   — delete slide + dedicated Media row + storage object
 *
 * Every mutation calls revalidateTag('homepage-hero') so the storefront
 * carousel reflects the change on the next request, and revalidatePath('/admin/cms')
 * so the admin tab refreshes after the action returns.
 *
 * Auth: ROLES.CMS_WRITE (super_admin / manager / cms_editor).
 */

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { STORAGE_BUCKETS, deleteFromStorage, uploadToStorage } from '../../../../lib/supabase-admin'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function isImageFile(file: unknown): file is File {
  return file instanceof File && file.size > 0
}

// ── Upload ─────────────────────────────────────────────────────────────────

export async function uploadHomeHeroSlide(formData: FormData): Promise<Result<{ slideId: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    const file = formData.get('file')
    if (!isImageFile(file)) {
      return fail('VALIDATION', 'Pick an image to upload')
    }
    if (file.size > MAX_BYTES) {
      return fail('VALIDATION', `Image must be under ${MAX_BYTES / 1024 / 1024} MB`)
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return fail('VALIDATION', 'Only JPEG, PNG, WebP or GIF images are accepted')
    }

    const altRaw = formData.get('alt')
    const alt = typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim().slice(0, 200) : null

    // Upload to the existing public images bucket. Same bucket as product
    // images — fine because slide-specific paths use a `homepage-hero/`
    // prefix that doesn't collide with product paths.
    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.images,
      file,
      'homepage-hero',
    )

    // Best-effort intrinsic dimensions — Next.js needs these for layout
    // stability, but we don't currently inspect the image server-side. Fall
    // back to the placeholder reference dims (1200×1100) which roughly match
    // the storefront aspect ratio. Editors can fix this in a follow-up by
    // uploading correctly-dimensioned source files.
    const width = 1200
    const height = 1100

    // Slide goes at the end of the list. Read the current max position.
    const max = await db.homepageHeroSlide.aggregate({ _max: { position: true } })
    const nextPosition = (max._max.position ?? -1) + 1

    const slide = await db.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          kind: 'image',
          mimeType,
          originalFilename: file.name.slice(-180),
          storagePath,
          bytes,
          width,
          height,
          alt,
          uploadedById: session.user.id,
        },
        select: { id: true },
      })
      return tx.homepageHeroSlide.create({
        data: {
          mediaId: media.id,
          position: nextPosition,
          alt,
          isPublished: true,
        },
        select: { id: true },
      })
    })

    updateTag('homepage-hero')
    revalidatePath('/admin/cms')
    return ok({ slideId: slide.id })
  } catch (err) {
    return failFromError(err)
  }
}

// ── Update (alt text + publish flag) ───────────────────────────────────────

const UpdateSchema = z.object({
  id: z.string().uuid(),
  alt: z.string().trim().max(200).optional().nullable(),
  isPublished: z.boolean().optional(),
})

export async function updateHomeHeroSlide(
  input: z.input<typeof UpdateSchema>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = UpdateSchema.parse(input)

    const data: { alt?: string | null; isPublished?: boolean } = {}
    if (parsed.alt !== undefined) data.alt = parsed.alt && parsed.alt.length > 0 ? parsed.alt : null
    if (parsed.isPublished !== undefined) data.isPublished = parsed.isPublished

    if (Object.keys(data).length === 0) {
      return fail('VALIDATION', 'No changes provided')
    }

    await db.homepageHeroSlide.update({ where: { id: parsed.id }, data })

    updateTag('homepage-hero')
    revalidatePath('/admin/cms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Reorder (swap with neighbour) ──────────────────────────────────────────

const MoveSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(['up', 'down']),
})

export async function moveHomeHeroSlide(
  input: z.input<typeof MoveSchema>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const { id, direction } = MoveSchema.parse(input)

    const all = await db.homepageHeroSlide.findMany({
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    })
    const idx = all.findIndex((s) => s.id === id)
    if (idx === -1) return fail('NOT_FOUND', 'Slide not found')

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= all.length) {
      return fail('PRECONDITION_FAILED', `Already at ${direction === 'up' ? 'top' : 'bottom'}`)
    }

    const a = all[idx]!
    const b = all[swapIdx]!

    // Two-phase swap to dodge any future unique constraint on position.
    // Today there's no unique constraint, but cheap insurance.
    await db.$transaction([
      db.homepageHeroSlide.update({ where: { id: a.id }, data: { position: -1 - a.position } }),
      db.homepageHeroSlide.update({ where: { id: b.id }, data: { position: a.position } }),
      db.homepageHeroSlide.update({ where: { id: a.id }, data: { position: b.position } }),
    ])

    updateTag('homepage-hero')
    revalidatePath('/admin/cms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Delete (cascades to dedicated Media row + storage object) ──────────────

export async function deleteHomeHeroSlide(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)

    const slide = await db.homepageHeroSlide.findUnique({
      where: { id },
      select: { mediaId: true, media: { select: { id: true, storagePath: true } } },
    })
    if (!slide) return fail('NOT_FOUND', 'Slide not found')

    // Delete in order: slide row first (releases the FK RESTRICT), then
    // Media row, then the storage object. Wrap DB writes in a transaction;
    // storage cleanup runs after — if it fails, we log and move on so the
    // user-visible state stays consistent.
    await db.$transaction([
      db.homepageHeroSlide.delete({ where: { id } }),
      db.media.delete({ where: { id: slide.mediaId } }),
    ])

    try {
      await deleteFromStorage(slide.media.storagePath)
    } catch (err) {
      // Don't fail the whole action — the row is already gone. Log so we
      // can prune orphan storage objects later.
      console.error(`Storage cleanup failed for hero slide ${id}:`, err)
    }

    updateTag('homepage-hero')
    revalidatePath('/admin/cms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
