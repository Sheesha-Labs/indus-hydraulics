/**
 * Build the Ferrules section of the catalogue from Manuli Hydraulics' own
 * ferrule sheets: one hub category, seven part-reference series beneath it,
 * a megamenu column, and one listing per series.
 *
 * Why one listing per series and not one per part number: the seven dimension
 * sheets between them name 71 part references, but they are 71 sizes of seven
 * products. A buyer picks the series from the hose construction — skive or
 * no-skive, braid, spiral, textile or compact — and then reads a bore off a
 * table. Seventy-one listings would be seventy-one near-identical pages
 * competing with each other for the same query, so the size table is rendered
 * into the listing's own description instead, part reference by part reference.
 *
 * Sources, frozen so the import is deterministic:
 *   - `data/ferrules-content.json`   the seven series, each with the full
 *     part-reference / DN / dash / inch / D / L table transcribed from its
 *     dimension sheet
 *   - `data/README-ferrules.md`      provenance, and the four places the
 *     overview matrix and the dimension sheets disagree
 *
 * Nothing here is generated. The sheets publish part references, bores and two
 * dimensions; they state no pressure rating, material or surface treatment, so
 * this payload asserts none. That scores lower on `scoreProductContent` than
 * padding the spec block would — the same call the industrial-couplings import
 * made, and for the same reason.
 *
 * Idempotent: categories, nav entries and products are all matched on their
 * natural key, specs on label and FAQs on question.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-ferrules.ts \
 *     [--dry-run] [--only=SKU] [--skip-nav] [--refresh-copy]
 *
 * `--refresh-copy` rewrites the descriptions, SEO fields and FAQ answers of
 * everything this import created, from the frozen payload. It is off by default
 * so a routine re-run never silently discards an edit made in the admin.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const DATA = resolve(__dirname, '../../data/ferrules-content.json')
const NAV_MENU_SLUG = 'primary-megamenu'

type Size = {
  part: string
  dn: number
  dash: string
  inch: string
  d: string
  l: string
}

type Series = {
  categorySlug: string
  categoryName: string
  navLabel: string
  categoryShortDescription: string
  categorySeoTitle: string
  categorySeoDescription: string
  categoryFocusKeyword: string
  sku: string
  slug: string
  title: string
  family: string | null
  ferruleType: 'skive' | 'no-skive'
  hoseFamily: string
  seriesLabel: string
  partPrefixes: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  intro: string
  note?: string
  sizes: Size[]
}

type Payload = {
  source: Record<string, string>
  brandSlug: string
  specTemplateSlug: string
  parentCategorySlug: string
  hub: {
    slug: string
    name: string
    navLabel: string
    shortDescription: string
    seoTitle: string
    seoDescription: string
    focusKeyword: string
  }
  navGroup: { parentLabel: string; afterLabel: string }
  series: Series[]
}

function words(s: string): number {
  return s.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
}

/** `&` and `<` are the only characters that can escape an HTML text node here. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function numeric(values: string[]): { min: string; max: string } {
  const sorted = [...values].sort((a, b) => Number(a) - Number(b))
  return { min: sorted[0]!, max: sorted[sorted.length - 1]! }
}

/** "DN5 – DN51 (3/16" – 2")" from the first and last row of the sheet. */
function bore(sizes: Size[]): string {
  const byDn = [...sizes].sort((a, b) => a.dn - b.dn)
  const lo = byDn[0]!
  const hi = byDn[byDn.length - 1]!
  if (lo.dn === hi.dn) return `DN${lo.dn} (${lo.inch})`
  return `DN${lo.dn} – DN${hi.dn} (${lo.inch} – ${hi.inch})`
}

function dashRange(sizes: Size[]): string {
  const byDn = [...sizes].sort((a, b) => a.dn - b.dn)
  const lo = byDn[0]!.dash
  const hi = byDn[byDn.length - 1]!.dash
  return lo === hi ? lo : `${lo} to ${hi}`
}

