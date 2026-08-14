import { db } from '@indus/db'
import { scoreFromProduct } from '../product-content-score'
import { slugify, slugifyLastPathSegment } from './sku'
import { deleteScraperImage, uploadScraperImage } from './storage'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const IMAGE_FETCH_TIMEOUT_MS = 30_000

type CandidateImageRow = {
  url: string
  position: number
  alt?: string
  contentType?: string
  bytes?: number
}

type PreparedImage = {
  storagePath: string
  bytes: number
  mimeType: string
  alt: string
  filename: string
  position: number
}

export type ScraperIngestCode =
  | 'NOT_FOUND'
  | 'PRECONDITION_FAILED'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'INTERNAL'

export class ScraperIngestError extends Error {
  constructor(
    readonly code: ScraperIngestCode,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ScraperIngestError'
  }
}

export type ScraperIngestResult = {
  productId: string
  jobId: string
  isNewProduct: boolean
  imageCount: number
  partialErrors: string[]
}

export async function ingestScrapedProduct(
  scrapedProductId: string,
  uploadedByStaffId: string,
): Promise<ScraperIngestResult> {
  const row = await db.scrapedProduct.findUnique({
    where: { id: scrapedProductId },
    select: {
      id: true,
      jobId: true,
      sourceUrl: true,
      sourceTitle: true,
      sourceDescription: true,
      sourceSku: true,
      candidateImages: true,
      deselectedImageUrls: true,
      selectionStatus: true,
      ingestMode: true,
      targetProductId: true,
      editedTitle: true,
      editedSku: true,
      mappedBrandId: true,
      mappedCategoryId: true,
      job: { select: { status: true } },
    },
  })
  if (!row) throw new ScraperIngestError('NOT_FOUND', 'Scraped product not found')
  if (row.selectionStatus === 'ingested') {
    throw new ScraperIngestError('PRECONDITION_FAILED', 'Already ingested')
  }
  if (row.selectionStatus !== 'selected') {
    throw new ScraperIngestError('PRECONDITION_FAILED', 'Row must be marked "selected" to ingest')
  }
  if (row.job.status !== 'completed') {
    throw new ScraperIngestError(
      'PRECONDITION_FAILED',
      `Crawl must be completed before ingesting (current status: ${row.job.status})`,
    )
  }

  const title = row.editedTitle?.trim() || row.sourceTitle.trim() || '(untitled)'
  let productId: string
  let isNewProduct: boolean

  if (row.ingestMode === 'attach_to_existing') {
    if (!row.targetProductId) {
      throw new ScraperIngestError(
        'VALIDATION',
        'Attach mode requires a target product - pick one first',
      )
    }
    const target = await db.product.findUnique({
      where: { id: row.targetProductId },
      select: { id: true },
    })
    if (!target) throw new ScraperIngestError('NOT_FOUND', 'Target product no longer exists')
    productId = target.id
    isNewProduct = false
  } else {
    const sku = (
      row.editedSku?.trim() ||
      row.sourceSku?.trim() ||
      slugifyLastPathSegment(row.sourceUrl)
    ).slice(0, 64)
    if (!sku) {
      throw new ScraperIngestError(
        'VALIDATION',
        'Could not derive a SKU - edit it manually before ingest',
      )
    }

    const skuClash = await db.product.findUnique({ where: { sku }, select: { id: true } })
    if (skuClash) {
      throw new ScraperIngestError(
        'CONFLICT',
        `SKU "${sku}" is already in use - rename it in the form, then retry`,
        { editedSku: ['SKU must be unique'] },
      )
    }
    const description = stripHtml(row.sourceDescription ?? '')
    const created = await db.product.create({
      data: {
        sku,
        title,
        slug: await nextUniqueProductSlug(title),
        status: 'draft',
        brandId: row.mappedBrandId,
        categoryId: row.mappedCategoryId,
        descriptionShort: description ? description.slice(0, 500) : null,
        descriptionLong: description ? `<p>${escapeHtml(description)}</p>` : null,
        seoTitle: title.slice(0, 70),
        seoDescription: description ? description.slice(0, 160) : null,
        focusKeyword: title.slice(0, 120),
      },
      select: { id: true },
    })
    productId = created.id
    isNewProduct = true
  }

  const candidates = ((row.candidateImages ?? []) as unknown as CandidateImageRow[]).slice()
  const deselected = new Set(
    ((row.deselectedImageUrls ?? []) as unknown as string[]).map((url) => url),
  )
  const kept = candidates.filter((candidate) => !deselected.has(candidate.url))
  const titleSlug = slugify(title) || 'image'
  const prepared: PreparedImage[] = []
  const partialErrors: string[] = []

  const existingMax = await db.productImage.aggregate({
    where: { productId },
    _max: { position: true },
  })
  let nextPosition = (existingMax._max.position ?? -1) + 1

  for (let i = 0; i < kept.length; i++) {
    const candidate = kept[i]!
    try {
      const downloaded = await downloadImage(candidate.url)
      if (!downloaded.ok) {
        partialErrors.push(`#${i + 1} ${candidate.url}: ${downloaded.message}`)
        continue
      }
      const ext = extForMime(downloaded.mimeType) ?? extFromUrl(candidate.url) ?? 'jpg'
      const filename = `${titleSlug}-${nextPosition + 1}.${ext}`
      const file = new File([downloaded.buffer], filename, { type: downloaded.mimeType })
      const uploaded = await uploadScraperImage(file, productId, filename)

      prepared.push({
        storagePath: uploaded.storagePath,
        bytes: uploaded.bytes,
        mimeType: uploaded.mimeType,
        alt: candidate.alt?.trim() || title,
        filename,
        position: nextPosition,
      })
      nextPosition += 1
    } catch (error) {
      partialErrors.push(
        `#${i + 1} ${candidate.url}: ${(error as Error).message ?? 'unknown error'}`,
      )
    }
  }

  if (prepared.length === 0) {
    if (isNewProduct) {
      await db.product.delete({ where: { id: productId } }).catch(() => undefined)
    }
    const reason =
      partialErrors.length > 0
        ? `No images could be fetched. ${partialErrors[0]}`
        : 'No images selected to ingest. Toggle at least one image back on, or pick attach mode.'
    await db.scrapedProduct.update({
      where: { id: scrapedProductId },
      data: { selectionStatus: 'ingest_failed', ingestError: reason },
    })
    throw new ScraperIngestError('VALIDATION', reason)
  }

  try {
    await db.$transaction(async (tx) => {
      for (const image of prepared) {
        const media = await tx.media.create({
          data: {
            kind: 'image',
            mimeType: image.mimeType,
            originalFilename: image.filename,
            storagePath: image.storagePath,
            bytes: image.bytes,
            alt: image.alt,
            uploadedById: uploadedByStaffId,
          },
        })
        await tx.productImage.create({
          data: {
            productId,
            mediaId: media.id,
            alt: image.alt,
            position: image.position,
          },
        })
      }
      await tx.scrapedProduct.update({
        where: { id: scrapedProductId },
        data: {
          selectionStatus: 'ingested',
          ingestedProductId: productId,
          ingestedAt: new Date(),
          ingestError:
            partialErrors.length > 0
              ? `Ingested with ${partialErrors.length} per-image error(s): ${partialErrors.slice(0, 3).join('; ')}`
              : null,
        },
      })
    })
  } catch (error) {
    await Promise.allSettled(prepared.map((image) => deleteScraperImage(image.storagePath)))
    if (isNewProduct) {
      await db.product.delete({ where: { id: productId } }).catch(() => undefined)
    }
    await db.scrapedProduct.update({
      where: { id: scrapedProductId },
      data: {
        selectionStatus: 'ingest_failed',
        ingestError: `DB write failed: ${(error as Error).message ?? 'unknown error'}`,
      },
    })
    throw error
  }

  await recomputeContentScore(productId)
  return {
    productId,
    jobId: row.jobId,
    isNewProduct,
    imageCount: prepared.length,
    partialErrors,
  }
}

