/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import MailFolder from './MailFolder'
import ThreadRow from './ThreadRow'

afterEach(cleanup)

const ROW = {
  href: '?thread=1',
  from: 'Pat Example',
  senderRole: 'Supplier',
  company: 'Example Valve Co',
  time: '10:42',
  subject: 'RE: IH-RFQ-2611-P01 — offer attached',
  type: 'Supplier quote',
  recordRef: 'ENQ-2026-0001',
  assistantNote: 'Captured quote: 3 of 4 lines',
} as const

describe('ThreadRow', () => {
  it('is one tab stop: a single link, named sender first', async () => {
    render(
      <>
        <ThreadRow {...ROW} />
        <ThreadRow {...ROW} href="?thread=2" subject="Second" />
      </>
    )
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAccessibleName(`Pat Example: ${ROW.subject}`)
    await userEvent.tab()
    expect(links[0]).toHaveFocus()
    await userEvent.tab()
    expect(links[1]).toHaveFocus()
  })

  it('marks the selected row with aria-current and the accent bar', () => {
    const { container } = render(
      <>
        <ThreadRow {...ROW} selected />
        <ThreadRow {...ROW} href="?thread=2" />
      </>
    )
    const [selected, other] = screen.getAllByRole('link')
    expect(selected).toHaveAttribute('aria-current', 'true')
    expect(other).not.toHaveAttribute('aria-current')
    const row = container.querySelector('[data-part="thread-row"]')!
    expect(row).toHaveAttribute('data-state', 'selected')
    expect(row).toHaveClass('bg-io-accent-wash')
  })

  it('takes the type chip tone from MAIL_TYPE_TONE and the role tag from MAIL_ROLE_TONE', () => {
    render(<ThreadRow {...ROW} senderRole="Unknown" type="Phishing" />)
    expect(screen.getByText('Phishing')).toHaveAttribute('data-tone', 'bad')
    expect(screen.getByText('Unknown')).toHaveClass('bg-io-warn-tint')
  })

  it('unread sets the sender to 600 and the subject to 500', () => {
    render(<ThreadRow {...ROW} unread />)
    expect(screen.getByText('Pat Example', { selector: 'b' })).toHaveClass('font-semibold')
    expect(screen.getByRole('link')).toHaveClass('font-medium')
    expect(screen.getByRole('link')).toHaveAccessibleName(`Pat Example, unread: ${ROW.subject}`)
  })

  it('renders only token classes', () => {
    const { container } = render(<ThreadRow {...ROW} unread selected />)
    for (const el of container.querySelectorAll('[class]'))
      expect(problemsIn(el.getAttribute('class')!)).toEqual([])
  })
})

describe('MailFolder', () => {
  it('active is navy with aria-current="page"; warn shows the count as a pill', () => {
    render(
      <>
        <MailFolder href="?f=all" label="All" count={58} active />
        <MailFolder href="?f=unsure" label="Unsure" count={3} warn />
      </>
    )
    const [all, unsure] = screen.getAllByRole('link')
    expect(all).toHaveAttribute('aria-current', 'page')
    expect(all).toHaveClass('bg-io-navy')
    expect(unsure).not.toHaveAttribute('aria-current')
    expect(screen.getByText('3')).toHaveClass('bg-io-warn-tint')
  })
})
