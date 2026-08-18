/**
 * Remove the site-name suffix baked into stored `seoTitle` values.
 *
 * The storefront layout sets `title.template = '%s | Indus Hydraulics'`, so
 * Next appends the site name to every page title. A bulk seed also wrote the
 * suffix into `seoTitle` itself, so 1,163 catalogue rows rendered
 * "… | Indus Hydraulics | Indus Hydraulics" — on the single most visible
 * element in a search result.
 *
 * `buildMetadata` now strips a redundant trailing site name at render time as
 * well, so a page is correct even if a bad value is entered again. This fixes
 * the stored data so the admin editor and the SEO screens show the real title.
 *
 * Only an exact trailing "| <site name>" is removed, and never the whole
 * value: an entity legitimately titled "Indus Hydraulics" keeps its name.
 *
 * Idempotent — a second run finds nothing to do.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/strip-seo-title-site-name.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'
import { stripTrailingSiteName } from '@indus/domain'

const db = new PrismaClient()
const SITE_NAME = 'Indus Hydraulics'

type Row = { id: string; seoTitle: string | null }

/** Every entity whose page title flows through the storefront layout. */
const TABLES = [
  { name: 'products', model: () => db.product },
  { name: 'categories', model: () => db.category },
  { name: 'brands', model: () => db.brand },
  { name: 'industries', model: () => db.industry },
  { name: 'cmsPages', model: () => db.cmsPage },
  { name: 'blogPosts', model: () => db.blogPost },
] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let totalChanged = 0

  for (const t of TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = t.model() as any
    const rows: Row[] = await model.findMany({
      where: { seoTitle: { contains: SITE_NAME } },
      select: { id: true, seoTitle: true },
    })

    let changed = 0
    for (const r of rows) {
      const before = r.seoTitle ?? ''
      const after = stripTrailingSiteName(before, SITE_NAME)
      if (after === before) continue
      if (!after.trim()) continue // never blank a title
      changed++
      if (!dryRun) {
        await model.update({ where: { id: r.id }, data: { seoTitle: after } })
      }
    }

    totalChanged += changed
    console.log(
      `${dryRun ? '[dry-run] ' : ''}${t.name.padEnd(11)} ${String(changed).padStart(5)} ` +
        `of ${String(rows.length).padStart(5)} matched rows rewritten`,
    )
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}done — ${totalChanged} titles corrected`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
