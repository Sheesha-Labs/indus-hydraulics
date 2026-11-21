/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import BannerSlot, { orderBanners, type SystemBanner } from './BannerSlot'

afterEach(cleanup)

const SAMPLE: SystemBanner[] = [
  { kind: 'info', props: { tone: 'info', children: 'Payments sync within 5 minutes.' } },
  {
    kind: 'mailbox-disconnected',
    props: { tone: 'bad', title: 'sales@ disconnected.', children: 'Nothing is sent.' },
  },
  { kind: 'assistant-paused', props: { tone: 'warn', children: 'The Assistant is paused.' } },
]

describe('BannerSlot', () => {
  it('orders by C23 severity', () => {
    expect(orderBanners(SAMPLE).map((b) => b.kind)).toEqual([
      'mailbox-disconnected',
      'assistant-paused',
      'info',
    ])
  })

  it('shows only the most severe banner and "+2 more", which discloses the rest', async () => {
    render(<BannerSlot banners={SAMPLE} />)
    expect(screen.getByText('sales@ disconnected.')).toBeInTheDocument()
    expect(screen.queryByText('The Assistant is paused.')).toBeNull()
    const more = screen.getByRole('button', { name: '+2 more' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('list', { name: 'More system notices' })
    expect(more).toHaveAttribute('aria-controls', list.id)
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(within(list).getByText('The Assistant is paused.')).toBeInTheDocument()
  })

  it('a single banner has no "more" button; no banners render nothing', () => {
    const { container, rerender } = render(<BannerSlot banners={SAMPLE.slice(0, 1)} />)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<BannerSlot banners={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
