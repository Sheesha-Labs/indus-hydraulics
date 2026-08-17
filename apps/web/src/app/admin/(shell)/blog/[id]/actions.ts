'use server'

import { revalidatePath } from 'next/cache'
import { invalidateBlogPosts } from '../../../../../lib/cache-tags'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import {
  estimateReadingMinutes,
  parseBlogBlocks,
  parseLocalDateTime,
  projectSeoFields,
  resolvePublishedAt,
} from '@indus/domain'
import {
  blocksToPlainText,
  deriveExcerpt,
  readBodyBlocks,
  resolveBodyWrite,
} from '../../../../../lib/blog-body-save'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { STORAGE_BUCKETS, uploadToStorage } from '../../../../../lib/supabase-admin'
import { withSeoAudit } from '../../../../../lib/seo-audit'

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
  const seoTitle = (formData.get('seoTitle') as string | null) || undefined
  const seoDescription = (formData.get('seoDescription') as string | null) || undefined
  const tagsRaw = (formData.get('tags') as string | null) || ''
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
  const publish = formData.get('publish') === '1'

  // Hero image. The picker submits '' to mean "no hero", which must clear the
  // FK rather than be dropped — hence null, not undefined.
  const heroRaw = (formData.get('heroId') as string | null) ?? ''
  const heroId = heroRaw.trim() ? heroRaw.trim() : null

  // Public byline — a BlogAuthor, not the staff user who pressed save.
  // `authorStaffId` still records who created the row; the two are different
  // questions and conflating them is what credited posts to whichever
  // sub-editor happened to touch them last.
  //
  // Empty means "no public byline", which is a real choice (the storefront
  // then falls back to the staff name), so it clears rather than being
  // ignored.
  const bylineRaw = (formData.get('blogAuthorId') as string | null) ?? ''
  const blogAuthorId = bylineRaw.trim() ? bylineRaw.trim() : null

  // Topic hub the post belongs to. Drives /blog/c/[slug], the chip on the
  // index card, and the Category column on the Blog Editor list. Empty is a
  // real choice — an uncategorised post still renders — so it clears.
  const categoryRaw = (formData.get('categoryId') as string | null) ?? ''
  const categoryId = categoryRaw.trim() ? categoryRaw.trim() : null

  // The body arrives as a JSON array from the block editor. It is opaque here
  // — the editor's node set constrains what an author can produce in the
  // browser, not what reaches this action — so every block is re-validated and
  // every HTML field is re-sanitised before it is stored. `body` keeps the
  // plain-text shadow of the article for full-text search and for anything
  // still reading the legacy column.
  const blocks = readBodyBlocks(formData.get('bodyBlocks'))
  const excerpt = deriveExcerpt(formData.get('excerpt') as string | null, blocks) ?? undefined

  // Explicit publish date, from a datetime-local input. Back-dating only —
  // a future date does NOT hold the post back, because nothing filters on it.
  const publishedAtRaw = (formData.get('publishedAt') as string | null) ?? ''
  const explicitPublishedAt = parseLocalDateTime(publishedAtRaw)

  const base = {
    title,
    slug,
    excerpt,
    seoTitle,
    seoDescription,
    tags,
    heroId,
    blogAuthorId,
    categoryId,
    bodyBlocks: blocks,
    isPublished: publish,
    // `status` supersedes `isPublished` and the two are kept in lockstep until
    // every read site has moved across. Writing only the boolean is what left
    // published posts showing a Draft pill on the list, which reads as data
    // loss to whoever wrote them.
    status: publish ? ('published' as const) : ('draft' as const),
  }

  if (id === 'new') {
    const post = await db.blogPost.create({
      data: {
        ...base,
        body: blocksToPlainText(blocks),
        readingMinutes: blocks.length > 0 ? estimateReadingMinutes(blocks) : null,
        // Provenance, not byline: who created the row.
        authorStaffId: session.user.id,
        publishedAt: explicitPublishedAt ?? (publish ? new Date() : null),
      },
    })
    revalidatePath('/admin/blog')
    invalidateBlogPosts()
    redirect(`/admin/blog/${post.id}`)
  }

  // `publishedAt` is the canonical first-publication date and feeds Article
  // JSON-LD `datePublished`. Re-publishing an edit must not reset it to now,
  // and un-publishing must not erase it — otherwise a post that goes back up
  // loses its original date and its search history along with it.
  const existing = await db.blogPost.findUnique({
    where: { id },
    select: { publishedAt: true, body: true, readingMinutes: true },
  })

  const { body, readingMinutes, preservedLegacy } = resolveBodyWrite({
    blocks,
    existingBody: existing?.body ?? null,
    existingReadingMinutes: existing?.readingMinutes ?? null,
    estimateMinutes: estimateReadingMinutes,
  })

  const publishedAt = resolvePublishedAt({
    explicit: explicitPublishedAt,
    existing: existing?.publishedAt ?? null,
    publish,
    now: new Date(),
  })

  await db.blogPost.update({
    where: { id },
    data: {
      ...base,
      body,
      readingMinutes,
      // Same reasoning as the body: a blank excerpt derived from no blocks
      // would wipe one that a legacy row already carries.
      // Same reasoning as the body: a blank excerpt derived from no blocks
      // would wipe one a legacy row already carries.
      ...(preservedLegacy && !excerpt ? {} : { excerpt }),
      publishedAt,
    },
  })

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  // The homepage rail and the blog index read through `unstable_cache` on the
  // `blog-posts` tag. Without this purge an edit is invisible on the
  // storefront until the tag expires on its own.
  invalidateBlogPosts()
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

    revalidatePath(`/admin/blog/${parsed.id}`)
    invalidateBlogPosts()
    revalidatePath(`/blog/${before.slug}`)
    revalidatePath('/admin/seo/inspector')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type UploadedImage = {
  mediaId: string
  storagePath: string
  alt: string | null
  originalFilename: string
}

