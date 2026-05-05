/**
 * Stage 3 — Generate technical line-drawing images for products that lack them.
 *
 * Reads products without any ProductImage rows, calls OpenAI's gpt-image-1 with
 * a CAD-style prompt per product, uploads the result to the public Supabase
 * Storage bucket `product-images`, and inserts Media + ProductImage rows in a
 * single transaction.
 *
 * Idempotent: products that already have at least one image are skipped.
 *
 * Run:
 *   pnpm --filter=@indus/db catalogue:images
 *   pnpm --filter=@indus/db catalogue:images -- --limit=10 --quality=medium --sku-prefix=IND-PMP
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolve } from 'node:path'

// Load env from the repo root (pnpm --filter sets cwd to packages/db).
loadEnv({ path: resolve(process.cwd(), '../../.env'), override: false })
loadEnv({ override: false }) // also pick up packages/db/.env if present

// ── Config ───────────────────────────────────────────────────────────────────

const STORAGE_BUCKET = 'product-images'
const IMAGE_MODEL = 'gpt-image-1'
const DEFAULT_SIZE = '1024x1024'
const DEFAULT_QUALITY = 'high' // 'low' | 'medium' | 'high' | 'auto'
const DEFAULT_CONCURRENCY = 4

type ImageQuality = 'low' | 'medium' | 'high' | 'auto'

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildImagePrompt(title: string): string {
  return [
    `Technical engineering line drawing of a ${title}, hydraulic component,`,
    `black ink linework on pure white background, isometric three-quarter view,`,
    `clean uniform line weights, dimensioned-style technical illustration,`,
    `no shading or gradients, no color, no text, no labels, no people,`,
    `mechanical drawing aesthetic, vector-style precision.`,
  ].join(' ')
}

// ── Supabase ─────────────────────────────────────────────────────────────────

function buildSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function uploadPng(
  supabase: SupabaseClient,
  productId: string,
  bytes: Uint8Array,
): Promise<{ storagePath: string; bytes: number }> {
  const objectPath = `products/${productId}/ai-${Date.now()}.png`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, bytes, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/png',
  })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl
  return { storagePath: publicUrl, bytes: bytes.byteLength }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function generateImage(
  client: OpenAI,
  title: string,
  size: string,
  quality: ImageQuality,
): Promise<Uint8Array> {
  const prompt = buildImagePrompt(title)
  const res = await client.images.generate({
    model: IMAGE_MODEL,
    prompt,
    n: 1,
    size: size as '1024x1024' | '1536x1024' | '1024x1536' | 'auto',
    quality,
  })
  const first = res.data?.[0]
  const b64 = first?.b64_json
  if (!b64) throw new Error('OpenAI returned no image data')
  return Uint8Array.from(Buffer.from(b64, 'base64'))
}

// ── DB writes ────────────────────────────────────────────────────────────────

async function attachImageToProduct(
  db: PrismaClient,
  productId: string,
  alt: string,
  storagePath: string,
  bytes: number,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        storagePath,
        kind: 'image',
        mimeType: 'image/png',
        originalFilename: 'ai-generated.png',
        bytes,
        alt,
      },
      select: { id: true },
    })
    await tx.productImage.create({
      data: {
        productId,
        mediaId: media.id,
        position: 0,
        alt,
      },
    })
  })
}

// ── Pool ─────────────────────────────────────────────────────────────────────

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = cursor++
      if (i >= items.length) return
      await worker(items[i]!, i)
    }
  })
  await Promise.all(workers)
}

// ── Args ─────────────────────────────────────────────────────────────────────

type Args = {
  limit: number
  concurrency: number
  size: string
  quality: ImageQuality
  skuPrefix: string | null
  dryRun: boolean
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const get = (key: string): string | undefined => {
    const flag = args.find((a) => a.startsWith(`--${key}=`))
    return flag ? flag.split('=').slice(1).join('=') : undefined
  }
  const has = (key: string): boolean => args.includes(`--${key}`)
  const quality = (get('quality') ?? DEFAULT_QUALITY) as ImageQuality
  if (!['low', 'medium', 'high', 'auto'].includes(quality)) {
    throw new Error(`--quality must be one of low|medium|high|auto`)
  }
  return {
    limit: parseInt(get('limit') ?? '0', 10) || Infinity,
    concurrency: parseInt(get('concurrency') ?? String(DEFAULT_CONCURRENCY), 10),
    size: get('size') ?? DEFAULT_SIZE,
    quality,
    skuPrefix: get('sku-prefix') ?? null,
    dryRun: has('dry-run'),
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs()
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const db = new PrismaClient()
  const supabase = buildSupabase()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const products = await db.product.findMany({
      where: {
        images: { none: {} },
        ...(args.skuPrefix ? { sku: { startsWith: args.skuPrefix } } : {}),
      },
      select: { id: true, sku: true, title: true },
      orderBy: { createdAt: 'asc' },
      ...(args.limit === Infinity ? {} : { take: args.limit }),
    })

    if (products.length === 0) {
      console.log('No products without images. Nothing to do.')
      return
    }

    console.log(
      `🎨 Generating images for ${products.length} products (concurrency=${args.concurrency}, size=${args.size}, quality=${args.quality})…`,
    )
    if (args.dryRun) {
      for (const p of products) console.log(`  - ${p.sku}  ${p.title}`)
      console.log(`(dry-run — no API calls made)`)
      return
    }

    let done = 0
    let failed = 0
    const failures: { sku: string; title: string; error: string }[] = []

    await runPool(products, args.concurrency, async (p) => {
      const tag = `[${++done}/${products.length}]`
      try {
        const bytes = await generateImage(openai, p.title, args.size, args.quality)
        const { storagePath, bytes: size } = await uploadPng(supabase, p.id, bytes)
        await attachImageToProduct(db, p.id, p.title, storagePath, size)
        console.log(`${tag} ✓ ${p.sku}  ${p.title.slice(0, 70)}`)
      } catch (err) {
        failed++
        const msg = (err as Error).message
        failures.push({ sku: p.sku, title: p.title, error: msg })
        console.warn(`${tag} ✗ ${p.sku}  ${p.title.slice(0, 70)} — ${msg.slice(0, 120)}`)
      }
    })

    console.log(`\n✓ ${products.length - failed} succeeded, ✗ ${failed} failed.`)
    if (failures.length > 0) {
      console.log('\nFailures:')
      for (const f of failures) console.log(`  ${f.sku}: ${f.error.slice(0, 200)}`)
    }
  } finally {
    await db.$disconnect()
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
