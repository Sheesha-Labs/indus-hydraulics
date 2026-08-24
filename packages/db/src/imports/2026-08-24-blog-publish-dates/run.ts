/**
 * One-off correction: 37 articles carried a publish date in the future.
 *
 * Waves 3, 4 and 5 were seeded with `publishedAt` values spread across
 * 25–28 August to stagger them. They were all actually imported on the 24th,
 * so those dates were between one and four days ahead of reality — and the
 * article template renders `publishedAt` straight into `datePublished` in the
 * Article JSON-LD, so 37 live pages were telling Google they had been
 * published tomorrow.
 *
 * That is worth correcting for two reasons. Search engines discount or ignore
 * future-dated content, and more simply it was untrue.
 *
 * WHY THIS NEEDS ITS OWN SCRIPT
 *
 * The article importers deliberately treat `publishedAt` as create-only —
 * re-importing an edited article must not re-date it, which is the right rule
 * and the reason the seed-file fix alone does not reach the database. This is
 * the deliberate exception, scoped to the 37 slugs below and idempotent: it
 * only writes where the stored value differs from the corrected one.
 *
 * WHERE THE REPLACEMENT VALUES COME FROM
 *
 * Each article's own `createdAt` — the moment the row was actually written —
 * rounded to the second. Not invented, and it preserves the real publication
 * order. The same values are now in the seed files, so a fresh import of those
 * waves reproduces this rather than reintroducing the drift.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-publish-dates/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-publish-dates/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'

const DRY_RUN = process.argv.includes('--dry-run')

/** slug → corrected publishedAt, from that row's own createdAt. */
const CORRECTIONS: Record<string, string> = {
  // Wave 3 — failure diagnosis
  'hose-burst-at-the-fitting': '2026-08-24T13:42:07.000Z',
  'hydraulic-hose-cover-blistering': '2026-08-24T13:42:08.000Z',
  'hydraulic-hose-wire-corrosion': '2026-08-24T13:42:09.000Z',
  'hydraulic-hose-abrasion-failure': '2026-08-24T13:42:10.000Z',
  'hydraulic-hose-installed-with-a-twist': '2026-08-24T13:42:11.000Z',
  'hydraulic-hose-kinked': '2026-08-24T13:42:12.000Z',
  'hydraulic-hose-tube-swelling': '2026-08-24T13:42:13.000Z',
  'hydraulic-hose-cover-cracking': '2026-08-24T13:42:14.000Z',
  'hydraulic-hose-crimp-faults': '2026-08-24T13:42:15.000Z',
  'hose-failure-post-mortem': '2026-08-24T13:42:16.000Z',

  // Wave 3 — Gulf conditions
  'hydraulic-hose-in-uae-heat': '2026-08-24T13:55:51.000Z',
  'hydraulic-hose-uv-and-ozone': '2026-08-24T13:55:52.000Z',
  'hydraulic-hose-sand-abrasion': '2026-08-24T13:55:53.000Z',
  'hydraulic-hose-coastal-corrosion': '2026-08-24T13:55:54.000Z',
  'offshore-hydraulic-hose': '2026-08-24T13:55:55.000Z',
  'hydraulic-hose-shelf-life-storage': '2026-08-24T13:55:56.000Z',
  'why-summer-is-harder-on-hydraulic-hose': '2026-08-24T13:55:57.000Z',
  'desalination-and-water-treatment-hose': '2026-08-24T13:55:58.000Z',

  // Wave 4 — machine and application
  'wheel-loader-hydraulic-hose': '2026-08-24T14:32:04.000Z',
  'mobile-crane-hydraulic-hose': '2026-08-24T14:32:05.000Z',
  'backhoe-hydraulic-hose': '2026-08-24T14:32:06.000Z',
  'skid-steer-hydraulic-hose': '2026-08-24T14:32:07.000Z',
  'truck-crane-hydraulic-hose': '2026-08-24T14:32:08.000Z',
  'boom-lift-hydraulic-hose': '2026-08-24T14:32:09.000Z',
  'port-equipment-hydraulic-hose': '2026-08-24T14:32:10.000Z',
  'tractor-hydraulic-hose': '2026-08-24T14:32:11.000Z',
  'concrete-pump-hydraulic-hose': '2026-08-24T14:32:12.000Z',
  'injection-moulding-hydraulic-hose': '2026-08-24T14:32:13.000Z',
  'refuse-truck-hydraulic-hose': '2026-08-24T14:32:14.000Z',

  // Wave 5 — procurement
  'how-to-cross-reference-a-hydraulic-hose': '2026-08-24T15:18:40.000Z',
  'what-to-send-for-a-hose-quote': '2026-08-24T15:18:41.000Z',
  'hydraulic-hose-assembly-cost': '2026-08-24T15:18:42.000Z',
  'hydraulic-hose-stocking-policy': '2026-08-24T15:18:43.000Z',
  'hydraulic-hose-lead-times': '2026-08-24T15:18:44.000Z',
  'bulk-hose-or-finished-assemblies': '2026-08-24T15:18:45.000Z',
  'unbranded-hydraulic-fittings': '2026-08-24T15:18:46.000Z',
  'hydraulic-hose-kits-for-a-fleet': '2026-08-24T15:18:47.000Z',
}

async function main(): Promise<void> {
  const slugs = Object.keys(CORRECTIONS)

  const posts = await db.blogPost.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, publishedAt: true },
  })

  const found = new Set(posts.map((p) => p.slug))
  const missing = slugs.filter((s) => !found.has(s))
  if (missing.length) {
    console.error(`${missing.length} slug(s) not in the database:`)
    for (const s of missing) console.error(`  ✗ ${s}`)
    process.exitCode = 1
    return
  }

  const changes = posts
    .map((post) => ({ slug: post.slug, from: post.publishedAt, to: new Date(CORRECTIONS[post.slug]!) }))
    .filter((c) => c.from?.getTime() !== c.to.getTime())

  if (!changes.length) {
    console.log('nothing to correct — all 37 already carry their real dates')
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${changes.length} article(s) to correct`)
  for (const c of changes) {
    console.log(`  ${c.slug}\n    ${c.from?.toISOString() ?? 'null'} → ${c.to.toISOString()}`)
  }

  const stillFuture = changes.filter((c) => c.to.getTime() > Date.now())
  if (stillFuture.length) {
    console.error(`${stillFuture.length} corrected date(s) are STILL in the future — refusing`)
    process.exitCode = 1
    return
  }

  if (DRY_RUN) return

  for (const c of changes) {
    await db.blogPost.update({ where: { slug: c.slug }, data: { publishedAt: c.to } })
    console.log(`  ✓ ${c.slug}`)
  }

  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
