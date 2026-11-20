/**
 * Drilling rig equipment (2026-11-19): the `drilling-rig-equipment` hub and twelve articles written for the
 * Oteco range — gate valves and their kits, shear-pin and reset relief valves, drilling gauges, float valves,
 * mud pump pistons, valves and dampener diaphragms, swivel washpipe, rig floor rubber, manifold fittings and
 * annular BOP packing units. Indus Hydraulics is Oteco's authorised Middle East distributor.
 *
 * Facts come from Oteco's published brochures and from the Oteco listings (catalogue PRs #629, #630, #631).
 * Interchange is named only where Oteco publishes it; no API monogram or NACE claim is made. Load ONLY after
 * those catalogues are live: the importer rejects unknown SKUs and unpublished shelves. Heroes are attached
 * afterwards with src/scripts/attach-blog-hero-images.ts.
 *
 * Category first: `runBlogArticleImport` validates every article's `categorySlug` against the live table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-blog-drilling-rig-equipment/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-blog-drilling-rig-equipment/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { DRILLING_RIG_EQUIPMENT_CATEGORY as CATEGORY } from './category'
import { ARTICLES } from './articles'

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function upsertCategory(): Promise<boolean> {
  const parsed = BlogBlocksSchema.safeParse(CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }
  const exists = await db.blogCategory.findUnique({ where: { slug: CATEGORY.slug }, select: { id: true } })
  if (DRY_RUN) {
    console.log(`[dry-run] category ${CATEGORY.slug} — ${parsed.data.length} blocks — ${exists ? 'exists' : 'would be created'}`)
    return Boolean(exists)
  }
  const { bodyBlocks: _seedBlocks, ...fields } = CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${CATEGORY.slug} (category)`)
  return true
}

async function main(): Promise<void> {
  // A bare re-run applies `draft` on update; refuse rather than silently unpublish.
  if (!DRY_RUN && !PUBLISH) {
    const live = await db.blogPost.findMany({
      where: { slug: { in: ARTICLES.map((a) => a.slug) }, status: 'published' },
      select: { slug: true },
    })
    if (live.length > 0) {
      console.error('Refusing to run: these articles are already published. Re-run with --publish or --dry-run.')
      process.exitCode = 1
      return
    }
  }

  const categoryExists = await upsertCategory()
  if (DRY_RUN && !categoryExists) {
    console.log('[dry-run] category not created yet — expect "unknown blog category" for every article below')
  }
  await runBlogArticleImport({
    articles: ARTICLES,
    dryRun: DRY_RUN,
    status: PUBLISH ? 'published' : 'draft',
    keepSeedFigures: true,
  })
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
