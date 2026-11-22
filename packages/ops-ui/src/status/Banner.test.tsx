/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, within } from '../lib/test-dom'
import Banner, { BannerAction } from './Banner'

afterEach(cleanup)

describe('Banner', () => {
  it('is a status with a bold lead-in and its actions', () => {
    render(
      <Banner
        tone="warn"
        title="Bank details changed."
        actions={<BannerAction href="#cb">Record call-back</BannerAction>}
      >
        Payments are blocked until you record a call-back.
      </Banner>
    )
    const b = screen.getByRole('status')
    expect(within(b).getByText('Bank details changed.').tagName).toBe('B')
    expect(within(b).getByRole('link', { name: 'Record call-back' })).toHaveAttribute('href', '#cb')
    expect(problemsIn(b.className)).toEqual([])
  })

  it('bad is an alert unless it has been shown before', () => {
    const { rerender } = render(<Banner tone="bad">Mailbox disconnected.</Banner>)
    expect(screen.getByRole('alert')).toHaveTextContent('Mailbox disconnected.')
    rerender(
      <Banner tone="bad" announce={false}>
        Mailbox disconnected.
      </Banner>
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('the assistant tone leads with the ASSISTANT tag; strip is 40px full width with no radius', () => {
    render(
      <Banner tone="assistant" strip actions={<BannerAction>Review</BannerAction>}>
        drafted the quotation
      </Banner>
    )
    const b = screen.getByRole('status')
    expect(within(b).getByText('Assistant')).toHaveAttribute('data-kind', 'assistant')
    expect(b).toHaveClass('h-io-strip', 'rounded-none', 'w-full')
    expect(within(b).getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('an icon is a labelled check mark', () => {
    render(
      <Banner tone="ok" icon="ok">
        Synced.
      </Banner>
    )
    expect(screen.getByRole('img', { name: 'Done' })).toBeInTheDocument()
  })
})
