/**
 * DEMCO overhaul, 2026-11-27: two FAQ answers on the Butterfly Valves shelf (`category/butterfly-valves`)
 * still decoded DEMCO part numbers from an older label set: body code 2 as cast iron, disc code 3 as
 * Monel and seat 34 as Viton. The 2018 Butterfly-Style DEMCO Valves brochure (pp. 10–14) gives NE-C body
 * 1 = ductile iron (lug) and 2 = ductile iron (wafer), lists no Monel disc, and calls seat 34 FKM. This
 * rewrites those two answers and nothing else on the page.
 *
 * The question text locates each item. The old answer must still contain the phrase in `mustContain`, so
 * an answer an editor has since rewritten is left alone. A backup of the page document is printed first.
 *
 *   tsx src/imports/2026-11-27-demco-overhaul/shelf-copy.ts [--dry-run]
 */
import { Prisma, PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const KEY = 'category/butterfly-valves'

const FIXES: { q: string; mustContain: string; a: string }[] = [
  {
    q: 'How do I read a DEMCO butterfly part number such as J022122-1215311?',
    mustContain: '2 cast iron',
    a: 'The base number gives series, size and shut-off rating: 200 psi NE-C valves run from 22119 for 2″ to 22127 for 12″, so 22122 is a 4″ NE-C. In the suffix, the first digit is the body configuration (1 wafer, 5 lug); the second the body material, by series (NE-C: 1 ductile iron lug, 2 ductile iron wafer; NE-I: 1 ductile iron, 3 aluminium bronze, 4 carbon steel, 8 stainless steel); the third the stem (1 416 SS, 2 316 SS); the fourth the disc (2 316 SS, 4 aluminium bronze, 5 nickel-plated ductile iron, A ZPEX-coated ductile iron); then two digits for the seat (31 Buna-N, 34 FKM, 35 EPDM, 36 natural rubber) and the actuation code. A J0 prefix marks a non-fire-safe valve and F0 a fire-safe one. Older nameplates can carry codes the current brochure no longer lists, so where they disagree, go by the nameplate.',
  },
  {
    q: 'Which disc material should a DEMCO butterfly valve have?',
    mustContain: 'Monel',
    a: 'Choose the disc by what the medium does to metal, as you choose the seat by what it does to rubber. Nickel-plated ductile iron is the standard disc for water, air and other non-corrosive service; aluminium bronze suits seawater and brackish water; 316 stainless steel suits food, beverage, many chemicals and corrosive water. The ZPEX-coated ductile iron disc is the option DEMCO offers for corrosive service, including salt water and hydrogen sulphide. Tell us the medium, concentration and temperature and we confirm disc, seat and stem together.',
  },
]

type Section = { key: string; enabled: boolean; values: { items?: { q: string; a: string }[] } & Record<string, unknown> }

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const doc = await db.pageContent.findUnique({ where: { key: KEY }, select: { id: true, sections: true } })
  if (!doc) throw new Error(`${KEY} not found`)
  console.log(`[backup] ${JSON.stringify(doc.sections)}`)
  const sections = structuredClone(doc.sections) as unknown as Section[]
  const faq = sections.find((s) => s.key === 'faq')
  if (!faq?.values.items) throw new Error('no faq section')
  let changed = 0
  for (const fix of FIXES) {
    const item = faq.values.items.find((i) => i.q === fix.q)
    if (!item) {
      console.log(`  ! not found: ${fix.q}`)
      continue
    }
    if (!item.a.includes(fix.mustContain)) {
      console.log(`  - already changed, left alone: ${fix.q}`)
      continue
    }
    item.a = fix.a
    changed++
  }
  if (!dryRun && changed > 0) {
    await db.pageContent.update({
      where: { id: doc.id },
      data: { sections: sections as unknown as Prisma.InputJsonValue },
    })
  }
  console.log(`[shelf-copy] ${changed} answers ${dryRun ? 'would change' : 'changed'} on ${KEY}`)
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
