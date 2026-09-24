/**
 * Swap the AI-generated hammer union renders for real product photographs
 * captured from the OFS Energy catalogue export (scraped 2026-09-23).
 *
 * Only six standard-service products get photos. OFS lists seven hammer union
 * items, and a photo is only paired where its cast figure number AND end
 * connection match the product exactly. Every photo was opened and its
 * stamping read ("FIG 1002", "FIG 1502", …) before being written down here —
 * a Fig 1502 on a Fig 206 page is invisible to us and obvious to a buyer.
 *
 * Deliberately NOT paired:
 *   - Sour-gas products. Sour-service unions carry different colour codes and
 *     markings; a standard-service photo there misstates the part.
 *   - The colour-code / pressure chart (`…-371-3`, `…-339-3`, byte-identical).
 *     It is a reference table, not a product photograph.
 *
 * Known caveat, accepted by the client on 2026-09-24: the photos are not OFS's
 * own. All nine carry a "GREAT OILFIELD" watermark (five heavily, four
 * faintly), and the unions are cast "NFC". They are uploaded as captured.
 *
 * Retirement is reversible, unlike `replace-hydraulic-hose-renders.ts`: the
 * displaced renders are unlinked from the product and their Media rows moved
 * to the media-library trash (`deletedAt`), which keeps the storage object.
 * Restore from Admin → Media → Trash and re-attach if this needs undoing. A
 * render still referenced by anything else is left untouched and reported.
 *
 * Idempotent: a photo already on the product (matched on
 * `Media.originalFilename`) is skipped, so a re-run only finishes the rest.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/replace-hammer-union-renders.ts \
 *     --dir "/path/to/OFS Energy/ofsenergy-product-images/Hammer-Union" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const BACKUP_DIR = resolve(__dirname, '../../data')

/**
 * Frozen. `photos` is in display order; the first becomes position 0, the
 * card image. `stamp` is what is cast into the nut in that file.
 */
const PAIRS: readonly {
  sku: string
  stamp: string
  photos: readonly { file: string; key: string; view: string }[]
}[] = [
  {
    sku: 'IH-FI-HU-100-NPT-1K-STD-INDUS',
    stamp: 'Figure 100, 5 in threaded',
    photos: [
      { file: 'figure-100-5-threaded-1000-psi-hammer-unions-371-1.jpg', key: 'fig-100-threaded-assembled', view: 'assembled, side view' },
      { file: 'figure-100-5-threaded-1000-psi-hammer-unions-371-2.jpg', key: 'fig-100-threaded-nut', view: 'wing nut' },
    ],
  },
  {
    sku: 'IH-FI-HU-602-BW-6K-STD-INDUS',
    stamp: 'FIG 602, 2 in and 4 in butt weld',
    photos: [
      { file: 'nfc-figure-602-2-buttweld-6000-psi-hammer-unions-339-1.jpg', key: 'fig-602-buttweld-2in-side', view: '2 in, side view' },
      { file: 'nfc-figure-602-2-buttweld-6000-psi-hammer-unions-339-2.jpg', key: 'fig-602-buttweld-2in-face', view: '2 in, face view' },
      { file: 'nfc-figure-602-4-buttweld-6000-psi-hammer-unions-661.jpg', key: 'fig-602-buttweld-4in-face', view: '4 in, face view' },
    ],
  },
  {
    sku: 'IH-FI-HU-1002-BW-10K-STD-INDUS',
    stamp: 'FIG 1002, 10000 CWP, 4 in butt weld',
    photos: [
      { file: 'nfc-figure-1002-4-buttweld-hammer-unions-10000-psi-662.jpg', key: 'fig-1002-buttweld-4in', view: '4 in, face view' },
    ],
  },
  {
    // Painted blue with a red band — the usual Fig 1502 scheme — but the nut
    // is cast "FIG 1002" and OFS files it as 1002. The casting wins.
    sku: 'IH-FI-HU-1002-NPT-10K-STD-INDUS',
    stamp: 'FIG 1002, 4 in threaded',
    photos: [
      { file: 'nfc-figure-1002-4-threaded-hammer-unions-10000-psi-663.jpg', key: 'fig-1002-threaded-4in', view: '4 in, face view' },
    ],
  },
  {
    sku: 'IH-FI-HU-1502-BW-15K-STD-INDUS',
    stamp: 'FIG 1502, 15000 CWP, 2 in butt weld',
    photos: [
      { file: 'nfc-figure-1502-2-buttweld-hammer-unions-15000-psi-659.jpg', key: 'fig-1502-buttweld-2in', view: '2 in, face view' },
    ],
  },
  {
    sku: 'IH-FI-HU-1502-NPT-15K-STD-INDUS',
    stamp: 'FIG 1502, 2 in threaded',
    photos: [
      { file: 'nfc-figure-1502-2-threaded-hammer-unions-15000-psi-660.jpg', key: 'fig-1502-threaded-2in', view: '2 in, face view' },
    ],
  },
] as const

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Anything already exported
 * wins, so a worktree without its own env files can run with the main
 * checkout's values exported in the shell.
 */