const CRIMP_METHOD: Record<Series['ferruleType'], string> = {
  skive: 'The hose cover is skived back before crimping, so the ferrule closes directly onto the wire reinforcement',
  'no-skive': 'Crimped straight over the hose cover — no skiving step before assembly',
}

/**
 * The size table is markup, not prose, so it is built here rather than being
 * carried as a 71-row HTML blob in the payload. One generator means one place
 * to fix if the table markup ever changes, and the transcribed numbers stay
 * readable as data in the JSON.
 *
 * `ih-table-scroll` is what keeps a 17-row, 6-column table from widening the
 * whole PDP column on a phone — see `.ih-rich-text` in globals.css.
 */
function sizeTableHtml(s: Series): string {
  const rows = s.sizes
    .map(
      (r) =>
        `<tr><td>${esc(r.part)}</td><td>${r.dn}</td><td>${esc(r.dash)}</td>` +
        `<td>${esc(r.inch)}</td><td>${esc(r.d)}</td><td>${esc(r.l)}</td></tr>`,
    )
    .join('\n')
  return (
    `<div class="ih-table-scroll">\n` +
    `<table class="ih-data-table">\n` +
    `<caption>${esc(s.seriesLabel)} — part reference, hose bore and ferrule dimensions</caption>\n` +
    `<thead><tr><th scope="col">Part ref.</th><th scope="col">DN</th><th scope="col">Dash</th>` +
    `<th scope="col">Inch</th><th scope="col">D (mm)</th><th scope="col">L (mm)</th></tr></thead>\n` +
    `<tbody>\n${rows}\n</tbody>\n` +
    `</table>\n</div>`
  )
}

