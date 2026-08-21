/**
 * Industrial-hose sprint: re-brand the Dixon hose lines to Indus, swap in the
 * 2026 Indus-branded renders, and rebuild the five products whose catalogue
 * pressure contradicted the artwork.
 *
 * Three phases, each independently skippable so a partial run can be finished:
 *
 *   1. REBRAND — the 39 non-metallic hose lines move from brand Dixon to brand
 *      Indus Hydraulics. Title loses its `Dixon ` prefix, slug loses `dixon-`
 *      (with a 301 row written to `redirects` so the old URL keeps working),
 *      `seoTitle` is rebuilt, and `descriptionLong` is transformed.
 *
 *      The description transform is deliberately conservative. The generated
 *      body carries claims that belong to Dixon, not to Indus — Pressure
 *      Equipment Directive 2014/68/EU compliance, BSI ISO 9001, "over 100
 *      years' experience", and a note that Dixon supplies the coupling range.
 *      Those sentences are REMOVED, never reattributed: dropping a claim we
 *      cannot stand behind is safe, transferring someone else's certification
 *      onto our own-brand product is not. The intro is rewritten to Indus
 *      framing and the printed-lay-line bullet is updated to what the new
 *      artwork actually prints. Everything technical is left byte-identical.
 *
 *   2. REBUILD — five products are deleted and recreated so the catalogue
 *      matches the render artwork, per the founder's explicit instruction
 *      after being shown that the catalogue figure is the manufacturer spec
 *      and the render figure is the error:
 *
 *        A235BK  7 bar  -> 10 bar      A906PG  14 bar -> 20 bar
 *        A901GG  14 bar -> 20 bar      A911SG  14 bar -> 20 bar
 *        A125    25 bar -> 20 bar
 *
 *      `Min Burst Pressure` is DROPPED rather than rescaled — the burst figure
 *      cannot be derived from a working figure, and inventing one would be
 *      fabrication. Every other spec carries across untouched.
 *
 *   3. ATTACH — 29 renders upload to the `product-images` bucket and take
 *      position 0. Whatever they displace is retired permanently (rows and
 *      storage objects), matching `replace-hydraulic-hose-renders.ts`.
 *
 * Traps this script exists to respect, all previously paid for:
 *   - `Media -> ProductImage` is RESTRICT, not cascade. The join row must go
 *     before `media.delete()` or it throws P2003 — and if the storage object
 *     was already removed, that failure leaves a live row pointing at a 400.
 *   - `Media.storagePath` is NOT unique. The storage object only goes when no
 *     other Media row addresses it (`canRemoveStorageObject`).
 *   - `DATABASE_URL` ships `connection_limit=1`, so transactions need a wide
 *     acquire window or long runs hit P2028.
 *
 * Idempotent: a product already on the Indus brand is not re-transformed, and
 * a product already carrying its render (matched on `Media.originalFilename`)
 * is skipped. Re-running after a partial failure finishes the rest.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/industrial-hose-render-sprint.ts \
 *     --dir "$HOME/Downloads/IndustrialHoses" [--dry-run] [--only=rebrand|rebuild|attach]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'
import { canRemoveStorageObject } from '@indus/domain'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const BACKUP_DIR = resolve(__dirname, '../../data')
const INDUS_BRAND_SLUG = 'indus'

/** The eight non-metallic hose categories. Couplings and fittings stay Dixon. */
const HOSE_CATEGORY_SLUGS = [
  'abrasive-hoses',
  'air-water-hoses',
  'composite-hoses',
  'food-beverage-hoses',
  'industrial-steam-hoses',
  'oil-chemical-purpose-hoses',
  'specialist-hoses',
  'water-suction-delivery-hoses',
] as const

