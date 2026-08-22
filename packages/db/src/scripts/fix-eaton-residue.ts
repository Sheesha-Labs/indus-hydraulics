/**
 * Repair the Eaton references the quick-coupler rebrand left behind.
 *
 * When the 27 Eaton Aeroquip couplers moved to the Indus house brand they were
 * renamed — SKU, title, slug and series code. The body copy was not fully
 * carried across, leaving three different problems that look alike but are not:
 *
 *   1. DEAD CROSS-REFERENCES. Copy that points the reader at another product by
 *      its old Eaton designation — "see the Eaton 5600 (ISO 7241 Series A)".
 *      Those products still exist but under Indus series codes, so the pointer
 *      resolves to nothing. Verified: zero products still match any old Eaton
 *      designation. These are rewritten to the current Indus codes.
 *
 *   2. MISATTRIBUTED FRAMING. Lead sentences that describe an Indus product as
 *      though it were an Eaton one — "Eaton-standard test couplings",
 *      "coupling for Eaton's FLOCS". Rewritten to name the STANDARD rather than
 *      the brand, which is both accurate and what a buyer actually searches.
 *
 *   3. LEGITIMATE INTERCHANGE REFERENCES — left completely alone. The
 *      "Interchanges With (Competitor Brands)" spec field exists precisely to
 *      say "this mates with an Eaton FD89", and hose copy noting a grade is
 *      also stocked in Eaton Aeroquip or Parker Hannifin is a true statement
 *      about what we carry. Stripping those would delete real buying
 *      information and real search traffic — someone looking for an "Eaton FD89
 *      equivalent" should land on ours. Naming a competitor's part as an
 *      interchange is ordinary trade practice, not a branding mistake.
 *
 * So this touches five products, not the sixty-three that merely contain the
 * word "Eaton".
 *
 * Idempotent: replacements are literal find-and-replace, and a second run finds
 * nothing to change. Reports per-field counts and aborts nothing silently — a
 * SKU whose expected text is missing is reported as NOT FOUND rather than
 * skipped quietly, because that means the copy drifted from what this script
 * was written against.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-eaton-residue.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-eaton-residue.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

type Fix = { find: string; replace: string; note: string }

/**
 * Keyed by SKU. Every `find` is a literal string lifted from the live row, so a
 * miss means the copy changed and the fix needs re-deriving rather than forcing.
 */
const FIXES: Record<string, Fix[]> = {
  // ── Dead cross-references ──────────────────────────────────────────────
  'IH-QC-WINGNUT': [
    {
      find:
        'For push-to-connect service see the Eaton 5600 (ISO 7241 Series A), FD45 (Series B) and FD89 flush-face ranges in the same category.',
      replace:
        'For push-to-connect service see the Indus QC-7241A (ISO 7241 Series A), QC-7241B (Series B) and QC-16028 flush-face ranges in the same category.',
      note: 'dead pointer -> current Indus series codes',
    },
    {
      find: 'For farm tractor tips see Eaton FD70 / FD76 (ISO 5675).',
      replace: 'For farm tractor tips see the Indus QC-5675 range (ISO 5675).',
      note: 'dead pointer -> current Indus series code',
    },
    {
      find:
        'For connect-under-pressure service use a thread-to-connect flush-face coupler such as the Eaton FD86 or FD96.',
      replace:
        'For connect-under-pressure service use a thread-to-connect flush-face coupler such as the Indus QC-DB or QC-FFT.',
      note: 'dead pointer in FAQ -> current Indus series codes',
    },
  ],
  'IH-QC-WINGNUT-TRL': [
    {
      find:
        'For push-to-connect service see the Eaton 5600 (ISO 7241 Series A), FD45 (Series B) and FD89 flush-face ranges in the same category.',
      replace:
        'For push-to-connect service see the Indus QC-7241A (ISO 7241 Series A), QC-7241B (Series B) and QC-16028 flush-face ranges in the same category.',
      note: 'dead pointer -> current Indus series codes',
    },
    {
      find: 'For farm tractor tips see Eaton FD70 / FD76 (ISO 5675).',
      replace: 'For farm tractor tips see the Indus QC-5675 range (ISO 5675).',
      note: 'dead pointer -> current Indus series code',
    },
    {
      find:
        'For connect-under-pressure service use a thread-to-connect flush-face coupler such as the Eaton FD86 or FD96.',
      replace:
        'For connect-under-pressure service use a thread-to-connect flush-face coupler such as the Indus QC-DB or QC-FFT.',
      note: 'dead pointer in FAQ -> current Indus series codes',
    },
  ],
  'IH-QC-AIR-MIL-MR': [
    {
      find: 'Uses Eaton FD40 Series male tips',
      replace: 'Uses Indus QC-AM Series male tips',
      note: 'dead pointer -> the FD40 equivalent is now QC-AM (IH-QC-AIR-MIL-PTC)',
    },
    {
      find: 'MIL-C-4109 industrial interchange (uses FD40 male tips)',
      replace: 'MIL-C-4109 industrial interchange',
      note: 'interchange value described our own tips by an old Eaton code; the standard is the useful part',
    },
  ],

  // ── Misattributed framing ──────────────────────────────────────────────
  'IH-QC-GAUGEKIT': [
    {
      find: 'Eaton-standard test couplings',
      replace: 'SAE J1502 test couplings',
      note: 'named a competitor brand as the standard of our own kit; SAE J1502 is the actual standard',
    },
  ],
  'IH-QC-OILDRAIN': [
    {
      find: "oil drain coupling for Eaton's FLOCS (Fast Lube Oil Change System)",
      replace: 'oil drain coupling for Fast Lube Oil Change (FLOCS-type) systems',
      note: 'lead sentence read as though this were an Eaton part; compatibility stays in the interchange spec',
    },
  ],
}

