import 'server-only'
import { opsDb } from '@indus/ops-db'
import {
  instructionHeadline,
  instructionOutput,
  validateInstruction,
  type InstructionOutput,
} from '@indus/ops-core'
import { instructionUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/instruction.v1'
import { actionDefinition, registerAction, registeredActionKeys } from '../registry'
import { actionRequestEvent } from '../request'
import type { ActionDefinition, EffectEvent, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `instruction` (S06-T08, shell S03, coverage gap G1): what a person types in the Assistant panel becomes a
 * proposal, never a silent action. Sonnet (instruction@1) classifies the text into one intent; code checks it
 * against the record (validateInstruction), writes the headline, and the card waits in Review — the action's
 * maxLevel is Draft and ask, so no preset or Custom level lets typed text act on its own
 * (instruction.guard.test.ts).
 *
 * On approve, inside one transaction through writeTracked:
 *   hold_line / release_line  the enquiry line's status and heldReason
 *   add_task / set_reminder   a task row (a reminder is a follow-up task due at its time, for the person)
 *   add_note                  a note row in the record's history
 *   request_action            asks for the target action, which drafts its OWN card at its own level
 *   unclear                   nothing (the card cannot be approved; rephrase in the panel)
 * Undo inside the internal window puts each change back (field writers in ../field-writers.ts).
 */
export interface InstructionInput {
  text: string
  enquiryId: string
  recordRef: string
  title: string
  lines: Array<{ no: number; description: string; status: string }>
  rfqs: string[]
  quotation: string | null
  requestable: Array<{ key: string; label: string }>
  requestedById: string | null
  today: string
}

export type InstructionOut = InstructionOutput & {
  text: string
  targetLabel: string | null
  /** Who typed it: a reminder is theirs; a task records them as its creator. */
  requestedById: string | null
}

const TODAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dubai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'long',
})

