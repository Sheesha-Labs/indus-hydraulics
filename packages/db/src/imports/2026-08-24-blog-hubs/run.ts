/**
 * Blog hub bodies and head-term targeting.
 *
 * Validates every hub body against BlogBlocksSchema and resolves every
 * referenced SKU and catalogue category before writing anything, on the same
 * reasoning as the article import: a category_link pointing at a dead slug
 * renders as nothing, silently, and a hub whose only job is to link outward
 * would quietly stop doing it.
 *
 * Idempotent. Re-running rewrites the same bodies and the same SEO fields.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-hubs/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-hubs/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { db } from '../../index'
import { BlogBlocksSchema, blogReferencedSkus } from '@indus/domain'

import { HUBS, UNPUBLISH } from './hubs'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const errors: string[] = []
  const parsed = new Map<string, Prisma.InputJsonValue>()
  const allSkus = new Set<string>()
  const allCategoryLinks = new Set<string>()

  for (const hub of HUBS) {
    const result = BlogBlocksSchema.safeParse(hub.bodyBlocks)
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`[${hub.slug}] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
      }
      continue
    }
    for (const sku of blogReferencedSkus(result.data)) allSkus.add(sku)
    for (const block of result.data) {
      if (block.type === 'category_link') allCategoryLinks.add(block.slug)
    }
    parsed.set(hub.slug, JSON.parse(JSON.stringify(result.data)) as Prisma.InputJsonValue)
  }

  const [blogCategories, foundSkus, foundCategories] = await Promise.all([
    db.blogCategory.findMany({ select: { slug: true } }),
    allSkus.size
      ? db.product.findMany({ where: { sku: { in: [...allSkus] } }, select: { sku: true } })
      : Promise.resolve([]),
    allCategoryLinks.size
      ? db.category.findMany({
          where: { slug: { in: [...allCategoryLinks] }, isPublished: true },
          select: { slug: true },
        })
      : Promise.resolve([]),
  ])

  const blogCatSlugs = new Set(blogCategories.map((c) => c.slug))
  for (const hub of HUBS) {
    if (!blogCatSlugs.has(hub.slug)) errors.push(`unknown blog category: ${hub.slug}`)
  }
  for (const slug of UNPUBLISH) {
    if (!blogCatSlugs.has(slug)) errors.push(`unknown blog category to unpublish: ${slug}`)
  }

  const skuSet = new Set(foundSkus.map((p) => p.sku))
  for (const sku of allSkus) if (!skuSet.has(sku)) errors.push(`unknown product SKU: ${sku}`)

  const catSet = new Set(foundCategories.map((c) => c.slug))
  for (const slug of allCategoryLinks) {
    if (!catSet.has(slug)) errors.push(`unknown or unpublished catalogue category: ${slug}`)
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${HUBS.length} hub(s) validated`)
  for (const hub of HUBS) {
    const blocks = parsed.get(hub.slug) as unknown[]
    console.log(`  /blog/c/${hub.slug} — ${blocks.length} blocks — "${hub.focusKeyword}"`)
  }
  console.log(`  unpublishing: ${UNPUBLISH.join(', ')}`)
  if (DRY_RUN) return

  for (const hub of HUBS) {
    await db.blogCategory.update({
      where: { slug: hub.slug },
      data: {
        bodyBlocks: parsed.get(hub.slug)!,
        seoTitle: hub.seoTitle,
        seoDescription: hub.seoDescription,
        focusKeyword: hub.focusKeyword,
      },
    })
    console.log(`  ✓ /blog/c/${hub.slug}`)
  }

  for (const slug of UNPUBLISH) {
    await db.blogCategory.update({ where: { slug }, data: { isPublished: false } })
    console.log(`  ✓ unpublished /blog/c/${slug}`)
  }

  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
