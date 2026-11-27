import 'server-only'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import { AccessError, type OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'

/**
 * Block a supplier (S10-T07, board 131; ADR-13). The effects are listed before confirming and the same list is
 * applied: draft RFQ recipients are withdrawn, sent RFQs are recorded for withdrawal (S14 sends the withdrawal),
 * open POs stay and are flagged, payments will need a call-back. Nothing is sent to the supplier. Not for sanctions
 * alone (a screening hit is a decision in vetting). Unblock is the Owner's; the reason stays on record.
 */
type Tx = Prisma.TransactionClient

export const BLOCK_REASONS = [
  'fake_company',
  'counterfeit',
  'payment_fraud_attempt',
  'persistent_non_delivery',
  'quality_failure',
] as const
export const BLOCK_REASON_WORD: Record<(typeof BLOCK_REASONS)[number], string> = {
  fake_company: 'Fake company',
  counterfeit: 'Counterfeit',
  payment_fraud_attempt: 'Payment fraud attempt',
  persistent_non_delivery: 'Persistent non-delivery',
  quality_failure: 'Quality failure',
}

export const blockSchema = z.object({
  reason: z.enum(BLOCK_REASONS),
  note: z.string().trim().max(500).optional(),
  evidence: z.array(z.string().trim().max(300)).max(10).default([]),
})
export type BlockInput = z.infer<typeof blockSchema>

const DRAFT: $Enums.RecipientStatus[] = ['draft', 'awaiting_approval', 'scheduled']
const SENT: $Enums.RecipientStatus[] = [
  'sent',
  'opened',
  'auto_reply',
  'replied_question',
  'partial_quote',
]
const OPEN_PO: $Enums.SupplierPoStatus[] = [
  'draft',
  'awaiting_approval',
  'approved',
  'sent',
  'acknowledged',
  'in_production',
  'ready',
  'inspected',
  'shipped',
]

export interface BlockEffects {
  draftRecipients: Array<{ id: string; rfq: string }>
  sentRfqs: Array<{ id: string; rfq: string }>
  pos: Array<{ id: string; number: string | null }>
  payments: number
}

export async function previewBlockEffects(
  supplierId: string,
  db: Pick<Tx, 'supplierRfqRecipient' | 'supplierPo' | 'supplierPayment'> = opsDb
): Promise<BlockEffects> {
  const [drafts, sent, pos, payments] = await Promise.all([
    db.supplierRfqRecipient.findMany({
      where: { supplierId, status: { in: DRAFT } },
      select: { id: true, rfq: { select: { ref: true } } },
    }),
    db.supplierRfqRecipient.findMany({
      where: { supplierId, status: { in: SENT } },
      select: { id: true, rfq: { select: { ref: true } } },
    }),
    db.supplierPo.findMany({
      where: { supplierId, status: { in: OPEN_PO } },
      select: { id: true, number: true },
    }),
    db.supplierPayment.count({ where: { supplierId, paidAt: null } }),
  ])
  return {
    draftRecipients: drafts.map((d) => ({ id: d.id, rfq: d.rfq.ref })),
    sentRfqs: sent.map((d) => ({ id: d.id, rfq: d.rfq.ref })),
    pos: pos.map((p) => ({ id: p.id, number: p.number })),
    payments,
  }
}

export async function blockSupplier(
  tx: Tx,
  supplierId: string,
  i: BlockInput,
  user: Pick<OpsUser, 'id'>
): Promise<BlockEffects> {
  const p = await tx.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true },
  })
  if (!p) throw new SafeError('That supplier is no longer here.')
  if (p.tier === 'blocked') throw new SafeError('This supplier is already blocked.')
  const effects = await previewBlockEffects(supplierId, tx)
  const now = new Date()
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        { field: 'tier', before: p.tier, after: 'blocked', kind: 'decision' },
        {
          field: 'blockEffects',
          before: null,
          after: {
            withdrawnDrafts: effects.draftRecipients.length,
            sentToWithdraw: effects.sentRfqs.map((s) => s.rfq),
            flaggedPos: effects.pos.map((x) => x.number ?? x.id),
            paymentsNeedCallback: effects.payments,
            evidence: i.evidence,
          },
          kind: 'supplier',
        },
      ],
      note: `Blocked: ${BLOCK_REASON_WORD[i.reason]}${i.note ? ` · ${i.note}` : ''}. Nothing was sent to the supplier.`,
    },
    async (t) => {
      await t.supplierProfile.update({
        where: { companyId: supplierId },
        data: {
          tier: 'blocked',
          tierSince: now,
          blockReason: i.reason,
          blockNote: i.note || null,
          blockedAt: now,
          blockedById: user.id,
        },
      })
      if (effects.draftRecipients.length)
        await t.supplierRfqRecipient.updateMany({
          where: { id: { in: effects.draftRecipients.map((d) => d.id) } },
          data: { status: 'withdrawn' },
        })
      await t.supplierApproval.create({
        data: {
          supplierId,
          decision: 'block',
          fromTier: p.tier,
          toTier: 'blocked',
          reason: `${BLOCK_REASON_WORD[i.reason]}${i.note ? ` · ${i.note}` : ''}`,
          decidedById: user.id,
          conditions: i.evidence,
        },
      })
    }
  )
  return effects
}

/** Owner only. The tier goes back to what it was before the block; the block stays on record. */
export async function unblockSupplier(
  tx: Tx,
  supplierId: string,
  reason: string,
  user: Pick<OpsUser, 'id' | 'role'>
): Promise<{ tier: string }> {
  if (user.role !== 'owner') throw new AccessError('forbidden')
  if (!reason.trim()) throw new SafeError('Say why the block is lifted.')
  const p = await tx.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true },
  })
  if (p?.tier !== 'blocked') throw new SafeError('This supplier is not blocked.')
  const last = await tx.supplierApproval.findFirst({
    where: { supplierId, decision: 'block' },
    orderBy: { decidedAt: 'desc' },
    select: { fromTier: true },
  })
  const back = last?.fromTier && last.fromTier !== 'blocked' ? last.fromTier : 'contact_only'
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [{ field: 'tier', before: 'blocked', after: back, kind: 'decision' }],
      note: `Unblocked: ${reason.trim()}`,
    },
    async (t) => {
      await t.supplierProfile.update({
        where: { companyId: supplierId },
        data: { tier: back, tierSince: new Date() },
      })
      await t.supplierApproval.create({
        data: {
          supplierId,
          decision: 'unblock',
          fromTier: 'blocked',
          toTier: back,
          reason: reason.trim(),
          decidedById: user.id,
        },
      })
    }
  )
  return { tier: back }
}
