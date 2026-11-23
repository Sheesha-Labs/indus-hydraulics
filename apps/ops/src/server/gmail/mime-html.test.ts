import { describe, expect, it } from 'vitest'
import { htmlToText, sanitizeMailHtml } from './html'
import { headerFlags, parseAddressList, parseGmailMessage } from './mime'
import { FakeGmail } from './testing/fake-gmail'

describe('MIME walk', () => {
  it('reads headers, both bodies, attachments and the threading ids', async () => {
    const gmail = new FakeGmail('purchase@example.test')
    const id = gmail.deliver({
      from: '"Example Valve Co" <RFQ@Example.test>',
      to: ['purchase@example.test', 'Owner Example <owner@example.test>'],
      cc: ['sales@example.test'],
      subject: 'Re: IH-RFQ-2611-P01',
      text: 'Our price is attached.',
      html: '<p>Our price is <b>attached</b>.</p>',
      attachments: [
        { filename: 'quote 01.pdf', mimeType: 'application/pdf', data: Buffer.from('%PDF-1.4 x') },
      ],
      inReplyTo: '<ops.abc@example.test>',
      references: ['<a@example.test>', '<ops.abc@example.test>'],
      headers: {
        'Authentication-Results': 'mx.example.test; spf=pass; dkim=pass; dmarc=pass',
        'Auto-Submitted': 'auto-replied',
        'List-Id': '<news.example.test>',
        'X-Indus-Outbound': 'out-123',
      },
    })
    const p = parseGmailMessage(await gmail.messages.get({ id, format: 'full' }))
    expect(p.from).toEqual({ address: 'rfq@example.test', name: 'Example Valve Co' })
    expect(p.to).toEqual(['purchase@example.test', 'owner@example.test'])
    expect(p.cc).toEqual(['sales@example.test'])
    expect(p.text).toBe('Our price is attached.')
    expect(p.html).toContain('<b>attached</b>')
    expect(p.attachments).toMatchObject([{ filename: 'quote 01.pdf', mimeType: 'application/pdf' }])
    expect(p.inReplyTo).toBe('<ops.abc@example.test>')
    expect(p.references).toEqual(['<a@example.test>', '<ops.abc@example.test>'])
    expect(headerFlags(p)).toMatchObject({
      autoSubmitted: 'auto-replied',
      listId: '<news.example.test>',
      xIndusOutbound: 'out-123',
    })
  })

  it('splits address lists only outside quotes and angle brackets', () => {
    expect(
      parseAddressList('"Doe, Jane" <jane@example.test>, bob@example.test').map((a) => a.address)
    ).toEqual(['jane@example.test', 'bob@example.test'])
  })
})

describe('sanitizeMailHtml', () => {
  it('strips script, style, iframe, forms, handlers and javascript: links; blocks remote images; rewrites cid', () => {
    const out = sanitizeMailHtml(
      '<div onclick="x()">Hi<script>alert(1)</script><style>p{}</style><iframe src="https://e.test"></iframe>' +
        '<form><input></form><a href="javascript:alert(1)">bad</a><a href="https://example.test">ok</a>' +
        '<img src="https://tracker.example.test/p.gif"><img src="cid:logo@x"></div>',
      new Map([['logo@x', 'file-1']])
    )
    expect(out).not.toMatch(/script|style|iframe|form|onclick|javascript:|tracker/)
    expect(out).toContain('data-blocked="remote-image"')
    expect(out).toContain('src="/api/files/file-1"')
    expect(out).toContain('href="https://example.test"')
  })

  it('turns HTML-only mail into text', () => {
    expect(htmlToText('<p>Line one</p><p>Line <b>two</b></p>')).toBe('Line one\n\nLine two')
  })
})