function descriptionLong(s: Series): string {
  const d = numeric(s.sizes.map((x) => x.d))
  const l = numeric(s.sizes.map((x) => x.l))
  const family = s.family ? ` It is part of Manuli's ${esc(s.family)} range.` : ''
  const skiveLine =
    s.ferruleType === 'skive'
      ? 'Skiving exposes the reinforcement, so the crimp grips steel rather than rubber. It is the construction Manuli publishes for this series — do not substitute a no-skive ferrule for it without checking the hose grade.'
      : 'No-skive means the ferrule crimps over the hose cover as supplied, with no stripping step. It is faster to assemble and removes the commonest field error on a skive assembly, which is skiving to the wrong depth.'

  return [
    `<p>${esc(s.intro)}${family}</p>`,
    `<h3>Sizes and dimensions</h3>`,
    s.note ? `<p>${esc(s.note)}</p>` : null,
    sizeTableHtml(s),
    `<p><strong>D</strong> is the ferrule outside diameter and <strong>L</strong> the overall length, both in millimetres and both as supplied — they are not crimp dimensions. Across this series D runs ${d.min}–${d.max} mm and L runs ${l.min}–${l.max} mm.</p>`,
    `<h3>Construction</h3>`,
    `<ul>`,
    `<li>Ferrule type: ${s.ferruleType === 'skive' ? 'skive' : 'no-skive'}</li>`,
    `<li>Published by Manuli for ${esc(s.hoseFamily)}</li>`,
    `<li>Part references in this series: ${esc(s.partPrefixes)}</li>`,
    `<li>Bore coverage: ${esc(bore(s.sizes))}, ${s.sizes.length} references</li>`,
    `</ul>`,
    `<p>${skiveLine}</p>`,
    `<h3>Selecting a size</h3>`,
    `<p>Read the bore off your hose — DN, dash or inch, whichever your drawing uses — and take the part reference on that row. The D and L columns are there for clearance: a ferrule has to fit the routing and the crimp die, and on tight installations that decides between two series more often than the bore does.</p>`,
    `<p>The crimp diameter is not on this sheet, and it is not a property of the ferrule alone — it comes from the hose grade and the fitting it is crimped with, on the die chart for your crimper. Send us the crimper model with the enquiry and we will quote against it.</p>`,
    `<h3>How to order</h3>`,
    `<p>Quote the part reference from the table, or give us the hose grade, the bore and the quantity and we will identify it. Indus supplies these ferrules loose or crimped as a finished assembly with the matching fitting at each end — say which when you send the enquiry.</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

function descriptionShort(s: Series): string {
  const type = s.ferruleType === 'skive' ? 'Skive' : 'No-skive'
  return (
    `${type} crimp ferrule for Manuli ${s.hoseFamily}, part references ${s.partPrefixes}. ` +
    `${s.sizes.length} sizes, ${bore(s.sizes)}, with outside diameter and length listed for every reference.`
  )
}

type SpecRow = { group: string; label: string; value: string; unit: string | null; templateKey: string | null }

function specs(s: Series): SpecRow[] {
  const d = numeric(s.sizes.map((x) => x.d))
  const l = numeric(s.sizes.map((x) => x.l))
  return [
    { group: 'Identification', label: 'Ferrule Type', value: s.ferruleType, unit: null, templateKey: 'ferrule_type' },
    { group: 'Identification', label: 'Part Reference Range', value: s.partPrefixes, unit: null, templateKey: null },
    { group: 'Identification', label: 'Compatible Hoses', value: `Manuli ${s.hoseFamily}`, unit: null, templateKey: 'compatible_hoses' },
    { group: 'Dimensions', label: 'Nominal Size Range', value: bore(s.sizes), unit: null, templateKey: 'nominal_size_range' },
    { group: 'Dimensions', label: 'Dash Size Range', value: dashRange(s.sizes), unit: null, templateKey: null },
    { group: 'Dimensions', label: 'Outside Diameter (D) Range', value: `${d.min} – ${d.max}`, unit: 'mm', templateKey: null },
    { group: 'Dimensions', label: 'Length (L) Range', value: `${l.min} – ${l.max}`, unit: 'mm', templateKey: null },
    { group: 'Construction', label: 'Crimp Method', value: CRIMP_METHOD[s.ferruleType], unit: null, templateKey: 'crimp_method' },
    { group: 'Commercial', label: 'Sold By', value: 'each', unit: null, templateKey: 'sold_by' },
  ]
}

function faqs(s: Series): { question: string; answer: string }[] {
  const d = numeric(s.sizes.map((x) => x.d))
  return [
    {
      question: `Which hoses does the ${s.seriesLabel} ferrule fit?`,
      answer: `Manuli publishes this series for ${s.hoseFamily}. Confirm the hose grade before ordering — the ferrule series is chosen from the reinforcement construction, not from the bore alone.`,
    },
    {
      question: 'What sizes does this series come in?',
      answer: `${s.sizes.length} part references covering ${bore(s.sizes)}. The table on this page lists every reference with its DN, dash and inch bore, its outside diameter D and its length L.`,
    },
    {
      question: `Is this a skive or a no-skive ferrule?`,
      answer:
        s.ferruleType === 'skive'
          ? 'Skive. The hose cover is stripped back over the crimp length before assembly so the ferrule closes onto the wire reinforcement.'
          : 'No-skive. It crimps over the hose cover as supplied, with no stripping step before assembly.',
    },
    {
      question: 'What do the D and L columns mean?',
      answer: `D is the ferrule outside diameter and L its overall length, both in millimetres and both as supplied rather than after crimping. On this series D runs ${d.min}–${d.max} mm. Use them for clearance and die-fit checks.`,
    },
    {
      question: 'What crimp diameter should I use?',
      answer:
        'That is not a property of the ferrule on its own — it comes from the hose grade and the fitting it is crimped with, on the die chart for your crimper. Send us the crimper model and we will quote against it, or have Indus crimp and pressure-test the assembly.',
    },
    {
      question: 'How is this ordered?',
      answer:
        'By part reference from the table, or by hose grade plus bore and quantity if you would rather we identify it. Ferrules ship loose, or crimped as a finished assembly with the matching fitting at each end — tell us which with the enquiry.',
    },
  ]
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const skipNav = argv.includes('--skip-nav')
  const refreshCopy = argv.includes('--refresh-copy')
  const only = argv.find((a) => a.startsWith('--only='))?.split('=')[1]

  const payload = JSON.parse(readFileSync(DATA, 'utf8')) as Payload
  const problems: string[] = []

  const brand = await db.brand.findUnique({ where: { slug: payload.brandSlug }, select: { id: true } })
  if (!brand) throw new Error(`brand "${payload.brandSlug}" not found`)

  const template = await db.specTemplate.findUnique({
    where: { slug: payload.specTemplateSlug },
    select: { id: true, fields: { select: { id: true, key: true } } },
  })
  if (!template) throw new Error(`spec template "${payload.specTemplateSlug}" not found`)
  const fieldByKey = new Map(template.fields.map((f) => [f.key, f.id]))

  const parent = await db.category.findUnique({
    where: { slug: payload.parentCategorySlug },
    select: { id: true },
  })
  if (!parent) throw new Error(`parent category "${payload.parentCategorySlug}" not found`)

  // ── hub category ───────────────────────────────────────────────────────
  const h = payload.hub
  let hubId: string | null = null
  let categoriesCreated = 0
  const existingHub = await db.category.findUnique({ where: { slug: h.slug }, select: { id: true } })
  if (existingHub) {
    hubId = existingHub.id
    if (refreshCopy && !dryRun) {
      await db.category.update({
        where: { id: hubId },
        data: {
          name: h.name,
          shortDescription: h.shortDescription,
          seoTitle: h.seoTitle,
          seoDescription: h.seoDescription,
          focusKeyword: h.focusKeyword,
        },
      })
    }
  } else if (dryRun) {
    console.log(`[dry-run] create hub category ${h.slug}`)
    hubId = `dry-run:${h.slug}`
    categoriesCreated++
  } else {
    const maxSibling = await db.category.aggregate({
      where: { parentId: parent.id },
      _max: { position: true },
    })
    const created = await db.category.create({
      data: {
        parentId: parent.id,
        slug: h.slug,
        name: h.name,
        shortDescription: h.shortDescription,
        seoTitle: h.seoTitle,
        seoDescription: h.seoDescription,
        focusKeyword: h.focusKeyword,
        position: (maxSibling._max.position ?? -1) + 1,
        isPublished: true,
        defaultSpecTemplateId: template.id,
      },
      select: { id: true },
    })
    hubId = created.id
    categoriesCreated++
  }

  // ── one category per part-reference series ─────────────────────────────
  //
  // These sit at depth 3 (Hoses & Fittings > Ferrules > series), which the tree
  // already does elsewhere — Industrial Hoses > Metallic Hoses > PTFE Hoses.
  // The megamenu draws exactly three levels, and this section spends all three:
  // L1 section, L2 "Ferrules", L3 series.
  const categoryIdBySlug = new Map<string, string>()
  let position = 0
  for (const s of payload.series) {
    const existing = await db.category.findUnique({ where: { slug: s.categorySlug }, select: { id: true } })
    if (existing) {
      categoryIdBySlug.set(s.categorySlug, existing.id)
      if (refreshCopy && !dryRun) {
        await db.category.update({
          where: { id: existing.id },
          data: {
            name: s.categoryName,
            shortDescription: s.categoryShortDescription,
            seoTitle: s.categorySeoTitle,
            seoDescription: s.categorySeoDescription,
            focusKeyword: s.categoryFocusKeyword,
          },
        })
      }
      position++
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] create category ${s.categorySlug} — ${s.categoryName}`)
      categoryIdBySlug.set(s.categorySlug, `dry-run:${s.categorySlug}`)
      categoriesCreated++
      position++
      continue
    }
    const created = await db.category.create({
      data: {
        parentId: hubId,
        slug: s.categorySlug,
        name: s.categoryName,
        shortDescription: s.categoryShortDescription,
        seoTitle: s.categorySeoTitle,
        seoDescription: s.categorySeoDescription,
        focusKeyword: s.categoryFocusKeyword,
        position: position++,
        isPublished: true,
        defaultSpecTemplateId: template.id,
      },
      select: { id: true },
    })
    categoryIdBySlug.set(s.categorySlug, created.id)
    categoriesCreated++
  }

  // ── megamenu ───────────────────────────────────────────────────────────
  //
  // The "Ferrules" column links to its own category rather than carrying the
  // decorative `/c/…?sub=` of its five siblings. Those markers exist because
  // the columns they head are groupings with no category behind them; this one
  // has a real page, and a real link beats a param the category route ignores.
  let navCreated = 0
  if (!skipNav) {
    const g = payload.navGroup
    const section = await db.navMenuItem.findFirst({
      where: { label: g.parentLabel, menu: { slug: NAV_MENU_SLUG } },
      select: { id: true, menuId: true },
    })
    if (!section) {
      problems.push(`nav section "${g.parentLabel}" not found in ${NAV_MENU_SLUG} — no menu entries added`)
    } else {
      let column = await db.navMenuItem.findFirst({
        where: { label: h.navLabel, parentId: section.id },
        select: { id: true, menuId: true },
      })
      if (!column && dryRun) {
        console.log(`[dry-run] create nav column ${h.navLabel} under ${g.parentLabel}`)
        navCreated++
      } else if (!column) {
        const after = await db.navMenuItem.findFirst({
          where: { label: g.afterLabel, parentId: section.id },
          select: { position: true },
        })
        const at = (after?.position ?? -1) + 1
        // Land the column next to the one it belongs beside instead of after
        // unrelated groups.
        await db.navMenuItem.updateMany({
          where: { parentId: section.id, position: { gte: at } },
          data: { position: { increment: 1 } },
        })
        column = await db.navMenuItem.create({
          data: {
            menuId: section.menuId,
            parentId: section.id,
            position: at,
            label: h.navLabel,
            linkType: 'category',
            categoryId: hubId,
          },
          select: { id: true, menuId: true },
        })
        navCreated++
      }

      // On a dry run against a DB that has no column yet, `column` is null
      // because nothing was created — but the leaf entries still need
      // reporting, or the dry run understates the change by seven rows.
      if (column || dryRun) {
        let navPosition = column
          ? ((
              await db.navMenuItem.aggregate({
                where: { parentId: column.id },
                _max: { position: true },
              })
            )._max.position ?? -1) + 1
          : 0
        for (const s of payload.series) {
          const categoryId = categoryIdBySlug.get(s.categorySlug)
          if (!categoryId) continue
          if (dryRun || !column) {
            console.log(`[dry-run] add nav item ${s.navLabel}`)
            navCreated++
            continue
          }
          const already = await db.navMenuItem.findFirst({
            where: { parentId: column.id, categoryId },
            select: { id: true },
          })
          if (already) continue
          const misplaced = await db.navMenuItem.findFirst({
            where: { categoryId, menuId: column.menuId, parentId: { not: column.id } },
            select: { id: true },
          })
          if (misplaced) {
            await db.navMenuItem.update({
              where: { id: misplaced.id },
              data: { parentId: column.id, position: navPosition++ },
            })
            navCreated++
            continue
          }
          await db.navMenuItem.create({
            data: {
              menuId: column.menuId,
              parentId: column.id,
              position: navPosition++,
              label: s.navLabel,
              linkType: 'category',
              categoryId,
            },
          })
          navCreated++
        }
      }
    }
  }

  // ── listings ───────────────────────────────────────────────────────────
  let created = 0
  let updated = 0
  let refreshed = 0
  const series = only ? payload.series.filter((s) => s.sku === only) : payload.series

  for (const s of series) {
    const body = descriptionLong(s)
    const short = descriptionShort(s)
    const categoryId = categoryIdBySlug.get(s.categorySlug)
    if (!categoryId) {
      problems.push(`${s.sku}: category ${s.categorySlug} unavailable`)
      continue
    }

    let product = await db.product.findUnique({
      where: { sku: s.sku },
      select: { id: true, brandId: true, categoryId: true, focusKeyword: true, seoTitle: true, seoDescription: true, _count: { select: { crossReferences: true } } },
    })

    if (!product) {
      if (dryRun) {
        console.log(`[dry-run] create ${s.sku} — ${s.title} (${s.sizes.length} sizes, ${words(body)} words)`)
        created++
        continue
      }
      product = await db.product.create({
        data: {
          sku: s.sku,
          slug: s.slug,
          title: s.title,
          categoryId,
          brandId: brand.id,
          specTemplateId: template.id,
          descriptionShort: short,
          descriptionLong: body,
          seoTitle: s.seoTitle,
          seoDescription: s.seoDescription,
          focusKeyword: s.focusKeyword,
          status: 'active',
          unitOfMeasure: 'each',
        },
        select: { id: true, brandId: true, categoryId: true, focusKeyword: true, seoTitle: true, seoDescription: true, _count: { select: { crossReferences: true } } },
      })
      created++
    } else {
      updated++
      if (refreshCopy && !dryRun) {
        await db.product.update({
          where: { id: product.id },
          data: {
            title: s.title,
            descriptionShort: short,
            descriptionLong: body,
            seoTitle: s.seoTitle,
            seoDescription: s.seoDescription,
            focusKeyword: s.focusKeyword,
          },
        })
        refreshed++
      }
    }

    if (dryRun) continue

    await db.$transaction(
      async (tx) => {
        for (const spec of specs(s)) {
          const hit = await tx.productSpec.updateMany({
            where: { productId: product!.id, label: spec.label },
            data: { value: spec.value, unit: spec.unit, group: spec.group },
          })
          if (hit.count === 0) {
            const max = await tx.productSpec.aggregate({
              where: { productId: product!.id },
              _max: { position: true },
            })
            await tx.productSpec.create({
              data: {
                productId: product!.id,
                group: spec.group,
                label: spec.label,
                value: spec.value,
                unit: spec.unit,
                position: (max._max.position ?? -1) + 1,
                templateFieldId: spec.templateKey ? (fieldByKey.get(spec.templateKey) ?? null) : null,
              },
            })
          } else if (spec.templateKey) {
            const fieldId = fieldByKey.get(spec.templateKey)
            if (fieldId) {
              await tx.productSpec.updateMany({
                where: { productId: product!.id, label: spec.label, templateFieldId: null },
                data: { templateFieldId: fieldId },
              })
            }
          }
        }

        let faqPos = await tx.productFaq.count({ where: { productId: product!.id } })
        for (const f of faqs(s)) {
          const hit = await tx.productFaq.updateMany({
            where: { productId: product!.id, question: f.question },
            data: { answer: f.answer },
          })
          if (hit.count === 0) {
            await tx.productFaq.create({
              data: { productId: product!.id, question: f.question, answer: f.answer, position: faqPos++ },
            })
          }
        }

        const specCount = await tx.productSpec.count({ where: { productId: product!.id } })
        const faqCount = await tx.productFaq.count({ where: { productId: product!.id } })
        const documentCount = await tx.productDocument.count({ where: { productId: product!.id } })
        const imageCount = await tx.productImage.count({ where: { productId: product!.id } })
        const score = scoreProductContent({
          descriptionShortWords: words(short),
          descriptionLongWords: words(body),
          faqCount,
          specCount,
          crossReferenceCount: product!._count.crossReferences,
          documentCount,
          imageCount,
          hasBrand: Boolean(product!.brandId),
          hasCategory: true,
          hasFocusKeyword: true,
          hasSeoTitleAndDescription: true,
          // No weight, country of origin or MPN: a series listing covers many
          // part numbers, and the sheets publish none of the three.
          hasCommerceAttributes: false,
        })
        await tx.product.update({ where: { id: product!.id }, data: { contentScore: score.score } })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )
  }

  console.log(
    `\n[ferrules] ${dryRun ? 'dry run — ' : ''}${created} listings created, ${updated} updated, ` +
      `${refreshed} refreshed, ${categoriesCreated} categories created, ` +
      `${navCreated} menu entries added, ${problems.length} problems`,
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
