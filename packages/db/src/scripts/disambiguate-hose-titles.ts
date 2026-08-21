/**
 * Give the eight duplicate-titled hose products distinguishable names.
 *
 * Three groups shared a title exactly, so nothing on a listing page told them
 * apart and the slugs had fallen back to `-2` / `-3` / `-4`:
 *
 *   "Air/Water Hose 20 Bar"        A101HP, A102HP, A190, A190Y
 *   "Multi Utility Hose 20 Bar"    A103HP, A105HP
 *   "PVC Suction & Delivery Hose"  DELVAC, IRRIBULK
 *
 * The distinguishing term for each comes from that product's own specs, not
 * from a guess:
 *
 *   - The Air/Water four split on TWO axes, which is why colour alone is not
 *     enough. A101HP/A102HP are `smooth extruded` EPDM/SBR at 6-25 mm and
 *     13-25 mm; A190/A190Y are `mandrel wrap` SBR at 13-76 mm — a different
 *     cover construction and roughly triple the bore. So they take both the
 *     colour and "Mandrel-Built".
 *   - A103HP/A105HP are identical but for `Cover Material` colour, Blue vs
 *     Green, so colour alone separates them.
 *   - DELVAC and IRRIBULK have the same cover string ("PVC tube construction"),
 *     so colour cannot separate them. They split on duty instead, which is what
 *     their own `descriptionShort` states: DELVAC is "Low pressure generic hose
 *     for water and dilute chemicals" (and carries the clear render), IRRIBULK
 *     is "Medium Duty hose for water, slurry, abrasives and chemicals" at
 *     25-152 mm.
 *
 * Each rename also rebuilds the slug, writes a 301 from the old path, and
 * repoints `seoTitle`, the `<strong>` product name in the body intro, and the
 * alt text on the feature image. Product pages are served from `/p/<slug>`, not
 * `/products/<slug>` — writing the wrong prefix here silently 404s every
 * redirect, which is exactly what happened in PR #258.
 *
 * Idempotent: a product already on its new title is skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/disambiguate-hose-titles.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const pdpPath = (slug: string) => `/p/${slug}`

const RENAMES: readonly { sku: string; from: string; to: string; why: string }[] = [
  {
    sku: 'IH-IH-A101HP',
    from: 'Air/Water Hose 20 Bar',
    to: 'Black Air/Water Hose 20 Bar',
    why: 'Black smooth extruded',
  },
  {
    sku: 'IH-IH-A102HP',
    from: 'Air/Water Hose 20 Bar',
    to: 'Yellow Air/Water Hose 20 Bar',
    why: 'Yellow smooth extruded',
  },
  {
    sku: 'IH-IH-A190',
    from: 'Air/Water Hose 20 Bar',
    to: 'Black Mandrel-Built Air/Water Hose 20 Bar',
    why: 'Black mandrel wrap, 13-76 mm',
  },
  {
    sku: 'IH-IH-A190Y',
    from: 'Air/Water Hose 20 Bar',
    to: 'Yellow Mandrel-Built Air/Water Hose 20 Bar',
    why: 'Yellow mandrel wrap, 13-76 mm',
  },
  {
    sku: 'IH-IH-A103HP',
    from: 'Multi Utility Hose 20 Bar',
    to: 'Blue Multi Utility Hose 20 Bar',
    why: 'Blue smooth extruded',
  },
  {
    sku: 'IH-IH-A105HP',
    from: 'Multi Utility Hose 20 Bar',
    to: 'Green Multi Utility Hose 20 Bar',
    why: 'Green smooth extruded',
  },
  {
    sku: 'IH-IH-DELVAC',
    from: 'PVC Suction & Delivery Hose',
    to: 'Clear PVC Suction & Delivery Hose',
    why: 'low-pressure clear, 19-51 mm',
  },
  {
    sku: 'IH-IH-IRRIBULK',
    from: 'PVC Suction & Delivery Hose',
    to: 'Medium-Duty PVC Suction & Delivery Hose',
    why: 'medium duty abrasive, 25-152 mm',
  },
] as const

/**
 * Slugs that drifted from the house convention and are not part of a rename.
 * A125 was recreated during the PR #258 rebuild with `&` expanded to "and".
 */
const SLUG_FIXES: readonly { sku: string; to: string }[] = [
  { sku: 'IH-IH-A125', to: 'multi-purpose-mineral-oil-air-hose-20-bar' },
] as const

