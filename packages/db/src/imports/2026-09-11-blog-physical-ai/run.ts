/**
 * Physical AI research wave — three long-form articles, one new category, two
 * author profiles.
 *
 * Same contract as every wave since 2026-08-17: validate every block against
 * BlogBlocksSchema, resolve every referenced SKU, catalogue category, page link
 * and sibling article against what is actually live, refuse to write anything
 * if any article has a problem, then upsert by slug with `publishedAt`
 * create-only. Idempotent. The importer is shared rather than forked — see the
 * note at the top of ../blog-article-import.ts.
 *
 * THIS WAVE IMPORTS AS DRAFT. See ./shared.ts for why, and read it before
 * changing the flag: the reason is that neither author has verifiable
 * credentials recorded yet, not that the content is unfinished.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-11-blog-physical-ai/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-11-blog-physical-ai/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-11-blog-physical-ai/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { PHYSICAL_AI_CATEGORY } from './category'
import ARTICLE_01 from './articles/humanoid-robots-offshore-rigs'
import ARTICLE_02 from './articles/physical-ai-inspecting-megamachines'
import ARTICLE_03 from './articles/vision-models-industrial-ai-limits'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [ARTICLE_01, ARTICLE_02, ARTICLE_03]

/**
 * Author profiles for the wave.
 *
 * Everything here is a name and a slug. `credentials`, `jobTitle`, `bio`,
 * `yearsExperience`, `linkedinUrl` and `avatarMediaId` are deliberately absent
 * rather than filled with a plausible guess: `credentials` feeds
 * `hasCredential` in Person JSON-LD, so a value invented here is a machine-
 * readable claim about a real person's qualifications published under their
 * name. On articles that argue about pressure-containment safety that is not a
 * small thing to get wrong.
 *
 * `isPublished: false` keeps the author pages out of the sitemap until the
 * profiles are real. Filling them in and flipping both flags is the step that
 * unblocks publication — it is a CMS edit and costs no deployment.
 */
const AUTHORS = [
  { slug: 'ayush-bhatia', name: 'Ayush Bhatia', position: 1 },
  { slug: 'krishan-bhatia', name: 'Krishan Bhatia', position: 2 },
]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function main(): Promise<void> {
  // Validate the category body before anything is written, so a malformed hub
  // fails the run rather than landing half-applied alongside three articles.
  const categoryBlocks = BlogBlocksSchema.safeParse(PHYSICAL_AI_CATEGORY.bodyBlocks)
  if (!categoryBlocks.success) {
    console.error('category bodyBlocks failed validation:')
    for (const issue of categoryBlocks.error.issues) {
      console.error(`  ✗ bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    process.exitCode = 1
    return
  }

  if (DRY_RUN) {
    console.log(`[dry-run] category /blog/c/${PHYSICAL_AI_CATEGORY.slug}`)
    for (const a of AUTHORS) console.log(`[dry-run] author /blog/author/${a.slug} — ${a.name}`)
  } else {
    const { bodyBlocks, focusKeyword, ...rest } = PHYSICAL_AI_CATEGORY
    const categoryData = {
      ...rest,
      focusKeyword,
      bodyBlocks: JSON.parse(JSON.stringify(categoryBlocks.data)) as Prisma.InputJsonValue,
    }
    await db.blogCategory.upsert({
      where: { slug: PHYSICAL_AI_CATEGORY.slug },
      update: categoryData,
      create: categoryData,
    })
    console.log(`  ✓ /blog/c/${PHYSICAL_AI_CATEGORY.slug}`)

    for (const author of AUTHORS) {
      // `update` carries only `name`. An existing row whose profile has since
      // been filled in by hand must not be reset to this file's empty version
      // every time the wave is re-run — which is exactly what a full upsert of
      // these fields would do the moment someone writes a real bio.
      await db.blogAuthor.upsert({
        where: { slug: author.slug },
        update: { name: author.name },
        create: { slug: author.slug, name: author.name, position: author.position, isPublished: false },
      })
      console.log(`  ✓ /blog/author/${author.slug}`)
    }
  }

  await runBlogArticleImport({
    articles: ARTICLES,
    dryRun: DRY_RUN,
    status: PUBLISH ? 'published' : 'draft',
  })

  if (!DRY_RUN && !PUBLISH) {
    console.log('')
    console.log('Imported as DRAFT. Before publishing:')
    console.log('  1. Fill in credentials, jobTitle, bio and avatar on both author profiles')
    console.log('  2. Set isPublished on both author rows')
    console.log('  3. Re-run with --publish, or publish each article from the admin editor')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
