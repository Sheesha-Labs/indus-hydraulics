import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MAIL_BODY_SUPPLIER_REPLY } from '../__fixtures__/mail'
import AssistantNote from './AssistantNote'
import AttachmentChip from './AttachmentChip'
import RenderedEmail from './Email'
import MailMessage from './MailMessage'

const FROM = { name: 'Sam Sample', address: 'buyer@sample-client.example' }

describe('RenderedEmail', () => {
  const html = renderToStaticMarkup(
    <RenderedEmail
      subject="RE: INDUS/Q10001-R2"
      from={FROM}
      to="sales@ops-sample.example"
      cc="purchase@ops-sample.example"
      time="10:42"
      body={<p>Thank you for the quotation.</p>}
      signature="Sam Sample · Sample Client LLC"
    />
  )

  it('is the one part set in --io-mail-font, with the mail greys and the e-mail shadow', () => {
    expect(html).toContain('font-[family-name:var(--io-mail-font)]')
    expect(html).toContain('text-io-mail-ink')
    expect(html).toContain('border-io-mail-rule')
    expect(html).toContain('shadow-io-e-mail')
  })

  it('prints the header the recipient sees', () => {
    expect(html).toContain('&lt;buyer@sample-client.example&gt;')
    expect(html).toContain('to sales@ops-sample.example · cc purchase@ops-sample.example · 10:42')
    expect(html).toContain('Sam Sample · Sample Client LLC')
  })

  it('no other Mail part uses the mail font (the ops-no-mono exemption is Email.tsx alone)', () => {
    const others = readdirSync(import.meta.dirname).filter(
      (f) => /\.tsx?$/.test(f) && f !== 'Email.tsx' && !f.endsWith('.test.tsx')
    )
    expect(others.length).toBeGreaterThan(5)
    for (const f of others)
      expect(readFileSync(join(import.meta.dirname, f), 'utf8'), f).not.toContain('io-mail-font')
    const message = renderToStaticMarkup(
      <MailMessage
        from={FROM}
        to="sales@ops-sample.example"
        subject="Hi"
        bodyHtml={MAIL_BODY_SUPPLIER_REPLY}
      />
    )
    expect(message).not.toContain('io-mail')
  })
})

describe('AttachmentChip', () => {
  it('colours the type label: PDF bad-solid, XLS/CSV ok, DOC accent', () => {
    expect(renderToStaticMarkup(<AttachmentChip fileType="PDF" name="a.pdf" />)).toContain(
      'text-io-bad-solid'
    )
    expect(renderToStaticMarkup(<AttachmentChip fileType="CSV" name="a.csv" />)).toContain(
      'text-io-ok'
    )
    expect(renderToStaticMarkup(<AttachmentChip fileType="DOC" name="a.docx" />)).toContain(
      'text-io-accent'
    )
  })

  it('unavailable is dashed, says so in words and is never a link', () => {
    const html = renderToStaticMarkup(
      <AttachmentChip fileType="PDF" name="Datasheets.pdf" href="?f=1" unavailable />
    )
    expect(html).toContain('border-dashed')
    expect(html).toContain('(not available)')
    expect(html).not.toContain('<a ')
  })

  it('with href it is a link', () => {
    expect(
      renderToStaticMarkup(<AttachmentChip fileType="PDF" name="a.pdf" href="?f=1" />)
    ).toMatch(/^<a href="\?f=1"/)
  })
})

describe('AssistantNote', () => {
  it('carries the ASSISTANT tag and an optional "… →" link', () => {
    const html = renderToStaticMarkup(
      <AssistantNote link={{ label: 'ENQ-2026-0001', href: '?r=1' }}>Linked.</AssistantNote>
    )
    expect(html).toContain('data-kind="assistant"')
    expect(html).toMatch(
      /<a href="\?r=1"[^>]*>ENQ-2026-0001 <span aria-hidden="true">→<\/span><\/a>/
    )
    expect(renderToStaticMarkup(<AssistantNote>Linked.</AssistantNote>)).not.toContain('<a ')
  })
})
