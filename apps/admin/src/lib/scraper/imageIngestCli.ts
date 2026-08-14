#!/usr/bin/env tsx

import { db } from '@indus/db'
import { ingestScrapedProduct } from './ingest'

type Args = {
  apply: boolean
  job: string
  concurrency: number
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.job) throw new Error('Pass --job=<job-id-or-code>')

  const job = await db.scraperJob.findFirst({
    where: { OR: [{ id: args.job }, { code: args.job }] },
    select: { id: true, code: true, createdByStaffId: true },
  })
  if (!job) throw new Error(`Scraper job "${args.job}" was not found`)

  const rows = await db.scrapedProduct.findMany({
    where: { jobId: job.id, selectionStatus: 'selected' },
    select: { id: true, sourceTitle: true },
    orderBy: { createdAt: 'asc' },
  })
  const actorId =
    job.createdByStaffId ??
    (
      await db.staffUser.findFirst({
        where: { isActive: true },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
    )?.id
  if (!actorId) throw new Error('No active staff user exists to own imported media')

  if (!args.apply) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          jobId: job.id,
          jobCode: job.code,
          selectedRows: rows.length,
          message: 'Re-run with --apply to ingest the selected images.',
        },
        null,
        2,
      ),
    )
    return
  }

  let ingested = 0
  let failed = 0
  let images = 0
  const errors: string[] = []
  await mapConcurrent(rows, args.concurrency, async (row, index) => {
    try {
      const result = await ingestScrapedProduct(row.id, actorId)
      ingested += 1
      images += result.imageCount
      process.stderr.write(`[${index + 1}/${rows.length}] ${row.sourceTitle}: ingested\n`)
    } catch (error) {
      failed += 1
      const message = (error as Error).message
      errors.push(`${row.sourceTitle}: ${message}`)
      process.stderr.write(`[${index + 1}/${rows.length}] ${row.sourceTitle}: ${message}\n`)
    }
  })

  console.log(
    JSON.stringify(
      {
        jobId: job.id,
        jobCode: job.code,
        selectedRows: rows.length,
        ingested,
        failed,
        images,
        errors: errors.slice(0, 20),
      },
      null,
      2,
    ),
  )
}

async function mapConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor++
      await worker(items[index]!, index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()))
}

function parseArgs(argv: string[]): Args {
  const args: Args = { apply: false, job: '', concurrency: 2 }
  for (const arg of argv) {
    if (arg === '--apply') args.apply = true
    else if (arg.startsWith('--job=')) args.job = arg.slice(6)
    else if (arg.startsWith('--concurrency=')) {
      const parsed = Number.parseInt(arg.slice(14), 10)
      if (Number.isFinite(parsed) && parsed > 0) args.concurrency = Math.min(parsed, 4)
    }
  }
  return args
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