function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]!
    if (process.env[key]) continue
    process.env[key] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Reads width/height from the first JPEG SOF marker — avoids an image dep. */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    // SOF0–SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/**
 * Every Media relation that can hold one of these rows, re-checked at run
 * time. `products.ogImageMediaId` and `categories.ogImageMediaId` are plain
 * columns, not relations, so they are counted separately.
 */
async function otherReferences(mediaId: string, ownProductImageIds: string[]) {
  const m = await db.media.findUnique({
    where: { id: mediaId },
    select: {
      _count: {
        select: {
          productImages: true,
          productDocuments: true,
          categoryImages: true,
          brandLogos: true,
          brandHeroes: true,
          brandCaseStudyImages: true,
          industryHeroes: true,
          industryCaseStudyImages: true,
          rfqAttachments: true,
          enquiryAttachments: true,
          quotePdfs: true,
          blogHeroes: true,
          blogCategoryImages: true,
          blogAuthorAvatars: true,
          importJobSources: true,
          navMenuItemPromos: true,
          storeSettingsLogos: true,
          storeSettingsFooterLogos: true,
          storeSettingsFavicons: true,
          storeSettingsSearchLogos: true,
          homepageHeroSlides: true,
          serviceCaseHeroes: true,
          serviceCaseOgImages: true,
        },
      },
    },
  })
  if (!m) return ['media row vanished']
  const found: string[] = []
  for (const [rel, n] of Object.entries(m._count)) {
    const expected = rel === 'productImages' ? ownProductImageIds.length : 0
    if (n > expected) found.push(`${rel}=${n}`)
  }
  const og =
    (await db.product.count({ where: { ogImageMediaId: mediaId } })) +
    (await db.category.count({ where: { ogImageMediaId: mediaId } }))
  if (og > 0) found.push(`ogImage=${og}`)
  return found
}

/**
 * Photos first in table order, then anything left behind (a render that was
 * referenced elsewhere) in its old order. Positions 0..n-1, no gaps. Run
 * after every pass so a partial re-run cannot leave the order scrambled.
 */
