// Catalogue clean-up 2026-10-09. node fix.cjs [--write --backup=file]
const { createRequire } = require('module')
const fs = require('fs')
const db = new (createRequire('/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics/packages/db/package.json')('@prisma/client').PrismaClient)()
const WRITE = process.argv.includes('--write')
const BACKUP = (process.argv.find(a => a.startsWith('--backup=')) || '').slice(9)

// A. category fields: [slug, field, find (exact substring) | null = whole value, replacement]
const CAT = [
 ['hydraulic-adapters','shortDescription','Carbon steel, stocked in Dubai across the full range of sizes and thread combinations.','Carbon steel and stainless steel, supplied from Dubai across the common sizes and thread combinations.'],
 ['metric-adapters','shortDescription',null,'Metric thread adapters for ISO 6149-1 O-ring ports and DIN 3852-1 face-sealed ports — 74° cone, JIS 60° cone, flat-face, bonded-seal and O-ring variants. Sizes M10×1 to M42×2. Includes Komatsu-specification metric adapters.'],
 ['metric-adapters','seoDescription',null,'Metric hydraulic adapters for ISO 6149-1 and DIN 3852-1 ports: 74° and JIS 60° cone, flat-face, O-ring and bonded-seal studs, M10×1 to M42×2, from Dubai.'],
 ['spiral-hose-crimp-fittings','shortDescription','four- and six-spiral','four-spiral'],
 ['quick-couplers','shortDescription',null,'Hydraulic, pneumatic, refrigerant and diagnostic quick-disconnect couplers to the ISO 7241-1 Series A and B, ISO 16028 flat-face, ISO 5675, NFPA T3.20.15 HTMA, MIL-C-4109, ARO 210 and SAE J1502 interchange standards, plus Enerpac-interchange jack couplers.'],
 ['cam-and-groove-couplings','shortDescription','MIL-A-A-59326 / EN 14420-7. Sealfast (USA) authorised range.','A-A-59326 / EN 14420-7. Sealfast range.'],
 ['storz-couplings','shortDescription','per DIN 14301 — fire-service quick-connect standard.','to the Storz system — listed by Sunpool to DIN 14301, now consolidated into DIN 14333 — the fire-service quick-connect.'],
 ['storz-couplings','shortDescription','Sizes 25-150 mm (1-1/2"–6").','Sizes 25–150 mm.'],
 ['molykote-grease-suppliers-uae','shortDescription',null,'Molykote specialty greases — multi-purpose, EP, high- and low-temperature, food-grade, chemical-resistant, plastics and OEM-spec grades, on mineral, synthetic, silicone and PFPE base oils with lithium, calcium, polyurea, aluminium-complex and PTFE thickeners.'],
 ['molykote-grease-suppliers-uae','seoDescription',null,'Molykote specialty greases from Dubai: multi-purpose, EP, high- and low-temperature, NSF H1 food-grade, chemical-resistant and plastics greases.'],
 ['molykote-oils','shortDescription',null,'Molykote silicone and synthetic oils and fluids by DuPont — 211 silicone fluids for viscous fan clutches, synthetic gear, compressor, vacuum pump and process gas oils, barrier fluid and chain oils, many as FM food-grade.'],
 ['molykote-oils','seoDescription',null,'Molykote oils and fluids by DuPont: 211 silicone fan-clutch fluids, synthetic gear, compressor and process gas oils, barrier fluid and chain oils, from Dubai.'],
 ['oilfield-gate-valves','shortDescription','Fail-close (FC) and fail-last-stable (FLS) actuator options.','Hydraulic fail-close (FC) actuated valves, Cameron FLS manual valves and 7,500 psi mud gate valves.'],
 ['oilfield-gate-valves','seoDescription','manual FLS','Cameron FLS'],
]
// B. page copy: [slug, section, field ('items[i].a' allowed), find, replacement]
const COPY = [
 ['wire-rope-fittings','standards','body','Thimbles follow DIN 6899 and BS 464, or the US standard and extra-heavy patterns.','Thimbles for wire rope slings are covered by EN 13411-1, which succeeded DIN 3090 and the withdrawn DIN 6899, whose A and B forms are still widely made; BS 464 and the US standard and extra-heavy patterns are separate dimension series.'],
 ['bollards-mooring','guidance','body','chosen on the safe working load of the lines','chosen on the load of the lines'],
 ['bollards-mooring','faq','items[0].a','the standard sets the safe working load and dimensions','the standard sets the published load and dimensions'],
 ['chain-slings','faq','items[2].a',"Dubai Municipality's guideline calls for certification at least every 12 months by an EIAC-accredited body.","Dubai Municipality's guideline calls for certification at least every 12 months by an EIAC-accredited body, and EIAC's own requirements set a 6-month interval for lifting accessories such as slings."],
 ['storz-couplings','standards','heading','DIN 14301 and UL-listed connections','Storz standards and UL-listed connections'],
 ['storz-couplings','standards','body','The couplings are listed to DIN 14301 in sizes from 25 to 150 mm.','The couplings are listed by Sunpool to DIN 14301, one of the original German Storz standards, since consolidated into DIN 14333 (Storz system PN 16 couplings for delivery and suction). Sizes run from 25 to 150 mm.'],
 ['master-links-rings-swivels','faq','items[0].a','Use it to prevent twisting, not as a rotating bearing.','Use it to prevent twisting, not as a rotating bearing. A bearing swivel, such as the Grade 80 roller-bearing swivel on this shelf, is made to turn under load within its rated capacity.'],
 ['double-ferrule-tube-fittings','standards','body','316L stainless bar','316 stainless bar'],
 ['single-ferrule-tube-fittings','standards','body','316L stainless steel from bar','316 stainless steel from bar'],
 ['hydraulic-adapters','standards','body','metric to ISO 6149 and DIN 3852-2','metric to ISO 6149 and DIN 3852-1'],
]
// C. product moves
const MOVES = [['IH-LUB-P37','molykote-pastes'],['IH-LUB-P40','molykote-pastes'],['IH-LUB-P74','molykote-pastes']]
// D. title tidy-up rules (applied to title and seoTitle)
const TIDY = t => {
  let s = t.replace(/º/g, '°').replace(/\b(\d+)o\b(?= elbow)/gi, '$1°').replace(/hidrowashing/gi, 'hydrowashing')
    .replace(/BranchTee/g, 'Branch Tee').replace(/ {2,}/g, ' ').replace(/\bo-ring\b/g, 'O-ring').replace(/\bsae\b/g, 'SAE')
    .replace(/(\d) PSI\b/g, '$1 psi').replace(/^BSP Plug \(Plug\)$/, 'BSP Plug').replace(/^Grade80 Clevis Clutch Locking Clutch$/, 'Grade 80 Clevis Locking Clutch')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

;(async () => {
  const errors = [], backup = { categories: {}, docs: {}, products: {} }, plan = []
  const cats = {}
  for (const [slug, field, find, rep] of CAT) {
    const c = cats[slug] ??= await db.category.findUnique({ where: { slug }, select: { id: true, shortDescription: true, seoDescription: true } })
    backup.categories[slug] ??= { shortDescription: c.shortDescription, seoDescription: c.seoDescription }
    const cur = c[field] ?? ''
    if (find && !cur.includes(find)) { errors.push(`cat ${slug}.${field}: phrase not found: ${find}`); continue }
    c[field] = find ? cur.replace(find, rep) : rep
    if (field === 'seoDescription' && c[field].length > 160) errors.push(`cat ${slug} seo ${c[field].length} chars`)
  }
  const docs = {}
  for (const [slug, sec, field, find, rep] of COPY) {
    const d = docs[slug] ??= await db.pageContent.findUnique({ where: { key: 'category/' + slug } })
    backup.docs[slug] ??= JSON.parse(JSON.stringify(d.sections))
    const s = d.sections.find(x => x.key === sec); const m = field.match(/^items\[(\d+)\]\.(\w)$/)
    const holder = m ? s.values.items[+m[1]] : s.values, key = m ? m[2] : field
    if (!(holder?.[key] || '').includes(find)) { errors.push(`copy ${slug}/${sec}.${field}: phrase not found`); continue }
    holder[key] = holder[key].replace(find, rep)
  }
  const target = Object.fromEntries((await db.category.findMany({ where: { slug: { in: [...new Set(MOVES.map(m => m[1]))] }, isPublished: true }, select: { slug: true, id: true } })).map(c => [c.slug, c.id]))
  const moves = []
  for (const [sku, to] of MOVES) {
    const p = await db.product.findFirst({ where: { sku }, select: { id: true, categoryId: true } })
    if (!p || !target[to]) { errors.push(`move ${sku}`); continue }
    backup.products[sku] = { categoryId: p.categoryId }; moves.push({ id: p.id, sku, categoryId: target[to] })
  }
  const prods = await db.product.findMany({ where: { status: 'active' }, select: { id: true, sku: true, title: true, seoTitle: true } })
  const titles = []
  for (const p of prods) {
    const t = TIDY(p.title), st = p.seoTitle ? TIDY(p.seoTitle) : p.seoTitle
    if (t !== p.title || st !== p.seoTitle) { titles.push({ id: p.id, sku: p.sku, title: t, seoTitle: st }); (backup.products[p.sku] ??= {}).title = p.title; backup.products[p.sku].seoTitle = p.seoTitle; plan.push(`title ${p.sku}: ${JSON.stringify(p.title)} -> ${JSON.stringify(t)}${st !== p.seoTitle ? ' (+seo)' : ''}`) }
  }
  for (const [slug, c] of Object.entries(cats)) for (const f of ['shortDescription','seoDescription']) if (c[f] !== backup.categories[slug][f]) plan.push(`cat ${slug}.${f}: ${c[f]}`)
  for (const slug of Object.keys(docs)) plan.push(`copy ${slug}`)
  moves.forEach(m => plan.push(`move ${m.sku} -> molykote-pastes`))
  console.log(plan.join('\n'))
  console.log(`\n${Object.keys(cats).length} categories, ${Object.keys(docs).length} docs, ${moves.length} moves, ${titles.length} titles`)
  if (errors.length) { console.error('ERRORS:\n ' + errors.join('\n ')); process.exit(1) }
  if (!WRITE) return db.$disconnect()
  if (!BACKUP) throw new Error('--backup required')
  fs.writeFileSync(BACKUP, JSON.stringify(backup, null, 1))
  for (const [slug, c] of Object.entries(cats)) await db.category.update({ where: { slug }, data: { shortDescription: c.shortDescription, seoDescription: c.seoDescription } })
  for (const [slug, d] of Object.entries(docs)) await db.pageContent.update({ where: { key: 'category/' + slug }, data: { sections: d.sections } })
  for (const m of moves) await db.product.update({ where: { id: m.id }, data: { categoryId: m.categoryId } })
  for (const t of titles) await db.product.update({ where: { id: t.id }, data: { title: t.title, seoTitle: t.seoTitle } })
  await db.category.updateMany({ where: { slug: { in: [...new Set([...Object.keys(cats), ...Object.keys(docs), 'molykote-pastes'])] } }, data: { contentUpdatedAt: new Date() } })
  console.log('written; backup', BACKUP)
  await db.$disconnect()
})()
