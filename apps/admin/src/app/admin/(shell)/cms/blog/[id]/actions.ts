'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { projectSeoFields } from '@indus/domain'
import { auth } from '../../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../../lib/result'
import { STORAGE_BUCKETS, uploadToStorage } from '../../../../../../lib/supabase'
import { withSeoAudit } from '../../../../../../lib/seo-audit'

// ── Existing content save (Content tab) ────────────────────────────────────
//
// Preserved verbatim from the previous inline-form editor — only difference
// is that it now lives in a co-located actions file so the new client
// component can call it.

export async function savePost(formData: FormData) {
  const session = requireRole(await auth(), ROLES.CMS_WRITE)

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = (formData.get('excerpt') as string | null) || undefined
  const body = formData.get('body') as string
  const seoTitle = (formData.get('seoTitle') as string | null) || undefined
  const seoDescription = (formData.get('seoDescription') as string | null) || undefined
  const tagsRaw = (formData.get('tags') as string | null) || ''
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
  const publish = formData.get('publish') === '1'

  const data = {
    title,
    slug,
    excerpt,
    body,
    seoTitle,
    seoDescription,
    tags,
    isPublished: publish,
    publishedAt: publish ? new Date() : undefined,
    authorStaffId: session.user.id,
  }

  if (id === 'new') {
    const post = await db.blogPost.create({ data })
    revalidatePath('/admin/cms')
    redirect(`/admin/cms/blog/${post.id}`)
  } else {
    await db.blogPost.update({ where: { id }, data })
    revalidatePath('/admin/cms')
    revalidatePath(`/blog/${slug}`)
  }
}

// ── SEO tab — `updateBlogPostSeo` mirrors updateProductSeo ──────────────────

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))

const ChangeFreqSchema = z.enum([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

const UpdateBlogPostSeoSchema = z.object({
  id: z.string().uuid(),
  seoTitle: optionalString(180),
  seoDescription: optionalString(320),
  canonicalUrl: optionalString(2048).refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    'Canonical must be a full https:// URL or empty',
  ),
  focusKeyword: optionalString(120),
  robotsIndex: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  robotsFollow: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  ogImageMediaId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  sitemapPriority: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === '' || v === null) return null
      const n = Number(v)
      return Number.isNaN(n) ? null : Math.max(0, Math.min(1, n))
    }),
  sitemapChangeFreq: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? v : null))
    .pipe(ChangeFreqSchema.nullable()),
  excludeFromSitemap: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  jsonLdOverride: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length ? v : null)),
})

export async function updateBlogPostSeo(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = UpdateBlogPostSeoSchema.parse({
      id: formData.get('id'),
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      canonicalUrl: formData.get('canonicalUrl') ?? '',
      focusKeyword: formData.get('focusKeyword') ?? '',
      robotsIndex: formData.get('robotsIndex') ?? 'true',
      robotsFollow: formData.get('robotsFollow') ?? 'true',
      ogImageMediaId: formData.get('ogImageMediaId') ?? '',
      sitemapPriority: formData.get('sitemapPriority') ?? '',
      sitemapChangeFreq: formData.get('sitemapChangeFreq') ?? '',
      excludeFromSitemap: formData.get('excludeFromSitemap') ?? 'false',
      jsonLdOverride: formData.get('jsonLdOverride') ?? '',
    })

    let parsedOverride: Prisma.InputJsonValue | null = null
    if (parsed.jsonLdOverride !== null) {
      try {
        parsedOverride = JSON.parse(parsed.jsonLdOverride) as Prisma.InputJsonValue
      } catch {
        return fail('VALIDATION', 'jsonLdOverride must be valid JSON', {
          jsonLdOverride: ['Invalid JSON'],
        })
      }
    }

    if (parsed.ogImageMediaId) {
      const media = await db.media.findUnique({
        where: { id: parsed.ogImageMediaId },
        select: { id: true },
      })
      if (!media) {
        return fail('VALIDATION', 'Selected OG image no longer exists', {
          ogImageMediaId: ['Media row not found'],
        })
      }
    }

    const before = await db.blogPost.findUnique({
      where: { id: parsed.id },
      select: {
        seoTitle: true,
        seoDescription: true,
        canonicalUrl: true,
        focusKeyword: true,
        robotsIndex: true,
        robotsFollow: true,
        ogImageMediaId: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
        excludeFromSitemap: true,
        jsonLdOverride: true,
        slug: true,
      },
    })
    if (!before) return fail('NOT_FOUND', 'Blog post not found')

    const after = {
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      canonicalUrl: parsed.canonicalUrl,
      focusKeyword: parsed.focusKeyword,
      robotsIndex: parsed.robotsIndex,
      robotsFollow: parsed.robotsFollow,
      ogImageMediaId: parsed.ogImageMediaId,
      sitemapPriority: parsed.sitemapPriority,
      sitemapChangeFreq: parsed.sitemapChangeFreq,
      excludeFromSitemap: parsed.excludeFromSitemap,
      jsonLdOverride: parsedOverride,
    }

    await withSeoAudit(
      {
        entityType: 'blog_post',
        entityId: parsed.id,
        before: projectSeoFields(before as Record<string, unknown>),
        after: projectSeoFields(after as Record<string, unknown>),
        actorId: session.user.id,
      },
      async (tx) => {
        await tx.blogPost.update({
          where: { id: parsed.id },
          data: {
            seoTitle: after.seoTitle,
            seoDescription: after.seoDescription,
            canonicalUrl: after.canonicalUrl,
            focusKeyword: after.focusKeyword,
            robotsIndex: after.robotsIndex,
            robotsFollow: after.robotsFollow,
            ogImageMediaId: after.ogImageMediaId,
            sitemapPriority:
              after.sitemapPriority !== null
                ? new Prisma.Decimal(after.sitemapPriority)
                : null,
            sitemapChangeFreq: after.sitemapChangeFreq,
            excludeFromSitemap: after.excludeFromSitemap,
            jsonLdOverride: after.jsonLdOverride ?? Prisma.DbNull,
            seoUpdatedAt: new Date(),
            seoUpdatedById: session.user.id,
          },
        })
      },
    )

    revalidatePath(`/admin/cms/blog/${parsed.id}`)
    revalidatePath(`/blog/${before.slug}`)
    revalidatePath('/admin/seo/inspector')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadBlogPostOgImage(
  formData: FormData,
): Promise<
  Result<{ mediaId: string; storagePath: string; alt: string | null; originalFilename: string }>
> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const session = await auth()
    const altRaw = (formData.get('alt') as string | null) ?? ''
    const alt = altRaw.trim() ? altRaw.trim().slice(0, 200) : null
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return fail('VALIDATION', 'Pick an image file to upload', {
        file: ['File is required'],
      })
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail('VALIDATION', `Image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB`)
    }
    if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return fail('VALIDATION', `Unsupported image type: ${file.type}`)
    }
    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.images,
      file,
      'seo/og',
    )
    const media = await db.media.create({
      data: {
        kind: 'image',
        mimeType,
        originalFilename: file.name.slice(0, 200),
        storagePath,
        bytes,
        alt,
        uploadedById: session?.user?.id ?? null,
      },
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    })
    return ok({
      mediaId: media.id,
      storagePath: media.storagePath,
      alt: media.alt,
      originalFilename: media.originalFilename,
    })
  } catch (err) {
    return failFromError(err)
  }
}
