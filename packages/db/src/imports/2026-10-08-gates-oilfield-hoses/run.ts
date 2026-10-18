/**
 * Moves fifteen oil & gas hose listings from Continental to Gates, the maker
 * that actually sells them.
 *
 * The May 2026 oil & gas hose import filed Gates' Black Gold low-pressure
 * oilfield hoses (Drill Water, Bulk Material, Mud & Oil, Potable Water, Fuel,
 * Oilfield Service), its Megashield 5000 BOP hose, Flameshield hose, QC47
 * quick-connect coupling and PowerSpiral cementing hose under the Continental
 * brand, and wrote "Continental …" through their copy. Gates' own datasheets
 * and oil & gas catalogue list every one of them (checked 2026-10-08).
 *
 * Per listing: the brand becomes Gates (created, published, if missing);
 * "Continental …" becomes "Gates …" in the short, SEO and long descriptions,
 * spec values and FAQ answers. Three template lines that only made sense
 * under Continental go: "Indus is an authorised distributor for the
 * Continental ContiTech and Manuli oil & gas hose ranges", the unsourced
 * "… is the dominant North-American brand", and the "(Continental USA /
 * Germany factory)" lead-time note. The runner refuses to write if
 * "Continental" or "ContiTech" would survive anywhere on a listing.
 *
 * Content only; each listing is one transaction; a re-run is a no-op.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-gates-oilfield-hoses/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-gates-oilfield-hoses/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'

import { db } from '../../index'

type Tx = Prisma.TransactionClient

export const SKUS = [
  'IH-OG-LP-001', // Megashield 5000 hose assemblies
  'IH-OG-LP-002', // QC47 quick connect coupling
  'IH-OG-LP-003', // Flameshield low-pressure oilfield hose
  'IH-OG-LP-004', // Black Gold Drill Water 300D
  'IH-OG-LP-005', // Black Gold Drill Water 300SD
  'IH-OG-LP-006', // Black Gold Oilfield Service 400D
  'IH-OG-LP-007', // Black Gold Fuel 300D
  'IH-OG-LP-008', // Black Gold Fuel 300SD
  'IH-OG-LP-009', // Black Gold Mud & Oil 300D
  'IH-OG-LP-010', // Black Gold Mud & Oil 300SD
  'IH-OG-LP-011', // Black Gold Bulk Material 300D
  'IH-OG-LP-012', // Black Gold Bulk Material 300SD
  'IH-OG-LP-013', // Black Gold Potable Water 300D
  'IH-OG-LP-014', // Black Gold Potable Water 300SD
  'IH-OG-DRL-004', // PowerSpiral cementing hose
]

const GATES = {
  slug: 'gates',
  name: 'Gates',
  country: 'USA',
  description:
    'Gates Corporation makes hydraulic, industrial and oil & gas hose, including the Black Gold low-pressure oilfield range, Megashield and Flameshield fire-resistant hoses and PowerSpiral cementing hose.',
}

/** Exact template lines that go entirely. */
const DROP = [
  ' Indus is an authorised distributor for the Continental ContiTech and Manuli oil &amp; gas hose ranges.',
  ' Indus is an authorised distributor for the Continental ContiTech and Manuli oil & gas hose ranges.',
  ' (Continental USA / Germany factory)',
]

export function rebrand(text: string): string {
  let t = text
  for (const d of DROP) t = t.split(d).join('')
  t = t
    .replace(
      /Continental Black Gold is the dominant North-American brand; suction-rated/g,
      'Black Gold suction-rated'
    )
    .replace(
      /the Continental ContiTech oil (&amp;|&) gas hose range/g,
      'the Gates oil $1 gas hose range'
    )
    .replace(/Continental Powerspiral/g, 'Gates PowerSpiral')
    .replace(/Continental (Black Gold|Megashield|Flameshield|QC47)/g, 'Gates $1')
  return t
}

const LEFT = /Continental|ContiTech/

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const

async function main(): Promise<void> {
  const products = await db.product.findMany({
    where: { sku: { in: SKUS } },
    select: {
      id: true,
      sku: true,
      title: true,
      brandId: true,
      seoTitle: true,
      seoDescription: true,
      descriptionShort: true,
      descriptionLong: true,
      specs: { select: { id: true, label: true, value: true } },
      faqs: { select: { id: true, question: true, answer: true } },
    },
  })
  const errors: string[] = []
  if (products.length !== SKUS.length)
    errors.push(
      `found ${products.length} of ${SKUS.length}: missing ${SKUS.filter((s) => !products.some((p) => p.sku === s)).join(', ')}`
    )

  const existing = await db.brand.findUnique({ where: { slug: GATES.slug }, select: { id: true } })

  const plans = products.map((p) => {
    const fields: Record<string, string> = {}
    for (const k of [
      'seoTitle',
      'seoDescription',
      'descriptionShort',
      'descriptionLong',
    ] as const) {
      const cur = p[k]
      if (cur == null) continue
      const next = rebrand(cur)
      if (next !== cur) fields[k] = next
      if (LEFT.test(next)) errors.push(`${p.sku}: "${k}" still names Continental`)
    }
    const specs = p.specs.flatMap((s) => {
      const next = rebrand(s.value).replace(/Continental/g, 'Gates')
      if (LEFT.test(next)) errors.push(`${p.sku}: spec "${s.label}" still names Continental`)
      return next !== s.value ? [{ id: s.id, value: next }] : []
    })
    const faqs = p.faqs.flatMap((f) => {
      const next = rebrand(f.answer)
      if (LEFT.test(next) || LEFT.test(f.question))
        errors.push(`${p.sku}: FAQ "${f.question}" still names Continental`)
      return next !== f.answer ? [{ id: f.id, answer: next }] : []
    })
    if (LEFT.test(p.title)) errors.push(`${p.sku}: title names Continental`)
    return { p, fields, specs, faqs, brandChange: !existing || p.brandId !== existing.id }
  })

  const work = plans.filter(
    (x) => x.brandChange || Object.keys(x.fields).length || x.specs.length || x.faqs.length
  )
  log(
    `${DRY_RUN ? '[dry-run] ' : ''}${existing ? 'Gates brand exists' : 'Gates brand will be created'}; ${work.length} of ${SKUS.length} listings to change`
  )
  for (const x of work)
    log(
      `  ${x.p.sku.padEnd(14)} brand${x.brandChange ? ' → Gates' : ' ok'}; fields: ${Object.keys(x.fields).join(', ') || '—'}; specs ${x.specs.length}; FAQs ${x.faqs.length}`
    )
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN || !work.length) return
  if (!SNAPSHOT) {
    console.error('--snapshot=<path> is required to write: it is the rollback')
    process.exitCode = 1
    return
  }
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      work.map((x) => x.p),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  const brand =
    existing ??
    (await db.brand.create({
      data: { ...GATES, isPublished: true, isAuthorizedDistributor: false },
      select: { id: true },
    }))
  for (const x of work) {
    await db.$transaction(async (tx: Tx) => {
      await tx.product.update({ where: { id: x.p.id }, data: { ...x.fields, brandId: brand.id } })
      for (const s of x.specs)
        await tx.productSpec.update({ where: { id: s.id }, data: { value: s.value } })
      for (const f of x.faqs)
        await tx.productFaq.update({ where: { id: f.id }, data: { answer: f.answer } })
    }, TX)
  }
  log(`written: ${work.length} listings`)
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
