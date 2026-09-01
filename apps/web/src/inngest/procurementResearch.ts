/**
 * Supplier research fan-out.
 *
 * One orchestrator per enquiry, one child run per item. Fan-out rather than a
 * loop because the median response window on these enquiries is 1.2 days: a
 * five-item enquiry researched serially takes ten minutes and loses the whole
 * run's work to a single failure, and it cannot fit inside the maxDuration=300
 * on the Inngest route.
 *
 * Every item's result row is written the MOMENT it lands, never in a final
 * aggregate step. A partial failure must still leave the human with usable
 * lists for the items that did finish.
 *
 * Concurrency is capped deliberately. Unbounded fan-out exhausts the Supabase
 * pooler's client limit, which surfaces as a connection error that reads like a
 * code bug and is not.
 */

import { db } from '@indus/db'
import {
  buildItemSignature,
  rankSuppliers,
  reachableCount,
  type SupplierCandidate,
} from '@indus/domain'
import { NonRetriableError } from 'inngest'

import { researchSuppliers, type ResearchedCandidate } from '../lib/supplier-research'
import { inngest } from './client'

/** Cache entries older than this are re-researched. */
const CACHE_TTL_DAYS = 180

/** Hard ceiling per enquiry, so one huge tender cannot run up an unbounded bill. */
const MAX_ITEMS_PER_RUN = 10

const DESTINATION_COUNTRY = 'AE'

type CachedCandidates = { candidates: ResearchedCandidate[] }

/**
 * Turn researched candidates plus the existing ledger into scoreable rows.
 *
 * Ledger rows win on identity: a researched company whose domain already exists
 * as a Supplier is the SAME supplier, and inherits its relationship and reply
 * history rather than being ranked as a cold candidate.
 */
async function toScoreable(
  researched: ResearchedCandidate[],
): Promise<SupplierCandidate[]> {
  const domains = researched.map((c) => c.domain).filter((d): d is string => !!d)
  const names = researched.map((c) => c.name)

  const known = await db.supplier.findMany({
    where: {
      status: 'active',
      OR: [
        ...(domains.length ? [{ domain: { in: domains } }] : []),
        { name: { in: names, mode: 'insensitive' as const } },
      ],
    },
    select: {
      id: true,
      name: true,
      domain: true,
      country: true,
      isAuthorizedDistributor: true,
      rfqsSent: true,
      repliesReceived: true,
      contacts: {
        select: { email: true, source: true, verifiedAt: true },
        orderBy: { isPrimary: 'desc' },
        take: 1,
      },
    },
  })

  const byDomain = new Map(known.filter((s) => s.domain).map((s) => [s.domain!, s]))
  const byName = new Map(known.map((s) => [s.name.toLowerCase(), s]))

  return researched.map((c) => {
    const match = (c.domain ? byDomain.get(c.domain) : undefined) ?? byName.get(c.name.toLowerCase())
    const contact = match?.contacts[0]

    return {
      supplierId: match?.id ?? null,
      name: match?.name ?? c.name,
      country: c.country ?? match?.country ?? null,
      fit: c.fit,
      isKnownSupplier: !!match,
      isAuthorizedDistributor: match?.isAuthorizedDistributor ?? false,
      rfqsSent: match?.rfqsSent ?? 0,
      repliesReceived: match?.repliesReceived ?? 0,
      certifications: c.certifications,
      contact: contact?.email
        ? {
            hasEmail: true,
            isRoleAddress: /^(sales|info|enquiries|contact|admin)@/i.test(contact.email),
            isGuessed: contact.source === 'pattern_guess',
            verified: !!contact.verifiedAt,
          }
        : null,
    }
  })
}

/**
 * Orchestrator. Reads the run, fans one child event per item, and leaves the
 * children to write their own rows.
 */
export const procurementResearchStart = inngest.createFunction(
  {
    id: 'procurement.research.start',
    concurrency: { limit: 4 },
    retries: 2,
    onFailure: async ({ event, error }) => {
      const runId = (event.data.event.data as { researchRunId?: string }).researchRunId
      if (!runId) return
      await db.researchRun.updateMany({
        where: { id: runId, status: { in: ['queued', 'running'] } },
        data: { status: 'failed', error: String(error).slice(0, 1000), finishedAt: new Date() },
      })
    },
  },
  { event: 'procurement/research.requested' },
  async ({ event, step }) => {
    const { researchRunId } = event.data as { researchRunId: string }

    const lines = await step.run('load-and-mark-running', async () => {
      const run = await db.researchRun.findUnique({
        where: { id: researchRunId },
        select: { id: true, status: true, enquiryId: true },
      })
      if (!run) throw new NonRetriableError(`ResearchRun ${researchRunId} not found`)
      if (run.status !== 'queued') {
        throw new NonRetriableError(`ResearchRun ${researchRunId} is ${run.status}, not queued`)
      }

      // Only lines a human has not rejected. Researching a rejected line spends
      // money on something already known to be wrong.
      const rows = await db.enquiryLine.findMany({
        where: { enquiryId: run.enquiryId, reviewStatus: { not: 'rejected' } },
        orderBy: { position: 'asc' },
        take: MAX_ITEMS_PER_RUN,
        select: { id: true, description: true, certification: true },
      })

      await db.researchRun.update({
        where: { id: researchRunId },
        data: { status: 'running', startedAt: new Date(), itemCount: rows.length },
      })
      return rows
    })

    if (lines.length === 0) {
      await step.run('finish-empty', () =>
        db.researchRun.update({
          where: { id: researchRunId },
          data: { status: 'completed', finishedAt: new Date() },
        }),
      )
      return { items: 0 }
    }

    await step.run('create-result-rows', async () => {
      for (const line of lines) {
        const signature = buildItemSignature(line.description)
        await db.itemResearchResult.upsert({
          where: {
            researchRunId_enquiryLineId: { researchRunId, enquiryLineId: line.id },
          },
          create: {
            researchRunId,
            enquiryLineId: line.id,
            signatureHash: signature.signatureHash,
            status: 'queued',
          },
          update: {},
        })
      }
    })

    await step.sendEvent(
      'fan-out-items',
      lines.map((line) => {
        const signature = buildItemSignature(line.description)
        return {
          name: 'procurement/research.item' as const,
          data: {
            researchRunId,
            enquiryLineId: line.id,
            signatureHash: signature.signatureHash,
            commodityKey: signature.commodityKey,
            description: line.description,
            requiredCertifications: signature.standards,
          },
        }
      }),
    )

    return { items: lines.length }
  },
)