const TEXT_FIELDS = ['descriptionShort', 'descriptionLong', 'seoDescription'] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const prefix = dryRun ? '[DRY-RUN]' : '[LIVE]'
  console.log(`${prefix} Repairing Eaton residue on ${Object.keys(FIXES).length} product(s)\n`)

  let changedProducts = 0
  let changedFields = 0
  let changedFaqs = 0
  let changedSpecs = 0
  const problems: string[] = []

  for (const [sku, fixes] of Object.entries(FIXES)) {
    const product = await db.product.findUnique({
      where: { sku },
      select: {
        id: true,
        sku: true,
        descriptionShort: true,
        descriptionLong: true,
        seoDescription: true,
        faqs: { select: { id: true, question: true, answer: true } },
        specs: { select: { id: true, label: true, value: true } },
      },
    })
    if (!product) {
      problems.push(`${sku}: no such product`)
      console.log(`  MISSING  ${sku}`)
      continue
    }

    console.log(`\n${sku}`)
    let touched = false

    for (const fix of fixes) {
      let found = false

      // Product text fields
      const data: Record<string, string> = {}
      for (const field of TEXT_FIELDS) {
        const current = product[field]
        if (current && current.includes(fix.find)) {
          data[field] = current.split(fix.find).join(fix.replace)
          found = true
          changedFields += 1
          console.log(`   ${field}: ${fix.note}`)
        }
      }
      if (Object.keys(data).length > 0 && !dryRun) {
        await db.product.update({ where: { id: product.id }, data })
        // keep the in-memory copy in step so a later fix sees the new text
        for (const [k, v] of Object.entries(data)) (product as Record<string, unknown>)[k] = v
      } else if (Object.keys(data).length > 0) {
        for (const [k, v] of Object.entries(data)) (product as Record<string, unknown>)[k] = v
      }

      // FAQs
      for (const faq of product.faqs) {
        const q = faq.question.includes(fix.find)
        const a = faq.answer.includes(fix.find)
        if (!q && !a) continue
        found = true
        changedFaqs += 1
        console.log(`   faq: ${fix.note}`)
        if (!dryRun) {
          await db.productFaq.update({
            where: { id: faq.id },
            data: {
              question: q ? faq.question.split(fix.find).join(fix.replace) : faq.question,
              answer: a ? faq.answer.split(fix.find).join(fix.replace) : faq.answer,
            },
          })
        }
        if (q) faq.question = faq.question.split(fix.find).join(fix.replace)
        if (a) faq.answer = faq.answer.split(fix.find).join(fix.replace)
      }

      // Specs — only the ones this fix table names explicitly
      for (const spec of product.specs) {
        if (!spec.value.includes(fix.find)) continue
        found = true
        changedSpecs += 1
        console.log(`   spec "${spec.label}": ${fix.note}`)
        if (!dryRun) {
          await db.productSpec.update({
            where: { id: spec.id },
            data: { value: spec.value.split(fix.find).join(fix.replace) },
          })
        }
        spec.value = spec.value.split(fix.find).join(fix.replace)
      }

      if (found) touched = true
      else console.log(`   NOT FOUND (already fixed, or copy drifted): "${fix.find.slice(0, 70)}…"`)
    }

    if (touched) changedProducts += 1
  }

  console.log(
    `\n${prefix} ${changedProducts} product(s) touched — ${changedFields} field(s), ${changedFaqs} FAQ(s), ${changedSpecs} spec(s).`,
  )
  console.log(
    '\nDeliberately NOT changed: "Interchanges With (Competitor Brands)" values naming Eaton\n' +
      'parts, and hose copy noting a grade is also stocked in Eaton Aeroquip or Parker\n' +
      'Hannifin. Both are true and both are what a buyer searches for.',
  )
  if (problems.length > 0) {
    console.log(`\n${problems.length} problem(s):`)
    for (const p of problems) console.log(`  - ${p}`)
    process.exitCode = 1
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
