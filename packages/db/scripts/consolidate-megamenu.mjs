/**
 * consolidate-megamenu.mjs
 * ------------------------------------------------------------------
 * One-off migration: collapse the `primary_megamenu` "Products" tree
 * from 18 top-level (L1) sections down to 6 broad domains.
 *
 * The storefront megamenu (SiteHeaderClient.tsx) renders only 3 levels
 * (L1/L2/L3). When a current L1 becomes an L2, its category leaves would
 * fall to L4 and vanish — so we PROMOTE every real category (linkType
 * 'category') to be a direct child of its section (L3), and HIDE the
 * intermediate wrapper nodes that this empties out (isVisible=false,
 * fully reversible). Nothing is deleted.
 *
 * Modes:
 *   node consolidate-megamenu.mjs --dry-run        (default; no writes)
 *   node consolidate-megamenu.mjs --execute        (apply, writes backup first)
 *   node consolidate-megamenu.mjs --rollback FILE  (restore from a backup JSON)
 *
 * Requires DATABASE_URL in env (loaded from packages/db/.env by the runner).
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const db = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = join(__dirname, 'backups')

const args = process.argv.slice(2)
const MODE = args.includes('--execute') ? 'execute'
  : args.includes('--rollback') ? 'rollback'
  : 'dry-run'
const ROLLBACK_FILE = MODE === 'rollback' ? args[args.indexOf('--rollback') + 1] : null
// timestamp passed in by the runner (Date.now is fine in plain node, but keep it injectable)
const STAMP = (args.find(a => a.startsWith('--stamp='))?.split('=')[1]) || String(Date.now())

// ── Target spec ────────────────────────────────────────────────────
// The 6 consolidated L1 sections. `from` = relabel an existing L1 row;
// otherwise a brand-new parent row is created.
const NEW_L1S = [
  { key: 'hydraulic',    label: 'Hydraulic Components & Power Units',          position: 0 },
  { key: 'hoses_fit',    label: 'Hose, Tube, Fittings & Adapters', position: 1, from: 'Hoses & Fittings' },
  { key: 'industrial',   label: 'Industrial & Oilfield Hoses',     position: 2, from: 'Industrial Hoses' },
  { key: 'oilfield_pc',  label: 'Oilfield Valves, Flow Iron & Pressure Control', position: 3 },
  { key: 'well_services',label: 'Well Services & Surface Equipment',           position: 4 },
  { key: 'instr_lube',   label: 'Instrumentation, Lubricants & Consumables',   position: 5 },
]

// Current L1 sections that get demoted to L2 under a new L1.
// `relabel` (optional) renames the section. Order within this array
// drives left-to-right L2 order under each parent.
const DEMOTE = [
  { from: 'Hydraulic Pumps',             under: 'hydraulic' },
  { from: 'Hydraulic Cylinders',         under: 'hydraulic' },
  { from: 'Valves & Manifolds',          under: 'hydraulic' },
  { from: 'Seals & Components',          under: 'hydraulic' },
  { from: 'Accessories & Instrumentation', under: 'hydraulic' },

  { from: 'Oil & Gas Hoses',             under: 'industrial', relabel: 'Oil & Gas / Drilling Hoses', appendLast: true },

  { from: 'Oilfield Valves',             under: 'oilfield_pc' },
  { from: 'Flow Iron & Wellhead',        under: 'oilfield_pc' },
  { from: 'Blowout Preventer',           under: 'oilfield_pc', relabel: 'Blowout Preventers (BOP)' },

  { from: 'Cementing Equipment',         under: 'well_services', relabel: 'Cementing' },
  { from: 'Stimulation Equipment',       under: 'well_services', relabel: 'Stimulation' },
  { from: 'Fracturing Equipment',        under: 'well_services', relabel: 'Fracturing' },
  { from: 'Well Testing Equipment',      under: 'well_services', relabel: 'Well Testing' },
  { from: 'Drilling & Workover Systems', under: 'well_services', relabel: 'Drilling & Workover' },

  { from: 'Instrumentation & Controls',  under: 'instr_lube' },
  { from: 'Lubricants',                  under: 'instr_lube', relabel: 'Lubricants (Molykote)' },
]

// ── Helpers ────────────────────────────────────────────────────────
function childrenMap(items, parentKey = 'parentId') {
  const m = new Map()
  for (const it of items) {
    const k = it[parentKey] ?? 'ROOT'
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(it)
  }
  for (const arr of m.values()) arr.sort((a, b) => a.position - b.position)
  return m
}

function dfsOrder(items) {
  const kids = childrenMap(items)
  const order = new Map()
  let i = 0
  const walk = (pid) => {
    for (const it of (kids.get(pid ?? 'ROOT') || [])) { order.set(it.id, i++); walk(it.id) }
  }
  walk(null)
  return order
}

function printTree(items, title) {
  const kids = childrenMap(items)
  const lines = [title]
  const walk = (pid, d) => {
    for (const it of (kids.get(pid ?? 'ROOT') || [])) {
      if (!it.isVisible) continue
      const tag = it.linkType === 'category' ? '◆' : '·'
      lines.push(`${'   '.repeat(d)}${tag} ${it.label}`)
      walk(it.id, d + 1)
    }
  }
  walk(null, 0)
  return lines.join('\n')
}

function stats(items) {
  const kids = childrenMap(items)
  const vis = items.filter(i => i.isVisible)
  const byId = new Map(items.map(x => [x.id, x]))
  const depthOf = (it) => { let d = 0, c = it; while (c.parentId) { c = byId.get(c.parentId); if (!c) break; d++ } return d }
  let l1 = 0, l2 = 0, l3 = 0, l4plus = 0, hidden = 0, catBelowL3 = 0
  for (const it of items) {
    if (!it.isVisible) { hidden++; continue }
    const d = depthOf(it)
    if (d === 0) l1++; else if (d === 1) l2++; else if (d === 2) l3++; else l4plus++
    if (it.linkType === 'category' && d > 2) catBelowL3++
  }
  return { total: items.length, visible: vis.length, hidden, l1, l2, l3, l4plus, catBelowL3 }
}

// ── Rollback ───────────────────────────────────────────────────────
async function rollback() {
  const backup = JSON.parse(readFileSync(ROLLBACK_FILE, 'utf8'))
  const menu = await db.navMenu.findFirstOrThrow({ where: { location: 'primary_megamenu' } })
  const current = await db.navMenuItem.findMany({ where: { menuId: menu.id }, select: { id: true } })
  const backupIds = new Set(backup.items.map(i => i.id))
  const toDelete = current.filter(c => !backupIds.has(c.id)).map(c => c.id)

  console.log(`Rollback from ${ROLLBACK_FILE}`)
  console.log(`  restore ${backup.items.length} items, delete ${toDelete.length} created items`)
  await db.$transaction([
    ...backup.items.map(it => db.navMenuItem.update({
      where: { id: it.id },
      data: {
        parentId: it.parentId, position: it.position, label: it.label,
        isVisible: it.isVisible, linkType: it.linkType, customUrl: it.customUrl,
        categoryId: it.categoryId,
      },
    })),
    ...(toDelete.length ? [db.navMenuItem.deleteMany({ where: { id: { in: toDelete } } })] : []),
  ])
  console.log('Rollback complete.')
}

// ── Main transform ─────────────────────────────────────────────────
async function run() {
  const menu = await db.navMenu.findFirstOrThrow({ where: { location: 'primary_megamenu' } })
  const raw = await db.navMenuItem.findMany({
    where: { menuId: menu.id },
    select: {
      id: true, parentId: true, position: true, label: true, isVisible: true,
      linkType: true, customUrl: true, categoryId: true,
    },
  })

  // working copy (mutated in memory to compute target state)
  const items = raw.map(r => ({ ...r }))
  const byId = new Map(items.map(i => [i.id, i]))
  const origParent = new Map(items.map(i => [i.id, i.parentId]))
  const origDfs = dfsOrder(raw)
  const origKids = childrenMap(raw)
  const origHadChildren = new Set([...origKids.keys()].filter(k => k !== 'ROOT'))

  const beforeTree = printTree(raw, '=== BEFORE ===')
  const beforeStats = stats(raw)

  // resolve current top-level sections by label
  const l1ByLabel = new Map()
  for (const it of items) if (it.parentId === null) l1ByLabel.set(it.label, it)

  // 1) Establish the 6 new L1 rows (reuse-by-rename or create)
  const created = []
  const l1ByKey = new Map()
  for (const spec of NEW_L1S) {
    if (spec.from) {
      const row = l1ByLabel.get(spec.from)
      if (!row) throw new Error(`Expected existing L1 "${spec.from}" not found`)
      row.label = spec.label
      row.position = spec.position
      l1ByKey.set(spec.key, row)
    } else {
      const id = `NEW_${spec.key}`           // placeholder id; real uuid assigned on insert
      const node = {
        id, parentId: null, position: spec.position, label: spec.label,
        isVisible: true, linkType: 'custom_url', customUrl: '/c', categoryId: null,
        __new: true,
      }
      items.push(node); byId.set(id, node); created.push(node)
      l1ByKey.set(spec.key, node)
    }
  }

  // descendants of a node in the ORIGINAL tree
  const origDescendants = (rootId) => {
    const out = []
    const stack = [...(origKids.get(rootId) || [])]
    while (stack.length) { const n = stack.pop(); out.push(n); stack.push(...(origKids.get(n.id) || [])) }
    return out
  }

  // 2) Demote sections; 3) promote real categories to L3; relabel
  for (const d of DEMOTE) {
    const section = l1ByLabel.get(d.from)
    if (!section) throw new Error(`Expected section "${d.from}" not found`)
    const parent = l1ByKey.get(d.under)
    section.parentId = parent.id
    if (d.relabel) section.label = d.relabel
    if (d.appendLast) section.__appendLast = true

    // promote every real category under this section to be its direct child (→ L3)
    for (const desc of origDescendants(section.id)) {
      if (desc.linkType === 'category' && origParent.get(desc.id) !== section.id) {
        byId.get(desc.id).parentId = section.id
      }
    }
  }

  // 4) hide wrappers emptied by promotion (had children originally, none now)
  const targetKids = childrenMap(items)
  const hasTargetChild = (id) => (targetKids.get(id)?.length ?? 0) > 0
  for (const it of items) {
    if (it.__new) continue
    if (it.linkType === 'custom_url' && origHadChildren.has(it.id) && !hasTargetChild(it.id)) {
      it.isVisible = false
    }
  }

  // 5) re-sequence positions within every parent group
  const finalKids = childrenMap(items)
  const sortKey = (it) => {
    if (it.parentId === null) return it.position           // L1s: explicit
    if (it.__appendLast) return 1e9                        // folded section → last
    return origDfs.get(it.id) ?? 1e8
  }
  for (const [pid, arr] of finalKids) {
    if (pid === 'ROOT') continue
    arr.sort((a, b) => sortKey(a) - sortKey(b))
    arr.forEach((it, i) => { it.position = i })
  }
  // top-level explicit order
  const roots = items.filter(i => i.parentId === null).sort((a, b) => a.position - b.position)
  roots.forEach((it, i) => { it.position = i })

  const afterTree = printTree(items, '=== AFTER ===')
  const afterStats = stats(items)

  // ── Report ──
  console.log(beforeTree)
  console.log('\n' + afterTree)
  console.log('\n=== STATS ===')
  console.log('before:', JSON.stringify(beforeStats))
  console.log('after :', JSON.stringify(afterStats))
  console.log(`\nMode: ${MODE}`)
  if (afterStats.catBelowL3 > 0) console.log(`⚠ WARNING: ${afterStats.catBelowL3} real categories still below L3 (would not render)`)
  else console.log('✓ every real category renders at ≤ L3')

  const emitArg = args.find(a => a.startsWith('--emit-json='))
  if (emitArg) {
    const path = emitArg.split('=')[1]
    const kids = childrenMap(items)
    const build = (pid, d) => (kids.get(pid ?? 'ROOT') || [])
      .filter(it => it.isVisible && d <= 2)
      .map(it => ({ label: it.label, isCategory: it.linkType === 'category', children: build(it.id, d + 1) }))
    writeFileSync(path, JSON.stringify(build(null, 0), null, 2))
    console.log(`\nEmitted visible tree → ${path}`)
  }

  if (MODE !== 'execute') {
    console.log('\n(dry-run — no changes written)')
    return
  }

  // ── Write backup ──
  mkdirSync(BACKUP_DIR, { recursive: true })
  const backupPath = join(BACKUP_DIR, `megamenu-backup-${STAMP}.json`)
  writeFileSync(backupPath, JSON.stringify({ stamp: STAMP, menuId: menu.id, items: raw }, null, 2))
  console.log(`\nBackup written: ${backupPath}`)

  // ── Apply ──
  // Client-generate the new L1 uuids up front so every create + update can go
  // in a SINGLE batched transaction (one round trip). Sequential awaits over a
  // remote DB blow past Prisma's interactive-tx timeout — the array form runs
  // server-side in one shot. Creates are ordered first so the parentId FK is
  // satisfied when demoted sections point at the new L1s.
  const idMap = new Map()
  for (const it of items) if (it.__new) idMap.set(it.id, randomUUID())
  const realId = (id) => (id && idMap.get(id)) || id

  const orig = new Map(raw.map(r => [r.id, r]))
  const ops = []
  for (const it of items.filter(i => i.__new)) {
    ops.push(db.navMenuItem.create({
      data: {
        id: realId(it.id), menuId: menu.id, parentId: null, position: it.position,
        label: it.label, isVisible: it.isVisible, linkType: it.linkType, customUrl: it.customUrl,
      },
    }))
  }
  let changed = 0
  for (const it of items.filter(i => !i.__new)) {
    const o = orig.get(it.id)
    const newParent = realId(it.parentId)
    if (o.parentId === newParent && o.position === it.position && o.label === it.label && o.isVisible === it.isVisible) continue
    changed++
    ops.push(db.navMenuItem.update({
      where: { id: it.id },
      data: { parentId: newParent, position: it.position, label: it.label, isVisible: it.isVisible },
    }))
  }
  console.log(`Applying: ${idMap.size} new L1s created, ${changed} items updated (${ops.length} ops in one transaction)`)
  await db.$transaction(ops)
  console.log('✓ Applied to live DB.')
}

if (MODE === 'rollback') {
  await rollback()
} else {
  await run()
}
await db.$disconnect()
