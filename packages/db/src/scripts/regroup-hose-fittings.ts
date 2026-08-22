/**
 * Give the fittings, adapters and stainless families a page of their own.
 *
 * "Hoses & Fittings" carries 35 categories in one flat list, 464 active SKUs
 * between them, and there is no page anywhere on the site whose heading reads
 * "hydraulic adapters" or "hydraulic fittings". The products exist; the phrase
 * a buyer actually searches does not resolve to anything.
 *
 * This groups 29 of those 35 under three new hub categories and links each one
 * from the megamenu column that already describes it. After it runs, "Hoses &
 * Fittings" has 9 direct children instead of 35.
 *
 *   /c/hydraulic-adapters                    7 categories   201 SKUs
 *   /c/hydraulic-fittings                   11 categories   140 SKUs
 *   /c/stainless-steel-hydraulic-fittings   11 categories    53 SKUs
 *
 * ## Why these three groupings and not the obvious two
 *
 * The first pass put every fitting — carbon steel and SS316L alike — under one
 * "Hydraulic Fittings" hub, 177 SKUs. That splits a coherent family: SS316L is
 * a material choice a buyer makes before anything else (offshore, chemical,
 * washdown), the megamenu has treated it as its own column since the
 * catalogue was consolidated, and a hub that swallowed seven of the eleven
 * SS316L categories while leaving banjos, standpipes and hydrowashing
 * couplings outside would be incoherent in both directions. Three hubs, each
 * mapping exactly onto one existing megamenu column, keeps the families whole.
 *
 * ## Why there is no couplings hub
 *
 * A "Hydraulic Couplings" hub would contain `quick-couplers` and nothing else
 * of substance — one page duplicating another page's 29 products, competing
 * with it for the same query. That is the near-duplicate problem this work
 * exists to avoid, so instead `quick-couplers` is retargeted in place: renamed
 * to "Hydraulic Quick Couplers" and given SEO fields that own the broader
 * term. No new URL.
 *
 * ## What this deliberately does not touch
 *
 * - **Products.** Listings hang off the leaf categories and stay there. The
 *   category page walks the published sub-tree (see the rollup fixed in #294),
 *   so a hub shows everything beneath it without owning a single row.
 * - **Megamenu structure.** The three columns already exist with the right
 *   children. All that changes is that their headings stop being dead text and
 *   start linking somewhere — the same thing `/c/ferrules` did for the
 *   Ferrules column. No item is created, moved or deleted, so the three-level
 *   render limit is unaffected.
 * - **Slugs of existing categories.** Nothing moves URL, so there are no
 *   redirects to write and no ranking to lose.
 *
 * Idempotent. Re-running finds the hubs by slug, re-parents only what is not
 * already parented, and leaves admin edits to hub copy alone unless
 * `--refresh-copy` is passed.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/regroup-hose-fittings.ts \
 *     [--execute] [--refresh-copy] [--rollback=FILE]
 *
 * Dry run is the default; nothing is written without `--execute`. Every
 * execute writes a backup of the previous parentId of every category it moves
 * to `scripts/backups/`, which `--rollback=FILE` replays in reverse.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = resolve(__dirname, '../../scripts/backups')

const db = new PrismaClient()

const args = process.argv.slice(2)
const execute = args.includes('--execute')
const refreshCopy = args.includes('--refresh-copy')
const rollbackFile = args.find((a) => a.startsWith('--rollback='))?.split('=')[1]

/** The parent every hub hangs off, and the categories that move under them. */
const PARENT_SLUG = 'hydraulic-hose-fittings-suppliers-uae'

type Hub = {
  slug: string
  name: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  /** Megamenu column whose heading should start pointing at this hub. */
  navLabel: string
  children: string[]
}

/**
 * `seoTitle` must never contain "Indus Hydraulics" — the storefront layout
 * applies `%s | Indus Hydraulics` and a title carrying it renders the suffix
 * twice. Asserted below rather than trusted.
 */
