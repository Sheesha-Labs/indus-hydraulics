/**
 * Puts the Dinamic Oil drives and winches on five industry pages (2026-10-21).
 *
 * The marine, construction, mining, steel and oil-and-gas pages had no curated `featuredProductSkus`, so each showed
 * the most recently updated products in its `featuredCategorySlugs` — two to six cylinders and valves. Setting an
 * explicit list switches the page to it, so each list keeps those products and adds the Dinamic Oil listings that
 * belong in that industry (deck and offshore winch drives on marine, slewing and wheel drives on construction, heavy
 * gearboxes and coolers on mining and steel, offshore winches on oil and gas). Dinamic Oil first, 8 at most.
 *
 * Idempotent. Run with --dry-run first; the previous lists are printed for rollback.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-dinamic-oil-industry-featured/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-dinamic-oil-industry-featured/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'

/** Dinamic Oil listings per industry, in display order. */
export const DINAMIC_OIL_BY_INDUSTRY: Record<string, string[]> = {
  marine: ['IH-DO-WD', 'IH-DO-RW', 'IH-DO-SLR', 'IH-DO-WDD'],
  construction: ['IH-DO-SLR', 'IH-DO-S', 'IH-DO-EW', 'IH-DO-GR'],
  mining: ['IH-DO-GB', 'IH-DO-RE', 'IH-DO-SRD', 'IH-DO-COOL'],
  steel: ['IH-DO-GB', 'IH-DO-GBA', 'IH-DO-RE', 'IH-DO-COOL'],
  'oil-gas': ['IH-DO-SRD', 'IH-DO-WD', 'IH-DO-RW', 'IH-DO-SLG'],
}

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  for (const [slug, dinamic] of Object.entries(DINAMIC_OIL_BY_INDUSTRY)) {
    const ind = await db.industry.findUnique({
      where: { slug },
      select: { id: true, featuredProductSkus: true, featuredCategorySlugs: true },
    })
    if (!ind) throw new Error(`industry ${slug} missing`)
    const curated = Array.isArray(ind.featuredProductSkus) ? (ind.featuredProductSkus as string[]) : []
    // What the page shows today: the curated list, or the category fallback the storefront uses.
    const current = curated.length
      ? curated
      : (
          await db.product.findMany({
            where: { status: 'active', category: { slug: { in: ind.featuredCategorySlugs as string[] } } },
            select: { sku: true },
            take: 8,
            orderBy: { updatedAt: 'desc' },
          })
        )
          .map((p) => p.sku)
          .filter((s) => !s.startsWith('IH-DO-'))
    const active = await db.product.findMany({ where: { sku: { in: dinamic }, status: 'active' }, select: { sku: true } })
    const missing = dinamic.filter((s) => !active.some((a) => a.sku === s))
    if (missing.length) throw new Error(`${slug}: not active ${missing.join(', ')}`)
    const next = [...new Set([...dinamic, ...current])].slice(0, 8)
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${slug}: was ${JSON.stringify(curated)} (showing ${current.length}) → ${JSON.stringify(next)}`)
    if (!DRY_RUN) await db.industry.update({ where: { id: ind.id }, data: { featuredProductSkus: next } })
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
