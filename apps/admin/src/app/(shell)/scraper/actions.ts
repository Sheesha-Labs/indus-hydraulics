'use server'

/**
 * Server actions for the competitor scraper.
 *
 * Phase 3 surface:
 *   - `startScrape`  — validate input, create ScraperJob, enqueue Inngest event
 *   - `cancelJob`    — set status='cancelled' so the Inngest function aborts
 *   - `getJob`       — fetch a job + per-status counts for polling refresh
 *
 * Phases 4-5 add row-level actions (`setRowSelection`, `updateRowMapping`,
 * `ingestRow`, `ingestSelected`, plus attach-mode helpers).
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db, nextScrapeCode, Prisma } from '@indus/db'
import { auth } from '../../../lib/auth'
import { requireRole, ROLES } from '../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../lib/result'
import { inngest } from '../../../inngest/client'
import { slugifyLastPathSegment } from '../../../lib/scraper/sku'
import {
  ingestScrapedProduct,
  ScraperIngestError,
} from '../../../lib/scraper/ingest'

const StartScrapeSchema = z
  .object({
    sourceUrl: z.string().trim().url('Must be a valid URL (https://…)'),
    urlListText: z.string().trim().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.urlListText) {
      const lines = parseUrlList(data.urlListText)
      const invalid = lines.filter((l) => !isValidHttpUrl(l))
      if (invalid.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['urlListText'],
          message: `Invalid URLs: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`,
        })
      }
    }
  })

export async function startScrape(formData: FormData): Promise<Result<{ jobId: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)

    const parsed = StartScrapeSchema.parse({
      sourceUrl: formData.get('sourceUrl'),
      urlListText: formData.get('urlListText') ?? undefined,
      notes: formData.get('notes') ?? undefined,
    })

    const hostname = new URL(parsed.sourceUrl).hostname
    const urlList = parsed.urlListText ? parseUrlList(parsed.urlListText) : []

    const code = await nextScrapeCode()
    const job = await db.scraperJob.create({
      data: {
        code,
        sourceUrl: parsed.sourceUrl,
        hostname,
        status: 'queued',
        createdByStaffId: session.user.id,
        notes: parsed.notes ?? null,
        options: urlList.length > 0 ? { urlList } : {},
      },
      select: { id: true },
    })

    // Enqueue the background crawl. If INNGEST_EVENT_KEY isn't configured
    // (local dev without the Inngest dev server), this becomes a no-op —
    // the job sits in 'queued' until you start `inngest-cli dev`.
    await inngest.send({
      name: 'scraper/job.requested',
      data: { jobId: job.id, host: hostname },
    })

    revalidatePath('/scraper')
    return ok({ jobId: job.id })
  } catch (err) {
    return failFromError(err)
  }
}

export async function cancelJob(jobId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)

    const job = await db.scraperJob.findUnique({
      where: { id: jobId },
      select: { status: true },
    })
    if (!job) return fail('NOT_FOUND', 'Job not found')

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return fail(
        'PRECONDITION_FAILED',
        `Job is already ${job.status} — cancel is only valid for queued or running jobs`,
      )
    }

    await db.scraperJob.update({
      where: { id: jobId },
      data: { status: 'cancelled', finishedAt: new Date() },
    })

    revalidatePath('/scraper')
    revalidatePath(`/scraper/${jobId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export type ScraperJobSnapshot = {
  id: string
  code: string
  hostname: string
  sourceUrl: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalFound: number
  errorMessage: string | null
  startedAt: Date | null
  finishedAt: Date | null
  counts: {
    pending: number
    selected: number
    skipped: number
    ingested: number
    ingest_failed: number
  }
}

export async function getJob(jobId: string): Promise<Result<ScraperJobSnapshot>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)

    const job = await db.scraperJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        code: true,
        hostname: true,
        sourceUrl: true,
        status: true,
        totalFound: true,
        errorMessage: true,
        startedAt: true,
        finishedAt: true,
      },
    })
    if (!job) return fail('NOT_FOUND', 'Job not found')

    const counts = await db.scrapedProduct.groupBy({
      by: ['selectionStatus'],
      where: { jobId },
      _count: { _all: true },
    })
    const countsByStatus = {
      pending: 0,
      selected: 0,
      skipped: 0,
      ingested: 0,
      ingest_failed: 0,
    }
    for (const c of counts) {
      countsByStatus[c.selectionStatus] = c._count._all
    }

    return ok({ ...job, counts: countsByStatus })
  } catch (err) {
    return failFromError(err)
  }
}

// ─── row-level mutations (Phase 4) ─────────────────────────────────────────

const SelectionStatusInput = z.enum(['pending', 'selected', 'skipped'])

export async function setRowSelection(
  scrapedProductId: string,
  status: z.infer<typeof SelectionStatusInput>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)
    const parsed = SelectionStatusInput.parse(status)
    const row = await db.scrapedProduct.findUnique({
      where: { id: scrapedProductId },
      select: { jobId: true, selectionStatus: true },
    })
    if (!row) return fail('NOT_FOUND', 'Scraped product not found')
    if (row.selectionStatus === 'ingested') {
      return fail('PRECONDITION_FAILED', 'Already ingested; selection is locked')
    }
    await db.scrapedProduct.update({
      where: { id: scrapedProductId },
      data: { selectionStatus: parsed },
    })
    revalidatePath(`/scraper/${row.jobId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const IngestModeInput = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('create_new') }),
  z.object({ mode: z.literal('attach_to_existing'), targetProductId: z.string().uuid() }),
])

export async function setRowIngestMode(
  scrapedProductId: string,
  input: z.infer<typeof IngestModeInput>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)
    const parsed = IngestModeInput.parse(input)
    const row = await db.scrapedProduct.findUnique({
      where: { id: scrapedProductId },
      select: { jobId: true, selectionStatus: true },
    })
    if (!row) return fail('NOT_FOUND', 'Scraped product not found')
    if (row.selectionStatus === 'ingested') {
      return fail('PRECONDITION_FAILED', 'Already ingested; mode is locked')
    }
    if (parsed.mode === 'attach_to_existing') {
      const exists = await db.product.findUnique({
        where: { id: parsed.targetProductId },
        select: { id: true },
      })
      if (!exists) return fail('VALIDATION', 'Target product not found')
    }
    await db.scrapedProduct.update({
      where: { id: scrapedProductId },
      data: {
        ingestMode: parsed.mode,
        targetProductId: parsed.mode === 'attach_to_existing' ? parsed.targetProductId : null,
      },
    })
    revalidatePath(`/scraper/${row.jobId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateMappingInput = z.object({
  editedTitle: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  editedSku: z
    .string()
    .trim()
    .max(64)
    .nullable()
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  mappedBrandId: z.string().uuid().nullable().optional(),
  mappedCategoryId: z.string().uuid().nullable().optional(),
  deselectedImageUrls: z.array(z.string().url()).optional(),
})

export async function updateRowMapping(
  scrapedProductId: string,
  input: z.infer<typeof UpdateMappingInput>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)
    const parsed = UpdateMappingInput.parse(input)
    const row = await db.scrapedProduct.findUnique({
      where: { id: scrapedProductId },
      select: { jobId: true, selectionStatus: true },
    })
    if (!row) return fail('NOT_FOUND', 'Scraped product not found')
    if (row.selectionStatus === 'ingested') {
      return fail('PRECONDITION_FAILED', 'Already ingested; mapping is locked')
    }
    const data: Prisma.ScrapedProductUncheckedUpdateInput = {}
    if (parsed.editedTitle !== undefined) data.editedTitle = parsed.editedTitle
    if (parsed.editedSku !== undefined) data.editedSku = parsed.editedSku
    if (parsed.mappedBrandId !== undefined) data.mappedBrandId = parsed.mappedBrandId
    if (parsed.mappedCategoryId !== undefined) data.mappedCategoryId = parsed.mappedCategoryId
    if (parsed.deselectedImageUrls !== undefined) {
      data.deselectedImageUrls = parsed.deselectedImageUrls as unknown as Prisma.InputJsonValue
    }
    await db.scrapedProduct.update({ where: { id: scrapedProductId }, data })
    revalidatePath(`/scraper/${row.jobId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export type AttachSearchHit = {
  id: string
  sku: string
  title: string
  slug: string
  imageCount: number
  brandName: string | null
}

export async function searchProductsForAttach(query: string): Promise<Result<AttachSearchHit[]>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)
    const q = query.trim()
    if (q.length < 2) return ok([])

    const rows = await db.product.findMany({
      where: {
        OR: [
          { sku: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { mpn: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        sku: true,
        title: true,
        slug: true,
        brand: { select: { name: true } },
        _count: { select: { images: true } },
      },
    })
    return ok(
      rows.map((r) => ({
        id: r.id,
        sku: r.sku,
        title: r.title,
        slug: r.slug,
        imageCount: r._count.images,
        brandName: r.brand?.name ?? null,
      })),
    )
  } catch (err) {
    return failFromError(err)
  }
}

// ─── ingest ────────────────────────────────────────────────────────────────

export async function ingestRow(scrapedProductId: string): Promise<Result<{ productId: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)
    const result = await ingestScrapedProduct(scrapedProductId, session.user.id)
    revalidatePath(`/scraper/${result.jobId}`)
    revalidatePath('/products')
    if (!result.isNewProduct) revalidatePath(`/products/${result.productId}/edit`)
    return ok({ productId: result.productId })
  } catch (err) {
    if (err instanceof ScraperIngestError) {
      return fail(err.code, err.message, err.fieldErrors)
    }
    return failFromError(err)
  }
}

export async function skipAllWithExistingSku(
  jobId: string,
): Promise<Result<{ skipped: number }>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)

    // Pull every still-actionable row on the job — we only want to flip
    // rows that haven't been ingested yet (and aren't already skipped).
    const rows = await db.scrapedProduct.findMany({
      where: {
        jobId,
        selectionStatus: { in: ['pending', 'selected'] },
        ingestMode: 'create_new', // attach-mode rows aren't "duplicates" in this sense
      },
      select: { id: true, sourceUrl: true, sourceSku: true, editedSku: true },
    })
    if (rows.length === 0) return ok({ skipped: 0 })

    // Compute effective SKU per row + look them all up in one query.
    const skus = new Map<string, string[]>() // sku → rowIds
    for (const r of rows) {
      const effective = (r.editedSku?.trim() || r.sourceSku?.trim() || slugifyLastPathSegment(r.sourceUrl)).slice(0, 64)
      if (!effective) continue
      const ids = skus.get(effective) ?? []
      ids.push(r.id)
      skus.set(effective, ids)
    }
    if (skus.size === 0) return ok({ skipped: 0 })

    const clashing = await db.product.findMany({
      where: { sku: { in: Array.from(skus.keys()) } },
      select: { sku: true },
    })
    const clashingSkus = new Set(clashing.map((p) => p.sku))
    const rowIdsToSkip = clashing.flatMap((p) => skus.get(p.sku) ?? [])

    if (rowIdsToSkip.length === 0) return ok({ skipped: 0 })

    const result = await db.scrapedProduct.updateMany({
      where: { id: { in: rowIdsToSkip } },
      data: { selectionStatus: 'skipped' },
    })

    // suppress "unused" lint
    void clashingSkus

    revalidatePath(`/scraper/${jobId}`)
    return ok({ skipped: result.count })
  } catch (err) {
    return failFromError(err)
  }
}

export async function ingestSelected(
  jobId: string,
): Promise<Result<{ ingested: number; failed: number; errors: string[] }>> {
  try {
    requireRole(await auth(), ROLES.COMPETITOR_SCRAPE)

    const rows = await db.scrapedProduct.findMany({
      where: { jobId, selectionStatus: 'selected' },
      select: { id: true, sourceTitle: true },
      orderBy: { createdAt: 'asc' },
    })

    let ingested = 0
    let failed = 0
    const errors: string[] = []
    for (const r of rows) {
      const result = await ingestRow(r.id)
      if (result.success) ingested += 1
      else {
        failed += 1
        errors.push(`${r.sourceTitle}: ${result.message}`)
      }
    }
    revalidatePath(`/scraper/${jobId}`)
    return ok({ ingested, failed, errors: errors.slice(0, 10) })
  } catch (err) {
    return failFromError(err)
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function parseUrlList(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

function isValidHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
