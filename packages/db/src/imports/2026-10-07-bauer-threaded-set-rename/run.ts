/**
 * Renames IH-BC-FLANGE-MALE-SET, which is not flanged.
 *
 * The listing took its title from Seal Fast's family page, "Zinc Plated Steel
 * Flanged Bauer Type Male NPT Threaded Couplings Complete Set". Every item on
 * that page says otherwise: "Male NPT Threaded Male x Female Bauer Type
 * Coupling", part numbers BTC200MT to BTC800MT — the same scheme as Seal
 * Fast's male-threaded female (BTC…MTF) and male (BTC…MTM) halves, while the
 * flanged set is BTC…FL. It is the male-threaded set; "Flanged" in the family
 * title is Seal Fast's slip.
 *
 * Title, SEO title, slug, the "Coupling type" line and spec row, and the
 * image alt text lose "Flanged". The old URL gets a 301 to the new one (recordSlugRedirect), and
 * any product, article or page link to it is rewritten. The SKU stays: part
 * numbers, images and quotes hang off it. The description, short description
 * and FAQs are rebuilt by src/imports/2026-10-07-older-coupling-copy, which
 * reads the new title.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-bauer-threaded-set-rename/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-bauer-threaded-set-rename/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'

import { db } from '../../index'
import { recordSlugRedirect } from '../../slug-redirect'
import { syncArticleLinks } from '../blog-article-import'
import { rewriteProductHrefs } from '../2026-10-06-listing-data-fixes/plan'
import { mapStrings } from '../2026-10-06-listing-data-fixes/posts'

const DRY_RUN = process.argv.includes('--dry-run')
const TX = { timeout: 30_000, maxWait: 10_000 } as const

export const SKU = 'IH-BC-FLANGE-MALE-SET'
export const FROM = {
  title: 'Zinc Plated Steel Flanged Bauer Type Male Threaded Coupling Complete Set',
  slug: 'zinc-plated-steel-flanged-bauer-type-male-threaded-coupling-complete-set',
  type: 'Bauer Flanged Male Threaded Complete Set',
}
export const TO = {
  title: 'Zinc Plated Steel Male Threaded Bauer Type Coupling Complete Set',
  slug: 'zinc-plated-steel-male-threaded-bauer-type-coupling-complete-set',
  type: 'Bauer Male Threaded Complete Set',
}

async function main(): Promise<void> {
  const p = await db.product.findUnique({
    where: { sku: SKU },
    select: {
      id: true,
      title: true,
      slug: true,
      seoTitle: true,
      descriptionLong: true,
      specs: { where: { label: 'Coupling Type / Variant' }, select: { id: true, value: true } },
      images: { select: { media: { select: { id: true, alt: true } } } },
    },
  })
  if (!p) throw new Error(`${SKU} not found`)
  // The gallery labels the image with its alt text, which still named the old title.
  const alts = p.images.map((i) => i.media).filter((m) => m.alt === FROM.title)
  if (p.slug === TO.slug && p.title === TO.title) {
    if (!alts.length) {
      log('already renamed — nothing to do')
      return
    }
    log(`${DRY_RUN ? '[dry-run] ' : ''}${SKU}: ${alts.length} image alt text(s) → "${TO.title}"`)
    if (!DRY_RUN) {
      await db.media.updateMany({
        where: { id: { in: alts.map((m) => m.id) } },
        data: { alt: TO.title },
      })
      log('written')
    }
    return
  }
  if (p.slug !== FROM.slug || p.title !== FROM.title) {
    throw new Error(`${SKU} is "${p.title}" at /p/${p.slug} — not the listing this runner expects`)
  }
  const clash = await db.product.findUnique({ where: { slug: TO.slug }, select: { sku: true } })
  if (clash) throw new Error(`/p/${TO.slug} already belongs to ${clash.sku}`)

  const typeLine = `<li><strong>Coupling type:</strong> ${FROM.type}</li>`
  const html = p.descriptionLong ?? ''
  if (html.split(typeLine).length !== 2)
    throw new Error(`${SKU}: expected one "Coupling type: ${FROM.type}" line`)
  const descriptionLong = html.replace(
    typeLine,
    () => `<li><strong>Coupling type:</strong> ${TO.type}</li>`
  )
  const seoTitle = (p.seoTitle ?? '').replace(FROM.title, TO.title)
  const spec = p.specs[0]
  if (!spec || spec.value !== FROM.type)
    throw new Error(`${SKU}: "Coupling Type / Variant" is not "${FROM.type}"`)

  // Links to the old URL anywhere else.
  const moves = [{ from: FROM.slug, to: TO.slug }]
  const products = (
    await db.product.findMany({
      where: { descriptionLong: { contains: `/p/${FROM.slug}` } },
      select: { id: true, sku: true, descriptionLong: true },
    })
  ).map((x) => ({ ...x, next: rewriteProductHrefs(x.descriptionLong ?? '', moves).text }))
  const posts = (
    await db.blogPost.findMany({ select: { id: true, slug: true, body: true, bodyBlocks: true } })
  )
    .map((x) => ({
      ...x,
      blocks: mapStrings(x.bodyBlocks, (s) => rewriteProductHrefs(s, moves)),
      body: x.body == null ? null : rewriteProductHrefs(x.body, moves),
    }))
    .filter((x) => x.blocks.hits || x.body?.hits)
  const pages = (await db.pageContent.findMany({ select: { id: true, key: true, sections: true } }))
    .map((x) => ({ ...x, next: mapStrings(x.sections, (s) => rewriteProductHrefs(s, moves)) }))
    .filter((x) => x.next.hits)

  log(`${DRY_RUN ? '[dry-run] ' : ''}${SKU}: "${FROM.title}" → "${TO.title}"`)
  log(`  /p/${FROM.slug} → /p/${TO.slug} (301)`)
  log(
    `  links rewritten: ${products.length} product(s), ${posts.length} article(s), ${pages.length} page(s)`
  )
  if (DRY_RUN) return

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.product.update({
      where: { id: p.id },
      data: { title: TO.title, slug: TO.slug, seoTitle, descriptionLong },
    })
    await tx.productSpec.update({ where: { id: spec.id }, data: { value: TO.type } })
    if (alts.length)
      await tx.media.updateMany({
        where: { id: { in: alts.map((m) => m.id) } },
        data: { alt: TO.title },
      })
    await recordSlugRedirect(tx, {
      fromPath: `/p/${FROM.slug}`,
      toPath: `/p/${TO.slug}`,
      notes: 'Bauer male-threaded set: Seal Fast items are BTC…MT, not flanged (2026-10-07)',
    })
    for (const x of products)
      await tx.product.update({ where: { id: x.id }, data: { descriptionLong: x.next } })
    for (const x of posts) {
      await tx.blogPost.update({
        where: { id: x.id },
        data: {
          bodyBlocks: x.blocks.value as Prisma.InputJsonValue,
          ...(x.body ? { body: x.body.text } : {}),
        },
      })
    }
    for (const x of pages) {
      await tx.pageContent.update({
        where: { id: x.id },
        data: { sections: x.next.value as Prisma.InputJsonValue },
      })
    }
  }, TX)
  for (const x of posts)
    await syncArticleLinks(x.id, x.blocks.value as Parameters<typeof syncArticleLinks>[1])
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