/**
 * Render -> SKU. Frozen, and not derived from filename similarity.
 *
 * Three pairings could not be settled by title because the catalogue holds
 * duplicate titles; each was resolved from the product's own `Cover Material`
 * spec against the colour of the hose in the render:
 *   - air-water-hose-20-bar  -> A102HP  (Yellow smooth extruded; A101HP is
 *     Black, A190/A190Y are mandrel wrap). Corroborated by A102HP's existing
 *     image filename matching the competitor source this render was built from.
 *   - multiutility-hose-20-bar -> A103HP (Blue cover; A105HP is Green).
 *   - the PVC pair -> IRRIBULK carries the 4-icon abrasive render, DELVAC the
 *     3-icon clear one, per their `descriptionShort` duty ratings.
 */
const PAIRS: readonly { file: string; sku: string }[] = [
  { file: 'air-water-hose-20-bar.png', sku: 'IH-IH-A102HP' },
  { file: 'antistatic-air-hose-20-bar.png', sku: 'IH-IH-A101AS-T3' },
  { file: 'black-saturated-steam-hose-10-bar.png', sku: 'IH-IH-A235BK' },
  { file: 'bulk-material-suction-delivery-hose-10-bar.png', sku: 'IH-IH-A361' },
  { file: 'chemical-composite-hose-20-bar.png', sku: 'IH-IH-A906PG' },
  { file: 'food-bulk-pvc-suction-delivery-hose.png', sku: 'IH-IH-PREMVIN' },
  { file: 'mdse-chemical-abrasion-pvc-suction-delivery-hose.png', sku: 'IH-IH-PREMFLEX' },
  { file: 'multi-purpose-mineral-oil-air-hose-20-bar.png', sku: 'IH-IH-A125' },
  { file: 'multi-purpose-mineral-oil-hose-10-bar.png', sku: 'IH-IH-A110' },
  { file: 'multiutility-hose-20-bar.png', sku: 'IH-IH-A103HP' },
  { file: 'oil-composite-hose-20-bar.png', sku: 'IH-IH-A901GG' },
  { file: 'ptfe-chemical-composite-hose-20-bar.png', sku: 'IH-IH-A911SG' },
  { file: 'pvc-non-toxic-suction-delivery-hose.png', sku: 'IH-IH-DELIKATESSE' },
  { file: 'pvc-oil-suction-delivery-hose.png', sku: 'IH-IH-BAKU' },
  { file: 'pvc-suction-delivery-hose-clear.png', sku: 'IH-IH-DELVAC' },
  { file: 'pvc-suction-delivery-hose.png', sku: 'IH-IH-IRRIBULK' },
  { file: 'red-multi-purpose-non-conductive-ogs-hose.png', sku: 'IH-IH-A104' },
  { file: 'silicone-suction-delivery-hose.png', sku: 'IH-IH-SANSIL' },
  { file: 'tanker-reeling-hose-17-bar.png', sku: 'IH-IH-A420' },
  { file: 'High Temp Air Hose 40 Bar.png', sku: 'IH-IH-A116EU100' },
  { file: 'Oil Mud Sea Water Suction Delivery.png', sku: 'IH-IH-A400EU' },
  { file: 'Oil Suction Delivery 10 Bar.png', sku: 'IH-IH-A430' },
  { file: 'Oil Suction Delivery 20 Bar.png', sku: 'IH-IH-A460' },
  { file: 'UHMPWE Chemical Suction Delivery 10 Bar.png', sku: 'IH-IH-A410' },
  { file: 'UHMPWE Chemical Suction Delivery 16 Bar.png', sku: 'IH-IH-A416' },
  { file: 'Vapor Recovery Composite Hose.png', sku: 'IH-IH-A901AG' },
  { file: 'Water Suction Delivery Hose 16 Bar.png', sku: 'IH-IH-A216' },
  { file: 'Water Suction and Delivery Hose 10 Bar.png', sku: 'IH-IH-A210' },
  // Founder's call: the red "Food & Bev" render represents the Food line, not
  // Brew. SANB is consequently left without an image.
  { file: 'Food and Bev Suction and Delivery.png', sku: 'IH-IH-SANF' },
] as const

/** `IndustrialHoseCover.png` is a category cover, explicitly out of scope. */
const IGNORED_FILES = new Set(['IndustrialHoseCover.png'])

