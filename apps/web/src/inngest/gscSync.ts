import { db } from '@indus/db'
import { gscSyncWindow, type GscDailyRow, type GscDimensionMode } from '@indus/domain'
import { inngest } from './client'
import { fetchGscPage, readGscConfig } from '../lib/gsc'

/**
 * Nightly Search Console sync.
 *
 * The property has been verified since before this job existed, so Google has
 * been accumulating data the whole time — a first run backfills roughly the
 * full retention window rather than starting from zero.
 *
 * Runs at 05:00, an hour after the SEO health recompute, so the two are not
 * competing for the same connection pool.
 *
 * The whole job is a no-op when the credential is absent, which is the state
 * it ships in. It logs why and returns rather than failing, because a red
 * cron every night for a feature nobody has configured yet is noise that
 * trains people to ignore the alerts that matter.
 */

const CHUNK = 500

async function writeRows(rows: GscDailyRow[]): Promise<number> {
  let written = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)

    // Upsert rather than createMany: the window deliberately overlaps what is
    // already stored so the settling days get their corrected figures, and an
    // insert would collide on @@unique([url, date, query]).
    await db.$transaction(
      chunk.map((row) =>
        db.gscMetricDaily.upsert({
          where: {
            url_date_query: {
              url: row.url,
              date: new Date(`${row.date}T00:00:00.000Z`),
              query: row.query,
            },
          },
          update: {
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          },
          create: {
            url: row.url,
            date: new Date(`${row.date}T00:00:00.000Z`),
            query: row.query,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          },
        }),
      ),
    )

    written += chunk.length
  }

  return written
}

export const gscDailySync = inngest.createFunction(
  { id: 'gsc.daily.sync', concurrency: 1, retries: 2 },
  { cron: '0 5 * * *' },
  async ({ step, logger }) => {
    const config = await step.run('read-config', async () => {
      const result = readGscConfig()
      return result.ok ? { ok: true as const, siteUrl: result.config.siteUrl } : { ok: false as const, reason: result.reason }
    })

    if (!config.ok) {
      logger.info(`gsc.daily.sync skipped: ${config.reason}`)
      return { skipped: true, reason: config.reason }
    }

    const window = await step.run('compute-window', async () => {
      const latest = await db.gscMetricDaily.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      })
      return gscSyncWindow(new Date(), latest?.date ?? null)
    })

    if (!window) {
      logger.info('gsc.daily.sync: nothing new to fetch')
      return { skipped: true, reason: 'up to date' }
    }

    const counts: Record<GscDimensionMode, number> = { page: 0, page_query: 0 }

    // Page totals and page+query are separate requests because Search Console
    // omits queries below a privacy threshold — the per-query rows for a page
    // do not sum to that page's real total, so both dimension sets are needed
    // and neither can be derived from the other.
    for (const mode of ['page', 'page_query'] as const) {
      let startRow = 0
      let more = true
      let guard = 0

      while (more && guard < 40) {
        const page = await step.run(`fetch-${mode}-${startRow}`, async () => {
          const fresh = readGscConfig()
          if (!fresh.ok) throw new Error(fresh.reason)
          return fetchGscPage(fresh.config, window, mode, startRow)
        })

        if (page.rows.length) {
          counts[mode] += await step.run(`write-${mode}-${startRow}`, () => writeRows(page.rows))
        }

        more = page.hasMore
        startRow += page.rows.length
        guard += 1
      }

      if (guard >= 40) {
        logger.warn(`gsc.daily.sync: ${mode} hit the pagination guard — some rows were not fetched`)
      }
    }

    logger.info(
      `gsc.daily.sync: ${window.startDate}..${window.endDate} — ${counts.page} page rows, ${counts.page_query} query rows`,
    )

    return { window, pageRows: counts.page, queryRows: counts.page_query }
  },
)
