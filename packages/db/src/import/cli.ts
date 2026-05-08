#!/usr/bin/env -S node --import tsx
/**
 * CLI entry-point for the bulk-product importer.
 *
 * Usage:
 *   pnpm --filter @indus/db db:import <data-file> [--dry-run] [--mode=...]
 *
 * Modes (re-run policy):
 *   --mode=add-only         (default) — specs/FAQs only inserted if absent
 *   --mode=overwrite-edits           — specs/FAQs replaced from data file
 *   --mode=update-only               — only Product row updated; specs/FAQs untouched
 *
 * --dry-run runs every step inside a transaction that's rolled back at the
 * end, so the DB is not modified. Used to preview SKU collisions, spec
 * coercion errors, missing brands/categories, and the import summary.
 *
 * Exit codes:
 *   0 — success (or successful dry-run)
 *   1 — Zod validation failure on the data file
 *   2 — runtime error during import (transaction rolled back)
 */
import './load-env' // MUST be first — Prisma client picks up DATABASE_URL on instantiation

import { resolve, isAbsolute } from 'node:path'
import { pathToFileURL } from 'node:url'
import { db } from '../index'
import {
  buildImportContext,
  ImportBatchSchema,
  replacePlaceholderLeaves,
  topoSortCategories,
  upsertBrand,
  upsertCategory,
  upsertProductWithRelations,
  upsertSpecTemplate,
  wireDefaultSpecTemplates,
  type ImportBatch,
  type ImportSummary,
  type ImportMode,
} from './index'

// ── Args ──────────────────────────────────────────────────────────────────

type CliArgs = {
  dataFilePath: string
  dryRun: boolean
  mode: ImportMode
}

