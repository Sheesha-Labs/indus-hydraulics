/**
 * Emergency removal of every `figure` block from every article.
 *
 * Kept because the ordering mistake it exists for is easy to repeat: the
 * figure data was applied to production before the renderer that resolves
 * `imageId` as a Media id had shipped, so main rendered every figure through
 * the shared service-case view, built `${R2_PUBLIC_URL}/<uuid>` as a URL, and
 * put one broken image on all 93 articles.
 *
 * Data that depends on a renderer change goes AFTER that change is live.
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes, type BlogBlocksInput } from '@indus/domain'
import { db } from '../../index'
import { syncArticleLinks } from '../blog-article-import'

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  let stripped = 0
  for (const post of posts) {
    const current = Array.isArray(post.bodyBlocks) ? (post.bodyBlocks as BlogBlocksInput) : []
    if (!current.some((b) => b.type === 'figure')) continue
    const parsed = BlogBlocksSchema.safeParse(current.filter((b) => b.type !== 'figure'))
    if (!parsed.success) {
      console.error(`  ✗ ${post.slug}: ${parsed.error.issues[0]?.message}`)
      continue
    }
    await db.blogPost.update({
      where: { id: post.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(parsed.data),
      },
    })
    await syncArticleLinks(post.id, parsed.data)
    stripped++
  }
  console.log(`stripped figures from ${stripped} article(s)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
