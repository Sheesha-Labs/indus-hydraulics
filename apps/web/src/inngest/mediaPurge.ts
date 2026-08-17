import { db } from '@indus/db'
import { canRemoveStorageObject, canTrash, deriveMediaState } from '@indus/domain'

import { buildMediaUsageIndexFromDb } from '../lib/queries/media-usage'
import { removeFromStorageStrict } from '../lib/supabase-admin'
import { inngest } from './client'

/**
 * Empties the media trash.
 *
 * The library tells the operator a trashed file is kept for 30 days and then
 * removed. Bazar shows the same countdown and has nothing behind it — its own
 * FOLLOWUPS.md records that only a human clicking "Delete permanently" ever
 * frees anything, so the storage bill just grows while the UI implies
 * otherwise. This is the job that makes the sentence true.
 *
 * Every safety rule from the interactive path applies here, and one more: this
 * runs unattended, so where the UI can refuse and let a person decide, the job
 * has to skip and leave the file for the next run.
 */

/** Matches the copy in the library and the trash empty state. */
export const TRASH_RETENTION_DAYS = 30

/**
 * A ceiling per run. Two reasons: an Inngest function has a wall-clock budget,
 * and a bug that trashed a large number of files should not have every one of
 * them destroyed by the first nightly run — a partial purge is recoverable
 * from the remainder, a total one is not.
 */
const MAX_PER_RUN = 100

export const purgeTrashedMedia = inngest.createFunction(
  { id: 'media.trash.purge', concurrency: 1 },
  { cron: '0 3 * * *' }, // 03:00 daily, before the SEO recompute at 04:00
  async ({ step }) => {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000)

    const candidates = await step.run('find-expired', () =>
      db.media.findMany({
        where: { deletedAt: { not: null, lt: cutoff } },
        select: { id: true, storagePath: true, originalFilename: true, bytes: true },
        orderBy: { deletedAt: 'asc' },
        take: MAX_PER_RUN,
      })
    )

    if (candidates.length === 0) {
      return { checked: 0, purged: 0, skipped: 0, bytesFreed: 0 }
    }

    // Usage is re-resolved rather than trusted from when the file was trashed.
    // Thirty days is long enough for someone to have restored a record that
    // references it, or for a draft holding it to have been published.
    const index = await step.run('resolve-usage', async () => {
      const built = await buildMediaUsageIndexFromDb(
        candidates.map((c) => ({ id: c.id, storagePath: c.storagePath }))
      )
      // Maps do not survive Inngest's step serialisation, so hand back a plain
      // object. Losing this quietly would turn every lookup into `undefined`,
      // i.e. "no usages", i.e. delete everything — exactly the failure the
      // whole partial/failedSources contract exists to prevent.
      return {
        partial: built.partial,
        failedSources: built.failedSources,
        byAsset: Object.fromEntries(built.byAsset),
      }
    })

    // A source that failed means "unknown", never "unused". Stop and try again
    // tomorrow rather than delete on an incomplete picture.
    if (index.partial) {
      return {
        checked: candidates.length,
        purged: 0,
        skipped: candidates.length,
        bytesFreed: 0,
        abortedBecause: `usage unavailable: ${index.failedSources.join(', ')}`,
      }
    }

    let purged = 0
    let skipped = 0
    let bytesFreed = 0

    for (const asset of candidates) {
      const usages = index.byAsset[asset.id] ?? []
      const decision = canTrash({
        state: deriveMediaState(usages),
        indexPartial: false,
        usages,
      })
      if (!decision.allowed) {
        // Re-attached while it sat in the trash. Leave it — a human can restore
        // it properly, and it will not come back to this job while it is used.
        skipped++
        continue
      }

      const outcome = await step.run(`purge-${asset.id}`, async () => {
        // storagePath is not unique: several rows can address one object, so
        // the object only goes when nothing else points at it.
        const siblings = await db.media.count({
          where: { storagePath: asset.storagePath, id: { not: asset.id } },
        })
        if (canRemoveStorageObject({ otherRowsSharingPath: siblings })) {
          const removal = await removeFromStorageStrict(asset.storagePath)
          // Abort this file only. A storage blip should not stop the run, and
          // the file stays in the trash for tomorrow.
          if (!removal.ok) return { deleted: false, reason: removal.message }
        }
        await db.media.delete({ where: { id: asset.id } })
        return { deleted: true }
      })

      if (outcome.deleted) {
        purged++
        bytesFreed += asset.bytes
      } else {
        skipped++
      }
    }

    return {
      checked: candidates.length,
      purged,
      skipped,
      bytesFreed,
      // Surfaced so a growing backlog is visible in the Inngest run history
      // rather than only in a storage bill.
      moreRemaining: candidates.length === MAX_PER_RUN,
    }
  }
)