function parseArgs(argv: string[]): CliArgs {
  let dataFilePath: string | undefined
  let dryRun = false
  let mode: ImportMode = 'add-only'

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('--mode=')) {
      const v = arg.slice('--mode='.length)
      if (v !== 'add-only' && v !== 'overwrite-edits' && v !== 'update-only') {
        throw new Error(
          `--mode must be one of: add-only, overwrite-edits, update-only (got "${v}")`,
        )
      }
      mode = v
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`)
    } else if (!dataFilePath) {
      dataFilePath = arg
    } else {
      throw new Error(`Extra positional arg: ${arg}`)
    }
  }

  if (!dataFilePath) {
    throw new Error(
      'Usage: db:import <data-file> [--dry-run] [--mode=add-only|overwrite-edits|update-only]',
    )
  }

  return { dataFilePath, dryRun, mode }
}

// ── Data file loader ──────────────────────────────────────────────────────

async function loadDataFile(path: string): Promise<unknown> {
  const absolute = isAbsolute(path) ? path : resolve(process.cwd(), path)
  const url = pathToFileURL(absolute).href
  const mod = await import(url)
  // Support both `export default { ... }` and `export const batch = { ... }`
  return mod.default ?? mod.batch ?? mod
}

// ── Orchestrator ──────────────────────────────────────────────────────────

async function runImport(
  batch: ImportBatch,
  mode: ImportMode,
  dryRun: boolean,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    brands: { created: 0, updated: 0 },
    categories: { created: 0, updated: 0 },
    specTemplates: { created: 0, updated: 0 },
    specTemplateFields: { created: 0, updated: 0 },
    products: { created: 0, updated: 0 },
    productSpecs: { created: 0, updated: 0, skipped: 0 },
    productFaqs: { created: 0, skipped: 0 },
    navigation: { leavesDeleted: 0, leavesInserted: 0 },
    warnings: [],
  }

  // We mutate `summary` inside the transaction. If `dryRun` is set, we throw
  // DryRunRollback as the last step so the transaction reverts — but the
  // in-memory summary survives because the catch is outside the tx callback.
  try {
    await db.$transaction(
      async (tx) => {
        // Disable PostgreSQL's per-statement timeout for the duration of this
        // transaction. Supabase's default `statement_timeout` (8s) is too tight
        // for catalogue imports that include hundreds of products. Scoped to
        // this tx via `SET LOCAL` so other connections are unaffected.
        await tx.$executeRawUnsafe('SET LOCAL statement_timeout = 0')
        await tx.$executeRawUnsafe('SET LOCAL idle_in_transaction_session_timeout = 0')

        // 1. Brands
        for (const brand of batch.brands) {
          const r = await upsertBrand(brand, tx)
          if (r.outcome === 'created') summary.brands.created += 1
          else summary.brands.updated += 1
        }

        // 2. Categories (topo-sorted so parents land first)
        const sorted = topoSortCategories(batch.categories)
        for (const cat of sorted) {
          const r = await upsertCategory(cat, tx)
          if (r.outcome === 'created') summary.categories.created += 1
          else summary.categories.updated += 1
        }

        // 3. Spec templates
        for (const tpl of batch.specTemplates) {
          const r = await upsertSpecTemplate(tpl, tx)
          if (r.outcome === 'created') summary.specTemplates.created += 1
          else summary.specTemplates.updated += 1
          summary.specTemplateFields.created += r.fieldsCreated
          summary.specTemplateFields.updated += r.fieldsUpdated
        }

        // 4. Wire each category's defaultSpecTemplateId now both exist
        await wireDefaultSpecTemplates(batch.categories, tx)

        // 5. Build product import context (resolves brand/category/template ids)
        const ctx = await buildImportContext(batch.products, mode, tx)

        // 6. Products
        for (const product of batch.products) {
          const r = await upsertProductWithRelations(product, ctx, tx)
          if (r.outcome === 'created') summary.products.created += 1
          else summary.products.updated += 1
          summary.productSpecs.created += r.specsCreated
          summary.productSpecs.updated += r.specsUpdated
          summary.productSpecs.skipped += r.specsSkipped
          summary.productFaqs.created += r.faqsCreated
          summary.productFaqs.skipped += r.faqsSkipped
          for (const w of r.warnings) summary.warnings.push(`[${r.sku}] ${w}`)
        }

        // 7. Navigation linking — single config or array of configs
        if (batch.navigation) {
          const navConfigs = Array.isArray(batch.navigation)
            ? batch.navigation
            : [batch.navigation]
          for (const navConfig of navConfigs) {
            const nav = await replacePlaceholderLeaves(navConfig, tx)
            summary.navigation.leavesDeleted += nav.leavesDeleted
            summary.navigation.leavesInserted += nav.leavesInserted
            for (const w of nav.warnings) summary.warnings.push(`[nav] ${w}`)
          }
        }

        if (dryRun) {
          throw new DryRunRollback()
        }
      },
      {
        // Catalogue imports can touch hundreds of products + their specs.
        // Default to 15 minutes — large batches (e.g. the 211-product
        // hydraulic-adapters import) can take several minutes against
        // a remote pooled DB. Override with INDUS_IMPORT_TIMEOUT_MS for
        // even larger batches.
        maxWait: 60_000,
        timeout: Number(process.env.INDUS_IMPORT_TIMEOUT_MS ?? 900_000),
      },
    )
  } catch (err) {
    if (err instanceof DryRunRollback) {
      // Expected — DB rolled back, but `summary` survived in our closure.
      return summary
    }
    throw err
  }

  return summary
}

class DryRunRollback extends Error {
  constructor() {
    super('Dry-run: rolling back transaction')
    this.name = 'DryRunRollback'
  }
}

// ── Pretty printer ────────────────────────────────────────────────────────

function printSummary(args: CliArgs, batch: ImportBatch, summary: ImportSummary): void {
  const tag = args.dryRun ? '[DRY-RUN]' : '[LIVE]'
  console.log('')
  console.log(`${tag} Import "${batch.meta.id}" — ${batch.meta.description}`)
  console.log(`Mode: ${args.mode}`)
  console.log('')
  console.log(
    `  Brands             — created ${summary.brands.created}, updated ${summary.brands.updated}`,
  )
  console.log(
    `  Categories         — created ${summary.categories.created}, updated ${summary.categories.updated}`,
  )
  console.log(
    `  Spec templates     — created ${summary.specTemplates.created}, updated ${summary.specTemplates.updated} ` +
      `(${summary.specTemplateFields.created} fields created, ${summary.specTemplateFields.updated} updated)`,
  )
  console.log(
    `  Products           — created ${summary.products.created}, updated ${summary.products.updated}`,
  )
  console.log(
    `  Product specs      — created ${summary.productSpecs.created}, updated ${summary.productSpecs.updated}, skipped ${summary.productSpecs.skipped}`,
  )
  console.log(
    `  Product FAQs       — created ${summary.productFaqs.created}, skipped ${summary.productFaqs.skipped}`,
  )
  console.log(
    `  Megamenu nav links — deleted ${summary.navigation.leavesDeleted}, inserted ${summary.navigation.leavesInserted}`,
  )

  if (summary.warnings.length > 0) {
    console.log('')
    console.log(`  Warnings (${summary.warnings.length}):`)
    for (const w of summary.warnings) console.log(`    • ${w}`)
  }

  if (args.dryRun) {
    console.log('')
    console.log(`${tag} No changes were committed. Re-run without --dry-run to apply.`)
  } else {
    console.log('')
    console.log(`${tag} Import committed.`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  let args: CliArgs
  try {
    args = parseArgs(process.argv.slice(2))
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }

  console.log(`Loading data file: ${args.dataFilePath}`)
  const raw = await loadDataFile(args.dataFilePath)

  const parsed = ImportBatchSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('Data file failed validation:')
    for (const issue of parsed.error.issues) {
      console.error(`  • ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }

  try {
    const summary = await runImport(parsed.data, args.mode, args.dryRun)
    printSummary(args, parsed.data, summary)
    await db.$disconnect()
  } catch (err) {
    console.error('')
    console.error('Import failed (transaction rolled back):')
    console.error(err instanceof Error ? err.stack ?? err.message : String(err))
    await db.$disconnect()
    process.exit(2)
  }
}

main()
