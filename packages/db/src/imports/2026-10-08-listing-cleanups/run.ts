/**
 * Three listing fixes Ayush approved on 2026-10-08.
 *
 * 1. IH-OG-WCT-002 moves from Manuli to Continental. TauroFlon is Continental's
 *    choke & kill liner, and Manuli's oil & gas range has no choke & kill line;
 *    the May import filed it under the wrong maker. "Manuli" in its copy and
 *    liner spec becomes Continental.
 *
 * 2. Four seed hydraulic listings that no maker publishes are retired — set to
 *    draft and 301-redirected to their category, the no-deploy way
 *    (retire-pages-without-deploy):
 *      IH-FLCB-LAN-3C4-D24 — no "FLCB" valve exists; its code copies Yuken's.
 *      IH-WC-120-80-600    — no Parker welded series has a 120 mm bore.
 *      IH-CYL-80-50-300    — Rexroth's CDT3 80 mm bore takes 36, 45 or 56 mm rods.
 *      IH-PP-11KW-30-DS    — no Rexroth standard power unit matches.
 *    None has an RFQ line, an article embed, a link or a menu item.
 *
 * 3. The two photos on the KHB ball valve (IH-KHB-G12-14-2X-S) come off the
 *    listing: one carries another seller's logo, the other shows a G1″ valve.
 *    The product-image links are removed; the media rows stay, marked
 *    deleted, so the snapshot can restore them.
 *
 * Each step is one transaction; a re-run is a no-op.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-listing-cleanups/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-listing-cleanups/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'

import { db } from '../../index'
import { recordSlugRedirect } from '../../slug-redirect'

type Tx = Prisma.TransactionClient

const MOVE_SKU = 'IH-OG-WCT-002'
export const RETIRE = [
  'IH-FLCB-LAN-3C4-D24',
  'IH-WC-120-80-600',
  'IH-CYL-80-50-300',
  'IH-PP-11KW-30-DS',
]
const KHB_SKU = 'IH-KHB-G12-14-2X-S'

export function toContinental(text: string): string {
  return text
    .replace(
      /the Manuli oil (&amp;|&) gas hose range/g,
      'the Continental ContiTech oil $1 gas hose range'
    )
    .replace(/\(Manuli specialty\)/g, '(Continental)')
    .replace(/Manuli flexible/g, 'Continental flexible')
}

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const

async function main(): Promise<void> {
  const errors: string[] = []
  const snapshot: Record<string, unknown> = {}

  // 1. Manuli → Continental
  const conti = await db.brand.findUnique({ where: { slug: 'continental' }, select: { id: true } })
  const move = await db.product.findUnique({
    where: { sku: MOVE_SKU },
    select: {
      id: true,
      brandId: true,
      seoDescription: true,
      descriptionShort: true,
      descriptionLong: true,
      specs: { select: { id: true, value: true } },
    },
  })
  if (!conti || !move) errors.push('Continental brand or IH-OG-WCT-002 missing')
  const moveFields: Record<string, string> = {}
  const moveSpecs: { id: string; value: string }[] = []
  if (move && conti) {
    for (const k of ['seoDescription', 'descriptionShort', 'descriptionLong'] as const) {
      const cur = move[k]
      if (cur == null) continue
      const next = toContinental(cur)
      if (next !== cur) moveFields[k] = next
      if (/Manuli/.test(next.replace('Continental ContiTech and Manuli', '')))
        errors.push(`${MOVE_SKU}: "${k}" still names Manuli`)
    }
    for (const s of move.specs) {
      const next = toContinental(s.value)
      if (next !== s.value) moveSpecs.push({ id: s.id, value: next })
    }
    snapshot.move = move
  }
  const moveNeeded =
    !!move &&
    !!conti &&
    (move.brandId !== conti.id || Object.keys(moveFields).length > 0 || moveSpecs.length > 0)

  // 2. Retire
  const retire = await db.product.findMany({
    where: { sku: { in: RETIRE } },
    select: {
      id: true,
      sku: true,
      slug: true,
      status: true,
      category: { select: { slug: true, isPublished: true } },
    },
  })
  if (retire.length !== RETIRE.length)
    errors.push(`retire: found ${retire.length} of ${RETIRE.length}`)
  for (const r of retire)
    if (!r.category?.isPublished) errors.push(`${r.sku}: category is missing or unpublished`)
  const toRetire = retire.filter((r) => r.status !== 'draft')
  snapshot.retire = retire

  // 3. KHB photos
  const khb = await db.product.findUnique({
    where: { sku: KHB_SKU },
    select: {
      id: true,
      images: { select: { id: true, position: true, alt: true, mediaId: true } },
    },
  })
  if (!khb) errors.push(`${KHB_SKU} missing`)
  snapshot.khbImages = khb?.images ?? []

  log(
    `${DRY_RUN ? '[dry-run] ' : ''}move ${MOVE_SKU} to Continental: ${moveNeeded ? `yes (${Object.keys(moveFields).join(', ') || 'brand only'}; ${moveSpecs.length} spec)` : 'done already'}`
  )
  for (const r of toRetire) log(`  retire ${r.sku}: /p/${r.slug} → /c/${r.category!.slug}`)
  log(`  KHB photos to remove: ${khb?.images.length ?? 0}`)
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN || (!moveNeeded && !toRetire.length && !khb?.images.length)) return
  if (!SNAPSHOT) {
    console.error('--snapshot=<path> is required to write: it is the rollback')
    process.exitCode = 1
    return
  }
  writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 1))
  log(`snapshot written: ${SNAPSHOT}`)

  if (moveNeeded) {
    await db.$transaction(async (tx: Tx) => {
      await tx.product.update({
        where: { id: move!.id },
        data: { ...moveFields, brandId: conti!.id },
      })
      for (const s of moveSpecs)
        await tx.productSpec.update({ where: { id: s.id }, data: { value: s.value } })
    }, TX)
  }
  for (const r of toRetire) {
    await db.$transaction(async (tx: Tx) => {
      await tx.product.update({ where: { id: r.id }, data: { status: 'draft' } })
      await recordSlugRedirect(tx, {
        fromPath: `/p/${r.slug}`,
        toPath: `/c/${r.category!.slug}`,
        statusCode: 301,
        notes: `Retired 2026-10-08: ${r.sku} matches no real maker product`,
      })
    }, TX)
  }
  if (khb?.images.length) {
    await db.$transaction(async (tx: Tx) => {
      await tx.productImage.deleteMany({ where: { id: { in: khb.images.map((i) => i.id) } } })
      await tx.media.updateMany({
        where: { id: { in: khb.images.map((i) => i.mediaId) } },
        data: { deletedAt: new Date() },
      })
    }, TX)
  }
  log('written')
}

function log(line: string): void {
  console.log(line)
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
