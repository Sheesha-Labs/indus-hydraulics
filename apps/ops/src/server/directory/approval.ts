import 'server-only'
import {
  canApprove,
  outstandingKinds,
  reproposeAfter,
  screeningComplete,
  type Decision,
} from '@indus/ops-core'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { AccessError, type OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { getSettingIn } from '../settings/get'
import { supplierRequiredDocuments } from './onboarding'

/**
 * Supplier approval (S10-T05, board 51; architecture §1.2: Owner-only decisions). The Helper proposes (submit for
 * review) and can be sent back; the Owner decides: approve (tier approved), approve on trial (tier trial with the
 * P09 limits and conditions from open documents) or reject (reason required; re-proposal after 6 months). Every
 * decision is a supplier_approval row (insert-only) and activity. Tiers change only here and in T07 (promote, block).
 */
type Tx = Prisma.TransactionClient

async function profile(tx: Tx, supplierId: string) {
  const p = await tx.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true, onboardingStatus: true, reproposeAfter: true, rejectReason: true },
  })
  if (!p) throw new SafeError('That supplier is no longer here.')
  return p
}

async function record(
  tx: Tx,
  i: {
    supplierId: string
    decision: string
    fromTier: $Enums.SupplierTier | null
    toTier: $Enums.SupplierTier | null
    reason?: string | null
    conditions?: string[]
    user: Pick<OpsUser, 'id'> | null
    actionId?: string | null
  }
) {
  await tx.supplierApproval.create({
    data: {
      supplierId: i.supplierId,
      decision: i.decision,
      fromTier: i.fromTier,
      toTier: i.toTier,
      reason: i.reason ?? null,
      conditions: i.conditions ?? [],
      decidedById: i.user?.id ?? null,
      actionId: i.actionId ?? null,
    },
  })
}

/** The Helper (or Owner) puts the draft in front of the Owner: draft → under_review. */
export async function submitForReview(
  tx: Tx,
  supplierId: string,
  user: Pick<OpsUser, 'id'>,
  note?: string
): Promise<void> {
  const p = await profile(tx, supplierId)
  if (!['draft', 'proposed', 'rejected'].includes(p.onboardingStatus ?? ''))
    throw new SafeError('This supplier is not waiting to be proposed.')
  if (p.onboardingStatus === 'rejected' && p.reproposeAfter && p.reproposeAfter > new Date())
    throw new SafeError(
      `This supplier can be proposed again from ${p.reproposeAfter.toISOString().slice(0, 10)}.`
    )
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        {
          field: 'onboardingStatus',
          before: p.onboardingStatus,
          after: 'under_review',
          kind: 'supplier',
        },
      ],
      note: note ?? 'Recommended for approval',
    },
    (t) =>
      t.supplierProfile.update({
        where: { companyId: supplierId },
        data: { onboardingStatus: 'under_review' },
      })
  )
  await record(tx, {
    supplierId,
    decision: 'propose',
    fromTier: p.tier,
    toTier: p.tier,
    reason: note ?? null,
    user,
  })
}

/** Back to the Helper with a reason: under_review → draft. */
export async function sendBack(
  tx: Tx,
  supplierId: string,
  reason: string,
  user: Pick<OpsUser, 'id' | 'role'>
): Promise<void> {
  if (user.role !== 'owner') throw new AccessError('forbidden')
  if (!reason.trim()) throw new SafeError('Say what is missing.')
  const p = await profile(tx, supplierId)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        { field: 'onboardingStatus', before: p.onboardingStatus, after: 'draft', kind: 'supplier' },
      ],
      note: `Sent back: ${reason.trim()}`,
    },
    (t) =>
      t.supplierProfile.update({
        where: { companyId: supplierId },
        data: { onboardingStatus: 'draft' },
      })
  )
  await record(tx, {
    supplierId,
    decision: 'send_back',
    fromTier: p.tier,
    toTier: p.tier,
    reason,
    user,
  })
}