const HUBS: Hub[] = [
  {
    slug: 'hydraulic-adapters',
    name: 'Hydraulic Adapters',
    shortDescription:
      'Adapters that join one hydraulic thread form to another — DIN 2353 bite type, BSP, JIC 37°, ORFS, metric and NPT, plus SAE flange adapters. Carbon steel, stocked in Dubai across the full range of sizes and thread combinations.',
    seoTitle: 'Hydraulic Adapters — BSP, JIC, ORFS, NPT & DIN 2353',
    seoDescription:
      'Hydraulic adapters supplied from Dubai: DIN 2353 bite type, BSP, JIC 37°, ORFS, metric, NPT and SAE flange. Every common thread-to-thread combination, with datasheets.',
    focusKeyword: 'hydraulic adapters',
    navLabel: 'Adapters',
    children: [
      'din-2353-bite-type-adapters-uae',
      'bsp-hydraulic-adapters-uae',
      'jic-adapters',
      'orfs-adapters',
      'metric-adapters',
      'npt-adapters',
      'sae-flange-adapters',
    ],
  },
  {
    slug: 'hydraulic-fittings',
    name: 'Hydraulic Fittings',
    shortDescription:
      'Hose-end fittings for hydraulic assemblies — crimp fittings for braided and spiral hose, and swaged ends in every common thread form: metric, DIN, BSP, JIC 37°, Japanese, ORFS, NPT/NPSM/SAE and SAE flange.',
    seoTitle: 'Hydraulic Fittings — Crimp & Hose-End Fittings',
    seoDescription:
      'Hydraulic hose fittings supplied from Dubai: braided and spiral crimp fittings, plus metric, DIN, BSP, JIC 37°, ORFS, NPT and SAE flange hose ends. Datasheet-backed.',
    focusKeyword: 'hydraulic fittings',
    navLabel: 'Hose Fittings',
    children: [
      'metric-hose-fittings',
      'din-hose-fittings',
      'bsp-hose-fittings',
      'jic-37-hose-fittings',
      'japanese-hose-fittings',
      'orfs-hose-fittings',
      'npt-npsm-sae-hose-fittings',
      'sae-flange-fittings',
      'braided-hose-crimp-fittings',
      'spiral-hose-crimp-fittings',
      'pressure-washer-waterjet-fittings',
    ],
  },
  {
    slug: 'stainless-steel-hydraulic-fittings',
    name: 'Stainless Steel Hydraulic Fittings',
    shortDescription:
      'SS316L fittings, adapters and flanges for hydraulic and washdown service — the material choice for offshore, chemical handling and anywhere carbon steel will not survive. BSP, SAE, JIC 37°, metric, ORFS and NPT/NPSM forms, plus banjos, standpipes and hydrowashing couplings.',
    seoTitle: 'Stainless Steel Hydraulic Fittings — SS316L',
    seoDescription:
      'SS316L stainless steel hydraulic fittings supplied from Dubai: BSP, SAE, JIC 37°, metric, ORFS and NPT/NPSM, with banjos, standpipes, flanges and hydrowashing couplings.',
    focusKeyword: 'stainless steel hydraulic fittings',
    navLabel: 'SS316L Fittings',
    children: [
      'ss316l-bsp-fittings',
      'ss316l-sae-fittings',
      'ss316l-banjos',
      'ss316l-jic-37-fittings',
      'ss316l-metric-fittings',
      'ss316l-standpipes',
      'ss316l-orfs-fittings',
      'ss316l-npt-npsm-fittings',
      'ss316l-double-hexagonal-fittings',
      'ss316l-hydrowashing-couplings',
      'ss316l-sae-flanges-for-hoses',
    ],
  },
]

/**
 * Quick couplers, retargeted in place rather than given a hub of their own.
 * See the header — a couplings hub would be a second page over one category's
 * products.
 */
const QUICK_COUPLERS = {
  slug: 'quick-couplers',
  name: 'Hydraulic Quick Couplers',
  seoTitle: 'Hydraulic Quick Couplers & Couplings — ISO A, ISO B & Flat Face',
  seoDescription:
    'Hydraulic quick couplers and couplings supplied from Dubai: ISO 7241 A and B, flat face, screw-to-connect and agricultural push-pull, in carbon steel and stainless.',
  focusKeyword: 'hydraulic couplings',
}

type Backup = {
  createdAt: string
  hubsCreated: string[]
  moves: { slug: string; fromParentId: string | null; toHubSlug: string }[]
  navLinked: { itemId: string; label: string; previousLinkType: string; previousCategoryId: string | null }[]
  quickCouplers: { name: string; seoTitle: string | null; seoDescription: string | null; focusKeyword: string | null } | null
}

