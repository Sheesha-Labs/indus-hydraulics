/**
 * Run supplier research in the request, for deployments with no background jobs.
 *
 * Inngest is documented as a no-op without `INNGEST_EVENT_KEY`: it accepts the
 * send and drops it (INNGEST_SETUP.md). A feature that fans out into that void
 * creates a run row that never starts, and the "already running" guard then
 * disables the button forever. This is the fallback that keeps the feature
 * usable until background jobs are connected.
 *
 * It is deliberately CAPPED. Each item costs two Claude calls plus web search —
 * tens of seconds — against a 300s function ceiling. Rather than start six
 * items and get killed halfway through the fourth, it does a few properly, says
 * so, and leaves the rest queued for the background path.
 */

import { db } from '@indus/db'
import {
  buildItemSignature,
  rankSuppliers,
  reachableCount,
  type SupplierCandidate,
} from '@indus/domain'

import { researchSuppliers, type ResearchedCandidate } from './supplier-research'

/** Fits comfortably inside the 300s ceiling with room for a slow search. */
const MAX_INLINE_ITEMS = 3

/** Stop starting new items past this point, whatever the count says. */
const TIME_BUDGET_MS = 200_000

const CACHE_TTL_DAYS = 180
const DESTINATION_COUNTRY = 'AE'

async function toScoreable(researched: ResearchedCandidate[]): Promise<SupplierCandidate[]> {
  const domains = researched.map((c) => c.domain).filter((d): d is string => !!d)
  const known = await db.supplier.findMany({
    where: {
      status: 'active',
      OR: [
        ...(domains.length ? [{ domain: { in: domains } }] : []),
        { name: { in: researched.map((c) => c.name), mode: 'insensitive' as const } },
      ],
    },
    select: {
      id: true, name: true, domain: true, country: true,
      isAuthorizedDistributor: true, rfqsSent: true, repliesReceived: true,
      contacts: { select: { email: true, source: true, verifiedAt: true }, orderBy: { isPrimary: 'desc' }, take: 1 },
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
 * Research up to `MAX_INLINE_ITEMS` lines and settle the run.
 *
 * Each item is persisted as it lands, never in a final aggregate step, so a
 * timeout mid-run still leaves the human with usable lists for what finished.
 */
export async function runResearchInline(researchRunId: string): Promise<void> {
  const startedAt = Date.now()

  const run = await db.researchRun.findUnique({
    where: { id: researchRunId },
    select: { id: true, enquiryId: true },
  })
  if (!run) return

  const lines = await db.enquiryLine.findMany({
    where: { enquiryId: run.enquiryId, reviewStatus: { not: 'rejected' } },
    orderBy: { position: 'asc' },
    select: { id: true, description: true },
  })

  await db.researchRun.update({
    where: { id: researchRunId },
    data: { status: 'running', startedAt: new Date(), itemCount: lines.length },
  })

  const attempt = lines.slice(0, MAX_INLINE_ITEMS)
  const deferred = lines.length - attempt.length
  let failures = 0

  for (const line of attempt) {
    const signature = buildItemSignature(line.description)
    const result = await db.itemResearchResult.upsert({
      where: { researchRunId_enquiryLineId: { researchRunId, enquiryLineId: line.id } },
      create: { researchRunId, enquiryLineId: line.id, signatureHash: signature.signatureHash, status: 'running' },
      update: { status: 'running' },
      select: { id: true },
    })

    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      await db.itemResearchResult.update({
        where: { id: result.id },
        data: { status: 'skipped', error: 'Ran out of time in the request. Re-run to continue.' },
      })
      continue
    }

    try {
      const cached = await db.itemResearchCache.findFirst({
        where: { signatureHash: signature.signatureHash, expiresAt: { gt: new Date() }, qualityScore: { gt: 0 } },
      })
      const researched: ResearchedCandidate[] = cached
        ? ((cached.candidates as unknown as { candidates: ResearchedCandidate[] }).candidates ?? [])
        : (
            await researchSuppliers({
              description: line.description,
              requiredCertifications: signature.standards,
              destinationCountry: DESTINATION_COUNTRY,
            })
          ).candidates

      const ranked = rankSuppliers(await toScoreable(researched), {
        requiredCertifications: signature.standards,
        destinationCountry: DESTINATION_COUNTRY,
      })

      await db.itemResearchResult.update({
        where: { id: result.id },
        data: {
          status: 'completed',
          cacheHit: !!cached,
          candidates: ranked as unknown as object,
          candidateCount: ranked.length,
          reachableCount: reachableCount(ranked),
        },
      })

      if (!cached && researched.length > 0) {
        await db.itemResearchCache.upsert({
          where: { signatureHash: signature.signatureHash },
          create: {
            signatureHash: signature.signatureHash,
            commodityKey: signature.commodityKey,
            candidates: { candidates: researched } as unknown as object,
            candidateCount: researched.length,
            reachableCount: reachableCount(ranked),
            expiresAt: new Date(Date.now() + CACHE_TTL_DAYS * 86_400_000),
          },
          update: {},
        })
      }

      await db.researchRun.update({
        where: { id: researchRunId },
        data: {
          completedCount: { increment: 1 },
          ...(cached ? { cacheHitCount: { increment: 1 } } : {}),
        },
      })
    } catch (error) {
      failures += 1
      await db.itemResearchResult.update({
        where: { id: result.id },
        data: { status: 'failed', error: String(error).slice(0, 500) },
      })
    }
  }

  const note =
    deferred > 0
      ? `Ran ${attempt.length} of ${lines.length} items in the request. Background jobs are not configured, so the rest were not attempted — see INNGEST_SETUP.md.`
      : null

  await db.researchRun.update({
    where: { id: researchRunId },
    data: {
      status: failures === attempt.length && attempt.length > 0 ? 'failed' : deferred > 0 || failures > 0 ? 'partial' : 'completed',
      finishedAt: new Date(),
      ...(note ? { error: note } : {}),
    },
  })
}
