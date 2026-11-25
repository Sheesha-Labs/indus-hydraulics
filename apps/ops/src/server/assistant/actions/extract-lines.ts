import 'server-only'
import { lookalikeVariants, parsePrintedDate, partNoNorm } from '@indus/ops-core'
import { buildCandidates, unsureShare, type CandidateDraft } from '../../intake/candidates'
import {
  ESCALATE_UNSURE_SHARE,
  ESCALATION_MODEL,
  EXTRACT_MODEL,
  planChunks,
  runExtraction,
  startingModel,
} from '../../intake/extract'
import {
  loadExtractDocument,
  type ExtractInput,
  loadExtractInput,
} from '../../intake/extract-input'
import { applyBatchFacts, type BatchFacts } from '../../intake/facts'
import { bumpIntake } from '../../intake/live'
import { spanSourceOf } from '../../intake/spans'
import { stageCandidates } from '../../intake/stage'
import { uomTableOf } from '../../intake/units'
import { matchParts, type PartMatch } from '../../parts/match'
import { unitReference, type ExtractOutput, type ExtractedLine } from '../prompts/extract-lines.v1'
import { registerAction } from '../registry'
import type { ActionDefinition, Check, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `extract_lines` (#5, S08-T02, 08 §2.4 / §2.5 / §3): the lines of one intake file, staged for a person.
 *
 *   gather   the intake file, where its bytes are (or the email body), today, the unit table
 *   propose  re-reads the file from Storage (no database), Sonnet 5.5 by chunk, merged; a document over 15 pages
 *            starts on Opus 5.5, and a Sonnet read with more than 20 % Unsure lines is read once more on Opus 5.5
 *   verify   code reads every quantity and unit, finds every quote again (spans), matches parts in one query per
 *            method (look-alike readings too) and computes each line's confidence
 *   proposed / effect   the candidates and their spans go into staging (intake_line_candidate) and the document's
 *            facts onto the batch. Nothing reaches an enquiry: board 15's "Continue" is the person's approval.
 *
 * Surface `hint`: no Review card. The extraction review (board 15) is where a person decides.
 */
export interface ExtractOut {
  failure: { kind: string; note: string } | null
  lines: ExtractedLine[]
  documentLevel: ExtractOutput['documentLevel'] | null
  model: string | null
  escalated: 'pages' | 'unsure_share' | null
  chunks: number
}

export interface ExtractVerified {
  failure: { kind: string; note: string } | null
  candidates: CandidateDraft[]
  facts: BatchFacts
  model: string | null
  escalated: 'pages' | 'unsure_share' | null
}

const EMPTY_FACTS: BatchFacts = { clientRef: null, deadline: null, terms: null }

const FAILURE_NOTE: Record<string, string> = {
  password_protected: 'The file is password-protected, so nothing was read',
  unreadable: 'The file could not be read',
  unsupported: 'This file type is not read',
  zip: 'An archive is expanded into its own files, not read itself',
}

async function lookalikeMatches(norms: readonly string[], matches: ReadonlyMap<string, PartMatch>) {
  const unmatched = norms.filter((n) => {
    const m = matches.get(n)
    return !m || m.method === 'none' || m.method === 'fuzzy'
  })
  const variants = new Map(unmatched.map((n) => [n, lookalikeVariants(n)]))
  const all = [...new Set([...variants.values()].flat())]
  const found = all.length ? await matchParts(all) : new Map<string, PartMatch>()
  const out = new Map<string, PartMatch[]>()
  for (const [n, vs] of variants) {
    const hits = vs
      .map((v) => found.get(v))
      .filter(
        (m): m is PartMatch =>
          !!m && ['exact', 'alias', 'catalogue', 'cross_ref'].includes(m.method)
      )
      .sort((a, b) => b.seenOnRfqs - a.seenOnRfqs)
    if (hits.length) out.set(n, hits)
  }
  return out
}

function factsOf(level: ExtractOutput['documentLevel'] | null, anchor: Date): BatchFacts {
  if (!level) return EMPTY_FACTS
  const closing = level.closingDate ? parsePrintedDate(level.closingDate.value, anchor) : null
  const terms: Record<string, { text: string; quote: string }> = {}
  for (const k of ['deliveryTerms', 'currency', 'quoteValidity', 'partialAllowed'] as const) {
    const v = level[k]
    if (v) terms[k] = { text: v.value, quote: v.quote }
  }
  return {
    clientRef: level.clientRef?.value ?? null,
    deadline: closing
      ? { date: closing.date, ambiguous: closing.ambiguous, quote: level.closingDate!.quote }
      : null,
    terms: Object.keys(terms).length ? terms : null,
  }
}

function addUsd(a: string, b: string): string {
  return (Number(a) + Number(b)).toFixed(6)
}

const definition: ActionDefinition<ExtractInput, ExtractOut> = {
  key: 'extract_lines',
  group: 'enquiries',
  aiPurpose: 'extract',
  external: false,
  concurrencyGroup: 'intake',
  surface: 'hint',

  estimate: (input) => ({
    chars: Math.min(400_000, (input.sizeBytes ?? 20_000) * 2),
    maxTokens: 16_000,
  }),

  async gather({ request }) {
    const input = await loadExtractInput(request.subjectId)
    return {
      input,
      versions: { file: input.intakeFileId, sha: input.sha256 ?? input.textHash ?? 'none' },
    }
  },

  async propose(input, ai) {
    const { doc, bytes } = await loadExtractDocument(input)
    const empty = (failure: ExtractOut['failure']) => ({
      ok: true as const,
      out: { failure, lines: [], documentLevel: null, model: null, escalated: null, chunks: 0 },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    })
    if (['password_protected', 'unreadable', 'unsupported', 'zip'].includes(doc.kind)) {
      const detail = 'detail' in doc ? doc.detail : (FAILURE_NOTE[doc.kind] ?? doc.kind)
      return empty({ kind: doc.kind, note: detail })
    }
    const chunks = await planChunks(doc, bytes)
    if (!chunks.length) return empty({ kind: 'unreadable', note: 'Nothing in the file to read' })
    const units = unitReference(input.units)
    const first = startingModel(doc)
    const run1 = await runExtraction({ chunks, ai, model: first, today: input.today, units })
    if (!run1.ok) return { ...run1, callIds: run1.callIds }
    let final = run1
    let escalated: ExtractOut['escalated'] = first === ESCALATION_MODEL ? 'pages' : null
    let cost = run1.costUsd
    const callIds = [...run1.callIds]
    if (first === EXTRACT_MODEL) {
      const source = spanSourceOf(doc, input.sourceId)
      const provisional = source
        ? buildCandidates(run1.lines, { source, units: uomTableOf(input.units) })
        : []
      if (unsureShare(provisional) > ESCALATE_UNSURE_SHARE) {
        const run2 = await runExtraction({
          chunks,
          ai,
          model: ESCALATION_MODEL,
          today: input.today,
          units,
        })
        cost = addUsd(cost, run2.costUsd)
        callIds.push(...run2.callIds)
        if (run2.ok) {
          final = run2
          escalated = 'unsure_share'
        }
      }
    }
    return {
      ok: true,
      out: {
        failure: null,
        lines: final.lines,
        documentLevel: final.documentLevel,
        model: final.model,
        escalated,
        chunks: final.chunks,
      },
      costUsd: cost,
      model: final.model,
      promptVersion: 'extract_lines@1',
      callIds,
    }
  },

  async verify(out, input) {
    if (out.failure) {
      return {
        out: {
          failure: out.failure,
          candidates: [],
          facts: EMPTY_FACTS,
          model: null,
          escalated: null,
        } as never,
        checks: [{ label: 'File', status: 'fail', detail: out.failure.note }],
        confidence: 'unsure',
        unsure: [{ field: 'file', why: out.failure.note }],
      }
    }
    const { doc } = await loadExtractDocument(input)
    const source = spanSourceOf(doc, input.sourceId)
    const units = uomTableOf(input.units)
    const norms = out.lines.map((l) => partNoNorm(l.partNumber)).filter(Boolean)
    const matches = await matchParts(out.lines.map((l) => l.partNumber))
    const lookalikes = await lookalikeMatches(norms, matches)
    const candidates = source
      ? buildCandidates(out.lines, { source, units, matches, lookalikes })
      : []
    const unsure = candidates.filter((c) => c.confidence === 'unsure').length
    const likely = candidates.filter((c) => c.confidence === 'likely').length
    const checks: Check[] = [
      {
        label: 'Lines read',
        status: candidates.length ? 'pass' : 'fail',
        detail: candidates.length
          ? `${candidates.length} lines from ${input.filename}`
          : 'No lines found',
      },
      {
        label: 'To check',
        status: unsure ? 'warn' : 'pass',
        detail: `${candidates.length - unsure - likely} high · ${likely} check · ${unsure} low`,
      },
    ]
    if (out.escalated)
      checks.push({
        label: 'Read again',
        status: 'pass',
        detail:
          out.escalated === 'pages'
            ? 'Over 15 pages: read on Opus 5.5'
            : 'More than 20 % Unsure on Sonnet 5.5: read again on Opus 5.5',
      })
    const verified: ExtractVerified = {
      failure: null,
      candidates,
      facts: factsOf(out.documentLevel, new Date(input.anchor)),
      model: out.model,
      escalated: out.escalated,
    }
    return {
      out: verified as never,
      checks,
      confidence: !candidates.length || unsure ? 'unsure' : likely ? 'likely' : 'sure',
      ...(unsure
        ? {
            unsure: candidates
              .filter((c) => c.unsure)
              .map((c) => ({ field: `line ${c.ord}`, why: c.unsure!.question })),
          }
        : {}),
    }
  },

  toProposal(v, input): ProposalDraft {
    const o = v.out as unknown as ExtractVerified
    const n = o.candidates.length
    const check = o.candidates.filter((c) => c.confidence !== 'sure').length
    return {
      headline: o.failure
        ? `Could not read ${input.filename}`
        : `Read ${n} line${n === 1 ? '' : 's'} from ${input.filename}${check ? ` · ${check} to check` : ''}`,
      reasons: o.escalated
        ? [
            {
              text:
                o.escalated === 'pages'
                  ? 'Long document: read on Opus 5.5'
                  : 'Many unclear lines: read again on Opus 5.5',
            },
          ]
        : [],
      preview: {
        kind: 'lines',
        lines: o.candidates.slice(0, 20).map((c) => ({
          ord: c.ord,
          description: c.description,
          partNo: c.partNo,
          qty: c.qty,
          uom: c.uom,
          confidence: c.confidence,
        })),
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: o.failure?.note ?? null,
      onApproveText: 'Lines stay in intake until a person confirms them in the review',
    }
  },

  async onProposed(tx, verified, ctx) {
    return stage(
      tx,
      verified.out as unknown as ExtractVerified,
      ctx.request.subjectId,
      ctx.actionId
    )
  },

  async effect(tx, verified, ctx) {
    return stage(
      tx,
      verified.out as unknown as ExtractVerified,
      ctx.request.subjectId,
      ctx.actionId
    )
  },
}

async function stage(
  tx: Parameters<NonNullable<typeof definition.effect>>[0],
  o: ExtractVerified,
  fileId: string,
  actionId: string
) {
  const file = await tx.intakeFile.findUniqueOrThrow({
    where: { id: fileId },
    select: { id: true, batchId: true, linesFound: true, status: true },
  })
  if (file.status === 'cancelled' || file.status === 'removed')
    return { note: 'The file was taken out of the queue' }
  if (o.failure) {
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId,
        subjectType: 'intake_file',
        subjectId: fileId,
        changes: [
          { field: 'status', before: file.status, after: 'needs_attention', kind: 'status' },
        ],
        note: o.failure.note,
      },
      (t) =>
        t.intakeFile.update({
          where: { id: fileId },
          data: {
            status: 'needs_attention',
            failureKind: o.failure!.kind,
            failureNote: o.failure!.note,
            actionId,
          },
        })
    )
    await bumpIntake(file.batchId, tx)
    return { note: o.failure.note }
  }
  const res = await writeTracked(
    tx,
    {
      actor: { kind: 'assistant' },
      actionId,
      subjectType: 'intake_file',
      subjectId: fileId,
      changes: [
        {
          field: 'linesFound',
          before: file.linesFound,
          after: o.candidates.length,
          kind: 'quantity',
        },
      ],
      note: `Read ${o.candidates.length} lines`,
    },
    async (t) => {
      const r = await stageCandidates(t, {
        batchId: file.batchId,
        fileId,
        actionId,
        drafts: o.candidates,
      })
      await applyBatchFacts(t, file.batchId, o.facts)
      return r
    }
  )
  await bumpIntake(file.batchId, tx)
  return { note: `Read ${res.created} lines · ${res.toCheck} to check` }
}

registerAction(definition)

export { definition as extractLinesDefinition }
