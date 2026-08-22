/**
 * State the JIS / Komatsu cone angle in both conventions.
 *
 * Our supplier's two catalogues name the same seat differently: the crimp book
 * writes JIC 37° and JIS 30°, the master book writes JIC 74° and JIS 60°. Those
 * are half-angle and included-angle measurements of one cone — 30° from the
 * centreline is 60° across the full cone — and neither book says which it is
 * using.
 *
 * That cost real time here: the two numbers were logged as a spec conflict
 * needing a supplier query, and they were never in conflict. A customer holding
 * a drawing that quotes the other number has exactly the same problem, and no
 * way to resolve it.
 *
 * So the listings say both. Nothing about the parts changes and no number is
 * corrected — the spec becomes unambiguous, which it was not before.
 *
 * Scope: the `Sealing Form` spec on the JIS-family hose fittings, and the two
 * sentences in body copy that repeat it. The metric adapters
 * (`IH-AD-MET-011`–`014`) say "30° flare" inside a thread description rather
 * than as a sealing form; left alone, because there the half-angle reading is
 * the only sensible one and adding a second number would clutter it.
 *
 * Idempotent, and the way it gets there is the whole trick: the old value is a
 * SUBSTRING of the new one — "30° cone seat" lives inside "30° cone seat, 60°
 * included" — so a plain find-and-replace re-fires on its own output and
 * appends the phrase again on every run. It did exactly that once here, on four
 * descriptions, before the guard below existed. Every replacement is therefore
 * gated on the target phrase being absent, not merely on the source being
 * present. `repair()` cleans up any row that was doubled before the guard.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/restate-jis-cone-angle.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Old sealing-form value → the both-conventions replacement. */
const RESTATE: Array<{ from: string; to: string }> = [
  { from: '30° flare seat (Japanese OEM)', to: '30° flare seat, 60° included (Japanese OEM)' },
  { from: '30° cone seat', to: '30° cone seat, 60° included' },
]

/** Undo a doubled application from before the guard existed. */
function repair(text: string): string {
  return text.replace(/(, 60° included)+/g, ', 60° included')
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let specs = 0
  let bodies = 0

  for (const { from, to } of RESTATE) {
    const rows = await db.productSpec.findMany({
      where: { label: 'Sealing Form', value: from },
      select: { id: true, product: { select: { sku: true } } },
    })
    for (const r of rows) {
      console.log(`${dryRun ? '[dry-run] ' : ''}${r.product.sku}: "${from}" → "${to}"`)
      if (!dryRun) await db.productSpec.update({ where: { id: r.id }, data: { value: to } })
      specs++
    }
    // `from` is a substring of `to`, so `value: from` above matches a row that
    // has already been restated. Prisma's `equals` saves us on the spec rows;
    // the body copy below has no such luxury.
  }

  // Body copy repeats the sealing form. Rewriting the whole description would
  // discard any admin edit made since import, so only the exact phrase moves.
  const products = await db.product.findMany({
    where: {
      OR: [
        ...RESTATE.map(({ from }) => ({ descriptionLong: { contains: from } })),
        { descriptionLong: { contains: ', 60° included, 60° included' } },
      ],
    },
    select: { id: true, sku: true, descriptionLong: true, descriptionShort: true },
  })
  for (const p of products) {
    let long = repair(p.descriptionLong ?? '')
    let short = repair(p.descriptionShort ?? '')
    for (const { from, to } of RESTATE) {
      // Only where the target is not already there — see the note above.
      if (!long.includes(to)) long = long.split(from).join(to)
      if (!short.includes(to)) short = short.split(from).join(to)
    }
    if (long === p.descriptionLong && short === p.descriptionShort) continue
    console.log(`${dryRun ? '[dry-run] ' : ''}${p.sku}: body copy restated`)
    if (!dryRun) {
      await db.product.update({
        where: { id: p.id },
        data: { descriptionLong: long, descriptionShort: short },
      })
    }
    bodies++
  }

  console.log(`\n[jis-cone] ${specs} spec rows, ${bodies} descriptions restated`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