/**
 * The five whose catalogue pressure contradicts the render. `bar` is the
 * figure printed on the artwork, which by instruction now wins.
 */
const REBUILDS: readonly {
  sku: string
  title: string
  bar: number
  oldBar: number
}[] = [
  { sku: 'IH-IH-A235BK', title: 'Black Saturated Steam Hose 10 Bar', bar: 10, oldBar: 7 },
  { sku: 'IH-IH-A906PG', title: 'Chemical Composite Hose 20 Bar', bar: 20, oldBar: 14 },
  { sku: 'IH-IH-A901GG', title: 'Oil Composite Hose 20 Bar', bar: 20, oldBar: 14 },
  { sku: 'IH-IH-A911SG', title: 'PTFE Chemical Composite Hose 20 Bar', bar: 20, oldBar: 14 },
  {
    sku: 'IH-IH-A125',
    title: 'Multi-Purpose Mineral Oil & Air Hose 20 Bar',
    bar: 20,
    oldBar: 25,
  },
] as const

// ── env / helpers ────────────────────────────────────────────────────────────

function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const k = m[1]
    const raw = m[2]
    if (!k || raw === undefined || process.env[k]) continue
    process.env[k] = raw.trim().replace(/^["']|["']$/g, '')
  }
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Width/height straight out of the PNG IHDR chunk — avoids an image dep. */
function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Delivered filenames carry spaces; the object key must not. */
function objectKeyFor(sku: string, file: string): string {
  return `products/${sku}/${slugify(file.replace(/\.png$/i, ''))}.png`
}

function stripDixonTitle(title: string): string {
  return title.replace(/^dixon\s+/i, '').trim()
}

/**
 * Rewrites the generated body so it reads as an Indus own-brand product.
 *
 * The five shapes below are every distinct Dixon-bearing line in the 39
 * bodies, enumerated from the database rather than inferred from one sample —
 * the first pass of this function was written against a single product and
 * silently missed three of them. The guard in `main` re-checks the output and
 * reports the surviving line, so a sixth shape cannot pass unnoticed.
 *
 *   1. Intro sentence — drops the part-code attribution, the "from the Dixon
 *      Group Europe range" clause and the distributor sentence.
 *   2. Printed-branding bullet — this records what is physically printed on
 *      the hose, and the new artwork prints an Indus lay-line, so DIXON
 *      becomes INDUS within that bullet only.
 *   3. Compliance section — removed outright. PED 2014/68/EU conformity, BSI
 *      ISO 9001 and "over 100 years' experience" are Dixon's; reassigning them
 *      to Indus would be a fabricated regulatory claim.
 *   4. "Pair with Dixon's matching couplings…" — the possessive is dropped;
 *      the accessory list itself is accurate and stays.
 *   5. How-to-order — the parenthetical naming Dixon's coupling range is cut,
 *      leaving the ordering instructions intact.
 */
function transformDescription(html: string, newTitle: string): string {
  let out = html

  // 1. Intro. `[\s\S]*?` rather than `[^<]*` because several families carry
  //    markup inside the clause (e.g. "Oil / Chemical / General Purpose").
  out = out.replace(
    /<p>The <strong>[\s\S]*?<\/strong>\s*\(Dixon part code <code>([^<]*)<\/code>\)\s*is an?\s*([\s\S]*?)\s*from the Dixon Group Europe industrial hose range\.\s*Indus Hydraulics is an authorised Dixon distributor in the UAE\.<\/p>/i,
    (_m, code: string, family: string) =>
      `<p>The <strong>${newTitle}</strong> (part code <code>${code}</code>) is a ${family.trim()} from the Indus Hydraulics industrial hose range.</p>`
  )

  // 2. Branding bullet — scoped to the one <li>, so a stray "Dixon" elsewhere
  //    is not silently renamed and then missed by the guard.
  out = out.replace(
    /(<li><strong>Branding \(printed on hose\):<\/strong>)([\s\S]*?)(<\/li>)/gi,
    (_m, open: string, body: string, close: string) =>
      `${open}${body.replace(/\bDIXON\b/gi, 'INDUS')}${close}`
  )

  // 3. Compliance section.
  out = out.replace(/<h3>Compliance<\/h3>\s*(<p>[\s\S]*?<\/p>\s*)+/i, '')

  // 4. Accessory pairing paragraph.
  out = out.replace(/\bPair with Dixon's matching couplings\b/i, 'Pair with matching couplings')

  // 5. How-to-order parenthetical.
  out = out.replace(/\s*\(Dixon supplies a full range of[^)]*\)/i, '')

  return out
}

/** Retargets the pressure figures a rebuild changes, inside the body copy. */
function repointBar(html: string, oldBar: number, newBar: number): string {
  return html
    .replace(new RegExp(`\\b${oldBar}\\s*BAR\\b`, 'g'), `${newBar} BAR`)
    .replace(new RegExp(`\\b${oldBar}\\s*bar\\b`, 'g'), `${newBar} bar`)
    .replace(
      /<li><strong>Min burst pressure:<\/strong>[^<]*<\/li>\s*/i,
      ''
    )
}

async function uniqueSlug(candidate: string, excludeId?: string): Promise<string> {
  let slug = candidate
  let n = 2
  for (;;) {
    const clash = await db.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!clash) return slug
    slug = `${candidate}-${n++}`
  }
}

