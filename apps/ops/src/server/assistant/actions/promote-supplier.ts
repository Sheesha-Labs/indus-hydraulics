import 'server-only'
import { checklistAllowsTrial, tierChecklist, type ChecklistRow } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { getSetting } from '../../settings/get'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `promote_supplier` (S10-T07, board 130). Two kinds, by `request.sourceVersion`:
 *
 *   trial:<n>     Contact only → Trial: the checklist (licence, domain, blocked list, sanctions, bank) with its
 *                 evidence; "Promote <supplier> to Trial so the supplier PO can go." Draft and ask.
 *   approved:<n>  Trial → Approved after the good POs: suggested only, "Approve" / "Not yet".
 *
 * → Principal is not here: the onboarding wizard (50–52) is that path. Tier changes are recorded as supplier_approval
 * 'promote' rows; trialPosUsed is left for S24 to count.
 */
export interface PromoteInput {
  supplierId: string
  name: string
  kind: 'trial' | 'approved'
  tier: string
  rows: ChecklistRow[]
  trial: { pos: number; perPoUsd: number; tpi: boolean }
  posOnTime: number
}
export type PromoteOut = { allowed: boolean }

const definition: ActionDefinition<PromoteInput, PromoteOut> = {
  key: 'promote_supplier',
  group: 'sourcing',
  aiPurpose: 'other',
  external: false,
  concurrencyGroup: 'directory',
  surface: 'review',
  alwaysAsk: { guardrail: 'tier_change', reason: 'A tier change is a person’s decision' },
  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const kind = String(request.sourceVersion).startsWith('approved') ? 'approved' : 'trial'
    const c = await opsDb.company.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: {
        name: true,
        primaryDomain: true,
        supplierProfile: { select: { tier: true, posCount: true, onTimePct: true } },
        complianceDocs: {
          where: { kind: 'trade_licence', status: 'received', archivedAt: null },
          select: { id: true },
        },
        bankAccounts: { where: { supersededAt: null }, select: { status: true } },
        screenings: {
          where: { listName: { not: null } },
          orderBy: { checkedAt: 'desc' },
          take: 10,
          select: { result: true },
        },
      },
    })
    const trust = await getSetting('suppliers.trust')
    const screening = c.screenings.some((s) => s.result === 'hit')
      ? 'hit'
      : c.screenings.length && c.screenings.every((s) => s.result === 'clear')
        ? 'clear'
        : 'open'
    const bank = c.bankAccounts.some((b) => b.status === 'pending_verification')
      ? 'pending'
      : c.bankAccounts.some((b) => b.status === 'verified')
        ? 'verified'
        : 'none'
    const tier = c.supplierProfile?.tier ?? 'contact_only'
    const name = c.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return {
      input: {
        supplierId: request.subjectId,
        name: c.name,
        kind,
        tier,
        rows: tierChecklist({
          licenceEvidence: c.complianceDocs.length > 0,
          domainAgeDays: null,
          domainMatchesName:
            !!c.primaryDomain &&
            name.includes(
              c.primaryDomain
                .split('.')[0]!
                .replace(/[^a-z0-9]/g, '')
                .slice(0, 6)
            ),
          blocked: tier === 'blocked',
          screening,
          bank,
        }),
        trial: { pos: trust.trialPos, perPoUsd: trust.trialPerPoUsd, tpi: trust.trialTpiEachPo },
        posOnTime: Math.round(
          ((c.supplierProfile?.posCount ?? 0) * Number(c.supplierProfile?.onTimePct ?? 0)) / 100
        ),
      },
      versions: {
        tier,
        rows: c.complianceDocs.length + c.bankAccounts.length + c.screenings.length,
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const allowed =
      input.kind === 'trial'
        ? input.tier === 'contact_only' && checklistAllowsTrial(input.rows)
        : input.tier === 'trial'
    return {
      ok: true,
      out: { allowed },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    return {
      out,
      checks: input.rows.map((r) => ({
        label: r.text,
        status: r.mark === 'ok' ? 'pass' : r.mark === 'bad' ? 'fail' : 'warn',
      })),
      confidence: out.allowed ? 'sure' : 'unsure',
      ...(out.allowed
        ? {}
        : {
            unsure: [
              { field: 'tier', why: 'A check fails or the supplier is not in the right tier' },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline:
        input.kind === 'trial'
          ? `Promote ${input.name} to Trial so the supplier PO can go`
          : `${input.name}: ${input.posOnTime} POs on time, no quality issues. Promote to Approved?`,
      reasons: input.rows.map((r) => ({
        text: `${r.mark === 'ok' ? '✓' : r.mark === 'bad' ? '×' : '–'} ${r.text}`,
      })),
      preview:
        input.kind === 'trial'
          ? {
              trial: `First ${input.trial.pos} POs, each up to USD ${input.trial.perPoUsd.toLocaleString('en-US')}${input.trial.tpi ? ', TPI at works' : ''}`,
            }
          : null,
      checks: v.checks,
      confidence: v.confidence,
      onApproveText:
        input.kind === 'trial' ? 'The supplier becomes Trial' : 'The supplier becomes Approved',
      options:
        input.kind === 'approved'
          ? [
              { key: 'approve', label: 'Approve', consequence: 'Tier becomes Approved' },
              {
                key: 'not_yet',
                label: 'Not yet',
                consequence: 'Stays on trial; suggested again after the next PO',
              },
            ]
          : null,
    }
  },

  async effect(tx, v, ctx) {
    if (!v.out.allowed || ctx.chosenOption === 'not_yet') return { note: 'Not promoted' }
    const p = await tx.supplierProfile.findUniqueOrThrow({
      where: { companyId: ctx.request.subjectId },
      select: { tier: true },
    })
    const to = String(ctx.request.sourceVersion).startsWith('approved') ? 'approved' : 'trial'
    await writeTracked(
      tx,
      {
        actor: ctx.decidedById ? { kind: 'user', id: ctx.decidedById } : { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'company',
        subjectId: ctx.request.subjectId,
        changes: [{ field: 'tier', before: p.tier, after: to, kind: 'decision' }],
        note: to === 'trial' ? 'Promoted to Trial' : 'Promoted to Approved',
      },
      async (t) => {
        await t.supplierProfile.update({
          where: { companyId: ctx.request.subjectId },
          data: { tier: to, tierSince: new Date() },
        })
        await t.supplierApproval.create({
          data: {
            supplierId: ctx.request.subjectId,
            decision: 'promote',
            fromTier: p.tier,
            toTier: to,
            decidedById: ctx.decidedById ?? null,
            actionId: ctx.actionId,
          },
        })
      }
    )
    return { note: to === 'trial' ? 'Promoted to Trial' : 'Promoted to Approved' }
  },
}

registerAction(definition)
export default definition
