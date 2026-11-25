import 'server-only'
import { partNoNorm, parseQuantity } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { initials } from '../../intake/review'
import { registerAction } from '../registry'
import { writeTracked } from '../write-tracked'
import type { ActionDefinition } from '../types'

/**
 * A question card for one Unsure extracted line (S08-T06, the S06 Unsure pattern). When an enquiry is created
 * from an email, each Unsure line stays on the intake batch and becomes one of these in Review, linked to the
 * enquiry: "Line 6 · which part number is right?" with the readings as options. No model: the question and the
 * options were decided in code when the line was read. Approving with an option writes the line into the enquiry
 * as the person's decision ("Decided by KB"); until then nothing Unsure is in enquiry_line.
 */
interface Option {
  value: string
  label: string
  sub?: string
}

export interface ResolveLineInput {
  candidateId: string
  enquiryId: string
  enquiryRef: string
  ord: number
  description: string
  field: string
  question: string
  options: Option[]
  decision: string
}

export type ResolveLineOut = ResolveLineInput

const AS_READ = '__as_read'

const definition: ActionDefinition<ResolveLineInput, ResolveLineOut> = {
  key: 'resolve_extracted_line',
  group: 'enquiries',
  aiPurpose: 'other',
  external: false,
  concurrencyGroup: 'intake',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const c = await opsDb.intakeLineCandidate.findUniqueOrThrow({
      where: { id: String(request.sourceVersion) },
      select: {
        id: true,
        ord: true,
        description: true,
        unsure: true,
        decision: true,
        version: true,
        batch: { select: { enquiry: { select: { id: true, ref: true } } } },
      },
    })
    const u = (c.unsure as { field?: string; question?: string; options?: Option[] } | null) ?? {}
    return {
      input: {
        candidateId: c.id,
        enquiryId: c.batch.enquiry?.id ?? request.subjectId,
        enquiryRef: c.batch.enquiry?.ref ?? '',
        ord: c.ord,
        description: c.description,
        field: u.field ?? 'description',
        question: u.question ?? `Line ${c.ord} · what is right?`,
        options: u.options ?? [],
        decision: c.decision,
      },
      versions: { candidate: c.version },
    }
  },

  async currentVersions(request) {
    const c = await opsDb.intakeLineCandidate.findUnique({
      where: { id: String(request.sourceVersion) },
      select: { version: true, decision: true },
    })
    return { candidate: c && c.decision === 'pending' ? c.version : -1 }
  },

  async propose(input) {
    return {
      ok: true,
      out: input,
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out) {
    return {
      out,
      checks: [{ label: 'Read with doubt', status: 'warn', detail: 'a person decides' }],
      confidence: 'unsure',
      unsure: [{ field: out.field, why: out.question }],
    }
  },

  toProposal(v) {
    const o = v.out
    return {
      headline: `${o.enquiryRef} · ${o.question}`,
      reasons: [
        {
          text: `“${o.description.slice(0, 120)}” was read with a doubt; it is not on the enquiry until answered.`,
        },
      ],
      checks: v.checks,
      confidence: 'unsure',
      unsureAbout: o.question,
      onApproveText: 'Writes the line onto the enquiry with your answer.',
      options: [
        ...o.options.map((x) => ({
          key: x.value,
          label: x.sub ? `${x.label} · ${x.sub}` : x.label,
          consequence: `Line ${o.ord} gets ${x.label}.`,
        })),
        { key: AS_READ, label: 'As read', consequence: `Line ${o.ord} goes on as it was read.` },
      ],
    }
  },

  async effect(tx, v, ctx) {
    const o = v.out
    const choice = ctx.chosenOption
    if (!choice) throw new Error('Choose one of the answers on the card.')
    const c = await tx.intakeLineCandidate.findUniqueOrThrow({
      where: { id: o.candidateId },
      include: {
        file: { select: { storedFileId: true, kind: true, actionId: true } },
        batch: true,
      },
    })
    if (c.decision !== 'pending') return { note: 'Already decided' }
    const person = ctx.decidedById
      ? await tx.user.findUnique({
          where: { id: ctx.decidedById },
          select: { id: true, name: true },
        })
      : null
    const who = person ? initials(person.name) : 'the Assistant'
    const data = {
      description: c.description,
      partNo: c.partNo,
      qty: c.qty,
      uom: c.uom,
      notes: c.notes,
    }
    if (choice !== AS_READ) {
      if (o.field === 'qty' || o.field === 'quantity') {
        const q = parseQuantity(choice, 'dot')
        if (q.value === null) throw new Error('That answer is not a quantity.')
        data.qty = new Prisma.Decimal(q.value)
      } else if (['partNumber', 'part', 'part_number'].includes(o.field)) data.partNo = choice
      else if (o.field === 'uom' || o.field === 'unit') data.uom = choice.toUpperCase()
      else if (o.field === 'reference')
        data.notes = [c.notes, `Same as ${choice}`].filter(Boolean).join(' · ')
      else data.description = choice
    }
    if (!data.qty)
      throw new Error('This line has no quantity: answer it in the intake review instead.')
    const no =
      ((await tx.enquiryLine.aggregate({ where: { enquiryId: o.enquiryId }, _max: { no: true } }))
        ._max.no ?? 0) + 1
    await writeTracked(
      tx,
      {
        actor: person ? { kind: 'user', id: person.id } : { kind: 'assistant' },
        actionId: ctx.actionId,
        enquiryId: o.enquiryId,
        subjectType: 'enquiry',
        subjectId: o.enquiryId,
        changes: [
          {
            field: `line ${no}`,
            before: null,
            after: `${data.qty.toString()} ${data.uom ?? 'EA'} · ${data.description.slice(0, 60)}`,
            kind: 'quantity',
          },
        ],
        note: `Decided by ${who}`,
      },
      async (t) => {
        await t.enquiryLine.create({
          data: {
            enquiryId: o.enquiryId,
            no,
            clientPartNo: data.partNo,
            description: data.description,
            qty: data.qty!,
            uom: data.uom ?? 'EA',
            specNotes: [c.spec, data.notes].filter(Boolean).join(' · ') || null,
            requestedMake: c.make,
            sourceDocumentId: c.file?.kind === 'email' ? null : (c.file?.storedFileId ?? null),
            sourceMessageId: c.file?.kind === 'email' ? c.batch.mailMessageId : null,
            sourcePage: c.sourcePage,
            sourceSpan: { spanIds: c.spanIds, fieldSpans: c.fieldSpans } as Prisma.InputJsonValue,
            extractionConfidence: 'unsure',
            extractedByActionId: c.file?.actionId ?? null,
          },
        })
        await t.intakeLineCandidate.update({
          where: { id: c.id },
          data: {
            decision: 'edited',
            partNo: data.partNo,
            partNoNorm: data.partNo ? partNoNorm(data.partNo) || null : null,
            qty: data.qty,
            uom: data.uom,
            description: data.description,
            notes: data.notes,
            unsure: Prisma.DbNull,
            reasons: [
              ...((c.reasons as string[] | null) ?? []),
              `Decided by ${who}`,
            ] as Prisma.InputJsonValue,
            decidedAt: new Date(),
            decidedById: person?.id ?? null,
            version: { increment: 1 },
          },
        })
      }
    )
    return { note: `Line ${no} added · decided by ${who}` }
  },
}

registerAction(definition)
export default definition
