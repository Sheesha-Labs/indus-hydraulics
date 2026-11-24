import { describe, expect, it } from 'vitest'
import { parseBounce } from '@indus/ops-core'
import type { GmailMessage } from './client'
import { headerFlags, parseGmailMessage } from './mime'

/** S05-T03: a bounce's delivery-status part and returned headers survive the MIME walk for parseBounce. */
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64url')

const BOUNCE: GmailMessage = {
  id: 'm-bounce',
  threadId: 't-1',
  labelIds: ['INBOX'],
  internalDate: String(Date.parse('2026-11-24T08:00:00Z')),
  payload: {
    mimeType: 'multipart/report',
    headers: [
      { name: 'From', value: 'Mail Delivery Subsystem <mailer-daemon@example.org>' },
      { name: 'Subject', value: 'Delivery Status Notification (Failure)' },
      {
        name: 'Content-Type',
        value: 'multipart/report; report-type=delivery-status; boundary="b"',
      },
      { name: 'X-SES-Outgoing', value: '2026.11.24' },
    ],
    parts: [
      { partId: '0', mimeType: 'text/plain', body: { data: b64('Address not found.'), size: 18 } },
      {
        partId: '1',
        mimeType: 'message/delivery-status',
        body: {
          data: b64('Final-Recipient: rfc822; buyer@example.test\nAction: failed\nStatus: 5.1.1\n'),
          size: 70,
        },
      },
      {
        partId: '2',
        mimeType: 'message/rfc822',
        headers: [
          { name: 'Message-ID', value: '<ops.42@example.com>' },
          { name: 'X-Indus-Outbound', value: '01937a5e-0000-7000-8000-0000000000aa' },
        ],
        parts: [
          { partId: '2.0', mimeType: 'text/plain', body: { data: b64('original'), size: 8 } },
        ],
      },
    ],
  },
} as GmailMessage

describe('MIME walk · bounces', () => {
  it('keeps the delivery-status text and the returned headers, and an ESP header by prefix', () => {
    const p = parseGmailMessage(BOUNCE)
    expect(p.dsn?.statusText).toContain('Status: 5.1.1')
    expect(p.dsn?.returnedHeadersText).toContain(
      'X-Indus-Outbound: 01937a5e-0000-7000-8000-0000000000aa'
    )
    expect(p.headers['x-ses-outgoing']).toEqual(['2026.11.24'])
    expect(headerFlags(p)).toMatchObject({ deliveryReport: true, bounceSender: true, dsn: p.dsn })

    const bounce = parseBounce({
      fromAddress: p.from.address,
      headers: p.headers,
      dsnText: p.dsn?.statusText ?? null,
      returnedHeadersText: p.dsn?.returnedHeadersText ?? null,
      bodyText: p.text,
    })
    expect(bounce).toMatchObject({
      isBounce: true,
      hard: true,
      finalRecipient: 'buyer@example.test',
      originalMessageId: 'ops.42@example.com',
      xIndusOutbound: '01937a5e-0000-7000-8000-0000000000aa',
    })
  })

  it('an ordinary message has no dsn', () => {
    const p = parseGmailMessage({
      ...BOUNCE,
      payload: {
        mimeType: 'text/plain',
        headers: [{ name: 'From', value: 'a@example.test' }],
        body: { data: b64('hi'), size: 2 },
      },
    } as GmailMessage)
    expect(p.dsn).toBeNull()
    expect(headerFlags(p)).not.toHaveProperty('dsn')
  })
})