function sha(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

/** What approving does, in one line, for the card. */
function onApprove(o: InstructionOut): string | null {
  const p = o.params
  switch (p.intent) {
    case 'hold_line':
      return `Sets line ${p.lineNo} to Held: ${p.note}`
    case 'release_line':
      return `Sets line ${p.lineNo} back to open`
    case 'add_task':
      return `Adds the task “${p.title}” for the ${p.assignee === 'owner' ? 'Owner' : 'Helper'}`
    case 'add_note':
      return 'Adds the note to this record’s history'
    case 'set_reminder':
      return `Adds a reminder for you: ${p.text}`
    case 'request_action':
      return `Asks the Assistant to ${o.targetLabel ?? p.targetKey}; that comes back as its own card`
    case 'unclear':
      return null
  }
}

const definition: ActionDefinition<InstructionInput, InstructionOut> = {
  key: 'instruction',
  group: 'system',
  aiPurpose: 'extract',
  external: false,
  concurrencyGroup: 'assistant',
  surface: 'review',

  estimate: (i) => ({ chars: 1_500 + i.text.length + i.lines.length * 80, maxTokens: 600 }),

  async gather({ request }) {
    if (request.subjectType !== 'enquiry')
      throw new Error('Instructions work on an enquiry for now')
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: {
        id: true,
        ref: true,
        title: true,
        updatedAt: true,
        lines: {
          orderBy: { no: 'asc' },
          take: 200,
          select: { no: true, description: true, status: true },
        },
        rfqs: { orderBy: { createdAt: 'desc' }, take: 10, select: { ref: true } },
        quotations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          where: { number: { not: null } },
          select: { number: true },
        },
      },
    })
    const candidates = registeredActionKeys().filter((k) =>
      actionDefinition(k)?.requestableOn?.includes('enquiry')
    )
    const defs = candidates.length
      ? await opsDb.autopilotActionDef.findMany({
          where: { key: { in: candidates }, configurable: true },
          select: { key: true, label: true },
        })
      : []
    const input: InstructionInput = {
      text: (request.hint ?? '').slice(0, 1_000),
      enquiryId: e.id,
      recordRef: e.ref,
      title: e.title,
      lines: e.lines.map((l) => ({
        no: l.no,
        description: l.description.slice(0, 120),
        status: l.status,
      })),
      rfqs: e.rfqs.map((r) => r.ref),
      quotation: e.quotations[0]?.number ?? null,
      requestable: defs.map((d) => ({ key: d.key, label: d.label })),
      requestedById: request.requestedById ?? null,
      today: TODAY.format(new Date()),
    }
    return {
      input,
      versions: {
        enquiry: e.updatedAt.toISOString(),
        lines: sha(e.lines.map((l) => `${l.no}:${l.status}`).join('|')),
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    const res = await ai.call({
      route: 'extract',
      system: SYSTEM_PARTS,
      user: instructionUser(input),
      zod: instructionOutput,
      maxTokens: 600,
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
    const p = res.value.params
    const target =
      p.intent === 'request_action' ? input.requestable.find((r) => r.key === p.targetKey) : null
    return {
      ok: true,
      out: {
        ...res.value,
        text: input.text,
        targetLabel: target?.label ?? null,
        requestedById: input.requestedById,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    const check = validateInstruction(out, {
      lines: input.lines,
      requestable: input.requestable.map((r) => r.key),
      now: new Date(),
    })
    if (!check.ok) {
      const why = check.problems.join('; ')
      return {
        out: { ...out, params: { intent: 'unclear', why } },
        checks: [{ label: 'Checked against the record', status: 'fail', detail: why }],
        confidence: 'unsure',
        unsure: [{ field: 'instruction', why }],
      }
    }
    return {
      out,
      checks: [
        { label: 'Checked against the record', status: 'pass' },
        { label: 'No price, quantity or amount from the model', status: 'pass' },
      ],
      confidence: 'likely',
    }
  },

  toProposal(v, input): ProposalDraft {
    const o = v.out
    const unclear = o.params.intent === 'unclear'
    return {
      headline: instructionHeadline(o.params, o.targetLabel ?? undefined),
      reasons: [
        { text: `You wrote on ${input.recordRef}: “${input.text.slice(0, 400)}”` },
        ...o.reasons.slice(0, 3).map((r) => ({ text: r.text })),
      ],
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout:
        o.params.intent === 'unclear' ? `${o.params.why}. Rephrase it in the panel.` : null,
      onApproveText: unclear ? null : onApprove(o),
      options: null,
    }
  },

  async effect(tx, verified, ctx) {
    const o = verified.out
    const p = o.params
    const enquiryId = ctx.request.subjectId
    const base = { actor: { kind: 'assistant' as const }, actionId: ctx.actionId, enquiryId }
    const note = `Instruction approved · ${ctx.ref}`
    switch (p.intent) {
      case 'hold_line':
      case 'release_line': {
        const line = await tx.enquiryLine.findFirstOrThrow({
          where: { enquiryId, no: p.lineNo },
          select: { id: true, status: true, heldReason: true },
        })
        const hold = p.intent === 'hold_line'
        const status = hold ? 'held' : 'open'
        const heldReason = hold ? p.note : null
        await writeTracked(
          tx,
          {
            ...base,
            subjectType: 'enquiry_line',
            subjectId: line.id,
            changes: [
              { field: 'status', before: line.status, after: status, kind: 'status' },
              { field: 'heldReason', before: line.heldReason, after: heldReason, kind: 'status' },
            ],
            note,
          },
          (t) =>
            t.enquiryLine.update({
              where: { id: line.id },
              data: { status, heldReason },
            })
        )
        return { note: hold ? `Held line ${p.lineNo}` : `Released line ${p.lineNo}` }
      }
      case 'add_task':
      case 'set_reminder': {
        const reminder = p.intent === 'set_reminder'
        const assigneeId = reminder
          ? (o.requestedById ?? null)
          : ((
              await tx.user.findFirst({
                where: { role: p.assignee, status: 'active' },
                orderBy: { createdAt: 'asc' },
                select: { id: true },
              })
            )?.id ?? null)
        const title = reminder ? `Reminder: ${p.text}` : p.title
        const dueAt = reminder
          ? new Date(p.at)
          : p.dueOn
            ? new Date(`${p.dueOn}T17:00:00+04:00`)
            : null
        const task = await writeTracked(
          tx,
          {
            ...base,
            subjectType: 'enquiry',
            subjectId: enquiryId,
            changes: [{ field: 'task', before: null, after: title, kind: 'other' }],
            note,
          },
          (t) =>
            t.task.create({
              data: {
                title,
                kind: reminder ? 'follow_up' : 'general',
                source: 'assistant',
                dueAt,
                assigneeId,
                enquiryId,
                subjectType: 'enquiry',
                subjectId: enquiryId,
                createdByActionId: ctx.actionId,
                createdById: o.requestedById ?? null,
              },
              select: { id: true },
            })
        )
        return { note: `${reminder ? 'Reminder' : 'Task'} added (${task.id})` }
      }
      case 'add_note':
        await writeTracked(
          tx,
          {
            ...base,
            subjectType: 'enquiry',
            subjectId: enquiryId,
            changes: [{ field: 'note', before: null, after: p.text, kind: 'other' }],
            note,
          },
          async () => undefined
        )
        return { note: 'Note added' }
      case 'request_action': {
        const ev = actionRequestEvent({
          actionKey: p.targetKey,
          subjectType: 'enquiry',
          subjectId: enquiryId,
          enquiryId,
          trigger: 'instruction',
          origin: 'live',
          sourceVersion: `instruction:${ctx.actionId}`,
          requestedById: o.requestedById ?? null,
        })
        await writeTracked(
          tx,
          {
            ...base,
            subjectType: 'enquiry',
            subjectId: enquiryId,
            changes: [{ field: 'requested', before: null, after: p.targetKey, kind: 'other' }],
            note,
          },
          async () => undefined
        )
        const emit: EffectEvent[] = [
          { name: ev.name, id: ev.id, data: ev.data as unknown as EffectEvent['data'] },
        ]
        // What it asked for drafts its own card; that cannot be called back from here.
        return { note: `Asked for ${p.targetKey}`, undoable: false, emit }
      }
      case 'unclear':
        return { note: 'Nothing to do', undoable: false }
    }
  },
}

registerAction(definition)
export default definition