/**
 * Every Media relation that can hold one of these rows, re-checked at run time
 * rather than trusted from a survey — "nothing else points at it" is the whole
 * basis for deleting the bytes.
 */
/**
 * Drops the storage object only when no other Media row addresses the same
 * path — `storagePath` is not unique, so a blind remove can 400 a live image
 * on an unrelated product. Then deletes the row, join first (RESTRICT).
 */
async function retireMedia(
  media: { id: string; storagePath: string },
  sb: ReturnType<typeof supabase>
) {
  const siblings = await db.media.count({
    where: { storagePath: media.storagePath, id: { not: media.id } },
  })
  if (canRemoveStorageObject({ otherRowsSharingPath: siblings })) {
    const key = media.storagePath.split(`/${BUCKET}/`)[1]
    if (key) await sb.storage.from(BUCKET).remove([key])
  }
  await db.$transaction([
    db.productImage.deleteMany({ where: { mediaId: media.id } }),
    db.media.delete({ where: { id: media.id } }),
  ])
}

async function otherReferences(mediaId: string, ownProductImageIds: string[]) {
  const m = await db.media.findUnique({
    where: { id: mediaId },
    select: {
      productImages: { select: { id: true } },
      _count: { select: { productImages: true } },
    },
  })
  if (!m) return ['media row already gone']
  const foreign = m.productImages
    .map((r) => r.id)
    .filter((id) => !ownProductImageIds.includes(id))
  const refs: string[] = []
  if (foreign.length) refs.push(`${foreign.length} other product_images`)

  const asOg = await db.product.count({ where: { ogImageMediaId: mediaId } })
  if (asOg) refs.push(`${asOg} product.ogImageMediaId`)
  const asCat = await db.category.count({
    where: { OR: [{ imageId: mediaId }, { ogImageMediaId: mediaId }] },
  })
  if (asCat) refs.push(`${asCat} category image`)
  return refs
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]
  const dirArg = args.find((a) => a.startsWith('--dir='))?.split('=')[1]
  const dirIdx = args.indexOf('--dir')
  const dir = dirArg ?? (dirIdx >= 0 ? args[dirIdx + 1] : undefined)
  if (!dir) throw new Error('--dir <folder> is required')
  const root = resolve(dir.replace(/^~/, process.env.HOME ?? '~'))
  if (!existsSync(root)) throw new Error(`no such directory: ${root}`)

  const run = (phase: string) => !only || only === phase
  const problems: string[] = []
  const audit: Record<string, unknown> = { at: new Date().toISOString(), dryRun }

  const indus = await db.brand.findUnique({
    where: { slug: INDUS_BRAND_SLUG },
    select: { id: true, name: true },
  })
  if (!indus) throw new Error(`brand "${INDUS_BRAND_SLUG}" not found`)

  const cats = await db.category.findMany({
    where: { slug: { in: [...HOSE_CATEGORY_SLUGS] } },
    select: { id: true, slug: true },
  })
  if (cats.length !== HOSE_CATEGORY_SLUGS.length) {
    throw new Error(`expected ${HOSE_CATEGORY_SLUGS.length} hose categories, found ${cats.length}`)
  }
  const catIds = cats.map((c) => c.id)

  // ── Phase 1: rebrand ──────────────────────────────────────────────────────
  const rebranded: { sku: string; from: string; to: string; slug: string; oldSlug: string }[] = []
  if (run('rebrand')) {
    const targets = await db.product.findMany({
      where: { categoryId: { in: catIds } },
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
        brandId: true,
        seoTitle: true,
        descriptionLong: true,
      },
      orderBy: { sku: 'asc' },
    })
    console.log(`\n── rebrand: ${targets.length} hose products ──`)

    for (const p of targets) {
      if (p.brandId === indus.id) continue // already done on a prior run
      // Phase 2 deletes and recreates these; rebranding them here first would
      // leave a redirect chain (dixon-x-14-bar -> x-14-bar -> x-20-bar).
      if (REBUILDS.some((r) => r.sku === p.sku)) continue

      const newTitle = stripDixonTitle(p.title)
      const partCode = p.sku.replace(/^IH-IH-/, '')
      const newSeo = `${newTitle} — Indus ${partCode}`
      const baseSlug = p.slug.replace(/^dixon-/, '')
      const newSlug = baseSlug === p.slug ? p.slug : await uniqueSlug(baseSlug, p.id)
      const newBody = p.descriptionLong
        ? transformDescription(p.descriptionLong, newTitle)
        : p.descriptionLong

      if (newBody && /dixon/i.test(newBody)) {
        // Report the actual line, not just the fact — a bare flag sent the
        // first pass of this transform out with three unhandled shapes.
        const offending = newBody
          .split('\n')
          .filter((l) => /dixon/i.test(l))
          .map((l) => l.slice(0, 160))
        problems.push(`${p.sku}: Dixon survives transform -> ${offending.join(' | ')}`)
      }

      rebranded.push({
        sku: p.sku,
        from: p.title,
        to: newTitle,
        slug: newSlug,
        oldSlug: p.slug,
      })

      if (dryRun) {
        console.log(`[dry-run] ${p.sku}  "${p.title}" -> "${newTitle}"  /${p.slug} -> /${newSlug}`)
        continue
      }

      await db.$transaction(
        async (tx) => {
          await tx.product.update({
            where: { id: p.id },
            data: {
              brandId: indus.id,
              title: newTitle,
              slug: newSlug,
              seoTitle: newSeo,
              descriptionLong: newBody,
            },
          })
          if (newSlug !== p.slug) {
            await tx.redirect.upsert({
              where: { fromPath: `/products/${p.slug}` },
              update: { toPath: `/products/${newSlug}`, statusCode: 301, isActive: true },
              create: {
                fromPath: `/products/${p.slug}`,
                toPath: `/products/${newSlug}`,
                statusCode: 301,
                isActive: true,
              },
            })
          }
        },
        { maxWait: 30_000, timeout: 30_000 }
      )
    }
    console.log(`rebranded ${rebranded.length}`)
    audit.rebranded = rebranded
  }

  // ── Phase 2: rebuild the five ─────────────────────────────────────────────
  const rebuilt: unknown[] = []
  if (run('rebuild')) {
    console.log(`\n── rebuild: ${REBUILDS.length} products ──`)
    for (const r of REBUILDS) {
      const old = await db.product.findUnique({
        where: { sku: r.sku },
        include: { specs: true, images: { include: { media: true } } },
      })
      if (!old) {
        problems.push(`${r.sku}: not found — already rebuilt?`)
        continue
      }
      if (old.title === r.title) {
        console.log(`skip ${r.sku} — already rebuilt`)
        continue
      }

      const blockers = await Promise.all([
        db.rfqLine.count({ where: { productId: old.id } }),
        db.orderLine.count({ where: { productId: old.id } }),
        db.savedListItem.count({ where: { productId: old.id } }),
      ])
      if (blockers.some((n) => n > 0)) {
        problems.push(
          `${r.sku}: has business references (rfq=${blockers[0]} order=${blockers[1]} saved=${blockers[2]}) — NOT deleted`
        )
        continue
      }

      const newSlug = await uniqueSlug(slugify(r.title), old.id)
      // These skipped phase 1, so the body is still Dixon-branded: de-brand it
      // first, then move the pressure figures onto the artwork's numbers.
      const body = old.descriptionLong
        ? repointBar(transformDescription(old.descriptionLong, r.title), r.oldBar, r.bar)
        : old.descriptionLong
      if (body && /dixon/i.test(body)) {
        problems.push(`${r.sku}: Dixon survives rebuild transform`)
      }
      const specs = old.specs
        .filter((s) => !/min burst pressure/i.test(s.label))
        .map((s) => ({
          group: s.group,
          label: s.label,
          value: /max working pressure/i.test(s.label) ? `${r.bar} bar` : s.value,
          unit: s.unit,
          position: s.position,
          isFilterable: s.isFilterable,
          templateFieldId: s.templateFieldId,
        }))

      rebuilt.push({
        sku: r.sku,
        deletedTitle: old.title,
        newTitle: r.title,
        oldSlug: old.slug,
        newSlug,
        specsCarried: specs.length,
        burstPressureDropped: old.specs.length - specs.length,
        mediaRetired: old.images.map((i) => i.media.originalFilename),
      })

      if (dryRun) {
        console.log(
          `[dry-run] DELETE ${r.sku} "${old.title}" -> CREATE "${r.title}" (${specs.length} specs, burst dropped)`
        )
        continue
      }

      const mediaIds = old.images.map((i) => i.mediaId)
      await db.$transaction(
        async (tx) => {
          await tx.productImage.deleteMany({ where: { productId: old.id } })
          await tx.product.delete({ where: { id: old.id } })
          const created = await tx.product.create({
            data: {
              sku: old.sku,
              mpn: old.mpn,
              slug: newSlug,
              title: r.title,
              categoryId: old.categoryId,
              brandId: indus.id,
              descriptionShort: old.descriptionShort,
              descriptionLong: body,
              listPrice: old.listPrice,
              listPriceCurrency: old.listPriceCurrency,
              unitOfMeasure: old.unitOfMeasure,
              weightKg: old.weightKg,
              dimensionsMm: old.dimensionsMm ?? Prisma.DbNull,
              leadTimeDays: old.leadTimeDays,
              warrantyMonths: old.warrantyMonths,
              countryOfOrigin: old.countryOfOrigin,
              hsCode: old.hsCode,
              status: old.status,
              seoTitle: `${r.title} — Indus ${r.sku.replace(/^IH-IH-/, '')}`,
              seoDescription: old.seoDescription,
              specTemplateId: old.specTemplateId,
              stockQty: old.stockQty,
              stockWarehouse: old.stockWarehouse,
              specs: { create: specs },
            },
            select: { id: true },
          })
          await tx.redirect.upsert({
            where: { fromPath: `/products/${old.slug}` },
            update: { toPath: `/products/${newSlug}`, statusCode: 301, isActive: true },
            create: {
              fromPath: `/products/${old.slug}`,
              toPath: `/products/${newSlug}`,
              statusCode: 301,
              isActive: true,
            },
          })
          return created
        },
        { maxWait: 30_000, timeout: 30_000 }
      )

      // Orphaned media from the deleted product.
      for (const mid of mediaIds) {
        const refs = await otherReferences(mid, [])
        if (refs.length) {
          problems.push(`${r.sku}: media ${mid} still referenced (${refs.join(', ')}) — kept`)
          continue
        }
        const m = await db.media.findUnique({
          where: { id: mid },
          select: { id: true, storagePath: true },
        })
        if (!m) continue
        await retireMedia(m, supabase())
      }
      console.log(`rebuilt ${r.sku} -> "${r.title}"`)
    }
    audit.rebuilt = rebuilt
  }

  // ── Phase 3: attach renders ───────────────────────────────────────────────
  const attached: unknown[] = []
  const displaced: { productImageId: string; media: { id: string; storagePath: string; originalFilename: string | null } }[] = []
  if (run('attach')) {
    const sb = supabase()
    console.log(`\n── attach: ${PAIRS.length} renders ──`)

    for (const pair of PAIRS) {
      if (IGNORED_FILES.has(pair.file)) continue
      const path = join(root, pair.file)
      if (!existsSync(path)) {
        problems.push(`${pair.file}: missing from ${root}`)
        continue
      }
      const product = await db.product.findUnique({
        where: { sku: pair.sku },
        select: { id: true, title: true, images: { include: { media: true } } },
      })
      if (!product) {
        problems.push(`${pair.sku}: product not found for ${pair.file}`)
        continue
      }
      if (product.images.some((i) => i.media.originalFilename === pair.file)) {
        console.log(`skip ${pair.sku} — already carries ${pair.file}`)
        continue
      }

      const buf = readFileSync(path)
      const size = pngSize(buf)
      const objectPath = objectKeyFor(pair.sku, pair.file)
      const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

      for (const img of product.images) {
        displaced.push({ productImageId: img.id, media: img.media })
      }

      attached.push({ file: pair.file, sku: pair.sku, size, displaced: product.images.length })

      if (dryRun) {
        console.log(
          `[dry-run] ${pair.file} (${size?.width}×${size?.height}) -> ${pair.sku} ${product.title}` +
            (product.images.length ? `  [displaces ${product.images.length}]` : '')
        )
        continue
      }

      const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/png',
      })
      if (error) {
        problems.push(`${pair.file}: upload failed — ${error.message}`)
        continue
      }

      await db.$transaction(
        async (tx) => {
          const media = await tx.media.create({
            data: {
              kind: 'image',
              mimeType: 'image/png',
              originalFilename: pair.file,
              storagePath: publicUrl,
              bytes: buf.byteLength,
              width: size?.width ?? null,
              height: size?.height ?? null,
              alt: product.title,
            },
            select: { id: true },
          })
          await tx.productImage.updateMany({
            where: { productId: product.id },
            data: { position: { increment: 1 } },
          })
          await tx.productImage.create({
            data: { productId: product.id, mediaId: media.id, position: 0, alt: product.title },
          })
        },
        { maxWait: 30_000, timeout: 30_000 }
      )
      console.log(`attached ${pair.file} -> ${pair.sku}`)
    }

    // Retire what the renders displaced.
    if (!dryRun) {
      for (const old of displaced) {
        const refs = await otherReferences(old.media.id, [old.productImageId])
        if (refs.length > 0) {
          problems.push(
            `${old.media.originalFilename}: still referenced (${refs.join(', ')}) — left in place`
          )
          continue
        }
        await retireMedia(old.media, sb)
      }
    }
    audit.attached = attached
    audit.displaced = displaced.map((d) => d.media.originalFilename)
  }

  // ── report ────────────────────────────────────────────────────────────────
  if (!dryRun) {
    const stamp = new Date().toISOString().slice(0, 10)
    const file = join(BACKUP_DIR, `industrial-hose-sprint-${stamp}.json`)
    writeFileSync(file, JSON.stringify(audit, null, 2))
    console.log(`\naudit written to ${file}`)
  }

  console.log(`\n── summary ──`)
  console.log(`rebranded ${rebranded.length}  rebuilt ${rebuilt.length}  attached ${attached.length}`)
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`)
    for (const p of problems) console.log(`  - ${p}`)
  } else {
    console.log('no problems')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
