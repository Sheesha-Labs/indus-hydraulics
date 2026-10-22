/**
 * Pneumatics (2026-10-22): the `pneumatics` hub and fourteen articles linking every listing on the 12 pneumatics
 * shelves that went live that day — cylinders, solenoid and manual valves, flow controls, safety and lockout valves,
 * FRL air preparation, tubing, push-to-connect fittings, silencers, grippers, vacuum and air motors.
 *
 * Every fact is sourced to a maker document or a standards body; sources are listed in each article's header and
 * figures that could not be traced were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 * Category first: `runBlogArticleImport` validates every article's `categorySlug` against the live table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-22-blog-pneumatics/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-22-blog-pneumatics/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { PNEUMATICS_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import A_PNEUMATIC_CYLINDER_TYPES_GUIDE from './articles/pneumatic-cylinder-types-guide'
import A_HOW_TO_SIZE_A_PNEUMATIC_CYLINDER from './articles/how-to-size-a-pneumatic-cylinder'
import A_PNEUMATIC_CYLINDER_CUSHIONING_AND_MOUNTING from './articles/pneumatic-cylinder-cushioning-and-mounting'
import A_SOLENOID_VALVE_FUNCTIONS from './articles/solenoid-valve-functions-3-2-5-2-5-3'
import A_SIZING_PNEUMATIC_VALVES_FLOW_CV from './articles/sizing-pneumatic-valves-flow-cv'
import A_CYLINDER_SPEED_CONTROL_AND_QUICK_EXHAUST_VALVES from './articles/cylinder-speed-control-and-quick-exhaust-valves'
import A_MANUAL_AND_PILOT_OPERATED_AIR_VALVES from './articles/manual-and-pilot-operated-air-valves'
import A_FRL_FILTER_REGULATOR_LUBRICATOR_GUIDE from './articles/frl-filter-regulator-lubricator-guide'
import A_COMPRESSED_AIR_QUALITY_ISO_8573_1 from './articles/compressed-air-quality-iso-8573-1'
import A_AIR_SAFETY_RELIEF_SOFT_START_AND_LOCKOUT_VALVES from './articles/air-safety-relief-soft-start-and-lockout-valves'
import A_PNEUMATIC_TUBING_MATERIALS_GUIDE from './articles/pneumatic-tubing-materials-guide'
import A_PUSH_TO_CONNECT_FITTINGS_AND_SILENCERS from './articles/push-to-connect-fittings-and-silencers'
import A_PNEUMATIC_GRIPPERS_AND_VACUUM_GUIDE from './articles/pneumatic-grippers-and-vacuum-guide'
import A_AIR_MOTORS_GUIDE from './articles/air-motors-guide'

export const ARTICLES: BlogArticleSeed[] = [
  A_PNEUMATIC_CYLINDER_TYPES_GUIDE,
  A_HOW_TO_SIZE_A_PNEUMATIC_CYLINDER,
  A_PNEUMATIC_CYLINDER_CUSHIONING_AND_MOUNTING,
  A_SOLENOID_VALVE_FUNCTIONS,
  A_SIZING_PNEUMATIC_VALVES_FLOW_CV,
  A_CYLINDER_SPEED_CONTROL_AND_QUICK_EXHAUST_VALVES,
  A_MANUAL_AND_PILOT_OPERATED_AIR_VALVES,
  A_FRL_FILTER_REGULATOR_LUBRICATOR_GUIDE,
  A_COMPRESSED_AIR_QUALITY_ISO_8573_1,
  A_AIR_SAFETY_RELIEF_SOFT_START_AND_LOCKOUT_VALVES,
  A_PNEUMATIC_TUBING_MATERIALS_GUIDE,
  A_PUSH_TO_CONNECT_FITTINGS_AND_SILENCERS,
  A_PNEUMATIC_GRIPPERS_AND_VACUUM_GUIDE,
  A_AIR_MOTORS_GUIDE,
]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(PNEUMATICS_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }
  if (DRY_RUN) {
    const exists = await db.blogCategory.findUnique({ where: { slug: PNEUMATICS_CATEGORY.slug }, select: { id: true } })
    console.log(`[dry-run] category ${PNEUMATICS_CATEGORY.slug} — ${parsed.data.length} blocks — ${exists ? 'exists' : 'would be created'}`)
    return
  }
  const { bodyBlocks: _seedBlocks, ...fields } = PNEUMATICS_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: PNEUMATICS_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${PNEUMATICS_CATEGORY.slug} (category)`)
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
  if (DRY_RUN && !(await db.blogCategory.findUnique({ where: { slug: PNEUMATICS_CATEGORY.slug } }))) {
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