async function renumber(productId: string, photoOrder: readonly string[]) {
  const rows = await db.productImage.findMany({
    where: { productId },
    orderBy: { position: 'asc' },
    select: { id: true, position: true, media: { select: { originalFilename: true } } },
  })
  const rank = (f: string) => {
    const i = photoOrder.indexOf(f)
    return i >= 0 ? i : photoOrder.length
  }
  const sorted = [...rows].sort(
    (a, b) => rank(a.media.originalFilename) - rank(b.media.originalFilename) || a.position - b.position
  )
  await db.$transaction(
    sorted
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) => r.position !== i)
      .map(({ r, i }) => db.productImage.update({ where: { id: r.id }, data: { position: i } }))
  )
}

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const eq = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length)
  const at = args.indexOf('--dir')
  const dirArg = eq ?? (at >= 0 ? args[at + 1] : undefined)
  if (!dirArg) throw new Error('--dir=<OFS Hammer-Union image folder> is required')
  const dir = resolve(dirArg)
  if (!existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const onDisk = new Set(readdirSync(dir))
  const sb = supabase()

  let attached = 0
  let alreadyPresent = 0
  let trashed = 0
  const problems: string[] = []
  const backup: unknown[] = []
  const backupPath = join(
    BACKUP_DIR,
    `retired-hammer-union-renders-${new Date().toISOString().slice(0, 10)}.json`
  )

  for (const pair of PAIRS) {
    const missing = pair.photos.filter((p) => !onDisk.has(p.file))
    if (missing.length > 0) {
      problems.push(`${pair.sku}: missing from ${dir} — ${missing.map((p) => p.file).join(', ')}`)
      continue
    }

    const product = await db.product.findUnique({
      where: { sku: pair.sku },
      select: {
        id: true,
        sku: true,
        title: true,
        images: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
            alt: true,
            media: {
              select: {
                id: true,
                originalFilename: true,
                storagePath: true,
                bytes: true,
                width: true,
                height: true,
                alt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })
    if (!product) {
      problems.push(`${pair.sku}: no such product`)
      continue
    }

    const photoFiles = new Set(pair.photos.map((p) => p.file))
    const displaced = product.images.filter((i) => !photoFiles.has(i.media.originalFilename))
    const present = new Set(product.images.map((i) => i.media.originalFilename))

    // ── Attach the photos, in display order ahead of anything displaced ────
    const toAttach = pair.photos.filter((p) => !present.has(p.file))
    alreadyPresent += pair.photos.length - toAttach.length

    if (toAttach.length > 0) {
      const prepared: {
        file: string
        alt: string
        position: number
        publicUrl: string
        bytes: number
        size: { width: number; height: number } | null
      }[] = []

      for (const photo of toAttach) {
        const buf = readFileSync(join(dir, photo.file))
        const size = jpegSize(buf)
        const objectPath = `products/${pair.sku.toLowerCase()}/${photo.key}.jpg`
        const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
        const alt = `${product.title} — ${photo.view}`
        const position = pair.photos.indexOf(photo)

        if (dryRun) {
          console.log(
            `[dry-run] attach ${photo.file} (${size?.width}×${size?.height}) -> ` +
              `${pair.sku} @${position} as ${objectPath}`
          )
        } else {
          const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
            cacheControl: '31536000',
            upsert: true,
            contentType: 'image/jpeg',
          })
          if (error) {
            problems.push(`${photo.file}: upload failed — ${error.message}`)
            continue
          }
        }
        prepared.push({ file: photo.file, alt, position, publicUrl, bytes: buf.byteLength, size })
      }

      if (!dryRun && prepared.length > 0) {
        // Positions are settled by `renumber` once the renders are gone.
        await db.$transaction(
          async (tx) => {
            for (const p of prepared) {
              const media = await tx.media.create({
                data: {
                  kind: 'image',
                  mimeType: 'image/jpeg',
                  originalFilename: p.file,
                  storagePath: p.publicUrl,
                  bytes: p.bytes,
                  width: p.size?.width ?? null,
                  height: p.size?.height ?? null,
                  alt: p.alt,
                  caption: `Source: OFS Energy catalogue export, 2026-09-23 (${pair.stamp})`,
                },
                select: { id: true },
              })
              await tx.productImage.create({
                data: { productId: product.id, mediaId: media.id, position: p.position, alt: p.alt },
              })
            }
          },
          { maxWait: 30_000, timeout: 30_000 }
        )
      }
      attached += prepared.length
    }

    // ── Unlink the renders and move them to the media trash ────────────────
    for (const old of displaced) {
      const refs = await otherReferences(old.media.id, [old.id])
      if (refs.length > 0) {
        problems.push(
          `${old.media.originalFilename} (${old.media.id}): still referenced ` +
            `(${refs.join(', ')}) — left in place`
        )
        continue
      }

      backup.push({ productSku: product.sku, productTitle: product.title, position: old.position, alt: old.alt, media: old.media })
      if (!dryRun) writeFileSync(backupPath, JSON.stringify(backup, null, 2))

      if (dryRun) {
        console.log(`[dry-run] unlink + trash ${old.media.originalFilename} (${old.media.id}) from ${pair.sku}`)
      } else {
        await db.$transaction([
          db.productImage.delete({ where: { id: old.id } }),
          db.media.update({ where: { id: old.media.id }, data: { deletedAt: new Date() } }),
        ])
      }
      trashed++
    }

    if (!dryRun) await renumber(product.id, pair.photos.map((p) => p.file))
  }

  if (backup.length > 0) {
    console.log(`\n[backup] ${backup.length} rows ${dryRun ? 'would go' : 'written'} to ${backupPath}`)
  }
  console.log(
    `\n[hammer-union-photos] ${attached} attached, ${alreadyPresent} already present, ` +
      `${trashed} renders trashed, ${problems.length} problems`
  )
  for (const p of problems) console.log(`  ! ${p}`)
  await db.$disconnect()
  if (problems.length) process.exitCode = 1
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
