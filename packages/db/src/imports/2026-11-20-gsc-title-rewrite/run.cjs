#!/usr/bin/env node
/**
 * GSC 2026-11-20 title + meta description rewrite — live DB, no deploy.
 *
 *   node run.cjs --dry-run            print old -> new, write nothing
 *   node run.cjs --backup <file>      write rollback JSON, then apply
 *   node run.cjs --rollback <file>    restore every field from a rollback JSON
 *
 * Loads @prisma/client and DATABASE_URL from the main checkout (worktrees have
 * neither). Never prints the URL. One small update per row.
 *
 * Touches only: Category/BlogPost/Product/Brand/ServiceCase seoTitle and
 * seoDescription, Brand.description (DEMCO intro), the market Pages & Blocks
 * hero meta_title / meta_description, and Product.brandId for DEMCO DM spares
 * that have no brand. Never touches blog bodyBlocks.
 */
const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')

const MAIN = process.env.INDUS_MAIN_CHECKOUT || '/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics'
if (!process.env.DATABASE_URL) {
  const env = fs.readFileSync(path.join(MAIN, 'apps/web/.env.local'), 'utf8')
  const m = env.match(/^DATABASE_URL=["']?([^"'\n]+)/m)
  if (!m) throw new Error('DATABASE_URL not found in main checkout .env.local')
  process.env.DATABASE_URL = m[1]
}
const { PrismaClient } = createRequire(path.join(MAIN, 'packages/db/package.json'))('@prisma/client')
const db = new PrismaClient()

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null)
const BACKUP = flag('--backup')
const ROLLBACK = flag('--rollback')
const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'payload.json'), 'utf8'))

const SUFFIX = ' | Indus Hydraulics'
const MODELS = {
  categories: 'category',
  blogPosts: 'blogPost',
  products: 'product',
  brands: 'brand',
  serviceCases: 'serviceCase',
}
const FIELDS = ['seoTitle', 'seoDescription', 'description']

function check() {
  const bad = []
  for (const group of Object.keys(MODELS)) {
    for (const e of P[group]) {
      if (e.seoTitle && (e.seoTitle + SUFFIX).length > 64) bad.push(`${e.slug}: title ${(e.seoTitle + SUFFIX).length}`)
      if (e.seoDescription && e.seoDescription.length > 170) bad.push(`${e.slug}: description ${e.seoDescription.length}`)
    }
  }
  for (const e of P.markets) {
    if (e.meta_title && (e.meta_title + SUFFIX).length > 64) bad.push(`market ${e.slug}: title`)
    if (e.meta_description && e.meta_description.length > 170) bad.push(`market ${e.slug}: description`)
  }
  if (bad.length) throw new Error('Length check failed:\n' + bad.join('\n'))
}

async function snapshot() {
  const out = { takenAt: new Date().toISOString(), rows: [], markets: [], brandLinks: [] }
  for (const [group, model] of Object.entries(MODELS)) {
    for (const e of P[group]) {
      const select = { id: true, slug: true, seoTitle: true, seoDescription: true }
      if (model === 'brand') select.description = true
      const row = await db[model].findUnique({ where: { slug: e.slug }, select })
      if (!row) throw new Error(`${model} ${e.slug} not found`)
      out.rows.push({ model, ...row })
    }
  }
  for (const e of P.markets) {
    const row = await db.pageContent.findUnique({ where: { key: `market/${e.slug}` }, select: { key: true, sections: true } })
    if (!row) throw new Error(`market/${e.slug} document not found`)
    const hero = row.sections.find((s) => s.key === 'hero')
    if (!hero) throw new Error(`market/${e.slug} has no hero section`)
    out.markets.push({ key: row.key, meta_title: hero.values.meta_title ?? null, meta_description: hero.values.meta_description ?? null })
  }
  for (const l of P.brandLinks) {
    const rows = await db.product.findMany({
      where: { slug: { startsWith: l.productSlugPrefix }, brandId: null },
      select: { id: true, slug: true, brandId: true },
    })
    out.brandLinks.push(...rows.map((r) => ({ ...r, brand: l.brand })))
  }
  return out
}

