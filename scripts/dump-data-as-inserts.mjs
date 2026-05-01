#!/usr/bin/env node
// Reads every table from local Postgres and emits per-table INSERT SQL files
// at /tmp/indus_data/<table>.sql, in dependency order. Used to seed Supabase.

import { PrismaClient } from '../packages/db/generated/client/index.js'
import fs from 'node:fs'
import path from 'node:path'

const LOCAL_URL = 'postgresql://medusa:medusa@localhost:5432/indus_hydraulics'
const OUT_DIR = '/tmp/indus_data'
fs.mkdirSync(OUT_DIR, { recursive: true })

const db = new PrismaClient({ datasourceUrl: LOCAL_URL })

// Topological order — tables with no FKs first.
const ORDER = [
  ['staff_users', 'staffUser'],
  ['industries', 'industry'],
  ['accounts', 'account'],
  ['account_contacts', 'accountContact'],
  ['account_addresses', 'accountAddress'],
  ['account_activity', 'accountActivity'],
  ['categories', 'category'],
  ['brands', 'brand'],
  ['media', 'media'],
  ['products', 'product'],
  ['product_specs', 'productSpec'],
  ['product_images', 'productImage'],
  ['product_documents', 'productDocument'],
  ['product_cross_references', 'productCrossReference'],
  ['product_questions', 'productQuestion'],
  ['rfqs', 'rfq'],
  ['rfq_lines', 'rfqLine'],
  ['rfq_attachments', 'rfqAttachment'],
  ['quotes', 'quote'],
  ['orders', 'order'],
  ['order_lines', 'orderLine'],
  ['order_shipments', 'orderShipment'],
  ['saved_lists', 'savedList'],
  ['saved_list_items', 'savedListItem'],
  ['saved_list_comments', 'savedListComment'],
  ['password_reset_tokens', 'passwordResetToken'],
  ['notifications', 'notification'],
  ['cms_pages', 'cmsPage'],
  ['blog_posts', 'blogPost'],
  ['redirects', 'redirect'],
  ['seo_settings', 'seoSetting'],
  ['import_jobs', 'importJob'],
  ['import_job_rows', 'importJobRow'],
  ['store_settings', 'storeSettings'],
  ['email_templates', 'emailTemplate'],
]

function literal(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
  if (value instanceof Date) return `'${value.toISOString()}'`
  if (Buffer.isBuffer?.(value)) return `'\\x${value.toString('hex')}'`
  // Prisma Decimal / Decimal.js — has toFixed() and a constructor named "Decimal".
  if (typeof value === 'object' && typeof value.toFixed === 'function') {
    return value.toString()
  }
  if (typeof value === 'object') {
    // JSON / JSONB columns + arrays.
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
  }
  return `'${String(value).replace(/'/g, "''")}'`
}

function quoteIdent(name) {
  return `"${name}"`
}

async function dumpTable(tableName, modelName) {
  const rows = await db[modelName].findMany()
  if (rows.length === 0) {
    return { tableName, count: 0 }
  }
  const cols = Object.keys(rows[0])
  const colsSql = cols.map(quoteIdent).join(',')
  const lines = [`-- ${rows.length} rows`]
  // Batch INSERTs in groups of 200 rows
  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const values = slice
      .map((r) => `(${cols.map((c) => literal(r[c])).join(',')})`)
      .join(',\n  ')
    lines.push(`INSERT INTO "${tableName}" (${colsSql}) VALUES\n  ${values};`)
  }
  fs.writeFileSync(path.join(OUT_DIR, `${tableName}.sql`), lines.join('\n') + '\n')
  return { tableName, count: rows.length }
}

const summary = []
for (const [tableName, modelName] of ORDER) {
  try {
    const r = await dumpTable(tableName, modelName)
    summary.push(r)
    process.stdout.write(`  ${r.tableName.padEnd(30)} ${r.count} rows\n`)
  } catch (e) {
    process.stdout.write(`  ${tableName.padEnd(30)} ERROR: ${e.message}\n`)
    summary.push({ tableName, count: -1, error: e.message })
  }
}

await db.$disconnect()
fs.writeFileSync(
  path.join(OUT_DIR, '_summary.json'),
  JSON.stringify(summary, null, 2),
)
process.stdout.write(`\nDone. Files in ${OUT_DIR}\n`)
