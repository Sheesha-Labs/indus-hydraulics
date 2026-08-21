/**
 * Give the sixteen duplicate-titled hydraulic adapters distinguishable names.
 *
 * Eight titles appear exactly twice — once in `BSP Adapters`, once in
 * `DIN 2353 Bite Type Adapters`:
 *
 *   Male Stud Connector BSPT / NPT · Male Stud Elbow BSPT / NPT
 *   Swivel Nut Branch Tee · Swivel Nut Elbow · Swivel Nut Run Tee · Union Tee
 *
 * These are the pairs the original feature-image import flagged as genuinely
 * ambiguous, and the reason `product-feature-images.csv` is frozen rather than
 * re-derived: a title alone cannot tell them apart, so a re-derivation silently
 * swaps the pair and nothing in the UI reveals it.
 *
 * The distinguishing term is NOT a judgement call — it is recorded on the rows
 * three times over, and all three agree:
 *
 *   - `Applicable Standards`  "ISO 228-1 (BSPP), ISO 7-1 (BSPT)"
 *                          vs "DIN 2353, ISO 8434-1"
 *   - `Port A Sealing`        `bspt-taper` vs `24-cone`
 *   - `descriptionShort`      "BSP family …" vs "DIN 2353 family …"
 *
 * So the suffix is derived from the product's own `Applicable Standards` spec
 * and cross-checked against its category, rather than inferred from the SKU
 * prefix — the prefix is a naming convention and could drift; the standard is
 * the actual product fact.
 *
 * Each rename rebuilds the slug (dropping the `-2` fallbacks), writes a 301
 * from the old path, and repoints `seoTitle`, the `<strong>` product name in
 * the body intro, and image alt text. PDPs are served from `/p/<slug>`.
 *
 * Idempotent: a product already carrying its suffix is skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/disambiguate-adapter-titles.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const pdpPath = (slug: string) => `/p/${slug}`

/** The two categories holding the colliding titles. */
const CATEGORY_SLUGS = ['bsp-adapters', 'din-2353-bite-type-adapters'] as const

/**
 * Standard -> suffix. Matched against the `Applicable Standards` spec value.
 * Ordered: DIN is tested first because a DIN row can also mention ISO 8434-1.
 */
const SUFFIX_RULES: readonly { match: RegExp; suffix: string; expectCategory: RegExp }[] = [
  { match: /DIN\s*2353/i, suffix: 'DIN 2353', expectCategory: /DIN/i },
  { match: /ISO\s*228-1|ISO\s*7-1|BSPP|BSPT/i, suffix: 'BSP', expectCategory: /BSP/i },
] as const

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' ')
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
  let renamed = 0

  const cats = await db.category.findMany({
    where: { slug: { in: [...CATEGORY_SLUGS] } },
    select: { id: true, name: true, slug: true },
  })
  if (cats.length !== CATEGORY_SLUGS.length) {
    throw new Error(
      `expected ${CATEGORY_SLUGS.length} adapter categories, found ${cats.length}: ` +
        cats.map((c) => c.slug).join(', ')
    )
  }
  const catName = new Map(cats.map((c) => [c.id, c.name]))

  // Only titles that actually collide — a unique title needs no suffix.
  const dupes = await db.product.groupBy({
    by: ['title'],
    where: { status: 'active' },
    _count: { title: true },
    having: { title: { _count: { gt: 1 } } },
  })
  const dupTitles = new Set(dupes.map((d) => d.title))

  const targets = await db.product.findMany({
    where: { status: 'active', categoryId: { in: cats.map((c) => c.id) } },
    select: {
      id: true,
      sku: true,
      slug: true,
      title: true,
      categoryId: true,
      descriptionLong: true,
      specs: { where: { label: 'Applicable Standards' }, select: { value: true } },
      images: { where: { position: 0 }, select: { id: true, mediaId: true } },
    },
    orderBy: { sku: 'asc' },
  })

  for (const p of targets) {
    if (!dupTitles.has(p.title)) continue
    if (/\((BSP|DIN 2353)\)$/.test(p.title)) {
      console.log(`skip ${p.sku} — already suffixed`)
      continue
    }

    const standards = p.specs[0]?.value
    if (!standards) {
      problems.push(`${p.sku}: no "Applicable Standards" spec — cannot derive a suffix`)
      continue
    }
    const rule = SUFFIX_RULES.find((r) => r.match.test(standards))
    if (!rule) {
      problems.push(`${p.sku}: standards "${standards}" match no rule`)
      continue
    }
    // Cross-check the spec against the category. If they disagree the row is
    // mis-filed and guessing from either one alone would be wrong.
    const category = p.categoryId ? (catName.get(p.categoryId) ?? '') : ''
    if (!rule.expectCategory.test(category)) {
      problems.push(
        `${p.sku}: standards say ${rule.suffix} but category is "${category}" — left alone`
      )
      continue
    }

    const to = `${p.title} (${rule.suffix})`
    const newSlug = await uniqueSlug(slugify(to), p.id)
    const seoTitle = `${to} — Indus ${p.sku.replace(/^IH-AD-/, '')}`
    const descriptionLong = p.descriptionLong
      ? p.descriptionLong.replace(/<strong>[^<]*<\/strong>/, `<strong>${to}</strong>`)
      : p.descriptionLong

    console.log(
      `${dryRun ? '[dry-run] ' : ''}${p.sku}  "${p.title}" -> "${to}"  /${p.slug} -> /${newSlug}`
    )
    renamed++
    if (dryRun) continue

    await db.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id: p.id },
          data: { title: to, slug: newSlug, seoTitle, descriptionLong },
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
        for (const img of p.images) {
          await tx.productImage.update({ where: { id: img.id }, data: { alt: to } })
          await tx.media.update({ where: { id: img.mediaId }, data: { alt: to } })
        }
      },
      { maxWait: 30_000, timeout: 30_000 }
    )
  }

  const remaining = await db.product.groupBy({
    by: ['title'],
    where: { status: 'active' },
    _count: { title: true },
    having: { title: { _count: { gt: 1 } } },
  })
  console.log(`\n── renamed ${renamed} ──`)
  console.log(`duplicate titles remaining catalogue-wide: ${remaining.length}`)
  for (const r of remaining) console.log(`  ${r.title} x${r._count.title}`)

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