/**
 * Per-item child. One research pass, cached by signature.
 *
 * The second concurrency key pins identical signatures to one at a time, so a
 * ten-line enquiry that repeats the same fitting does not pay for it ten times
 * in parallel — the first run populates the cache and the rest hit it.
 */
export const procurementResearchItem = inngest.createFunction(
  {
    id: 'procurement.research.item',
    concurrency: [{ limit: 8 }, { limit: 1, key: 'event.data.signatureHash' }],
    retries: 2,
    onFailure: async ({ event, error }) => {
      const data = event.data.event.data as { researchRunId?: string; enquiryLineId?: string }
      if (!data.researchRunId || !data.enquiryLineId) return
      await db.itemResearchResult.updateMany({
        where: {
          researchRunId: data.researchRunId,
          enquiryLineId: data.enquiryLineId,
          status: { in: ['queued', 'running'] },
        },
        data: { status: 'failed', error: String(error).slice(0, 1000) },
      })
      await settleRun(data.researchRunId)
    },
  },
  { event: 'procurement/research.item' },
  async ({ event, step }) => {
    const {
      researchRunId,
      enquiryLineId,
      signatureHash,
      commodityKey,
      description,
      requiredCertifications,
    } = event.data as {
      researchRunId: string
      enquiryLineId: string
      signatureHash: string
      commodityKey: string
      description: string
      requiredCertifications: string[]
    }

    const cached = await step.run('check-cache', async () => {
      await db.itemResearchResult.updateMany({
        where: { researchRunId, enquiryLineId },
        data: { status: 'running' },
      })
      const hit = await db.itemResearchCache.findFirst({
        where: { signatureHash, expiresAt: { gt: new Date() }, qualityScore: { gt: 0 } },
      })
      if (!hit) return null
      await db.itemResearchCache.update({
        where: { id: hit.id },
        data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
      })
      return hit.candidates as unknown as CachedCandidates
    })

    let researched: ResearchedCandidate[]
    let cost = 0
    let toolError: string | null = null

    if (cached) {
      researched = cached.candidates ?? []
    } else {
      // Split from persistence so a slow search does not hold a DB step open,
      // and so a retry re-searches rather than replaying a half-written row.
      const found = await step.run('web-research', () =>
        researchSuppliers({
          description,
          requiredCertifications,
          destinationCountry: DESTINATION_COUNTRY,
        }),
      )
      researched = found.candidates
      cost = found.costUsdMicros
      toolError = found.toolError
    }

    await step.run('score-and-persist', async () => {
      const scoreable = await toScoreable(researched)
      const ranked = rankSuppliers(scoreable, {
        requiredCertifications,
        destinationCountry: DESTINATION_COUNTRY,
      })
      const reachable = reachableCount(ranked)

      await db.itemResearchResult.updateMany({
        where: { researchRunId, enquiryLineId },
        data: {
          status: 'completed',
          cacheHit: !!cached,
          candidates: ranked as unknown as object,
          candidateCount: ranked.length,
          reachableCount: reachable,
          costUsdMicros: cost,
          error: toolError,
        },
      })

      // Cache the RAW research, not the ranking: ranking depends on the
      // requesting line's certification requirements and on ledger state that
      // moves, so a cached ranking would go stale in a way raw candidates do not.
      if (!cached && researched.length > 0) {
        const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86_400_000)
        await db.itemResearchCache.upsert({
          where: { signatureHash },
          create: {
            signatureHash,
            commodityKey,
            candidates: { candidates: researched } as unknown as object,
            candidateCount: researched.length,
            reachableCount: reachable,
            expiresAt,
          },
          update: {
            candidates: { candidates: researched } as unknown as object,
            candidateCount: researched.length,
            reachableCount: reachable,
            expiresAt,
          },
        })
      }

      await db.researchRun.update({
        where: { id: researchRunId },
        data: {
          completedCount: { increment: 1 },
          costUsdMicros: { increment: cost },
          ...(cached ? { cacheHitCount: { increment: 1 } } : {}),
        },
      })
    })

    await step.run('settle-run', () => settleRun(researchRunId))

    return { candidates: researched.length, cacheHit: !!cached }
  },
)

/**
 * Close the run once every item has stopped moving.
 *
 * `partial` rather than `failed` when some items succeeded — the human still
 * has usable lists and the screen should say so.
 */
async function settleRun(researchRunId: string): Promise<{ status: string } | null> {
  const results = await db.itemResearchResult.findMany({
    where: { researchRunId },
    select: { status: true },
  })
  if (results.length === 0) return null
  if (results.some((r) => r.status === 'queued' || r.status === 'running')) return null

  const failed = results.filter((r) => r.status === 'failed').length
  const status = failed === 0 ? 'completed' : failed === results.length ? 'failed' : 'partial'

  await db.researchRun.updateMany({
    where: { id: researchRunId, status: 'running' },
    data: { status, finishedAt: new Date() },
  })
  return { status }
}
