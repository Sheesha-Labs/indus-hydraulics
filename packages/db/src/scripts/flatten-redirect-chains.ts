/**
 * Repoint every redirect that lands on another redirect.
 *
 * `recordSlugRedirect` keeps the graph flat as it writes — renaming a slug
 * twice gives `a → c`, not `a → b → c`. Rows that predate it do not have that
 * property: the Dixon rebrand renamed each hose twice, months apart, leaving
 * `dixon-x → x → colour-x`. Every visitor on an old link pays two round trips,
 * and a crawler following a chain discounts what it finds at the end.
 *
 * This walks each chain to its final destination and repoints the first hop
 * straight at it. The intermediate rows stay — something may link them
 * directly — they simply stop being anyone's second hop.
 *
 * Refuses to write when a chain does not end somewhere real: a cycle, a chain
 * longer than the walk allows, or a destination that is not a live product or
 * a published category. Those want a human, not a rewrite.
 *
 * Idempotent: with no chains left it reports none and writes nothing.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/flatten-redirect-chains.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Long enough for any real rename history, short enough to stop a cycle. */
const MAX_HOPS = 10

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  const rows = await db.redirect.findMany({
    select: { id: true, fromPath: true, toPath: true, statusCode: true },
  })
  const byFrom = new Map(rows.map((r) => [r.fromPath, r]))

  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { status: 'active' }, select: { slug: true } }),
    db.category.findMany({ where: { isPublished: true }, select: { slug: true } }),
  ])
  const live = new Set([
    ...products.map((p) => `/p/${p.slug}`),
    ...categories.map((c) => `/c/${c.slug}`),
  ])

  const problems: string[] = []
  let flattened = 0

  for (const row of rows) {
    if (!byFrom.has(row.toPath)) continue        // already one hop

    const seen = new Set([row.fromPath])
    let dest = row.toPath
    let hops = 0
    while (byFrom.has(dest) && hops < MAX_HOPS) {
      if (seen.has(dest)) {
        problems.push(`${row.fromPath}: chain loops back through ${dest}`)
        dest = ''
        break
      }
      seen.add(dest)
      dest = byFrom.get(dest)!.toPath
      hops++
    }
    if (!dest) continue
    if (byFrom.has(dest)) {
      problems.push(`${row.fromPath}: still a redirect after ${MAX_HOPS} hops`)
      continue
    }
    if (dest === row.fromPath) {
      problems.push(`${row.fromPath}: chain returns to itself`)
      continue
    }
    // Only worth collapsing onto something that actually serves a page. A
    // chain ending at a 404 is a content problem, not a redirect problem.
    if (!live.has(dest)) {
      problems.push(`${row.fromPath} → ${dest}: destination is not a live product or category`)
      continue
    }

    console.log(`${dryRun ? '[dry-run] ' : ''}${row.fromPath} → ${row.toPath} → … → ${dest}`)
    if (!dryRun) {
      await db.redirect.update({ where: { id: row.id }, data: { toPath: dest } })
    }
    flattened++
  }

  console.log(
    `\n[flatten-redirect-chains] ${flattened} chain${flattened === 1 ? '' : 's'} flattened, ` +
      `${rows.length} redirects in total, ${problems.length} left for a human`,
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
