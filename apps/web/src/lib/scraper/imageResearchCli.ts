#!/usr/bin/env tsx

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { db, nextScrapeCode, Prisma } from '@indus/db'
import {
  IMAGE_RESEARCH_BRANDS,
  researchProductImages,
  resolveImageSelections,
  type ResearchProduct,
  type ResearchedProduct,
} from './imageResearch'

type Args = {
  apply: boolean
  autoSelect: boolean
  limit: number
  output: string
  concurrency: number
  reuse: string | null
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let rawResearch: ResearchedProduct[]
  if (args.reuse) {
    const reused = JSON.parse(await readFile(resolve(args.reuse), 'utf8')) as {
      products: ResearchedProduct[]
    }
    rawResearch = reused.products
    process.stderr.write(`Reusing ${rawResearch.length} researched products from ${args.reuse}\n`)
  } else {
    const products = await selectCohort(args.limit)
    process.stderr.write(`Researching ${products.length} products with concurrency ${args.concurrency}\n`)
    rawResearch = await mapConcurrent(products, args.concurrency, async (product, index) => {
      try {
        const result = await researchProductImages(product)
        process.stderr.write(
          `[${index + 1}/${products.length}] ${product.sku}: ${result.selected ? `selected score ${result.selected.score}` : 'review required'}\n`,
        )
        return result
      } catch (error) {
        process.stderr.write(
          `[${index + 1}/${products.length}] ${product.sku}: ${(error as Error).message}\n`,
        )
        return { product, query: '', candidates: [], selected: null } satisfies ResearchedProduct
      }
    })
  }
  const researched = resolveImageSelections(rawResearch)

  const summary = {
    generatedAt: new Date().toISOString(),
    productCount: researched.length,
    selectedCount: researched.filter((row) => row.selected).length,
    reviewCount: researched.filter((row) => !row.selected).length,
    products: researched,
  }
  const outputPath = resolve(args.output)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')

  if (!args.apply) {
    console.log(JSON.stringify({ ...summary, products: undefined, outputPath }, null, 2))
    return
  }

  const job = await createResearchJob(researched, args.autoSelect)
  console.log(
    JSON.stringify(
      {
        outputPath,
        jobId: job.id,
        jobCode: job.code,
        rows: researched.length,
        selected: args.autoSelect ? researched.filter((row) => row.selected).length : 0,
      },
      null,
      2,
    ),
  )
}

async function selectCohort(limit: number): Promise<ResearchProduct[]> {
  const preferred = await db.product.findMany({
    where: {
      status: 'active',
      images: { none: {} },
      brand: { name: { in: [...IMAGE_RESEARCH_BRANDS] } },
      NOT: [{ title: { contains: 'test', mode: 'insensitive' } }],
    },
    select: {
      id: true,
      sku: true,
      mpn: true,
      title: true,
      slug: true,
      brandId: true,
      categoryId: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ brand: { name: 'asc' } }, { title: 'asc' }],
    take: limit,
  })

  const rows = preferred.map(toResearchProduct)
  if (rows.length >= limit) return rows.slice(0, limit)

  const fill = await db.product.findMany({
    where: {
      status: 'active',
      images: { none: {} },
      id: { notIn: rows.map((row) => row.id) },
      mpn: { not: null },
      brand: { name: { in: ['Parker Hannifin', 'Manuli', 'Continental'] } },
    },
    select: {
      id: true,
      sku: true,
      mpn: true,
      title: true,
      slug: true,
      brandId: true,
      categoryId: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ contentScore: 'desc' }, { title: 'asc' }],
    take: limit - rows.length,
  })
  return [...rows, ...fill.map(toResearchProduct)].slice(0, limit)
}

async function createResearchJob(rows: ResearchedProduct[], autoSelect: boolean) {
  const creator = await db.staffUser.findFirst({
    where: { isActive: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: { id: true },
  })
  if (!creator) throw new Error('No active staff user exists to own the research job')

  const code = await nextScrapeCode()
  const job = await db.scraperJob.create({
    data: {
      code,
      sourceUrl: 'https://duckduckgo.com/?q=indus-hydraulics-product-image-research',
      hostname: 'duckduckgo.com',
      status: 'completed',
      startedAt: new Date(),
      finishedAt: new Date(),
      totalFound: rows.length,
      createdByStaffId: creator.id,
      notes: 'Automated image research for the first 100 existing catalogue products.',
      options: {
        workflow: 'catalogue-image-research-v1',
        autoSelect,
      },
    },
  })

  try {
    await db.scrapedProduct.createMany({
      data: rows.map((row) => {
        const selectedUrl = row.selected?.image
        const orderedCandidates = [
          ...(row.selected ? [row.selected] : []),
          ...row.candidates.filter((candidate) => candidate.image !== selectedUrl),
        ]
        const candidates = orderedCandidates.map((candidate, position) => ({
          url: candidate.image,
          position,
          alt: row.product.title,
        }))
        return {
          jobId: job.id,
          sourceUrl: `https://duckduckgo.com/?q=${encodeURIComponent(row.query || row.product.title)}`,
          sourceTitle: row.product.title,
          sourceDescription: `Image research query: ${row.query}`,
          sourceCategoryText: row.product.categoryName,
          sourceBrandText: row.product.brandName,
          sourceSku: row.product.sku,
          candidateImages: candidates as Prisma.InputJsonValue,
          selectionStatus: autoSelect && selectedUrl ? ('selected' as const) : ('pending' as const),
          ingestMode: 'attach_to_existing' as const,
          targetProductId: row.product.id,
          mappedBrandId: row.product.brandId,
          mappedCategoryId: row.product.categoryId,
          editedTitle: row.product.title,
          editedSku: row.product.sku,
          deselectedImageUrls: candidates
            .filter((candidate) => candidate.url !== selectedUrl)
            .map((candidate) => candidate.url),
        }
      }),
    })
    return job
  } catch (error) {
    await db.scraperJob.delete({ where: { id: job.id } }).catch(() => undefined)
    throw error
  }
}

function toResearchProduct(row: {
  id: string
  sku: string
  mpn: string | null
  title: string
  slug: string
  brandId: string | null
  categoryId: string | null
  brand: { name: string } | null
  category: { name: string } | null
}): ResearchProduct {
  return {
    id: row.id,
    sku: row.sku,
    mpn: row.mpn,
    title: row.title,
    slug: row.slug,
    brandId: row.brandId,
    brandName: row.brand?.name ?? null,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index]!, index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()))
  return results
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    apply: false,
    autoSelect: false,
    limit: 100,
    concurrency: 2,
    output: '../../data/catalogue-enrichment/first-100-image-research.json',
    reuse: null,
  }
  for (const arg of argv) {
    if (arg === '--apply') args.apply = true
    else if (arg === '--auto-select') args.autoSelect = true
    else if (arg.startsWith('--limit=')) args.limit = positiveInt(arg.slice(8), args.limit)
    else if (arg.startsWith('--concurrency=')) {
      args.concurrency = Math.min(4, positiveInt(arg.slice(14), args.concurrency))
    } else if (arg.startsWith('--output=')) args.output = arg.slice(9)
    else if (arg.startsWith('--reuse=')) args.reuse = arg.slice(8)
  }
  return args
}

function positiveInt(raw: string, fallback: number): number {
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