/** What the decision step needs to know (screening, bank, open documents), and whether each decision is allowed. */
export async function decisionFacts(supplierId: string, db: Tx | typeof opsDb = opsDb) {
  const [checks, verified, docs] = await Promise.all([
    db.screeningCheck.findMany({
      where: { companyId: supplierId, listName: { not: null } },
      orderBy: { checkedAt: 'asc' },
      select: { listName: true, result: true },
    }),
    db.supplierBankAccount.count({
      where: { supplierId, status: 'verified', supersededAt: null, callbackOutcome: 'genuine' },
    }),
    supplierRequiredDocuments(supplierId, db),
  ])
  const screening = screeningComplete(
    checks.map((c) => ({ listName: c.listName!, result: c.result as never }))
  )
  const openDocuments = outstandingKinds(docs.rows)
  return {
    screening,
    bankVerified: verified > 0,
    openDocuments,
    allowed: Object.fromEntries(
      (['approve', 'approve_trial'] as const).map((d) => [
        d,
        canApprove({ decision: d, screening, bankVerified: verified > 0, openDocuments }),
      ])
    ) as Record<'approve' | 'approve_trial', ReturnType<typeof canApprove>>,
  }
}

/** The Owner's decision. */
export async function decide(
  tx: Tx,
  supplierId: string,
  decision: Decision,
  user: Pick<OpsUser, 'id' | 'role'>,
  reason?: string | null
): Promise<{ tier: string; onboarding: string; conditions: string[] }> {
  if (user.role !== 'owner') throw new AccessError('forbidden')
  const p = await profile(tx, supplierId)
  if (p.tier === 'blocked') throw new SafeError('A blocked supplier is unblocked first.')
  const facts = await decisionFacts(supplierId, tx)
  const check = canApprove({ decision, ...facts, rejectReason: reason ?? null })
  if (!check.allowed) throw new SafeError(check.reasons.join('. '))
  const trust = await getSettingIn(tx, 'suppliers.trust')
  const now = new Date()
  const next =
    decision === 'approve'
      ? { tier: 'approved' as const, onboarding: 'approved' as const }
      : decision === 'approve_trial'
        ? { tier: 'trial' as const, onboarding: 'approved_trial' as const }
        : { tier: p.tier, onboarding: 'rejected' as const }
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        { field: 'tier', before: p.tier, after: next.tier, kind: 'decision' },
        {
          field: 'onboardingStatus',
          before: p.onboardingStatus,
          after: next.onboarding,
          kind: 'decision',
        },
      ],
      note:
        decision === 'reject'
          ? `Rejected: ${reason}`
          : decision === 'approve_trial'
            ? `Approved on trial: first ${trust.trialPos} POs, each up to USD ${trust.trialPerPoUsd.toLocaleString('en-US')}${check.conditions.length ? `; ${check.conditions.join('; ')}` : ''}`
            : 'Approved',
    },
    (t) =>
      t.supplierProfile.update({
        where: { companyId: supplierId },
        data: {
          tier: next.tier,
          onboardingStatus: next.onboarding,
          ...(next.tier !== p.tier ? { tierSince: now } : {}),
          ...(decision === 'approve_trial'
            ? {
                trialPoLimit: trust.trialPos,
                trialPoMaxAmount: trust.trialPerPoUsd,
                trialPoMaxCurrency: 'USD',
                trialTpiEachPo: trust.trialTpiEachPo,
                trialPosUsed: 0,
              }
            : {}),
          ...(decision === 'reject'
            ? {
                rejectReason: reason!.trim(),
                reproposeAfter: reproposeAfter(now, trust.reproposeMonths),
              }
            : { rejectReason: null, reproposeAfter: null }),
        },
      })
  )
  await record(tx, {
    supplierId,
    decision,
    fromTier: p.tier,
    toTier: next.tier,
    reason: reason ?? null,
    conditions: check.conditions,
    user,
  })
  return { tier: next.tier, onboarding: next.onboarding, conditions: check.conditions }
}

/** Board 51's checks timeline: proposed → documents → bank → decision, from the approval rows and the records. */
export async function approvalTimeline(supplierId: string) {
  const rows = await opsDb.supplierApproval.findMany({
    where: { supplierId },
    orderBy: { decidedAt: 'asc' },
    select: { decision: true, reason: true, decidedAt: true, decidedById: true, conditions: true },
  })
  const users = await opsDb.user.findMany({
    where: { id: { in: rows.flatMap((r) => (r.decidedById ? [r.decidedById] : [])) } },
    select: { id: true, name: true, initials: true },
  })
  return rows.map((r) => ({ ...r, by: users.find((u) => u.id === r.decidedById) ?? null }))
}
