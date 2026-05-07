/**
 * Bulk-product import library.
 *
 * Composable helpers that the CLI (cli.ts), the existing admin importer
 * (apps/admin/src/app/(shell)/products/import/actions.ts — refactor pending
 * in a follow-up PR), and any future bulk-create flows can call. Every
 * helper is pure with respect to the Prisma client (no global state); pass
 * a `Tx` (PrismaClient | TransactionClient) and the call is transaction-
 * compatible.
 *
 * Two-phase import flow:
 *   1. Preflight — upsert brands, categories (parent-aware topo-sorted),
 *      spec templates + fields. Wire each category's defaultSpecTemplateId
 *      after templates exist.
 *   2. Products — for each product, upsert the row + sync specs (via the
 *      live template's fields) + sync FAQs. Re-run policy controlled by
 *      the import `mode` (add-only / overwrite-edits / update-only).
 *
 * Then optionally run `replacePlaceholderLeaves` to make new categories
 * appear in the megamenu.
 *
 * The CLI wraps all this in a single `db.$transaction()` so a partial
 * failure rolls back cleanly.
 */

export * from './types'
export * from './slug'
export * from './sanitise-html'
export * from './brands'
export * from './categories'
export * from './spec-templates'
export * from './products'
export * from './navigation'
