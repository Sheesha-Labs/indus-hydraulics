/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import { formatAge, formatLaterUntil } from './age'
import CheckList from './CheckList'
import ConfidenceLine from './ConfidenceLine'
import Highlight from './Highlight'
import OptionGroup from './OptionGroup'
import ProposalPreview from './ProposalPreview'
import SourceQuote from './SourceQuote'
import UnsureRow from './UnsureRow'
import WhyList from './WhyList'

afterEach(cleanup)

describe('formatAge', () => {
  it.each([
    [-5_000, 'now'],
    [30_000, 'now'],
    [60_000, '1 min'],
    [12 * 60_000 + 59_000, '12 min'],
    [60 * 60_000, '1 h'],
    [130 * 60_000, '2 h 10 min'],
    [3 * 24 * 60 * 60_000 + 5, '3 d'],
    [Number.NaN, 'now'],
  ])('%d ms → %s', (ms, text) => {
    expect(formatAge(ms)).toBe(text)
  })

  it('labels Later presets and a picked time in Dubai time', () => {
    expect(formatLaterUntil('in-1h')).toBe('in 1 hour')
    expect(formatLaterUntil('tomorrow-0900')).toBe('tomorrow at 09:00')
    expect(formatLaterUntil('monday-0900')).toBe('Monday at 09:00')
    expect(formatLaterUntil(new Date('2026-11-20T10:30:00Z'))).toBe('20 Nov, 14:30')
  })
})

describe('ConfidenceLine', () => {
  it.each(['Sure', 'Likely', 'Unsure'] as const)('%s renders the word, never a %%', (level) => {
    const html = renderToStaticMarkup(
      <ConfidenceLine level={level} reason="From the client email." />
    )
    expect(html).toContain(level)
    expect(html).not.toContain('%')
  })

  it('Unsure is in warn', () => {
    render(<ConfidenceLine level="Unsure" />)
    expect(screen.getByText('Unsure')).toHaveClass('text-io-warn')
  })
})

describe('OptionGroup', () => {
  const items = [
    {
      value: 'one',
      title: 'Example Valve Co for both lines',
      sub: 'Lowest landed cost.',
      suggested: true,
    },
    { value: 'split', title: 'Split the lines', tag: 'Drafts the ask' },
  ]

  it('is a fieldset with a legend and native radios inside label cards', async () => {
    const onValueChange = vi.fn<(v: string) => void>()
    render(
      <OptionGroup
        name="opt"
        legend="Choose one"
        items={items}
        defaultValue="one"
        onValueChange={onValueChange}
      />
    )
    const group = screen.getByRole('group', { name: 'Choose one' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group.querySelector('legend')).toHaveTextContent('Choose one')
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toBeChecked()
    expect(radios[0]!.closest('label')).toHaveAttribute('data-state', 'on')
    expect(within(group).getByText('Suggested')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /Split the lines/ }))
    expect(onValueChange).toHaveBeenCalledWith('split')
    expect(radios[1]).toBeChecked()
  })

  it('names itself without a visible legend', () => {
    render(<OptionGroup name="opt" items={items} />)
    expect(screen.getByRole('group', { name: 'Options' })).toBeInTheDocument()
  })
})

describe('shared parts', () => {
  it('WhyList evidence links are real links to /why/<id>', () => {
    render(
      <WhyList
        reasons={[
          { text: 'Reason', evidence: { label: 'Lines tab', evidenceId: 'ev 1' } },
          { text: 'Plain' },
        ]}
      />
    )
    expect(screen.getByRole('link', { name: /Lines tab/ })).toHaveAttribute('href', '/why/ev%201')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('CheckList labels every mark so a flag never rests on colour', () => {
    render(
      <CheckList
        label="Checks"
        items={[
          { key: 'a', mark: 'ok', text: 'Client identifiers: none found', right: '6 fields' },
          { key: 'b', mark: 'warn', text: 'First email to Demo Bearings FZE' },
        ]}
      />
    )
    expect(screen.getByRole('list', { name: 'Checks' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Passed' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Flagged' })).toBeInTheDocument()
  })

  it('ProposalPreview renders its kinds; a link line with an href is a link', () => {
    render(
      <ProposalPreview
        title="Preview · email 1 of 5"
        lines={[
          { key: '1', text: 'To quotes@examplevalve.example' },
          { key: '2', text: 'RFQ IH-RFQ-2611-P01', kind: 'bold' },
          { key: '3', text: 'Open all 5 emails', kind: 'link', href: '/review/A-1' },
        ]}
      />
    )
    expect(screen.getByRole('region', { name: 'Preview · email 1 of 5' })).toBeInTheDocument()
    expect(screen.getByText('RFQ IH-RFQ-2611-P01')).toHaveClass('font-medium')
    expect(screen.getByRole('link', { name: 'Open all 5 emails' })).toHaveAttribute(
      'href',
      '/review/A-1'
    )
  })

  it('Highlight marks the first match; active and at rest differ; no match leaves the text', () => {
    const { container, rerender } = render(
      <Highlight text="Line 3 as PN-10-228 instead." match="PN-10-228" />
    )
    const mark = container.querySelector('mark')!
    expect(mark).toHaveTextContent('PN-10-228')
    expect(mark).toHaveAttribute('data-state', 'off')
    expect(container).toHaveTextContent('Line 3 as PN-10-228 instead.')
    rerender(<Highlight text="Line 3 as PN-10-228 instead." match="PN-10-228" active />)
    expect(container.querySelector('mark')).toHaveAttribute('data-state', 'on')
    rerender(<Highlight text="No match here" match="PN-10-228" />)
    expect(container.querySelector('mark')).toBeNull()
  })

  it('SourceQuote shows the file type, the doc, the active quote and the open link', () => {
    render(
      <SourceQuote
        fileType="PDF"
        doc="EVC-Q-10001.pdf"
        meta="Example Valve Co · 14 Nov"
        text="quoting AED 418.00 per piece"
        match="AED 418.00"
        location="Line 3 · unit price"
        openHref="/documents/1"
      />
    )
    expect(screen.getByText('PDF')).toHaveClass('text-io-bad-solid')
    expect(screen.getByText('AED 418.00').tagName).toBe('MARK')
    expect(screen.getByText('AED 418.00')).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('link', { name: /Open source/ })).toHaveAttribute(
      'href',
      '/documents/1'
    )
  })

  it('UnsureRow: "Unsure ·" with the question; Decide (primary) and Not now by default', async () => {
    const onDecide = vi.fn<() => void>()
    const onNotNow = vi.fn<() => void>()
    render(
      <UnsureRow
        question="Is PN-10-228 an equivalent?"
        reason="Seen on 3 RFQs."
        onDecide={onDecide}
        onNotNow={onNotNow}
      />
    )
    expect(screen.getByText(/Is PN-10-228 an equivalent\? Seen on 3 RFQs\./)).toBeInTheDocument()
    const decide = screen.getByRole('button', { name: 'Decide' })
    expect(decide).toHaveAttribute('data-variant', 'primary')
    await userEvent.click(decide)
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onDecide).toHaveBeenCalledOnce()
    expect(onNotNow).toHaveBeenCalledOnce()
  })
})
