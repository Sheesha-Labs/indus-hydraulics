import 'server-only'
import {
  effortSignals,
  fitCounts,
  fitSignals,
  legitimacyFromSignals,
  legitimacySignals,
  qualifyVerdict,
  type QualifyVerdict,
  type Signal,
} from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import { changeEnquiryStage } from '../../enquiry/transition'
import {
  gatherQualify,
  type QualifyGathered,
  type StoredQualification,
} from '../../enquiry/qualify'
import {
  PROMPT_VERSION,
  qualifySchema,
  qualifyUser,
  SYSTEM_PARTS,
  type QualifyModelOut,
} from '../prompts/qualify-enquiry.v1'
import { registerAction } from '../registry'
import type { ActionDefinition, Check, EffectContext, ProposalDraft, Verified } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `qualify_enquiry` (S09-T06, board 167, 171b states 1–3): the quick read on a new enquiry.
 *
 *   gather   server/enquiry/qualify.ts: lines and their trades, sender, history, price history, deadline, the
 *            RDAP age and website probe (only the domain leaves). Never the country, region or address.
 *   propose  the signals (ops-core, pure) and one Sonnet call at low effort that weighs them (qualify_enquiry@1)
 *   verify   qualifyVerdict: code decides the confidence (Sure only when no signal is bad and the model agrees)
 *   record   onProposed (Suggest, the seeded level) and effect (Do and tell) write the same thing: the read on the
 *            enquiry through writeTracked, and new → qualifying. A person chooses the path (choose-path.ts).
 *
 * Surface 'hint': the read shows on the enquiry's QualificationCard, not as a Review card.
 */

export interface QualifyOut {
  signals: { legitimacy: Signal[]; fit: Signal[]; effort: Signal[] }
  fit: { fit: number; of: number }
  /** Line numbers the path cards name: OEM-only parts and lines outside the range. */
  lineFacts: { proprietary: number[]; outside: number[] }
  /** From price history, computed in code (AED, whole dirhams); null without history. */
  value: { currency: string; min: number; max: number } | null
  model: QualifyModelOut
  verdict: QualifyVerdict
}

