/**
 * Repair words the supplier's PDF broke at an f-ligature.
 *
 * The hose catalogue sets `fl`, `fi` and `ffi` as single ligature glyphs, and
 * pulling text out of it splits the word at the glyph: "highly flexible"
 * arrives as "highly fl exible", "refinery" as "refi nery". The 2026-08-21
 * rebrand imported that text as printed, so four composite hose listings have
 * been publishing broken words ever since.
 *
 * The list is CLOSED — every repair is a literal string that was found in the
 * data, never a general rule. A regex for "fl followed by a space" would also
 * eat "overall fl ow" style false positives in copy nobody checked, and the
 * point of the pass is to leave the text as its author meant it, not to guess
 * at English.
 *
 * The same string lives in several places, which is this catalogue's signature
 * failure: the visible copy reads clean while a spec value, an FAQ answer and
 * the meta description still carry the broken word. The first pass of this
 * script covered descriptions, specs and FAQs and reported zero — and left
 * "highly fl exible" in the meta description of three composite hoses, which
 * is the string Google actually indexes. Cover the SEO fields and the category
 * copy too, and check the count from the database rather than from this
 * script's own idea of where to look.
 *
 * Idempotent: a second run finds nothing and reports zero.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-ligature-splits.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Broken form -> what the printed page actually says. */
const REPAIRS: ReadonlyArray<readonly [string, string]> = [
  ['fl exible', 'flexible'],
  ['refi neries', 'refineries'],
  ['refi nery', 'refinery'],
  ['fi lms', 'films'],
]

function repair(value: string): string {
  let out = value
  for (const [broken, fixed] of REPAIRS) out = out.split(broken).join(fixed)
  return out
}

function isBroken(value: string | null | undefined): boolean {
  return typeof value === 'string' && REPAIRS.some(([broken]) => value.includes(broken))
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let fixed = 0

  const products = await db.product.findMany({
    select: {
      id: true,
      sku: true,
      descriptionShort: true,
      descriptionLong: true,
      // The meta fields matter MORE than the body copy, not less: a broken
      // word in a description a reader skims is ugly, the same word in the
      // meta description is what Google indexes and prints in the result.
      seoTitle: true,
      seoDescription: true,
      focusKeyword: true,
    },
  })
  for (const p of products) {
    const fields = [p.descriptionShort, p.descriptionLong, p.seoTitle, p.seoDescription, p.focusKeyword]
    if (!fields.some(isBroken)) continue
    fixed++
    console.log(`${dryRun ? '[dry-run] ' : ''}${p.sku} — product copy`)
    if (dryRun) continue
    await db.product.update({
      where: { id: p.id },
      data: {
        descriptionShort: p.descriptionShort ? repair(p.descriptionShort) : p.descriptionShort,
        descriptionLong: p.descriptionLong ? repair(p.descriptionLong) : p.descriptionLong,
        seoTitle: p.seoTitle ? repair(p.seoTitle) : p.seoTitle,
        seoDescription: p.seoDescription ? repair(p.seoDescription) : p.seoDescription,
        focusKeyword: p.focusKeyword ? repair(p.focusKeyword) : p.focusKeyword,
      },
    })
  }

  // Categories are always a separate sweep on this catalogue — a products-only
  // pass has come back clean here before while category SEO copy still carried
  // the supplier's text.
  const categories = await db.category.findMany({
    select: { id: true, slug: true, name: true, shortDescription: true, seoTitle: true, seoDescription: true },
  })
  for (const c of categories) {
    const fields = [c.name, c.shortDescription, c.seoTitle, c.seoDescription]
    if (!fields.some(isBroken)) continue
    fixed++
    console.log(`${dryRun ? '[dry-run] ' : ''}category ${c.slug}`)
    if (dryRun) continue
    await db.category.update({
      where: { id: c.id },
      data: {
        name: repair(c.name),
        shortDescription: c.shortDescription ? repair(c.shortDescription) : c.shortDescription,
        seoTitle: c.seoTitle ? repair(c.seoTitle) : c.seoTitle,
        seoDescription: c.seoDescription ? repair(c.seoDescription) : c.seoDescription,
      },
    })
  }

  const specs = await db.productSpec.findMany({ select: { id: true, label: true, value: true } })
  for (const s of specs) {
    if (!isBroken(s.value) && !isBroken(s.label)) continue
    fixed++
    console.log(`${dryRun ? '[dry-run] ' : ''}spec ${s.id}`)
    if (dryRun) continue
    await db.productSpec.update({
      where: { id: s.id },
      data: { label: repair(s.label), value: repair(s.value) },
    })
  }

  // FAQs matter twice over: they render as copy AND as FAQPage structured data.
  const faqs = await db.productFaq.findMany({ select: { id: true, question: true, answer: true } })
  for (const f of faqs) {
    if (!isBroken(f.question) && !isBroken(f.answer)) continue
    fixed++
    console.log(`${dryRun ? '[dry-run] ' : ''}faq ${f.id}`)
    if (dryRun) continue
    await db.productFaq.update({
      where: { id: f.id },
      data: { question: repair(f.question), answer: repair(f.answer) },
    })
  }

  console.log(`\n[fix-ligature-splits] ${dryRun ? 'would fix' : 'fixed'} ${fixed} row(s)`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
