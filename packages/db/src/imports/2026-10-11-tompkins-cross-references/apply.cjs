/**
 * Tompkins cross-references (2026-10-11): Tompkins part numbers whose configuration is
 * already live go onto the live Indus page instead of a new branded page.
 *
 *   fill_competitor  row exists  -> competitorBrand/Mpn = Tompkins, only where both are empty
 *   new_rows         size absent -> new product_variants row in the page's own part-number and label style
 *   alias_only       IH-ST/IH-HN pages (the supplier codes) -> Tompkins number added to searchAliases if missing
 *
 * plan.json is built outside the repo from the supplier export: end order
 * is checked against the page title and every end's thread against the thread chart; failures are left out.
 * Writes a backup of every touched product's variants and aliases first. Idempotent.
 *
 *   node apply.cjs [--dry-run]
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
const BACKUP = `${process.env.HOME}/Documents/Indus Supplier Research/Content Backups/tompkins-cross-references-backup-2026-10-11.json`

;(async () => {
  const byPage = new Map()
  const add = (page, k, v) => {
    if (!byPage.has(page)) byPage.set(page, { fill: [], rows: [], alias: [] })
    byPage.get(page)[k].push(v)
  }
  for (const [page, pn, nh] of plan.fill_competitor) add(page, 'fill', { pn, nh })
  for (const [page, pn, nh, labels] of plan.new_rows) add(page, 'rows', { pn, nh, labels })
  for (const [page, nh] of plan.alias_only) add(page, 'alias', nh)

  const products = await db.product.findMany({
    where: { sku: { in: [...byPage.keys()] } },
    select: { id: true, sku: true, searchAliases: true, variants: { select: { id: true, partNumber: true, position: true, portLabel: true, port2Label: true, port3Label: true, competitorBrand: true, competitorMpn: true } } },
  })
  if (!dry) fs.writeFileSync(BACKUP, JSON.stringify(products, null, 1))
  const counts = { filled: 0, created: 0, aliases: 0, keptCompetitor: 0, rowExists: 0 }
  for (const p of products) {
    const job = byPage.get(p.sku)
    const aliases = new Set((p.searchAliases || '').split(/\s+/).filter(Boolean))
    const before = aliases.size
    const ops = []
    let pos = Math.max(-1, ...p.variants.map((v) => v.position))
    for (const { pn, nh } of job.fill) {
      const v = p.variants.find((x) => x.partNumber === pn)
      aliases.add(nh)
      if (!v) continue
      if (v.competitorMpn || v.competitorBrand) { counts.keptCompetitor++; continue }
      ops.push(db.productVariant.update({ where: { id: v.id }, data: { competitorBrand: 'Tompkins', competitorMpn: nh } }))
      counts.filled++
    }
    for (const { pn, nh, labels } of job.rows) {
      aliases.add(nh); aliases.add(pn)
      if (p.variants.some((x) => x.partNumber === pn)) { counts.rowExists++; continue }
      ops.push(db.productVariant.create({ data: { productId: p.id, partNumber: pn, position: ++pos, dimensions: {},
        portLabel: labels[0] ?? null, port2Label: labels[1] ?? null, port3Label: labels[2] ?? null, competitorBrand: 'Tompkins', competitorMpn: nh } }))
      counts.created++
    }
    for (const nh of job.alias) aliases.add(nh)
    if (aliases.size !== before) {
      ops.push(db.product.update({ where: { id: p.id }, data: { searchAliases: [...aliases].join(' ') } }))
      counts.aliases += aliases.size - before
    }
    if (!dry && ops.length) await db.$transaction(ops)
  }
  console.log(dry ? '[dry-run]' : '[applied]', products.length, 'products', counts)
  await db.$disconnect()
})().catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1) })