async function recomputeContentScore(productId: string): Promise<void> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      descriptionShort: true,
      descriptionLong: true,
      brandId: true,
      categoryId: true,
      focusKeyword: true,
      seoTitle: true,
      seoDescription: true,
      weightKg: true,
      countryOfOrigin: true,
      mpn: true,
      _count: {
        select: {
          faqs: true,
          specs: true,
          crossReferences: true,
          documents: true,
          images: true,
        },
      },
    },
  })
  if (!product) return
  await db.product.update({
    where: { id: productId },
    data: { contentScore: scoreFromProduct(product).score },
  })
}

async function nextUniqueProductSlug(title: string): Promise<string> {
  const base = (slugify(title) || `product-${Date.now()}`).slice(0, 80)
  let slug = base
  let suffix = 1
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1
    slug = `${base}-${suffix}`.slice(0, 120)
  }
  return slug
}

async function downloadImage(
  url: string,
): Promise<
  { ok: true; buffer: ArrayBuffer; mimeType: string } | { ok: false; message: string }
> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'IndusHydraulics-Scraper/1.0',
        accept: 'image/*',
      },
    })
    if (!response.ok) return { ok: false, message: `HTTP ${response.status}` }
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        message: `Image exceeds ${MAX_IMAGE_BYTES / 1024 / 1024}MB`,
      }
    }
    const contentType = (response.headers.get('content-type') ?? '')
      .split(';')[0]!
      .trim()
      .toLowerCase()
    if (!ACCEPTED_IMAGE_MIME.has(contentType)) {
      return { ok: false, message: `Unsupported MIME ${contentType || '(missing)'}` }
    }
    return { ok: true, buffer, mimeType: contentType }
  } catch (error) {
    if ((error as Error).name === 'AbortError') return { ok: false, message: 'Timed out' }
    return { ok: false, message: (error as Error).message ?? 'fetch failed' }
  } finally {
    clearTimeout(timeout)
  }
}

function extForMime(mime: string): string | undefined {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return undefined
}

function extFromUrl(url: string): string | undefined {
  try {
    const match = new URL(url).pathname.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/)
    if (!match) return undefined
    return match[1] === 'jpeg' ? 'jpg' : match[1]
  } catch {
    return undefined
  }
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
