import 'server-only'
import {
  checkSummary,
  fillSummary,
  RELIABILITY_MIN_REPLIES,
  reliabilityBasis,
  summaryValues,
  type SupplierStats,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import {
  PROMPT_VERSION,
  summarySchema,
  summaryUser,
  SYSTEM_PARTS,
} from '../prompts/supplier-reliability-summary.v1'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `supplier_reliability_summary` (S10-T03, board 129, Do quietly, internal): the paragraph in the Reliability card.
 * gather reads the figures the nightly job stored; propose asks Sonnet (low effort) for words with placeholders;
 * verify refuses a bare digit or an unknown placeholder (Unsure, nothing written); effect fills the figures in code
 * and writes the paragraph and the basis line. Never shown with fewer than 3 replies.
 */
export interface SummaryInput {
  supplierId: string
  type: string
  tier: string
  stats: SupplierStats
  firstAt: string | null
}
export interface SummaryOut {
  template: string
  text: string
  basis: string
  problem: string | null
}

const definition: ActionDefinition<SummaryInput, SummaryOut> = {
  key: 'supplier_reliability_summary',
  group: 'sourcing',
  aiPurpose: 'summarise',
  external: false,
  concurrencyGroup: 'directory',
  surface: 'hint',

  estimate: () => ({ chars: 1_200, maxTokens: 300 }),

  async gather({ request }) {
    const p = await opsDb.supplierProfile.findUniqueOrThrow({
      where: { companyId: request.subjectId },
      select: {
        type: true,
        tier: true,
        rfqsAsked: true,
        repliesCount: true,
        quotesCount: true,
        regretsCount: true,
        replyRatePct: true,
        medianReplyHours: true,
        linesQuotedPct: true,
        winSharePct: true,
        onTimePct: true,
        posCount: true,
        lastQuoteAt: true,
        firstContactAt: true,
        reliabilityAt: true,
      },
    })
    const n = (v: unknown) => (v === null || v === undefined ? null : Number(v))
    const stats: SupplierStats = {
      rfqsAsked: p.rfqsAsked,
      replies: p.repliesCount,
      quotes: p.quotesCount,
      regrets: p.regretsCount,
      replyRatePct: n(p.replyRatePct),
      medianReplyHours: n(p.medianReplyHours),
      linesQuotedPct: n(p.linesQuotedPct),
      winSharePct: n(p.winSharePct),
      onTimePct: n(p.onTimePct),
      posCount: p.posCount,
      lastQuoteAt: p.lastQuoteAt,
    }
    return {
      input: {
        supplierId: request.subjectId,
        type: p.type.replace(/_/g, ' '),
        tier: p.tier.replace(/_/g, ' '),
        stats,
        firstAt: p.firstContactAt?.toISOString() ?? null,
      },
      versions: { figures: p.reliabilityAt?.toISOString() ?? '' },
    }
  },

  async propose(input, ai) {
    const values = summaryValues(input.stats)
    const basis = reliabilityBasis(input.stats, input.firstAt ? new Date(input.firstAt) : null)
    if (input.stats.replies < RELIABILITY_MIN_REPLIES)
      return {
        ok: true,
        out: { template: '', text: '', basis, problem: 'fewer than 3 replies' },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    const res = await ai.call({
      route: 'draft',
      effort: 'low',
      purpose: 'summarise',
      system: SYSTEM_PARTS,
      user: summaryUser({
        available: Object.keys(values),
        type: input.type,
        tier: input.tier,
        counts:
          `${input.stats.rfqsAsked} requests, ${input.stats.quotes} quotes, ${input.stats.posCount} purchase orders`.replace(
            /\d+/g,
            (m) =>
              Number(m) >= 10 ? 'many' : Number(m) >= 3 ? 'several' : Number(m) > 0 ? 'a few' : 'no'
          ),
      }),
      zod: summarySchema,
      maxTokens: 300,
      promptVersion: PROMPT_VERSION,
    })
    if (!res.ok)
      return {
        ok: false,
        reason: res.reason,
        detail: res.detail,
        costUsd: res.costUsd,
        callIds: res.callIds,
      }
    const template = res.value.paragraph.trim()
    const problem = checkSummary(template, Object.keys(values))
    return {
      ok: true,
      out: { template, text: problem ? '' : fillSummary(template, values), basis, problem },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out) {
    return {
      out,
      checks: [
        out.problem
          ? {
              label: 'Figures filled by code',
              status: 'fail' as const,
              detail: `The paragraph ${out.problem}`,
            }
          : { label: 'Figures filled by code', status: 'pass' as const },
      ],
      confidence: out.problem ? 'unsure' : 'sure',
      ...(out.problem
        ? { unsure: [{ field: 'paragraph', why: `The paragraph ${out.problem}` }] }
        : {}),
    }
  },

  toProposal(v): ProposalDraft {
    return {
      headline: v.out.problem
        ? 'Reliability paragraph not written'
        : 'Reliability paragraph updated',
      reasons: [{ text: v.out.basis }],
      preview: { text: v.out.text },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.problem,
      onApproveText: 'Shows the paragraph on the supplier profile',
    }
  },

  async effect(tx, v, ctx) {
    if (v.out.problem) return { note: `Not written: ${v.out.problem}` }
    const before = await tx.supplierProfile.findUniqueOrThrow({
      where: { companyId: ctx.request.subjectId },
      select: { reliabilitySummary: true },
    })
    const text = `${v.out.text}\n${v.out.basis}`
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'company',
        subjectId: ctx.request.subjectId,
        changes: [
          {
            field: 'reliabilitySummary',
            before: before.reliabilitySummary,
            after: text,
            kind: 'supplier',
          },
        ],
      },
      (t) =>
        t.supplierProfile.update({
          where: { companyId: ctx.request.subjectId },
          data: { reliabilitySummary: text },
        })
    )
    return { note: 'Reliability paragraph updated', undoable: true }
  },
}

registerAction(definition)
export default definition
