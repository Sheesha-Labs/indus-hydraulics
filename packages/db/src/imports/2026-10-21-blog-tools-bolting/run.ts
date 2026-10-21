/**
 * Hydraulic tools & bolting (2026-10-21): the `hydraulic-tools-bolting` hub and articles linking the
 * torque wrenches, bolting tools, jacks, pullers, presses, cutters and hydraulic power tools that had no article.
 *
 * Research notes (maker data sheets and trade press, every fact sourced) are summarised in each article's header;
 * figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 * Category first: `runBlogArticleImport` validates every article's `categorySlug` against the live table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-tools-bolting/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-tools-bolting/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { TOOLS_BOLTING_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import TORQUE from './articles/hydraulic-torque-wrenches-guide'
import BOLTING from './articles/bolt-tensioning-nut-splitters-and-flange-tools'
import JACKS from './articles/hydraulic-jacks-wedges-and-skates'
import PULLERS from './articles/hydraulic-pullers-presses-and-cutters'
import POWER from './articles/hydraulic-power-tools-and-power-units'

export const ARTICLES: BlogArticleSeed[] = [TORQUE, BOLTING, JACKS, PULLERS, POWER]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(TOOLS_BOLTING_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }
  if (DRY_RUN) {
    const exists = await db.blogCategory.findUnique({ where: { slug: TOOLS_BOLTING_CATEGORY.slug }, select: { id: true } })
    console.log(`[dry-run] category ${TOOLS_BOLTING_CATEGORY.slug} — ${parsed.data.length} blocks — ${exists ? 'exists' : 'would be created'}`)
    return
  }
  const { bodyBlocks: _seedBlocks, ...fields } = TOOLS_BOLTING_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: TOOLS_BOLTING_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${TOOLS_BOLTING_CATEGORY.slug} (category)`)
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

  await upsertCategory()
  // The category must exist before the article import validates against it; on a dry run with no
  // category yet, the import would report every article as having an unknown category.
  if (DRY_RUN && !(await db.blogCategory.findUnique({ where: { slug: TOOLS_BOLTING_CATEGORY.slug } }))) {
    console.log('[dry-run] skipping article import validation against the live category table (category not created yet)')
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
