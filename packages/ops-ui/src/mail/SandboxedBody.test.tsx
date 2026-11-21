/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { MAIL_BODY_HOSTILE, MAIL_BODY_SUPPLIER_REPLY, fixtureHtml } from '../__fixtures__/mail'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import { FRAME_CSP, frameDocument } from './frame-document'
import MailMessage from './MailMessage'
import SandboxedBody from './SandboxedBody'

afterEach(cleanup)

/** The srcdoc parsed as the browser would parse it, without loading it into a frame. */
function parseSrcdoc(iframe: HTMLIFrameElement): Document {
  return new DOMParser().parseFromString(iframe.getAttribute('srcdoc')!, 'text/html')
}

describe('SandboxedBody', () => {
  it('renders an iframe with sandbox="" (no allow-* token) and a title', () => {
    render(<SandboxedBody html={MAIL_BODY_SUPPLIER_REPLY} />)
    const frame = screen.getByTitle('Email body') as HTMLIFrameElement
    expect(frame.tagName).toBe('IFRAME')
    expect(frame.getAttribute('sandbox')).toBe('')
    expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer')
  })

  it('the frame document carries a CSP meta that blocks remote images, scripts and fetches', () => {
    render(<SandboxedBody html={MAIL_BODY_SUPPLIER_REPLY} />)
    const doc = parseSrcdoc(screen.getByTitle('Email body') as HTMLIFrameElement)
    const meta = doc.head.querySelector('meta[http-equiv="Content-Security-Policy"]')
    expect(meta?.getAttribute('content')).toBe(FRAME_CSP)
    const csp = Object.fromEntries(
      FRAME_CSP.split(';').map((d) => {
        const [name, ...values] = d.trim().split(/\s+/)
        return [name, values]
      })
    )
    expect(csp['default-src']).toEqual(["'none'"])
    expect(csp['img-src']).toEqual(['data:', 'blob:'])
    expect(csp['script-src']).toBeUndefined()
    // The meta must come before any body content to apply to it.
    expect(doc.head.firstElementChild?.getAttribute('charset')).toMatch(/^utf-?8$/i)
  })

  it('hostile HTML lands inside the frame only: the console DOM has none of it', () => {
    const { container } = render(<SandboxedBody html={MAIL_BODY_HOSTILE} />)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(document.querySelectorAll('script, img, [onerror]')).toHaveLength(0)
    expect(document.title).not.toBe('owned')
    // …and it is all in the srcdoc, where the sandbox and the CSP hold it.
    const doc = parseSrcdoc(container.querySelector('iframe')!)
    expect(doc.body.querySelector('script')).not.toBeNull()
    expect(doc.body.querySelector('img[src^="https://"]')).not.toBeNull()
  })

  it('server markup never contains the body as markup (only as an escaped srcdoc attribute)', () => {
    const html = renderToStaticMarkup(
      <MailMessage
        from={{ name: 'Pat Example', address: 'pat@example-valve.example' }}
        to="purchase@ops-sample.example"
        subject="Statement"
        bodyHtml={MAIL_BODY_HOSTILE}
      />
    )
    expect(html).not.toMatch(/<script|<img|<a href="javascript/i)
    expect(html).toMatch(/<iframe sandbox="" srcDoc="|<iframe sandbox="" srcdoc="/)
  })

  it('the nonce admits the base stylesheet; it is escaped', () => {
    const doc = new DOMParser().parseFromString(
      frameDocument(fixtureHtml('<p>Hi</p>'), 'abc"def'),
      'text/html'
    )
    expect(doc.head.querySelector('style')?.getAttribute('nonce')).toBe('abc"def')
    expect(frameDocument(fixtureHtml('<p>Hi</p>'))).not.toContain('nonce=')
  })

  it('height is a class from a closed set; Expand toggles 360 → 720', async () => {
    render(<SandboxedBody html={MAIL_BODY_SUPPLIER_REPLY} />)
    const frame = screen.getByTitle('Email body')
    expect(frame).toHaveClass('h-[360px]')
    expect(frame).not.toHaveAttribute('style')
    const expand = screen.getByRole('button', { name: 'Expand' })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(expand)
    expect(frame).toHaveClass('h-[720px]')
    expect(screen.getByRole('button', { name: 'Collapse' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('preview is 127px with no toggle', () => {
    render(<SandboxedBody html={MAIL_BODY_SUPPLIER_REPLY} height="preview" />)
    expect(screen.getByTitle('Email body')).toHaveClass('h-[127px]')
    expect(screen.queryByRole('button')).toBeNull()
  })
})
