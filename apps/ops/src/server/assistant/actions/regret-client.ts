import 'server-only'
import { canTransitionLine, fillTemplate, replyReferences, type ScanHit } from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import { parseScopeVersion } from '../../enquiry/choose-path'
import { changeEnquiryStage, changeLineStatus } from '../../enquiry/transition'
import {
  categoryList,
  gatherRegret,
  linesSentence,
  REGRET_REASONS,
  type RegretInput,
  type RegretReasonValue,
} from '../../enquiry/regret'
import { blockReason, enquiryDenyList, scanClientBound } from '../../identity/client-bound'
import { replySubject } from '../../mail/reply'
import { registerAction } from '../registry'
import type { ActionDefinition, Check, EffectEvent, OutboundDraft, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `regret_client` (S09-T06, board 168, 171b states 4 and 12): a regret to the client, the whole enquiry or some
 * lines, from sales@ in the client's own thread. Never above Draft and ask (ops-core MAX_LEVELS): a regret ends a
 * client conversation, so a person always approves it.
 *
 *   gather   server/enquiry/regret.ts (the scope rides on the request's source version: "whole" or "lines:3.14")
 *   propose  no model: the awaiting templates filled in code, the "glad to quote on" line from the categories
 *            quoted in the last 12 months (a switch on the card; none without history)
 *   verify   the reverse identifier check (supplier names, domains, addresses, refs) and the money scan on the
 *            subject and body; a hit fails the check, makes the card Unsure, and blocks approval
 *   card     the reason chips (required, the suggestion preselected) and the switch
 *   approve  approvalCheck scans the final text again (after edits); the send gate scans the exact bytes
 *   onSent   once the email has left: whole → Regretted with the reason; lines → each line Regretted with it;
 *            ops/rfq.withdraw.requested for recipients still waiting (S14 withdraws them)
 */

export interface RegretOut {
  subject: string
  /** With the "glad to quote on" line, when there is one. */
  body: string
  /** The same email without it (the card's switch off). */
  bodyNoGlad: string
  missing: string[]
  identity: ScanHit[]
  money: ScanHit[]
}

const definition: ActionDefinition<RegretInput, RegretOut> = {
  key: 'regret_client',
  group: 'enquiries',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',
  requestableOn: ['enquiry'],

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const input = await gatherRegret(request.subjectId, request.sourceVersion)
    return {
      input,
      versions: {
        enquiry: input.ref,
        scope: `${input.scope}:${input.lines.map((l) => l.no).join('.')}`,
        template:
          (input.scope === 'whole' ? input.templates.whole : input.templates.lines)?.body.length ??
          -1,
        suppliers: input.deny.length,
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const tpl = input.scope === 'whole' ? input.templates.whole : input.templates.lines
    const glad =
      input.categories.length && input.templates.glad
        ? fillTemplate(input.templates.glad, { categories: categoryList(input.categories) })
        : { text: '', missing: [] as string[] }
    const values = (gladLine: string) => ({
      salutation: input.salutation,
      original_subject: (input.source?.subject ?? input.title).replace(
        /^\s*((re|fwd?|fw)\s*:\s*)+/i,
        ''
      ),
      client_ref: input.clientRef ?? input.ref,
      enquiry_title: input.title.charAt(0).toLowerCase() + input.title.slice(1),
      lines_sentence: linesSentence(input.lines),
      glad_line: gladLine,
    })
    const subject = tpl
      ? fillTemplate(tpl.subject, values(''))
      : { text: replySubject(input.source?.subject ?? input.ref), missing: [] }
    const withGlad = tpl
      ? fillTemplate(tpl.body, values(glad.text))
      : { text: '', missing: ['template'] }
    const without = tpl ? fillTemplate(tpl.body, values('')) : { text: '', missing: [] }
    const tidy = (t: string) => t.replace(/\n{3,}/g, '\n\n').trim()
    const body = tidy(withGlad.text)
    const scan = scanClientBound(`${subject.text}\n${body}`, input.deny)
    return {
      ok: true,
      out: {
        subject: subject.text,
        body,
        bodyNoGlad: tidy(without.text),
        missing: [...new Set([...subject.missing, ...withGlad.missing, ...glad.missing])].filter(
          (m) => m !== 'glad_line'
        ),
        identity: scan.identity,
        money: scan.money,
      },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    const clean = out.identity.length === 0 && out.money.length === 0
    const reason = blockReason({ identity: out.identity, money: out.money })
    const ok = out.missing.length === 0 && clean && !!input.source?.to && !!input.mailbox
    const checks: Check[] = [
      clean
        ? { label: 'No supplier names, prices or margins in the email', status: 'pass' }
        : {
            label: 'No supplier names, prices or margins in the email',
            status: 'fail',
            detail: reason ?? undefined,
          },
      input.source?.inSales
        ? {
            label: 'In the client’s thread, with the signature',
            status: 'pass',
            detail: input.mailbox?.address,
          }
        : {
            label: 'New message from sales@, with the signature',
            status: 'warn',
            detail: input.source ? 'the thread is only in purchase@' : 'no email to reply to',
          },
      out.missing.length
        ? {
            label: 'Wording from the template',
            status: 'fail',
            detail: `Missing: ${out.missing.join(', ')}`,
          }
        : { label: 'Wording from the template', status: 'pass' },
      ...(input.deadline
        ? [
            input.deadline.daysEarly >= 0
              ? {
                  label: `Client deadline ${input.deadline.label}; sent ${input.deadline.daysEarly === 0 ? 'on the day' : `${input.deadline.daysEarly} day${input.deadline.daysEarly === 1 ? '' : 's'} early`}`,
                  status: 'pass' as const,
                }
              : {
                  label: `Client deadline ${input.deadline.label} has passed`,
                  status: 'warn' as const,
                },
          ]
        : []),
      ...(input.source?.to ? [] : [{ label: 'No client address', status: 'fail' as const }]),
      ...(input.scope === 'lines' && input.lines.length === 0
        ? [{ label: 'No lines to regret', status: 'fail' as const }]
        : []),
    ]
    return {
      out,
      checks,
      confidence: ok ? 'sure' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              {
                field: !clean ? 'identity' : out.missing.length ? 'template' : 'recipient',
                why: !clean
                  ? (reason ?? 'The email names a supplier or a price')
                  : out.missing.length
                    ? `The template is missing ${out.missing.join(', ')}`
                    : 'No client address or sales mailbox to send from',
              },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const mailbox = input.mailbox?.address ?? 'sales@'
    const whole = input.scope === 'whole'
    const reasons: ProposalDraft['reasons'] = []
    if (input.outcomes.declined.length)
      reasons.push({
        text: `${list(input.outcomes.declined)} ${input.outcomes.declined.length === 1 ? 'has' : 'have'} declined.`,
      })
    for (const n of input.outcomes.noReply.slice(0, 2))
      reasons.push({
        text: `${n.name} has not replied${n.chasers ? ` after ${n.chasers} chaser${n.chasers === 1 ? '' : 's'}` : ''} (${n.rfqRef}).`,
      })
    if (input.outcomes.linesOutside.length)
      reasons.push({
        text: `${input.outcomes.linesOutside.length === 1 ? 'Line' : 'Lines'} ${input.outcomes.linesOutside.join(', ')}: never quoted, no supplier on file.`,
      })
    if (!reasons.length)
      reasons.push({
        text: whole
          ? 'A person chose to regret this enquiry on the qualification card.'
          : 'A person chose to regret these lines on the qualification card.',
      })
    const quoted = input.source?.quoted ? `\n\n${input.source.wrote} ${input.source.quoted}…` : ''
    return {
      headline: whole
        ? `Send a regret to ${input.clientName} and close ${input.ref} as Regretted.`
        : `Regret ${input.lines.length === 1 ? 'line' : 'lines'} ${input.lines.map((l) => l.no).join(', ')} to ${input.clientName}; ${input.otherLines} line${input.otherLines === 1 ? '' : 's'} still quoted.`,
      reasons: reasons.slice(0, 4),
      preview:
        input.source?.to && input.mailbox
          ? ({
              mailbox,
              to: [input.source.to],
              subject: v.out.subject,
              text: `${v.out.body}${quoted}`,
              reasonChips: {
                label: 'Reason',
                options: REGRET_REASONS.map((r) => ({ value: r.value, label: r.label })),
                value: input.suggestedReason,
              },
              ...(input.categories.length && input.templates.glad
                ? {
                    toggle: {
                      name: 'glad_line',
                      label:
                        'Include the “glad to quote on” line · categories from the last 12 months of quotations',
                      defaultOn: true,
                      textOff: `${v.out.bodyNoGlad}${quoted}`,
                    },
                  }
                : {}),
            } as Prisma.InputJsonValue)
          : null,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout:
        v.out.identity.length || v.out.money.length
          ? blockReason({ identity: v.out.identity, money: v.out.money })
          : v.out.missing.length
            ? `Template missing ${v.out.missing.join(', ')}`
            : null,
      onApproveText: whole
        ? `Sends from ${mailbox} in 5 minutes. ${input.ref} moves to Regretted with the reason once it has left${input.outcomes.noReply.length ? '; open RFQs are withdrawn' : ''}.`
        : `Sends from ${mailbox} in 5 minutes. The lines move to Regretted with the reason once it has left; the record stays open.`,
    }
  },

  async effect() {
    return { note: 'Regret sent to the client', undoable: false }
  },

  // The final text a person approves, after edits or the switch, is checked once more.
  async approvalCheck(email, request) {
    if (!request.enquiryId) return null
    const deny = await enquiryDenyList(request.enquiryId)
    return blockReason(scanClientBound(`${email.subject}\n${email.body}`, deny))
  },

  outbound(v, input): OutboundDraft | null {
    if (v.out.missing.length || !input.mailbox || !input.source?.to) return null
    if (v.out.identity.length || v.out.money.length) return null
    const inThread = input.source.inSales
    return {
      kind: 'regret',
      mailboxId: input.mailbox.id,
      to: [input.source.to],
      subject: inThread ? v.out.subject : v.out.subject.replace(/^Re:\s*/i, ''),
      bodyHtml: v.out.body
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join(''),
      bodyText: v.out.body,
      threadId: inThread ? input.source.threadId : null,
      ...(inThread && input.source.rfcMessageId
        ? {
            inReplyToRfcId: input.source.rfcMessageId,
            referencesRfcIds: replyReferences(
              input.source.referencesRfcIds,
              input.source.rfcMessageId
            ),
          }
        : {}),
      enquiryId: input.enquiryId,
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
    }
  },

  async onSent(tx, action) {
    const reason = (
      REGRET_REASONS.some((r) => r.value === action.chosenOption) ? action.chosenOption : 'other'
    ) as RegretReasonValue
    const label = REGRET_REASONS.find((r) => r.value === reason)!.label
    const actor = action.decidedById
      ? { kind: 'user' as const, id: action.decidedById }
      : { kind: 'assistant' as const }
    const enquiryId = action.request.subjectId
    const { scope, lineNos } = parseScopeVersion(action.request.sourceVersion)
    const emit: EffectEvent[] = []

    if (scope === 'whole') {
      const e = await tx.enquiry.findUniqueOrThrow({
        where: { id: enquiryId },
        select: { stage: true },
      })
      if (!['won', 'lost', 'regretted', 'closed'].includes(e.stage))
        await changeEnquiryStage(tx, {
          enquiryId,
          to: 'regretted',
          ctx: { regretSent: true },
          actor,
          actionId: action.id,
          note: `Regretted · ${label}`,
          data: { regretReason: reason },
        })
    } else {
      const lines = await tx.enquiryLine.findMany({
        where: { enquiryId, no: { in: lineNos } },
        select: { id: true, no: true, status: true },
      })
      const skipped: number[] = []
      for (const l of lines) {
        if (!canTransitionLine(l.status, 'regretted', { regretReason: reason }).ok) {
          skipped.push(l.no)
          continue
        }
        await changeLineStatus(tx, {
          lineId: l.id,
          to: 'regretted',
          ctx: { regretReason: reason },
          actor,
          actionId: action.id,
          note: `Regretted to the client · ${label}`,
          data: { regretReason: reason },
        })
      }
      if (skipped.length)
        await writeTracked(
          tx,
          {
            actor: { kind: 'system' },
            actionId: action.id,
            enquiryId,
            subjectType: 'enquiry',
            subjectId: enquiryId,
            changes: [
              { field: 'lineRegret', before: null, after: skipped.join(','), kind: 'status' },
            ],
            note: `The regret left, but ${skipped.length === 1 ? 'line' : 'lines'} ${skipped.join(', ')} had moved on and ${skipped.length === 1 ? 'was' : 'were'} not marked Regretted`,
          },
          async () => undefined
        )
    }
    // Recipients still waiting on the regretted lines (or the whole enquiry): S14 withdraws them with a short note.
    const open = await tx.supplierRfqRecipient.findMany({
      where: {
        rfq: {
          enquiryId,
          ...(scope === 'lines'
            ? { lines: { some: { droppedAt: null, line: { no: { in: lineNos } } } } }
            : {}),
        },
        status: {
          in: [
            'draft',
            'awaiting_approval',
            'scheduled',
            'sent',
            'opened',
            'auto_reply',
            'replied_question',
          ],
        },
      },
      select: { id: true },
    })
    if (open.length)
      emit.push({
        name: 'ops/rfq.withdraw.requested',
        id: `rfq-withdraw:${action.id}`,
        data: {
          enquiryId,
          actionId: action.id,
          scope,
          lineNos: lineNos.join(','),
          recipientIds: open.map((r) => r.id).join(','),
        },
      })
    return emit
  },
}

const list = (names: readonly string[]) =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

registerAction(definition)
export default definition
