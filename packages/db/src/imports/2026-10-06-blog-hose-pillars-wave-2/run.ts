/**
 * Hose pillars and fittings, wave 2 — see ./shared.ts for what it covers and the
 * constraints it was written to.
 *
 * No new blog category: the articles land in specification-standards,
 * fitting-identification, hose-assembly, buying-hydraulic-fittings and
 * oilfield-pressure-control, all of which have market-reach profiles. Related
 * reading and SEO metadata come from `BLOG_CROSS_LINKS` and `BLOG_SEO`.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-blog-hose-pillars-wave-2/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-blog-hose-pillars-wave-2/run.ts --draft
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-blog-hose-pillars-wave-2/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import {
  applyInlineLinks,
  unresolvedArticleHrefs,
  unresolvedCatalogueHrefs,
} from '../2026-10-06-blog-inline-links/apply-to-seeds'
import { WAVE_INLINE_LINKS } from './inline-links'

import type { BlogArticleSeed } from './shared'

/**
 * Every file in ./articles is one article. Loaded by directory rather than by a
 * hand-kept import list, because a wave of thirty is exactly where a forgotten
 * import ships an article nobody can find — and the importer cannot warn about
 * a file it was never given.
 */
async function loadArticles(): Promise<BlogArticleSeed[]> {
  const dir = join(__dirname, 'articles')
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).sort()
  const mods = await Promise.all(files.map((f) => import(join(dir, f))))
  return mods.map((m) => (m.default ?? m) as BlogArticleSeed)
}

async function main(): Promise<void> {
  const loaded = await loadArticles()
  const { seeds, errors, applied } = applyInlineLinks(loaded, WAVE_INLINE_LINKS)
  errors.push(...(await unresolvedCatalogueHrefs(seeds)).map((h) => `catalogue link does not resolve: ${h}`))
  errors.push(...(await unresolvedArticleHrefs(seeds)).map((h) => `article link does not resolve: ${h}`))
  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing imported:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${applied} in-text catalogue link(s) applied`)
  await runBlogArticleImport({
    articles: seeds,
    dryRun: process.argv.includes('--dry-run'),
    status: process.argv.includes('--draft') ? 'draft' : 'published',
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
