/**
 * Inngest function: `scraper.job.run`
 *
 * Triggered by the `scraper/job.requested` event when an admin clicks
 * "Start a crawl". The function:
 *
 *   1. Marks the `ScraperJob` as `running`.
 *   2. Discovers product URLs via the adapter (sitemap or paste-list).
 *   3. For each URL: fetches HTML, parses with the adapter, HEAD-probes
 *      candidate images, upserts a `ScrapedProduct` row.
 *   4. Marks the job `completed` (or `failed` on irrecoverable errors).
 *
 * Cancellation: at every step boundary we re-read `ScraperJob.status` and
 * throw `NonRetriableError('cancelled')` if the operator hit cancel.
 *
 * Concurrency: `{ limit: 1, key: 'event.data.host' }` ensures we never run
 * two crawls against the same competitor at the same time — global
 * rate-limit guard across concurrent jobs.
 *
 * Robots.txt: the fetcher (`lib/scraper/fetch.ts`) throws
 * `RobotsDisallowedError` if the target disallows our UA. We map that to
 * `status='failed'` with `errorMessage='robots disallow'` so the operator
 * sees a clear reason.
 */

import { NonRetriableError } from 'inngest'
import { inngest } from './client'
import { db, Prisma } from '@indus/db'
import { crawlUrlList, discoverAndCrawl } from '../lib/scraper/crawl'
import type { CrawlOptions, CrawlResult } from '../lib/scraper/crawl'
import { RobotsDisallowedError } from '../lib/scraper/fetch'
import type { ScrapedProductDraft } from '../lib/scraper/types'

/** Cap on total URLs we'll parse in one job — sanity bound. */
const MAX_URLS_PER_JOB = 500

type ScraperJobEventData = {
  jobId: string
  host: string
}

export const scraperJobRun = inngest.createFunction(
  {
    id: 'scraper.job.run',
    concurrency: { limit: 1, key: 'event.data.host' },
    retries: 2,
  },
  { event: 'scraper/job.requested' },
  async ({ event, step, logger }) => {
    const { jobId } = event.data as ScraperJobEventData

    // 1. Mark running (also verifies job exists and is in a runnable state)
    const job = await step.run('mark-running', async () => {
      const existing = await db.scraperJob.findUnique({ where: { id: jobId } })
      if (!existing) throw new NonRetriableError(`ScraperJob ${jobId} not found`)
      if (existing.status === 'cancelled') {
        throw new NonRetriableError(`ScraperJob ${jobId} was cancelled before running`)
      }
      if (existing.status !== 'queued' && existing.status !== 'running') {
        // Already completed/failed — don't re-run.
        throw new NonRetriableError(
          `ScraperJob ${jobId} is in terminal status ${existing.status}; refusing to re-run`,
        )
      }
      await db.scraperJob.update({
        where: { id: jobId },
        data: { status: 'running', startedAt: new Date(), errorMessage: null },
      })
      return existing
    })

    // urlList from the start-form (paste mode) lives on options.urlList
    const options = (job.options ?? {}) as { urlList?: string[] }
    const explicitUrls = Array.isArray(options.urlList) ? options.urlList.filter(Boolean) : []

    let result: CrawlResult
    try {
      // 2. Discover (sitemap mode) OR use the pasted list directly.
      const crawlOpts: CrawlOptions = {
        maxUrls: MAX_URLS_PER_JOB,
        skipImageProbes: false,
      }
      if (explicitUrls.length > 0) {
        result = await step.run('crawl-url-list', () =>
          crawlUrlList(job.sourceUrl, explicitUrls, crawlOpts),
        )
      } else {
        result = await step.run('crawl-sitemap', () =>
          discoverAndCrawl(job.sourceUrl, crawlOpts),
        )
      }
    } catch (err) {
      // Robots disallow → failed with clear message.
      if (err instanceof RobotsDisallowedError) {
        await step.run('mark-robots-failed', () =>
          db.scraperJob.update({
            where: { id: jobId },
            data: { status: 'failed', finishedAt: new Date(), errorMessage: 'robots disallow' },
          }),
        )
        throw new NonRetriableError('robots.txt disallows our UA for this host')
      }
      throw err // let Inngest retry on transient network errors
    }

    // Check cancellation before persisting (operator may have cancelled mid-crawl)
    const cancelled = await step.run('check-cancelled', async () => {
      const fresh = await db.scraperJob.findUnique({
        where: { id: jobId },
        select: { status: true },
      })
      return fresh?.status === 'cancelled'
    })
    if (cancelled) {
      logger.info('Scraper job cancelled mid-crawl; skipping persist')
      throw new NonRetriableError('cancelled')
    }

    // 3. Persist scraped products in batches.
    const BATCH = 25
    for (let i = 0; i < result.products.length; i += BATCH) {
      const slice = result.products.slice(i, i + BATCH)
      await step.run(`persist-${i / BATCH}`, async () => {
        for (const draft of slice) {
          await upsertScrapedProduct(jobId, draft)
        }
      })
    }

    // 4. Finalize
    await step.run('finalize', () =>
      db.scraperJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          totalFound: result.products.length,
          errorMessage:
            result.errors.length > 0
              ? `Completed with ${result.errors.length} per-URL errors`
              : null,
        },
      }),
    )

    return {
      jobId,
      discovered: result.discoveredUrls.length,
      parsed: result.products.length,
      errors: result.errors.length,
    }
  },
)

async function upsertScrapedProduct(jobId: string, draft: ScrapedProductDraft) {
  await db.scrapedProduct.upsert({
    where: { jobId_sourceUrl: { jobId, sourceUrl: draft.sourceUrl } },
    create: {
      jobId,
      sourceUrl: draft.sourceUrl,
      sourceTitle: draft.title || '(untitled)',
      sourceDescription: draft.description ?? null,
      sourceCategoryText: draft.categoryText ?? null,
      sourceBrandText: draft.brandText ?? null,
      sourceSku: draft.sku ?? null,
      candidateImages: draft.candidateImages as unknown as Prisma.InputJsonValue,
    },
    update: {
      sourceTitle: draft.title || '(untitled)',
      sourceDescription: draft.description ?? null,
      sourceCategoryText: draft.categoryText ?? null,
      sourceBrandText: draft.brandText ?? null,
      sourceSku: draft.sku ?? null,
      candidateImages: draft.candidateImages as unknown as Prisma.InputJsonValue,
    },
  })
}
