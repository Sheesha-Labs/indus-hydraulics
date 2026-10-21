/**
 * Cylinders, pumps and motors (2026-10-21): the `cylinders-pumps-motors` hub and fifteen articles linking the
 * roughly three hundred cylinders, pumps and motors that had no article pointing at them.
 *
 * Research notes (maker data sheets and trade press, every fact sourced) are summarised in each article's header;
 * figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 * Category first: `runBlogArticleImport` validates every article's `categorySlug` against the live table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-cylinders-pumps-motors/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-cylinders-pumps-motors/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { CYLINDERS_PUMPS_MOTORS_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import CYLINDER_GUIDE from './articles/hydraulic-cylinder-guide'
import WELDED_VS_TIE_ROD from './articles/welded-vs-tie-rod-hydraulic-cylinders'
import FORCE_AND_SPEED from './articles/hydraulic-cylinder-force-and-speed'
import MOUNTING from './articles/hydraulic-cylinder-mounting-styles'
import TELESCOPIC from './articles/telescopic-hydraulic-cylinders'
import HIGH_PRESSURE from './articles/high-pressure-hydraulic-cylinders-and-pumps'
import DRIFT from './articles/hydraulic-cylinder-drift-diagnosis'
import PUMP_TYPES from './articles/hydraulic-pump-types-gear-vane-piston'
import PUMP_SIZING from './articles/how-to-size-a-hydraulic-pump'
import VANE from './articles/vane-pump-guide-v10-v20-t6'
import TWO_STAGE from './articles/two-stage-hydraulic-pumps-log-splitter'
import DUMP_PTO from './articles/dump-pumps-and-pto-pumps'
import ORBITAL from './articles/orbital-hydraulic-motor-guide'
import MOTOR_SIZING from './articles/hydraulic-motor-torque-and-speed'
import MOTOR_TYPES from './articles/gear-orbital-or-piston-hydraulic-motor'

export const ARTICLES: BlogArticleSeed[] = [
  CYLINDER_GUIDE,
  WELDED_VS_TIE_ROD,
  FORCE_AND_SPEED,
  MOUNTING,
  TELESCOPIC,
  HIGH_PRESSURE,
  DRIFT,
  PUMP_TYPES,
  PUMP_SIZING,
  VANE,
  TWO_STAGE,
  DUMP_PTO,
  ORBITAL,
  MOTOR_SIZING,
  MOTOR_TYPES,
]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(CYLINDERS_PUMPS_MOTORS_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }
  if (DRY_RUN) {
    const exists = await db.blogCategory.findUnique({ where: { slug: CYLINDERS_PUMPS_MOTORS_CATEGORY.slug }, select: { id: true } })
    console.log(`[dry-run] category ${CYLINDERS_PUMPS_MOTORS_CATEGORY.slug} — ${parsed.data.length} blocks — ${exists ? 'exists' : 'would be created'}`)
    return
  }
  const { bodyBlocks: _seedBlocks, ...fields } = CYLINDERS_PUMPS_MOTORS_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: CYLINDERS_PUMPS_MOTORS_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${CYLINDERS_PUMPS_MOTORS_CATEGORY.slug} (category)`)
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
  if (DRY_RUN && !(await db.blogCategory.findUnique({ where: { slug: CYLINDERS_PUMPS_MOTORS_CATEGORY.slug } }))) {
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
