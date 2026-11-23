import { describe, expect, it } from 'vitest'
import { sanitizeSignature, signatureLines, summariseSendAs } from './send-as'

describe('send-as and signature', () => {
  it('keeps accepted aliases (primary first) and the default alias signature, sanitised', () => {
    const summary = summariseSendAs([
      { sendAsEmail: 'info@example.test', verificationStatus: 'pending' },
      {
        sendAsEmail: 'Orders@Example.test',
        verificationStatus: 'accepted',
        isDefault: true,
        signature:
          '<div>Regards,<br><b>Owner Example</b><img src="https://tracker.example.test/x.png"><script>x()</script></div>',
      },
      { sendAsEmail: 'sales@example.test', isPrimary: true },
    ])
    expect(summary.aliases).toEqual(['sales@example.test', 'orders@example.test'])
    expect(summary.defaultAlias).toBe('orders@example.test')
    expect(summary.signatureHtml).toBe('<div>Regards,<br /><b>Owner Example</b></div>')
  })

  it('renders a signature as plain lines for the preview', () => {
    expect(
      signatureLines(
        '<div>Best regards,<br><b>Owner Example</b><br>Example Valve Co &amp; Sons</div>'
      )
    ).toEqual(['Best regards,', 'Owner Example', 'Example Valve Co & Sons'])
    expect(signatureLines(null)).toEqual([])
    expect(sanitizeSignature('<script>bad()</script>')).toBeNull()
  })

  it('keeps a table-laid-out signature on separate lines (rows, and cells side by side)', () => {
    const html =
      '<table><tbody><tr><td><span>Owner Example</span></td></tr><tr><td><span>General Manager</span></td></tr>' +
      '<tr><td>Example Valve Co</td><td>Dubai</td></tr></tbody></table>'
    const clean = sanitizeSignature(html)
    expect(clean).toContain('<tr>')
    expect(signatureLines(clean)).toEqual([
      'Owner Example',
      'General Manager',
      'Example Valve Co Dubai',
    ])
  })
})