async function rollback(file: string) {
  const backup: Backup = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`Rolling back ${file} (taken ${backup.createdAt})`)

  for (const m of backup.moves) {
    await db.category.update({ where: { slug: m.slug }, data: { parentId: m.fromParentId } })
    console.log(`  reparented ${m.slug} back`)
  }
  for (const n of backup.navLinked) {
    await db.navMenuItem.update({
      where: { id: n.itemId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- enum round-trips through JSON as a string
      data: { linkType: n.previousLinkType as any, categoryId: n.previousCategoryId },
    })
    console.log(`  unlinked nav column "${n.label}"`)
  }
  if (backup.quickCouplers) {
    await db.category.update({ where: { slug: QUICK_COUPLERS.slug }, data: backup.quickCouplers })
    console.log('  restored quick-couplers copy')
  }
  // Hubs are unpublished rather than deleted: a category with children cannot
  // be removed without deciding what happens to them, and by this point the
  // children are already back where they were.
  for (const slug of backup.hubsCreated) {
    await db.category.update({ where: { slug }, data: { isPublished: false } })
    console.log(`  unpublished hub ${slug}`)
  }
  console.log('Rollback complete. The hub rows remain, unpublished.')
}

async function main() {
  if (rollbackFile) {
    await rollback(rollbackFile)
    return
  }

  for (const h of HUBS) {
    if (/indus\s*hydraulics/i.test(h.seoTitle)) {
      throw new Error(`${h.slug}: seoTitle must not contain "Indus Hydraulics" — the layout appends it`)
    }
  }

  // A category listed under two hubs would silently land in whichever ran
  // last, and the counts quoted in the PR would be wrong in a way nothing
  // else here would catch.
  const seen = new Map<string, string>()
  for (const h of HUBS) {
    for (const slug of h.children) {
      const already = seen.get(slug)
      if (already) throw new Error(`${slug} is listed under both ${already} and ${h.slug}`)
      seen.set(slug, h.slug)
    }
  }
  if (HUBS.some((h) => seen.has(h.slug))) throw new Error('a hub is listed as its own child')
  if (new Set(HUBS.map((h) => h.slug)).size !== HUBS.length) throw new Error('duplicate hub slug')
  if (new Set(HUBS.map((h) => h.navLabel)).size !== HUBS.length) throw new Error('duplicate nav label')

  const parent = await db.category.findUnique({ where: { slug: PARENT_SLUG }, select: { id: true, name: true } })
  if (!parent) throw new Error(`parent category ${PARENT_SLUG} not found`)

  const backup: Backup = { createdAt: new Date().toISOString(), hubsCreated: [], moves: [], navLinked: [], quickCouplers: null }
  const label = execute ? '' : '[dry-run] '

  const menu = await db.navMenu.findUnique({ where: { slug: 'primary-megamenu' }, select: { id: true } })
  const section = menu
    ? await db.navMenuItem.findFirst({
        where: { menuId: menu.id, parentId: null, label: { contains: 'Hose, Tube' } },
        select: { id: true },
      })
    : null
  if (!section) console.warn('! megamenu section "Hose, Tube…" not found — nav columns will not be linked')

  for (const h of HUBS) {
    // ── the hub category ────────────────────────────────────────────────
    let hub = await db.category.findUnique({ where: { slug: h.slug }, select: { id: true } })
    if (!hub) {
      const maxSibling = await db.category.aggregate({ where: { parentId: parent.id }, _max: { position: true } })
      console.log(`${label}create hub /c/${h.slug} "${h.name}"`)
      if (execute) {
        hub = await db.category.create({
          data: {
            parentId: parent.id,
            slug: h.slug,
            name: h.name,
            shortDescription: h.shortDescription,
            seoTitle: h.seoTitle,
            seoDescription: h.seoDescription,
            focusKeyword: h.focusKeyword,
            position: (maxSibling._max.position ?? -1) + 1,
            isPublished: true,
          },
          select: { id: true },
        })
        backup.hubsCreated.push(h.slug)
      }
    } else {
      console.log(`${label}hub /c/${h.slug} exists`)
      if (execute) {
        // A previous run may have left it unpublished via --rollback.
        await db.category.update({
          where: { id: hub.id },
          data: {
            isPublished: true,
            ...(refreshCopy
              ? {
                  name: h.name,
                  shortDescription: h.shortDescription,
                  seoTitle: h.seoTitle,
                  seoDescription: h.seoDescription,
                  focusKeyword: h.focusKeyword,
                }
              : {}),
          },
        })
      }
    }

    // ── move the children under it ──────────────────────────────────────
    let position = 0
    for (const slug of h.children) {
      const child = await db.category.findUnique({ where: { slug }, select: { id: true, parentId: true } })
      if (!child) {
        console.warn(`  ! ${slug} not found — skipped`)
        continue
      }
      if (hub && child.parentId === hub.id) {
        console.log(`  ${label}${slug} already under ${h.slug}`)
        position++
        continue
      }
      console.log(`  ${label}move ${slug} → ${h.slug}`)
      if (execute && hub) {
        backup.moves.push({ slug, fromParentId: child.parentId, toHubSlug: h.slug })
        await db.category.update({ where: { id: child.id }, data: { parentId: hub.id, position: position } })
      }
      position++
    }

    // ── point the megamenu column at it ─────────────────────────────────
    //
    // The column already exists with the right children. Today its heading is
    // inert text; this gives it a destination, exactly as /c/ferrules does for
    // the Ferrules column. Nothing is created or moved, so the three-level
    // render limit is untouched.
    if (section) {
      const column = await db.navMenuItem.findFirst({
        where: { parentId: section.id, label: h.navLabel },
        select: { id: true, linkType: true, categoryId: true },
      })
      if (!column) {
        console.warn(`  ! megamenu column "${h.navLabel}" not found — not linked`)
      } else if (column.linkType === 'category' && column.categoryId === hub?.id) {
        console.log(`  ${label}nav column "${h.navLabel}" already linked`)
      } else {
        console.log(`  ${label}link nav column "${h.navLabel}" → /c/${h.slug}`)
        if (execute && hub) {
          backup.navLinked.push({
            itemId: column.id,
            label: h.navLabel,
            previousLinkType: column.linkType,
            previousCategoryId: column.categoryId,
          })
          await db.navMenuItem.update({
            where: { id: column.id },
            data: { linkType: 'category', categoryId: hub.id },
          })
        }
      }
    }
  }

  // ── quick couplers, retargeted in place ───────────────────────────────
  const qc = await db.category.findUnique({
    where: { slug: QUICK_COUPLERS.slug },
    select: { id: true, name: true, seoTitle: true, seoDescription: true, focusKeyword: true },
  })
  if (!qc) {
    console.warn(`! ${QUICK_COUPLERS.slug} not found — not retargeted`)
  } else if (qc.name === QUICK_COUPLERS.name && qc.focusKeyword === QUICK_COUPLERS.focusKeyword) {
    console.log(`${label}${QUICK_COUPLERS.slug} already retargeted`)
  } else {
    console.log(`${label}retarget ${QUICK_COUPLERS.slug} → "${QUICK_COUPLERS.name}" (${QUICK_COUPLERS.focusKeyword})`)
    if (execute) {
      backup.quickCouplers = {
        name: qc.name,
        seoTitle: qc.seoTitle,
        seoDescription: qc.seoDescription,
        focusKeyword: qc.focusKeyword,
      }
      await db.category.update({
        where: { id: qc.id },
        data: {
          name: QUICK_COUPLERS.name,
          seoTitle: QUICK_COUPLERS.seoTitle,
          seoDescription: QUICK_COUPLERS.seoDescription,
          focusKeyword: QUICK_COUPLERS.focusKeyword,
        },
      })
    }
  }

  if (execute) {
    mkdirSync(BACKUP_DIR, { recursive: true })
    const file = resolve(BACKUP_DIR, `regroup-hose-fittings-${backup.createdAt.replace(/[:.]/g, '-')}.json`)
    writeFileSync(file, JSON.stringify(backup, null, 2))
    console.log(`\nBackup written to ${file}`)
    console.log(`Rollback with: --rollback=${file}`)
  } else {
    console.log('\nDry run. Nothing written. Re-run with --execute to apply.')
  }

  const remaining = await db.category.count({ where: { parentId: parent.id } })
  console.log(`"${parent.name}" direct children: ${remaining}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
