/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, within } from '../lib/test-dom'
import StageTrack from './StageTrack'

afterEach(cleanup)

describe('StageTrack', () => {
  it('is an ordered list with aria-current on the current stage', () => {
    render(<StageTrack flow="enquiry" current="Quoted" />)
    const list = screen.getByRole('list', { name: 'Enquiry stage' })
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(6)
    expect(items[3]).toHaveAttribute('aria-current', 'step')
    expect(items.filter((i) => i.hasAttribute('aria-current'))).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Enquiry, completed')
    expect(items[5]).toHaveTextContent('Won / Lost / Regretted, upcoming')
    for (const i of items) expect(problemsIn(i.className)).toEqual([])
  })

  it('Won, Lost and Regretted fold into the final enquiry stage', () => {
    render(<StageTrack flow="enquiry" current="Lost" />)
    const items = screen.getAllByRole('listitem')
    expect(items[5]).toHaveAttribute('aria-current', 'step')
    expect(items[5]).toHaveTextContent('Won / Lost / Regretted')
  })

  it('order flow has nine stages; custom flows take their own', () => {
    const { rerender } = render(<StageTrack flow="order" current="Inspection" />)
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
    expect(screen.getAllByRole('listitem')[3]).toHaveAttribute('aria-current', 'step')
    rerender(
      <StageTrack
        flow="custom"
        stages={['Reading', 'Bid pack', 'Submitted']}
        current="Bid pack"
        label="Tender"
      />
    )
    expect(screen.getByRole('list', { name: 'Tender' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step')
  })
})
