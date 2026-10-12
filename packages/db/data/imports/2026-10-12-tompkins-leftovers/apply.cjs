/**
 * Tompkins leftovers (2026-10-12): the Tompkins numbers the 2026-10-11 pass left out, and
 * the duplicate rows that pass created.
 *
 *   fill      row exists (IH-ST-<number>, the same-size row, or the brass air-brake row of the same industry number) -> competitorBrand/Mpn = Tompkins, only where both are empty
 *   new_row   size absent -> new row in the page's own part-number and label style
 *   alias     end order not provable (reducing tees) -> Tompkins number added to the page's searchAliases only
 *   dedupe    row created 2026-10-11 that repeats an IH-ST-<same number> row on the same page -> deleted,
 *             Tompkins number moved onto the IH-ST row if that row has no equivalent yet
 *   relabel   row whose thread label contradicts its own dash size -> corrected label on every end
 *   excluded  listed for the record, not written (configuration is not the page's)
 *
 * plan.json is built outside the repo from the supplier export and the live rows; every
 * end's thread comes from the SAE J514 / ANSI B1.20.1 charts. Backs up every touched product
 * first. Idempotent.
 *
 *   node packages/db/data/imports/2026-10-12-tompkins-leftovers/apply.cjs [--dry-run]
 *
 * Kept under packages/db/data/ so committing the record does not trigger a site build.
 */
const { createRequire } = require('module')
const fs = require('fs')
const path = require('path')
const M = '/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics/'
const req = createRequire(M + 'packages/db/package.json')
process.env.DATABASE_URL = fs.readFileSync(M + 'apps/web/.env.local', 'utf8').match(/^DATABASE_URL=["']?([^"'\n]+)/m)[1]
const db = new (req('@prisma/client').PrismaClient)()
const dry = process.argv.includes('--dry-run')
const plan = JSON.parse(fs.readFileSync(path.join(__dirname, 'plan.json'), 'utf8'))
const BACKUP = `${process.env.HOME}/Documents/Indus Supplier Research/Content Backups/tompkins-leftovers-backup-2026-10-12.json`

;(async () => {
  const pages = new Set([...plan.fill, ...plan.new_row, ...plan.alias, ...plan.dedupe, ...plan.relabel].map((r) => r[0]))
  const products = await db.product.findMany({
    where: { sku: { in: [...pages] } },
    select: { id: true, sku: true, searchAliases: true, variants: { select: { id: true, partNumber: true, position: true, portLabel: true, port2Label: true, port3Label: true, competitorBrand: true, competitorMpn: true } } },
  })
  if (!dry) fs.writeFileSync(BACKUP, JSON.stringify(products, null, 1))
  const c = { filled: 0, keptCompetitor: 0, created: 0, rowExists: 0, aliases: 0, deleted: 0, moved: 0, relabelled: 0 }
  for (const p of products) {
    const ops = []
    const aliases = new Set((p.searchAliases || '').split(/\s+/).filter(Boolean))
    const before = aliases.size
    const find = (pn) => p.variants.find((v) => v.partNumber === pn)
    let pos = Math.max(-1, ...p.variants.map((v) => v.position))
    for (const [, pn, nh] of plan.fill.filter((r) => r[0] === p.sku)) {
      aliases.add(nh)
      const v = find(pn)
      if (!v) continue
      if (v.competitorBrand || v.competitorMpn) { c.keptCompetitor++; continue }
      ops.push(db.productVariant.update({ where: { id: v.id }, data: { competitorBrand: 'Tompkins', competitorMpn: nh } })); c.filled++
    }
    for (const [, pn, nh, l] of plan.new_row.filter((r) => r[0] === p.sku)) {
      aliases.add(nh); aliases.add(pn)
      if (find(pn)) { c.rowExists++; continue }
      ops.push(db.productVariant.create({ data: { productId: p.id, partNumber: pn, position: ++pos, dimensions: {},
        portLabel: l[0] ?? null, port2Label: l[1] ?? null, port3Label: l[2] ?? null, competitorBrand: 'Tompkins', competitorMpn: nh } })); c.created++
    }
    for (const [, nh] of plan.alias.filter((r) => r[0] === p.sku)) aliases.add(nh)
    for (const [, dupPn, stPn, nh] of plan.dedupe.filter((r) => r[0] === p.sku)) {
      const dup = find(dupPn), st = find(stPn)
      if (!dup || !st || dup.competitorMpn !== nh) continue
      ops.push(db.productVariant.delete({ where: { id: dup.id } })); c.deleted++
      aliases.delete(dupPn)
      if (!st.competitorBrand && !st.competitorMpn) { ops.push(db.productVariant.update({ where: { id: st.id }, data: { competitorBrand: 'Tompkins', competitorMpn: nh } })); c.moved++ }
    }
    for (const [, pn, bad, good, n] of plan.relabel.filter((r) => r[0] === p.sku)) {
      const v = find(pn)
      if (!v || v.portLabel !== bad) continue
      ops.push(db.productVariant.update({ where: { id: v.id }, data: { portLabel: good, port2Label: n > 1 ? good : v.port2Label, port3Label: n > 2 ? good : v.port3Label } })); c.relabelled++
    }
    if (aliases.size !== before || [...aliases].join(' ') !== (p.searchAliases || '')) {
      ops.push(db.product.update({ where: { id: p.id }, data: { searchAliases: [...aliases].join(' ') } }))
      c.aliases += Math.max(0, aliases.size - before)
    }
    if (!dry && ops.length) await db.$transaction(ops, { timeout: 30_000, maxWait: 10_000 })
  }
  console.log(dry ? '[dry-run]' : '[applied]', products.length, 'products', c, '| excluded', plan.excluded.length)
  await db.$disconnect()
})().catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1) })