async function apply(snap) {
  const changed = []
  for (const [group, model] of Object.entries(MODELS)) {
    for (const e of P[group]) {
      const old = snap.rows.find((r) => r.model === model && r.slug === e.slug)
      const data = {}
      for (const f of FIELDS) if (e[f] !== undefined && e[f] !== old[f]) data[f] = e[f]
      if (!Object.keys(data).length) continue
      for (const f of Object.keys(data)) console.log(`${model} ${e.slug} ${f}\n  - ${old[f]}\n  + ${data[f]}`)
      if (!DRY) await db[model].update({ where: { id: old.id }, data })
      changed.push({ model, slug: e.slug })
    }
  }
  for (const e of P.markets) {
    const key = `market/${e.slug}`
    const row = await db.pageContent.findUnique({ where: { key }, select: { sections: true } })
    const sections = row.sections.map((s) => {
      if (s.key !== 'hero') return s
      const values = { ...s.values }
      if (e.meta_title) values.meta_title = e.meta_title
      if (e.meta_description) values.meta_description = e.meta_description
      return { ...s, values }
    })
    const old = snap.markets.find((m) => m.key === key)
    console.log(`market ${e.slug}\n  - ${old.meta_title}\n  + ${e.meta_title ?? old.meta_title}`)
    if (!DRY) await db.pageContent.update({ where: { key }, data: { sections } })
    changed.push({ model: 'market', slug: e.slug })
  }
  for (const l of P.brandLinks) {
    const brand = await db.brand.findUnique({ where: { slug: l.brand }, select: { id: true } })
    const rows = snap.brandLinks.filter((r) => r.brand === l.brand)
    console.log(`brand link ${l.brand}: ${rows.length} products ${rows.map((r) => r.slug).join(', ')}`)
    if (!DRY && rows.length) await db.product.updateMany({ where: { id: { in: rows.map((r) => r.id) }, brandId: null }, data: { brandId: brand.id } })
    for (const r of rows) changed.push({ model: 'product', slug: r.slug })
  }
  return changed
}

async function rollback(file) {
  const snap = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const r of snap.rows) {
    const data = { seoTitle: r.seoTitle, seoDescription: r.seoDescription }
    if (r.model === 'brand') data.description = r.description
    await db[r.model].update({ where: { id: r.id }, data })
  }
  for (const m of snap.markets) {
    const row = await db.pageContent.findUnique({ where: { key: m.key }, select: { sections: true } })
    const sections = row.sections.map((s) => {
      if (s.key !== 'hero') return s
      const values = { ...s.values }
      for (const f of ['meta_title', 'meta_description']) {
        if (m[f] === null) delete values[f]
        else values[f] = m[f]
      }
      return { ...s, values }
    })
    await db.pageContent.update({ where: { key: m.key }, data: { sections } })
  }
  if (snap.brandLinks.length) {
    await db.product.updateMany({ where: { id: { in: snap.brandLinks.map((r) => r.id) } }, data: { brandId: null } })
  }
  console.log(`Rolled back ${snap.rows.length} rows, ${snap.markets.length} markets, ${snap.brandLinks.length} brand links`)
}

;(async () => {
  try {
    if (ROLLBACK) return await rollback(ROLLBACK)
    check()
    const snap = await snapshot()
    if (!DRY) {
      if (!BACKUP) throw new Error('Refusing to write without --backup <file>')
      fs.writeFileSync(BACKUP, JSON.stringify(snap, null, 2))
      console.log(`Backup written: ${BACKUP}`)
    }
    const changed = await apply(snap)
    console.log(`\n${DRY ? 'Would change' : 'Changed'} ${changed.length} rows`)
  } finally {
    await db.$disconnect()
  }
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