const definition: ActionDefinition<QualifyGathered, QualifyOut> = {
  key: 'qualify_enquiry',
  group: 'enquiries',
  aiPurpose: 'classify',
  external: false,
  concurrencyGroup: 'enquiry',
  surface: 'hint',

  estimate: (input) => ({ chars: 2_500 + input.lineSummaries.length * 200, maxTokens: 900 }),

  async gather({ request }) {
    const input = await gatherQualify(request.subjectId)
    return { input, versions: { enquiry: input.ref, lines: input.version } }
  },

  async propose(input, ai) {
    const signals = {
      legitimacy: legitimacySignals(input.input),
      fit: fitSignals(input.input),
      effort: effortSignals(input.input),
    }
    const line = (s: Signal) => `[${s.mark}] ${s.text}${s.sub ? ` (${s.sub})` : ''}`
    const res = await ai.call({
      route: 'draft',
      effort: 'low',
      purpose: 'classify',
      system: SYSTEM_PARTS,
      user: qualifyUser({
        signals: {
          legitimacy: signals.legitimacy.map(line),
          fit: signals.fit.map(line),
          effort: signals.effort.map(line),
        },
        lines: input.lineSummaries,
      }),
      zod: qualifySchema,
      maxTokens: 900,
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
    return {
      ok: true,
      out: {
        signals,
        fit: fitCounts(input.input),
        lineFacts: {
          proprietary: input.input.lines.filter((l) => l.proprietary).map((l) => l.no),
          outside: input.input.lines.filter((l) => !l.trade || !l.tradeSourced).map((l) => l.no),
        },
        value: input.input.value
          ? {
              currency: input.input.value.currency,
              min: input.input.value.min,
              max: input.input.value.max,
            }
          : null,
        model: res.value,
        // Filled by verify (code decides); propose only carries the model's read.
        verdict: null as unknown as QualifyVerdict,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input): Promise<Verified<QualifyOut>> {
    const verdict = qualifyVerdict({
      legitimacySignals: out.signals.legitimacy,
      fitSignals: out.signals.fit,
      codeLegitimacy: legitimacyFromSignals(out.signals.legitimacy),
      fit: out.fit,
      lineNos: input.input.lines.map((l) => l.no),
      model: out.model,
    })
    const checks: Check[] = [
      { label: 'No country, region or address read', status: 'pass' },
      verdict.notes.length
        ? { label: 'Model read checked by code', status: 'warn', detail: verdict.notes.join('; ') }
        : { label: 'Model read checked by code', status: 'pass' },
      input.input.lines.length
        ? { label: `${input.input.lines.length} lines read`, status: 'pass' }
        : { label: 'No lines on the enquiry', status: 'warn' },
    ]
    return {
      out: { ...out, verdict },
      checks,
      confidence: verdict.pathConfidence,
      ...(verdict.realBuyerQuestion
        ? { unsure: [{ field: 'legitimacy', why: 'Is this a real buyer?' }] }
        : {}),
    }
  },

  toProposal(v, input): ProposalDraft {
    const d = v.out.verdict
    return {
      headline: `${input.ref}: ${PATH_WORD[d.suggestedPath]} · ${CONF[d.pathConfidence]}`,
      reasons: v.out.model.reasons.map((text) => ({ text })),
      preview: {
        legitimacy: `${LEGIT[d.legitimacy]} · ${CONF[d.legitimacyConfidence]}`,
        fit: `Fit ${v.out.fit.fit} of ${v.out.fit.of} · ${CONF[d.fitConfidence]}`,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: d.realBuyerQuestion ? 'Is this a real buyer?' : null,
      onApproveText: 'A person chooses the path on the qualification card',
    }
  },

  async onProposed(tx, verified, ctx) {
    return recordRead(tx, verified, ctx)
  },

  async effect(tx, verified, ctx) {
    return recordRead(tx, verified, ctx)
  },
}

const PATH_WORD: Record<QualifyVerdict['suggestedPath'], string> = {
  quote_fully: 'Quote fully',
  quote_partial: 'Quote what we can, regret the rest',
  ask_client_first: 'Ask the client first',
  regret: 'Regret politely',
  ignore_spam: 'Ignore (spam)',
}
const CONF = { sure: 'Sure', likely: 'Likely', unsure: 'Unsure' } as const
const LEGIT = { legitimate: 'Legitimate', suspicious: 'Suspicious', spam: 'Spam' } as const

/** The read on the enquiry (board 167) and new → qualifying; a later read replaces an earlier one. */
async function recordRead(
  tx: Prisma.TransactionClient,
  v: Verified<QualifyOut>,
  ctx: EffectContext
) {
  const d = v.out.verdict
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: ctx.request.subjectId },
    select: {
      id: true,
      stage: true,
      chosenPath: true,
      suggestedPath: true,
      legitimacy: true,
      estValueMin: true,
    },
  })
  // A path already chosen, or an enquiry already past qualification, keeps what it has.
  if (e.chosenPath || !['new', 'qualifying'].includes(e.stage))
    return { note: 'Quick read skipped: the path was already chosen', undoable: false }
  const stored: StoredQualification = {
    legitimacy: {
      verdict: d.legitimacy,
      confidence: d.legitimacyConfidence,
      signals: v.out.signals.legitimacy,
    },
    fit: {
      fit: v.out.fit.fit,
      of: v.out.fit.of,
      confidence: d.fitConfidence,
      signals: v.out.signals.fit,
      regretLineNos: d.regretLineNos,
      askLineNos: d.askLineNos,
      proprietaryNos: v.out.lineFacts.proprietary,
      outsideNos: v.out.lineFacts.outside,
    },
    effort: {
      signals: v.out.signals.effort,
      reasons: v.out.model.reasons,
      pathConfidence: d.pathConfidence,
      realBuyerQuestion: d.realBuyerQuestion,
      actionId: ctx.actionId,
      readAt: new Date().toISOString(),
    },
  }
  await writeTracked(
    tx,
    {
      actor: { kind: 'assistant' },
      actionId: ctx.actionId,
      enquiryId: e.id,
      subjectType: 'enquiry',
      subjectId: e.id,
      changes: [
        {
          field: 'suggestedPath',
          before: e.suggestedPath,
          after: d.suggestedPath,
          kind: 'decision',
        },
        {
          field: 'legitimacy',
          before: e.legitimacy,
          after: d.legitimacyConfidence,
          kind: 'decision',
        },
      ],
      note: `Quick read: ${LEGIT[d.legitimacy]} · ${PATH_WORD[d.suggestedPath]} suggested`,
    },
    (t) =>
      t.enquiry.update({
        where: { id: e.id },
        data: {
          legitimacy: d.legitimacyConfidence,
          legitimacyNotes: stored.legitimacy as unknown as Prisma.InputJsonValue,
          fitNotes: stored.fit as unknown as Prisma.InputJsonValue,
          effortNotes: stored.effort as unknown as Prisma.InputJsonValue,
          suggestedPath: d.suggestedPath,
          // The estimate from price history, unless a person or a later step already set one.
          ...(v.out.value && e.estValueMin === null
            ? {
                estValueMin: String(v.out.value.min),
                estValueMax: String(v.out.value.max),
                estCurrency: v.out.value.currency,
              }
            : {}),
        },
      })
  )
  if (e.stage === 'new')
    await changeEnquiryStage(tx, {
      enquiryId: e.id,
      to: 'qualifying',
      actor: { kind: 'assistant' },
      actionId: ctx.actionId,
      note: 'Quick read landed',
    })
  return { note: `Quick read: ${PATH_WORD[d.suggestedPath]} suggested`, undoable: false }
}

registerAction(definition)
export default definition
