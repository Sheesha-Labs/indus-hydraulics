import type { z } from 'zod'
import type { StoredProposalInput } from './base'
import { EMAIL_EDITABLE, emailProposal, type EmailProposal } from './email'
import { mailResolutionProposal, type MailResolutionProposal } from './mail-resolution'
import { noticeProposal, type NoticeProposal } from './notice'
import { outboundAttentionProposal, type OutboundAttentionProposal } from './outbound-attention'

/**
 * The proposal kinds and which action writes which (S06-T01). Later sprints add a kind without editing this
 * file: declare it on `ProposalKinds` by interface merging and register its schema and builder.
 *
 *   declare module '@indus/ops-core' { interface ProposalKinds { rfq_send: RfqSendProposal } }
 *   registerProposalKind('rfq_send', rfqSendSchema, (stored) => ({ ...stored, kind: 'rfq_send', rfqs: … }))
 *   registerActionKind('send_rfqs', 'rfq_send')
 */
export interface ProposalKinds {
  email: EmailProposal
  mail_resolution: MailResolutionProposal
  outbound_attention: OutboundAttentionProposal
  notice: NoticeProposal
}
export type ProposalKind = keyof ProposalKinds
export type Proposal = ProposalKinds[ProposalKind]

type Builder = (stored: StoredProposalInput) => unknown
interface KindEntry {
  schema: z.ZodType
  build: Builder
  /** Fields Edit may change (into effectivePayload). */
  editable: readonly string[]
}

const base = (s: StoredProposalInput) => ({
  headline: s.headline,
  reasons: s.reasons,
  checks: s.checks,
  confidence: s.confidence,
  unsureAbout: s.unsureAbout ?? null,
  options: s.options ?? null,
  onApproveText: s.onApproveText ?? null,
})

const KINDS = new Map<string, KindEntry>([
  [
    'email',
    {
      schema: emailProposal,
      build: (s) => ({ ...base(s), kind: 'email', email: s.preview }),
      editable: EMAIL_EDITABLE,
    },
  ],
  [
    'mail_resolution',
    {
      schema: mailResolutionProposal,
      build: (s) => ({ ...base(s), kind: 'mail_resolution', options: s.options ?? [] }),
      editable: [],
    },
  ],
  [
    'outbound_attention',
    {
      schema: outboundAttentionProposal,
      build: (s) => ({ ...base(s), kind: 'outbound_attention', attention: s.preview }),
      editable: [],
    },
  ],
  [
    'notice',
    {
      schema: noticeProposal,
      build: (s) => ({ ...base(s), kind: 'notice', ...(s.preview ? { detail: s.preview } : {}) }),
      editable: [],
    },
  ],
])

const ACTION_KIND = new Map<string, ProposalKind | string>([
  ['ask_open_copy', 'email'],
  ['resend_alternate_contact', 'email'],
  ['manual_reply', 'email'],
  ['correction_email', 'email'],
  // S08: the client acknowledgement (#6) and the request for an original file (board 17) are emails.
  ['ack_email', 'email'],
  ['request_original', 'email'],
  ['outbound_attention', 'outbound_attention'],
])

/** Actions whose Unsure items are resolved in Mail (board 94) rather than Review. */
const MAIL_RESOLVED = new Set(['classify_mail', 'link_mail'])

export function registerProposalKind(
  kind: string,
  schema: z.ZodType,
  build: Builder,
  editable: readonly string[] = []
): void {
  if (KINDS.has(kind)) throw new Error(`Proposal kind "${kind}" is registered twice`)
  KINDS.set(kind, { schema, build, editable })
}

export function registerActionKind(actionKey: string, kind: string): void {
  if (!KINDS.has(kind)) throw new Error(`Unknown proposal kind "${kind}": register it first`)
  const had = ACTION_KIND.get(actionKey)
  if (had && had !== kind) throw new Error(`Action "${actionKey}" already writes "${had}"`)
  ACTION_KIND.set(actionKey, kind)
}

export function proposalKindOf(actionKey: string, surface: string): string {
  if (MAIL_RESOLVED.has(actionKey) && surface === 'mail_unsure') return 'mail_resolution'
  return ACTION_KIND.get(actionKey) ?? 'notice'
}

export function editableFields(kind: string): readonly string[] {
  return KINDS.get(kind)?.editable ?? []
}

export type ParsedProposal =
  | { ok: true; kind: string; proposal: Proposal; editable: readonly string[] }
  | { ok: false; kind: string; error: string }

/** The stored proposal of an action, typed by its kind; a typed error when it does not fit. */
export function parseProposal(actionKey: string, stored: StoredProposalInput): ParsedProposal {
  const k = proposalKindOf(actionKey, stored.surface)
  // An email action with nothing to send (a bounce with no other address: "Fix contact" only) is a choice.
  const kind =
    (k === 'email' && (stored.preview === null || stored.preview === undefined)) ||
    // Classify and link write on the mail_unsure surface whatever the outcome: only an Unsure run has options.
    (k === 'mail_resolution' && !(stored.options && stored.options.length > 0))
      ? 'notice'
      : k
  const entry = KINDS.get(kind)
  if (!entry) return { ok: false, kind, error: `No schema for proposal kind "${kind}"` }
  const parsed = entry.schema.safeParse(entry.build(stored))
  if (!parsed.success) {
    const where = parsed.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    return { ok: false, kind, error: where }
  }
  const proposal = parsed.data as Proposal
  return kind === 'email'
    ? {
        ok: true,
        kind,
        proposal: { ...(proposal as EmailProposal), editable: EMAIL_EDITABLE },
        editable: entry.editable,
      }
    : { ok: true, kind, proposal, editable: entry.editable }
}
