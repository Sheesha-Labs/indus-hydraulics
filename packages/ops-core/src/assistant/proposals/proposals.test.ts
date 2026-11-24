import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { basisHash, canonicalVersions } from '../basis-hash'
import {
  editableFields,
  parseProposal,
  proposalKindOf,
  registerActionKind,
  registerProposalKind,
  type StoredProposalInput,
} from './index'

const base: Omit<StoredProposalInput, 'preview' | 'surface'> = {
  headline: 'Ask the sender for an open copy of RFQ.pdf',
  reasons: [{ text: 'RFQ.pdf is password-protected, so it could not be read' }],
  checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
  confidence: 'sure',
  unsureAbout: null,
  options: [{ key: 'send', label: 'Send the reply', consequence: 'Queued with the 5-minute undo' }],
  onApproveText: 'Sends the reply from purchase@example.test in this thread',
}

describe('proposal union (S06-T01)', () => {
  it('an email proposal parses, with its editable fields', () => {
    const out = parseProposal('ask_open_copy', {
      ...base,
      surface: 'review',
      preview: {
        mailbox: 'purchase@example.test',
        to: ['sender@example-valve.test'],
        subject: 'Re: RFQ',
        text: 'Could you send it without a password?',
      },
    })
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.kind).toBe('email')
    expect(out.editable).toEqual(['to', 'cc', 'subject', 'body'])
    expect(out.proposal.kind === 'email' && out.proposal.email.to).toEqual([
      'sender@example-valve.test',
    ])
  })

  it('an email without a recipient or a body is a typed error', () => {
    const noTo = parseProposal('manual_reply', {
      ...base,
      surface: 'review',
      preview: { mailbox: 'sales@example.test', to: [], subject: 'Re: x', html: '<p>x</p>' },
    })
    expect(noTo).toMatchObject({ ok: false, kind: 'email' })
    const noBody = parseProposal('resend_alternate_contact', {
      ...base,
      surface: 'review',
      preview: { mailbox: null, to: ['a@example.test'], subject: 's' },
    })
    expect(noBody.ok).toBe(false)
  })

  it('classify and link Unsure items are mail resolutions; their sure runs are notices', () => {
    expect(proposalKindOf('classify_mail', 'mail_unsure')).toBe('mail_resolution')
    expect(proposalKindOf('link_mail', 'hint')).toBe('notice')
    expect(proposalKindOf('label_gmail', 'hint')).toBe('notice')
    // A sure classification writes on the same surface with no options: a notice, not an Unsure item.
    const sure = parseProposal('classify_mail', {
      ...base,
      options: null,
      surface: 'mail_unsure',
      preview: null,
    })
    expect(sure).toMatchObject({ ok: true, kind: 'notice' })
    expect(
      parseProposal('classify_mail', { ...base, surface: 'mail_unsure', preview: null })
    ).toMatchObject({
      ok: true,
      kind: 'mail_resolution',
    })
  })

  it('a later sprint registers a kind and an action without editing the registry', () => {
    const rfq = z.object({
      kind: z.literal('test_rfq_send'),
      headline: z.string(),
      rfqs: z.array(z.string()).min(1),
    })
    registerProposalKind(
      'test_rfq_send',
      rfq,
      (s) => ({ kind: 'test_rfq_send', headline: s.headline, rfqs: s.preview }),
      ['rfqs']
    )
    registerActionKind('test_send_rfqs', 'test_rfq_send')
    expect(
      parseProposal('test_send_rfqs', { ...base, surface: 'review', preview: ['IH-RFQ-2611-P01'] })
    ).toMatchObject({
      ok: true,
      kind: 'test_rfq_send',
    })
    expect(editableFields('test_rfq_send')).toEqual(['rfqs'])
    expect(() => registerActionKind('test_send_rfqs', 'email')).toThrow(/already writes/)
    expect(() => registerActionKind('x', 'nope')).toThrow(/Unknown proposal kind/)
  })

  it('outbound attention carries the failed send and what a person can do', () => {
    const out = parseProposal('outbound_attention', {
      ...base,
      surface: 'review',
      preview: {
        outboundId: '01937a5e-0000-7000-8000-0000000000aa',
        failure: 'Gmail did not confirm the send',
        actions: ['retry', 'mark_sent'],
      },
    })
    expect(out).toMatchObject({ ok: true, kind: 'outbound_attention' })
  })
})

describe('basis hash', () => {
  const h = (t: string) => `h(${t})`
  it('is stable whatever the key order, and changes with any version', () => {
    expect(canonicalVersions({ b: 2, a: '1' })).toBe(canonicalVersions({ a: '1', b: 2 }))
    expect(basisHash({ thread: 'm1', message: 'x' }, h)).toBe(
      basisHash({ message: 'x', thread: 'm1' }, h)
    )
    expect(basisHash({ thread: 'm1' }, h)).not.toBe(basisHash({ thread: 'm2' }, h))
    expect(canonicalVersions({ a: 1 })).toBe('[["a",1]]')
  })
})