/**
 * `&` is DROPPED, not expanded to "and". Among the 42 active titles containing
 * an ampersand, 38 slugs drop it (`food-bulk-pvc-suction-delivery-hose`) and
 * only four expand it — two of which this session introduced. Dropping is the
 * house convention; `SLUG_FIXES` below repairs the one I got wrong.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uniqueSlug(candidate: string, excludeId: string): Promise<string> {
  let slug = candidate
  let n = 2
  for (;;) {
    const clash = await db.product.findFirst({
      where: { slug, id: { not: excludeId } },
      select: { id: true },
    })
    if (!clash) return slug
    slug = `${candidate}-${n++}`
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const problems: string[] = []

  for (const r of RENAMES) {
    const p = await db.product.findUnique({
      where: { sku: r.sku },
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
        descriptionLong: true,
        images: { where: { position: 0 }, select: { id: true, mediaId: true } },
      },
    })
    if (!p) {
      problems.push(`${r.sku}: not found`)
      continue
    }
    if (p.title === r.to) {
      console.log(`skip ${r.sku} — already "${r.to}"`)
      continue
    }
    if (p.title !== r.from) {
      // Guard: the rename table was written against a known starting title. If
      // the row has moved on, stop rather than overwrite someone else's edit.
      problems.push(`${r.sku}: expected "${r.from}", found "${p.title}" — left alone`)
      continue
    }

    const newSlug = await uniqueSlug(slugify(r.to), p.id)
    const partCode = p.sku.replace(/^IH-IH-/, '')
    const seoTitle = `${r.to} — Indus ${partCode}`
    // The body intro names the product in its first <strong>; leave the rest of
    // the HTML untouched.
    const descriptionLong = p.descriptionLong
      ? p.descriptionLong.replace(/<strong>[^<]*<\/strong>/, `<strong>${r.to}</strong>`)
      : p.descriptionLong

    console.log(
      `${dryRun ? '[dry-run] ' : ''}${r.sku}  "${p.title}" -> "${r.to}"  ` +
        `/${p.slug} -> /${newSlug}   (${r.why})`
    )
    if (dryRun) continue

    await db.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id: p.id },
          data: { title: r.to, slug: newSlug, seoTitle, descriptionLong },
        })
        await tx.redirect.upsert({
          where: { fromPath: pdpPath(p.slug) },
          update: { toPath: pdpPath(newSlug), statusCode: 301, isActive: true },
          create: {
            fromPath: pdpPath(p.slug),
            toPath: pdpPath(newSlug),
            statusCode: 301,
            isActive: true,
          },
        })
        // Alt text repeats the title in two places.
        for (const img of p.images) {
          await tx.productImage.update({ where: { id: img.id }, data: { alt: r.to } })
          await tx.media.update({ where: { id: img.mediaId }, data: { alt: r.to } })
        }
      },
      { maxWait: 30_000, timeout: 30_000 }
    )
  }

  // ── Slug convention repairs ──────────────────────────────────────────────
  for (const f of SLUG_FIXES) {
    const p = await db.product.findUnique({
      where: { sku: f.sku },
      select: { id: true, slug: true },
    })
    if (!p) {
      problems.push(`${f.sku}: not found for slug fix`)
      continue
    }
    if (p.slug === f.to) {
      console.log(`skip ${f.sku} — slug already correct`)
      continue
    }
    console.log(`${dryRun ? '[dry-run] ' : ''}${f.sku}  /${p.slug} -> /${f.to}   (& convention)`)
    if (dryRun) continue
    const oldSlug = p.slug
    await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id: p.id }, data: { slug: f.to } })
      await tx.redirect.upsert({
        where: { fromPath: pdpPath(oldSlug) },
        update: { toPath: pdpPath(f.to), statusCode: 301, isActive: true },
        create: {
          fromPath: pdpPath(oldSlug),
          toPath: pdpPath(f.to),
          statusCode: 301,
          isActive: true,
        },
      })
    })
  }

  // Prove the duplication is actually gone rather than assume it.
  const remaining = await db.$queryRaw<{ title: string; n: bigint }[]>`
    WITH RECURSIVE t AS (
      SELECT id FROM categories WHERE slug = 'industrial-hoses'
      UNION ALL SELECT c.id FROM categories c JOIN t ON c."parentId" = t.id
    )
    SELECT title, count(*) AS n FROM products
    WHERE "categoryId" IN (SELECT id FROM t) AND status = 'active'
    GROUP BY title HAVING count(*) > 1`
  console.log(`\n── remaining duplicate titles in Industrial Hoses: ${remaining.length} ──`)
  for (const row of remaining) console.log(`  ${row.title} x${row.n}`)

  console.log(`\n── summary ──`)
  if (problems.length) {
    console.log(`${problems.length} problem(s):`)
    for (const x of problems) console.log(`  - ${x}`)
  } else {
    console.log('no problems')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
