/**
 * Stage 1 — Title → import CSV row generator.
 *
 * Reads a list of product titles, asks Claude to fill in catalogue fields
 * (category, brand, descriptions, specs, SEO copy), allocates a SKU per
 * title using a category-prefix sequence, and writes a CSV that the
 * existing admin import preview screen accepts unchanged.
 *
 * Run:
 *   pnpm --filter=@indus/db catalogue:generate -- --input=titles.txt --output=products.csv
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import Papa from 'papaparse'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Load env from the repo root (pnpm --filter sets cwd to packages/db).
loadEnv({ path: resolve(process.cwd(), '../../.env'), override: false })
loadEnv({ override: false }) // also pick up packages/db/.env if present

// ── Types ────────────────────────────────────────────────────────────────────

type CategorySlug =
  | 'hydraulic-pumps'
  | 'valves-manifolds'
  | 'cylinders'
  | 'hoses-fittings'
  | 'seals-accessories'

type LlmRow = {
  category_slug: CategorySlug
  brand_slug: string | null
  mpn: string | null
  description_short: string
  description_long: string
  seo_title: string
  seo_description: string
  focus_keyword: string
  country_of_origin: string | null
  warranty_months: number | null
  spec_template_slug: string | null
  attrs: Record<string, string | number>
}

type CsvRow = Record<string, string | number | undefined>

type CategoryRecord = { id: string; slug: string; name: string; defaultSpecTemplateId: string | null }
type BrandRecord = { id: string; slug: string; name: string; country: string | null }
type SpecTemplateRecord = {
  id: string
  slug: string
  name: string
  fields: { id: string; key: string; label: string; dataType: string; isRequired: boolean }[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_PREFIX: Record<CategorySlug, string> = {
  'hydraulic-pumps': 'PMP',
  'valves-manifolds': 'VLV',
  cylinders: 'CYL',
  'hoses-fittings': 'HOS',
  'seals-accessories': 'SEL',
}

const SKU_PREFIX = 'IND'
const SKU_PAD_WIDTH = 4
const DEFAULT_MODEL = 'claude-sonnet-4-6'
const HOUSE_BRAND_SLUG = 'indus-hydraulics'

// ── DB helpers ───────────────────────────────────────────────────────────────

async function loadTaxonomy(db: PrismaClient): Promise<{
  categories: CategoryRecord[]
  brands: BrandRecord[]
  templates: SpecTemplateRecord[]
}> {
  const [categories, brands, templatesRaw] = await Promise.all([
    db.category.findMany({
      select: { id: true, slug: true, name: true, defaultSpecTemplateId: true },
      orderBy: { position: 'asc' },
    }),
    db.brand.findMany({
      select: { id: true, slug: true, name: true, country: true },
      orderBy: { name: 'asc' },
    }),
    db.specTemplate.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        fields: {
          select: { id: true, key: true, label: true, dataType: true, isRequired: true },
          orderBy: { position: 'asc' },
        },
      },
    }),
  ])
  return { categories, brands, templates: templatesRaw }
}

async function ensureHouseBrand(db: PrismaClient): Promise<void> {
  await db.brand.upsert({
    where: { slug: HOUSE_BRAND_SLUG },
    create: {
      name: 'Indus Hydraulics',
      slug: HOUSE_BRAND_SLUG,
      country: 'India',
      isAuthorizedDistributor: false,
      isPublished: true,
      seoTitle: 'Indus Hydraulics — House Brand',
      seoDescription:
        'Indus Hydraulics private-label hydraulic components engineered for Middle East and Indian industrial use.',
    },
    update: {},
  })
}

async function buildSkuAllocator(db: PrismaClient): Promise<(cat: CategorySlug) => string> {
  // Find the highest existing numeric suffix per prefix so we don't collide.
  const existing = await db.product.findMany({ select: { sku: true } })
  const nextByPrefix = new Map<string, number>()
  for (const p of existing) {
    const m = p.sku.match(new RegExp(`^${SKU_PREFIX}-([A-Z]{3})-(\\d+)$`))
    if (!m) continue
    const prefix = m[1]!
    const n = parseInt(m[2]!, 10)
    if (!Number.isFinite(n)) continue
    nextByPrefix.set(prefix, Math.max(nextByPrefix.get(prefix) ?? 0, n))
  }
  return (cat: CategorySlug) => {
    const prefix = CATEGORY_PREFIX[cat]
    const next = (nextByPrefix.get(prefix) ?? 0) + 1
    nextByPrefix.set(prefix, next)
    return `${SKU_PREFIX}-${prefix}-${String(next).padStart(SKU_PAD_WIDTH, '0')}`
  }
}

// ── LLM call ─────────────────────────────────────────────────────────────────

function buildSystemPrompt(
  categories: CategoryRecord[],
  brands: BrandRecord[],
  templates: SpecTemplateRecord[],
): string {
  const catLines = categories.map((c) => `- ${c.slug}: ${c.name}`).join('\n')
  const brandLines = brands
    .map((b) => `- ${b.slug}: ${b.name}${b.country ? ` (${b.country})` : ''}`)
    .join('\n')
  const templateLines = templates
    .map(
      (t) =>
        `- ${t.slug} (${t.name}):\n${t.fields
          .map((f) => `    • ${f.key} (${f.dataType}${f.isRequired ? ', required' : ''}) — ${f.label}`)
          .join('\n')}`,
    )
    .join('\n')

  return `You are a hydraulics catalogue editor for Indus Hydraulics, a Middle East / Indian distributor and house-brand maker.

For each product title given, return a single JSON object that maps the title into the catalogue.

CATEGORIES (must pick exactly one slug):
${catLines}

BRANDS (use one slug, or null if no brand fits):
${brandLines}

SPEC TEMPLATES (each tied to a category — use ONE matching the chosen category; field keys go into the "attrs" map):
${templateLines}

RULES
1. category_slug — required, exact match from the list.
2. brand_slug — pick the slug if the brand is named in the title (e.g. "Bosch Rexroth", "Parker"). If the title is generic with no brand named, use "${HOUSE_BRAND_SLUG}". Never invent a slug.
3. mpn — extract verbatim from the title if present (e.g. "A10VSO71", "DSG-01"). null otherwise.
4. description_short — one-line teaser, ≤ 500 chars, action-oriented, no marketing fluff.
5. description_long — 2–4 short paragraphs in plain markdown, no headings, no lists. Cover what the product is, what it's used for, and one or two key features. Keep it factual.
6. seo_title — ≤ 60 chars, keyword-front. Include brand if known.
7. seo_description — 140–160 chars, includes the focus keyword.
8. focus_keyword — single primary keyword, lowercased.
9. country_of_origin — best inference from brand. null if no brand and you can't tell.
10. warranty_months — sensible default per category (12 for most components, 24 for premium pumps/cylinders). null if unsure.
11. spec_template_slug — pick the template tied to your chosen category, if there is one. null otherwise.
12. attrs — only include keys that exist in the chosen template's fields. Extract numeric values from the title where stated (e.g. "200 bar", "30 L/min", "50 mm bore"). Numeric fields must be numbers (not strings). Skip fields you can't derive.
13. NEVER invent a price. NEVER invent a real-world MPN you didn't see in the title.

Output ONLY valid JSON matching this exact schema:
{
  "category_slug": string,
  "brand_slug": string | null,
  "mpn": string | null,
  "description_short": string,
  "description_long": string,
  "seo_title": string,
  "seo_description": string,
  "focus_keyword": string,
  "country_of_origin": string | null,
  "warranty_months": number | null,
  "spec_template_slug": string | null,
  "attrs": { [fieldKey: string]: string | number }
}`
}

async function callClaude(
  client: Anthropic,
  systemPrompt: string,
  title: string,
  model: string,
): Promise<LlmRow> {
  const resp = await client.messages.create({
    model,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Title: ${title}\n\nReturn the JSON object only — no prose, no fencing.`,
      },
    ],
  })

  const textBlock = resp.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response')
  }
  const raw = textBlock.text.trim()
  // Strip code fences if Claude added them despite instructions.
  const stripped = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(stripped)
  } catch (err) {
    throw new Error(`Could not parse JSON from Claude: ${(err as Error).message}\nRaw: ${raw.slice(0, 500)}`)
  }
  return validateLlmRow(parsed, title)
}

function validateLlmRow(parsed: unknown, title: string): LlmRow {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`LLM row is not an object for title "${title}"`)
  }
  const r = parsed as Record<string, unknown>
  const cat = r.category_slug
  if (typeof cat !== 'string' || !(cat in CATEGORY_PREFIX)) {
    throw new Error(`Invalid category_slug "${String(cat)}" for title "${title}"`)
  }
  return {
    category_slug: cat as CategorySlug,
    brand_slug: typeof r.brand_slug === 'string' ? r.brand_slug : null,
    mpn: typeof r.mpn === 'string' && r.mpn.length > 0 ? r.mpn : null,
    description_short: String(r.description_short ?? '').slice(0, 500),
    description_long: String(r.description_long ?? ''),
    seo_title: String(r.seo_title ?? '').slice(0, 180),
    seo_description: String(r.seo_description ?? '').slice(0, 320),
    focus_keyword: String(r.focus_keyword ?? '').toLowerCase(),
    country_of_origin: typeof r.country_of_origin === 'string' ? r.country_of_origin : null,
    warranty_months: typeof r.warranty_months === 'number' ? r.warranty_months : null,
    spec_template_slug: typeof r.spec_template_slug === 'string' ? r.spec_template_slug : null,
    attrs: r.attrs && typeof r.attrs === 'object' ? (r.attrs as Record<string, string | number>) : {},
  }
}

// ── CSV writing ──────────────────────────────────────────────────────────────

function buildCsvRow(title: string, sku: string, llm: LlmRow): CsvRow {
  const row: CsvRow = {
    sku,
    title,
    mpn: llm.mpn ?? undefined,
    brand_slug: llm.brand_slug ?? undefined,
    category_slug: llm.category_slug,
    spec_template_slug: llm.spec_template_slug ?? undefined,
    description_short: llm.description_short || undefined,
    description_long: llm.description_long || undefined,
    list_price: undefined,
    currency: undefined,
    unit_of_measure: 'each',
    weight_kg: undefined,
    lead_time_days: undefined,
    warranty_months: llm.warranty_months ?? undefined,
    stock_qty: 0,
    stock_warehouse: undefined,
    country_of_origin: llm.country_of_origin ?? undefined,
    hs_code: undefined,
    status: 'draft',
    seo_title: llm.seo_title || undefined,
    seo_description: llm.seo_description || undefined,
  }
  for (const [key, value] of Object.entries(llm.attrs)) {
    row[`attr_${key}`] = typeof value === 'number' ? value : String(value)
  }
  return row
}

function writeCsv(rows: CsvRow[], outputPath: string): void {
  const allKeys = new Set<string>()
  for (const r of rows) for (const k of Object.keys(r)) if (r[k] !== undefined) allKeys.add(k)
  const fixedOrder = [
    'sku',
    'title',
    'mpn',
    'brand_slug',
    'category_slug',
    'spec_template_slug',
    'description_short',
    'description_long',
    'list_price',
    'currency',
    'unit_of_measure',
    'weight_kg',
    'lead_time_days',
    'warranty_months',
    'stock_qty',
    'stock_warehouse',
    'country_of_origin',
    'hs_code',
    'status',
    'seo_title',
    'seo_description',
  ]
  const dynamicAttrs = [...allKeys].filter((k) => k.startsWith('attr_')).sort()
  const fields = [...fixedOrder, ...dynamicAttrs]
  const csv = Papa.unparse({ fields, data: rows.map((r) => fields.map((f) => r[f] ?? '')) })
  writeFileSync(outputPath, csv, 'utf8')
}

// ── Args ─────────────────────────────────────────────────────────────────────

function parseArgs(): { input: string; output: string; model: string; limit: number } {
  const args = process.argv.slice(2)
  const get = (key: string): string | undefined => {
    const flag = args.find((a) => a.startsWith(`--${key}=`))
    return flag ? flag.split('=').slice(1).join('=') : undefined
  }
  const input = get('input')
  if (!input) {
    console.error('Usage: catalogue:generate -- --input=titles.txt [--output=products.csv] [--model=claude-sonnet-4-6] [--limit=N]')
    process.exit(2)
  }
  const output = get('output') ?? './products.csv'
  const model = get('model') ?? DEFAULT_MODEL
  const limit = parseInt(get('limit') ?? '0', 10) || Infinity
  return { input, output, model, limit }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { input, output, model, limit } = parseArgs()
  const inputAbs = resolve(input)
  if (!existsSync(inputAbs)) throw new Error(`Input file not found: ${inputAbs}`)

  const titles = readFileSync(inputAbs, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .slice(0, limit)
  if (titles.length === 0) throw new Error('No titles to process')

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  console.log(`📚 Generating catalogue rows for ${titles.length} titles using ${model}…`)

  const db = new PrismaClient()
  try {
    await ensureHouseBrand(db)
    const taxonomy = await loadTaxonomy(db)
    const allocateSku = await buildSkuAllocator(db)
    const systemPrompt = buildSystemPrompt(taxonomy.categories, taxonomy.brands, taxonomy.templates)
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const rows: CsvRow[] = []
    const failures: { title: string; error: string }[] = []

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]!
      const progress = `[${i + 1}/${titles.length}]`
      try {
        const llm = await callClaude(client, systemPrompt, title, model)
        const sku = allocateSku(llm.category_slug)
        rows.push(buildCsvRow(title, sku, llm))
        console.log(`${progress} ✓ ${sku}  ${title.slice(0, 70)}`)
      } catch (err) {
        const msg = (err as Error).message
        failures.push({ title, error: msg })
        console.warn(`${progress} ✗ ${title.slice(0, 70)}  — ${msg.slice(0, 120)}`)
      }
    }

    const outputAbs = resolve(output)
    writeCsv(rows, outputAbs)
    console.log(`\n✓ Wrote ${rows.length} rows to ${outputAbs}`)
    if (failures.length > 0) {
      const failPath = `${outputAbs}.failures.json`
      writeFileSync(failPath, JSON.stringify(failures, null, 2), 'utf8')
      console.log(`✗ ${failures.length} titles failed; details at ${failPath}`)
    }
  } finally {
    await db.$disconnect()
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
