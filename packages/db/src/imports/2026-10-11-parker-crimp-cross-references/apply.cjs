/**
 * Parker 43/71 crimp numbers onto the live Indus crimp pages (2026-10-11).
 *
 *   new_rows    size missing on the page -> new product_variants row: the page's own part-number scheme
 *               (IH-CF..-<hose><end>), end label copied from a row with the same Parker style and end,
 *               competitor = Parker. Dimensions are left empty — no drawing figures for the new size.
 *   alias_only  Parker style the page names as an equivalent but whose rows carry a sibling style
 *               (e.g. long vs short drop) -> number added to searchAliases only, no row.
 *
 * Parker numbers read <style><series>-<END>-<HOSE>. plan.json is built outside the repo. Backup first;
 * idempotent.   node apply.cjs [--dry-run]
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
const BACKUP = `${process.env.HOME}/Documents/Indus Supplier Research/Content Backups/parker-crimp-cross-references-backup-2026-10-11.json`

;(async () => {
  const jobs = new Map()
  const job = (sku) => jobs.get(sku) ?? jobs.set(sku, { rows: [], alias: [] }).get(sku)
  for (const [sku, pn, num, label, hose, hoseInch] of plan.new_rows) job(sku).rows.push({ pn, num, label, hose, hoseInch })
  for (const [sku, num] of plan.alias_only) job(sku).alias.push(num)
  const products = await db.product.findMany({
    where: { sku: { in: [...jobs.keys()] } },
    select: { id: true, sku: true, searchAliases: true, variants: { select: { partNumber: true, position: true, competitorMpn: true } } },
  })
  if (!dry) fs.writeFileSync(BACKUP, JSON.stringify(products, null, 1))
  const taken = new Set((await db.productVariant.findMany({ where: { competitorBrand: 'Parker' }, select: { competitorMpn: true } })).map((v) => v.competitorMpn))
  const n = { created: 0, aliases: 0, skipped: 0 }
  for (const p of products) {
    const j = jobs.get(p.sku)
    const aliases = new Set((p.searchAliases || '').split(/\s+/).filter(Boolean))
    const before = aliases.size
    const ops = []
    let pos = Math.max(-1, ...p.variants.map((v) => v.position))
    for (const r of j.rows) {
      aliases.add(r.num)
      if (p.variants.some((v) => v.partNumber === r.pn) || taken.has(r.num)) { n.skipped++; continue }
      ops.push(db.productVariant.create({ data: { productId: p.id, partNumber: r.pn, position: ++pos, dimensions: {}, portLabel: r.label,
        hoseDash: r.hose, hoseInch: r.hoseInch, competitorBrand: 'Parker', competitorMpn: r.num } }))
      n.created++
    }
    for (const a of j.alias) aliases.add(a)
    if (aliases.size !== before) { ops.push(db.product.update({ where: { id: p.id }, data: { searchAliases: [...aliases].join(' ') } })); n.aliases += aliases.size - before }
    if (!dry && ops.length) await db.$transaction(ops)
  }
  console.log(dry ? '[dry-run]' : '[applied]', products.length, 'products', n)
  await db.$disconnect()
})().catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1) })
