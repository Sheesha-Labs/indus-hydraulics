/**
 * Product FAQ programme — dump the facts a family's FAQs may be written from.
 *
 * Plan: docs/product-faq-plan.md. One run = one family: every active product
 * on a shelf (optionally narrowed to one brand), with everything the database
 * knows about each — specs, size table, cross-references, documents, origin,
 * availability, existing FAQs, linked guides and the Search Console queries
 * its URL already gets impressions for — plus the family-level context the
 * writer needs: the shelf's guides, sibling shelves and the link targets that
 * exist.
 *
 * Read-only. The output is the source list for the "every number traceable"
 * check: an FAQ may state a figure only if it appears here.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/dump-facts.ts \
 *     --shelf=pneumatic-tubing [--brand="Indus Hydraulics"] --out=/path/to/facts.json
 */
import { writeFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { productAvailability } from '@indus/domain'

const db = new PrismaClient()

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit?.slice(name.length + 3)
}

function stripHtml(html: string | null): string | null {
  if (!html) return null
  return html
    .replace(/<\/(p|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim()
}

async function categoryChain(id: string): Promise<{ slug: string; name: string }[]> {
  const out: { slug: string; name: string }[] = []
  let cur: string | null = id
  while (cur) {
    const c: { slug: string; name: string; parentId: string | null } | null =
      await db.category.findUnique({
        where: { id: cur },
        select: { slug: true, name: true, parentId: true },
      })
    if (!c) break
    out.push({ slug: c.slug, name: c.name })
    cur = c.parentId
  }
  return out // leaf first
}

async function main() {
  const shelf = arg('shelf')
  const brand = arg('brand')
  const out = arg('out')
  if (!shelf || !out) throw new Error('--shelf and --out are required')

  const category = await db.category.findUnique({
    where: { slug: shelf },
    select: { id: true, slug: true, name: true, parentId: true, shortDescription: true },
  })
  if (!category) throw new Error(`no category ${shelf}`)
  const chain = await categoryChain(category.id)

  const products = await db.product.findMany({
    where: {
      status: 'active',
      categoryId: category.id,
      ...(brand ? { brand: { name: brand } } : {}),
    },
    orderBy: { slug: 'asc' },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: { orderBy: { position: 'asc' } },
      variants: { orderBy: { position: 'asc' } },
      crossReferences: true,
      documents: { select: { kind: true, title: true } },
      faqs: { orderBy: { position: 'asc' } },
      blogPosts: {
        where: { post: { isPublished: true, deletedAt: null } },
        select: { post: { select: { slug: true, title: true } } },
      },
    },
  })

  const urls = products.map((p) => `%/p/${p.slug}`)
  const gsc = urls.length
    ? await db.$queryRawUnsafe<{ url: string; query: string; imp: number; pos: number }[]>(
        `select url, query, sum(impressions)::int imp, avg(position)::float pos
           from gsc_metric_daily
          where query <> '' and url like any($1::text[])
          group by 1, 2 order by 3 desc`,
        urls
      )
    : []

  const shelfGuides = await db.blogPostCategory.findMany({
    where: {
      categoryId: { in: [category.id, ...(category.parentId ? [category.parentId] : [])] },
      post: { isPublished: true, deletedAt: null },
    },
    select: { post: { select: { slug: true, title: true } } },
  })

  const siblingShelves = category.parentId
    ? await db.category.findMany({
        where: { parentId: category.parentId, isPublished: true },
        select: { slug: true, name: true },
        orderBy: { position: 'asc' },
      })
    : []

  const categorySlugs = chain.map((c) => c.slug)
  const family = {
    generatedAt: new Date().toISOString(),
    shelf: { slug: category.slug, name: category.name, path: `/c/${category.slug}` },
    brandFilter: brand ?? null,
    chain,
    shelfDescription: category.shortDescription,
    shelfGuides: shelfGuides.map((g) => ({ path: `/blog/${g.post.slug}`, title: g.post.title })),
    siblingShelves: siblingShelves.map((s) => ({ path: `/c/${s.slug}`, name: s.name })),
    linkTargets: products.map((p) => ({ path: `/p/${p.slug}`, title: p.title })),
    products: products.map((p) => {
      const availability = productAvailability({
        status: p.status,
        stockQty: p.stockQty,
        stockWarehouse: p.stockWarehouse,
        leadTimeDays: p.leadTimeDays,
        categorySlugs,
      })
      return {
        id: p.id,
        sku: p.sku,
        mpn: p.mpn,
        slug: p.slug,
        path: `/p/${p.slug}`,
        title: p.title,
        brand: p.brand?.name ?? null,
        focusKeyword: p.focusKeyword,
        descriptionShort: p.descriptionShort,
        descriptionLong: stripHtml(p.descriptionLong),
        countryOfOrigin: p.countryOfOrigin,
        hsCode: p.hsCode,
        weightKg: p.weightKg?.toString() ?? null,
        leadTimeDays: p.leadTimeDays,
        warrantyMonths: p.warrantyMonths,
        availability: {
          kind: availability.kind,
          label: availability.label,
          note: availability.deliveryNote,
        },
        specs: p.specs.map((s) => ({
          group: s.group,
          label: s.label,
          value: s.value,
          unit: s.unit,
        })),
        variants: p.variants.map((v) => ({
          partNumber: v.partNumber,
          hoseInch: v.hoseInch,
          hoseDash: v.hoseDash,
          hoseDn: v.hoseDn,
          port: v.portLabel,
          port2: v.port2Label,
          port3: v.port3Label,
          pressureBar: v.pressureBar,
          weightG: v.weightG,
          dimensions: v.dimensions,
          competitor: v.competitorBrand
            ? `${v.competitorBrand} ${v.competitorMpn ?? ''}`.trim()
            : null,
        })),
        crossReferences: p.crossReferences.map((x) => ({
          brand: x.competitorBrand,
          mpn: x.competitorMpn,
          series: x.series,
          compatibility: x.compatibility,
          variant: x.variantPartNumber,
        })),
        documents: p.documents,
        guides: p.blogPosts.map((b) => ({ path: `/blog/${b.post.slug}`, title: b.post.title })),
        existingFaqs: p.faqs.map((f) => ({ q: f.question, a: f.answer })),
        searchQueries: gsc
          .filter((g) => g.url.endsWith(`/p/${p.slug}`))
          .map((g) => ({
            query: g.query,
            impressions: g.imp,
            position: Math.round(g.pos * 10) / 10,
          })),
      }
    }),
  }

  writeFileSync(out, JSON.stringify(family, null, 2))
  console.log(`${family.products.length} products → ${out}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
