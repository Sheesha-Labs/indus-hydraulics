import { describe, expect, it } from 'vitest'
import { extractableSegments, isForwardSubject, segmentEmail } from './email-segments'

const kinds = (body: string, isForward = false) =>
  segmentEmail(body, { isForward }).map((s) => [s.kind, body.slice(s.start, s.end).split('\n')[0]])

describe('segmentEmail', () => {
  it('fresh text, a sign-off and an earlier reply', () => {
    const body = [
      'Please quote 10 nos ball valve 2".',
      '',
      'Best regards,',
      'Sample Buyer',
      'On Mon, 3 Nov 2026 at 10:00, Example Sales wrote:',
      '> Thank you for your enquiry.',
    ].join('\n')
    expect(kinds(body)).toEqual([
      ['fresh', 'Please quote 10 nos ball valve 2".'],
      ['signature', 'Best regards,'],
      ['quoted_reply', 'On Mon, 3 Nov 2026 at 10:00, Example Sales wrote:'],
    ])
  })

  it('a Gmail forward keeps the forwarded enquiry and reads its header', () => {
    const body = [
      'Please address.',
      '',
      '---------- Forwarded message ---------',
      'From: Sample Buyer <buyer@sample-client.test>',
      'Date: Mon, 3 Nov 2026 at 09:12',
      'Subject: RFQ SC-1182',
      'To: <sales@example.test>',
      '',
      'Dear Sir, kindly quote:',
      '1. Ball valve 2" - 10 nos',
    ].join('\n')
    const segs = segmentEmail(body)
    const fwd = segs.find((s) => s.kind === 'forwarded')!
    expect(fwd.header).toEqual({
      from: 'Sample Buyer <buyer@sample-client.test>',
      date: 'Mon, 3 Nov 2026 at 09:12',
      subject: 'RFQ SC-1182',
      to: '<sales@example.test>',
    })
    expect(body.slice(fwd.start, fwd.end)).toContain('1. Ball valve 2" - 10 nos')
    expect(extractableSegments(segs).map((s) => s.kind)).toEqual(['fresh', 'forwarded'])
  })

  it('an Outlook forward: the first header block is the forward when the subject says Fw:', () => {
    const body = [
      'FYI',
      'From: Sample Buyer',
      'Sent: Monday, November 3, 2026 9:12 AM',
      'To: Example Sales',
      'Subject: RFQ',
      '',
      'Kindly quote 5 sets gasket kit.',
    ].join('\n')
    expect(segmentEmail(body, { isForward: true }).map((s) => s.kind)).toEqual([
      'fresh',
      'forwarded',
    ])
    expect(segmentEmail(body, { isForward: false }).map((s) => s.kind)).toEqual([
      'fresh',
      'quoted_reply',
    ])
  })

  it('isForwardSubject', () => {
    expect(isForwardSubject('Fwd: RFQ')).toBe(true)
    expect(isForwardSubject('FW: RFQ')).toBe(true)
    expect(isForwardSubject('RFQ fw: x')).toBe(false)
    expect(isForwardSubject(null)).toBe(false)
  })
})