export async function uploadBlogPostOgImage(
  formData: FormData,
): Promise<Result<UploadedImage>> {
  return uploadBlogPostImage(formData, 'seo/og')
}

/**
 * Hero upload. Same validation and Media row as the OG picker, but filed
 * under `blog/hero` so the two roles stay separable in storage.
 */
/**
 * Body image upload. Filed under `blog/body` so an in-article figure stays
 * separable in storage from the hero and the OG card, which are different
 * jobs at different sizes.
 */
export async function uploadBlogPostBodyImage(
  formData: FormData,
): Promise<Result<UploadedImage>> {
  return uploadBlogPostImage(formData, 'blog/body')
}

export async function uploadBlogPostHeroImage(
  formData: FormData,
): Promise<Result<UploadedImage>> {
  return uploadBlogPostImage(formData, 'blog/hero')
}

async function uploadBlogPostImage(
  formData: FormData,
  folder: string,
): Promise<Result<UploadedImage>> {
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
      folder,
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

// ── Publish / archive, from the editor's publish card ──────────────────────

/**
 * Take a saved post live, or pull it back to draft.
 *
 * Publishing reads the row back rather than trusting the caller: a post with
 * no title or no body has nothing to serve, and a 404-shaped article on the
 * index is worse than a draft nobody can see. The publish button in the editor
 * saves first for exactly this reason.
 */
export async function setBlogPostPublished(
  id: string,
  published: boolean,
): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)

    const post = await db.blogPost.findUnique({
      where: { id },
      select: {
        title: true,
        slug: true,
        body: true,
        bodyBlocks: true,
        publishedAt: true,
        deletedAt: true,
      },
    })
    if (!post) return fail('NOT_FOUND', 'Post not found')
    if (post.deletedAt) return fail('VALIDATION', 'Restore it from the trash first.')

    if (published) {
      if (!post.title.trim()) return fail('VALIDATION', 'A title is required to publish.')
      const { blocks } = parseBlogBlocks(post.bodyBlocks)
      if (blocks.length === 0 && !post.body.trim())
        return fail('VALIDATION', 'The body is empty — write something first.')
    }

    await db.blogPost.update({
      where: { id },
      data: {
        isPublished: published,
        status: published ? 'published' : 'draft',
        // `publishedAt` is the canonical first-publication date and feeds
        // Article JSON-LD `datePublished`. Un-publishing must not erase it, or
        // a post that goes back up loses its original date.
        publishedAt: published ? (post.publishedAt ?? new Date()) : post.publishedAt,
      },
    })

    revalidateBlogPost(id, post.slug)
    return ok({ message: published ? 'Published.' : 'Reverted to draft.' })
  } catch (err) {
    return failFromError(err)
  }
}

/** Archive keeps the slug reserved; un-archiving returns the post to draft. */
export async function setBlogPostArchivedFromEditor(
  id: string,
  archived: boolean,
): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)

    const post = await db.blogPost.findUnique({ where: { id }, select: { slug: true } })
    if (!post) return fail('NOT_FOUND', 'Post not found')

    await db.blogPost.update({
      where: { id },
      data: { status: archived ? 'archived' : 'draft', isPublished: false },
    })

    revalidateBlogPost(id, post.slug)
    return ok({ message: archived ? 'Archived.' : 'Moved back to draft.' })
  } catch (err) {
    return failFromError(err)
  }
}

function revalidateBlogPost(id: string, slug: string) {
  revalidatePath('/admin/blog')
  revalidatePath(`/admin/blog/${id}`)
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  invalidateBlogPosts()
}
