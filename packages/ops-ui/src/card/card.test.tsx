/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, within } from '../lib/test-dom'
import Card from './Card'
import Contact from './Contact'
import Kpi from './KPI'
import KeyValue from './KV'
import List from './List'
import NeedsRow from './NeedsRow'
import Note from './Note'
import Person from './Person'
import Stat from './Stat'

afterEach(cleanup)

function tokensOk(container: HTMLElement) {
  expect(container.querySelector('[style]')).toBeNull()
  for (const el of container.querySelectorAll<HTMLElement>('[class]'))
    expect(problemsIn(el.className)).toEqual([])
}

describe('Card', () => {
  it('renders its title as a heading at the level the caller sets, with the link and list rows', () => {
    const { container } = render(
      <Card
        eyebrow="Came in since yesterday"
        link={{ label: 'See all', href: '/review' }}
        title="Today"
        titleAs="h2"
        text="Three things changed."
        items={[
          { key: 'a', mark: 'n', title: '2 new enquiries', sub: 'ENQ-2026-0001' },
          { key: 'b', mark: 'ok', title: '3 supplier quotes captured', right: '09:12' },
        ]}
      />
    )
    expect(screen.getByRole('region', { name: 'Today' }).tagName).toBe('SECTION')
    expect(screen.getByRole('heading', { level: 2, name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/review')
    expect(screen.getByRole('list')).toBeInTheDocument()
    tokensOk(container)
  })

  it('defaults the title to h3 and renders key–value pairs as a <dl>', () => {
    render(
      <Card
        eyebrow="Order"
        title="Order"
        pairs={[{ label: 'Client', value: 'Sample Client LLC' }]}
      />
    )
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(screen.getByText('Client').closest('dl')).not.toBeNull()
  })
})

describe('List', () => {
  it('is a <ul>; the mark glyph is hidden and its meaning is read as text', () => {
    render(
      <List
        items={[
          {
            key: 'a',
            mark: 'warn',
            title: '1 price above history',
            right: { label: 'Review', href: '/review/1' },
          },
          { key: 'b', mark: null, title: 'No mark' },
        ]}
      />
    )
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]!).getByRole('img', { name: 'Needs attention' })).toBeInTheDocument()
    expect(within(items[0]!).getByText('!')).toHaveAttribute('aria-hidden', 'true')
    expect(within(items[0]!).getByRole('link', { name: 'Review' })).toHaveClass('text-io-accent')
    expect(within(items[1]!).queryByRole('img')).toBeNull()
    expect(items[1]).toHaveClass('grid-cols-[minmax(0,1fr)_auto]')
  })
})

describe('KV', () => {
  it('is a <dl> of dt/dd pairs; emphasis and links show in the value', () => {
    const { container } = render(
      <KeyValue
        labelWidth={160}
        pairs={[
          { label: 'Payment', value: '30% advance', sub: 'then 70% before dispatch' },
          { label: 'Delivery', value: '14 Dec', emphasis: 'bad' },
          {
            label: 'Quotation',
            value: 'INDUS/Q10001-R2',
            emphasis: 'link',
            href: '/quotations/Q10001-R2',
          },
        ]}
      />
    )
    const dl = container.querySelector('dl')!
    expect(dl).toHaveClass('grid-cols-[160px_minmax(0,1fr)]')
    expect(dl.querySelectorAll(':scope > dt')).toHaveLength(3)
    expect(dl.querySelectorAll(':scope > dd')).toHaveLength(3)
    expect(screen.getByText('14 Dec')).toHaveClass('text-io-bad')
    expect(screen.getByRole('link', { name: 'INDUS/Q10001-R2' })).toHaveAttribute(
      'href',
      '/quotations/Q10001-R2'
    )
    tokensOk(container)
  })

  it('stack puts labels on row 1 and values on row 2 across N columns', () => {
    const { container } = render(
      <KeyValue
        layout="stack"
        cols={3}
        pairs={[
          { label: 'Lines', value: '12' },
          { label: 'Value', value: 'USD 1' },
        ]}
      />
    )
    expect(container.querySelector('dl')).toHaveClass('grid-cols-3')
    expect(screen.getByText('Lines')).toHaveClass('row-start-1')
    expect(screen.getByText('12')).toHaveClass('row-start-2')
  })
})

describe('Stat, KPI, NeedsRow, Person, Contact, Note', () => {
  it('Stat is a <dl> with a total row', () => {
    const { container } = render(
      <Stat
        rows={[
          { label: 'Freight', value: 'AED 10.00' },
          { label: 'Landed', value: 'AED 20.00', total: true },
        ]}
      />
    )
    expect(container.firstElementChild!.tagName).toBe('DL')
    expect(screen.getByText('Landed').parentElement).toHaveClass('border-t')
  })

  it('KPI value is Geist 24/500 and its direction is read as text', () => {
    render(
      <Kpi label="Margin, last 30 days" value="13.7%" sub="−1.7 pts vs estimate" direction="dn" />
    )
    expect(screen.getByText('13.7%')).toHaveClass('text-io-kpi')
    const sub = screen.getByText(/pts vs estimate/)
    expect(sub).toHaveTextContent('Down: −1.7 pts vs estimate')
    expect(sub).toHaveClass('text-io-bad')
    expect(within(sub).getByText('Down:')).toHaveClass('sr-only')
  })

  it('NeedsRow shows the action tag, the record and its buttons', () => {
    render(
      <NeedsRow
        action="Send quotation"
        title="INDUS/Q10001-R2"
        href="/q/1"
        sub="Assistant drafted"
        actions={<button type="button">Review</button>}
      />
    )
    expect(screen.getByText('Send quotation')).toHaveClass('bg-io-accent-tint')
    expect(screen.getByRole('link', { name: 'INDUS/Q10001-R2' })).toHaveAttribute('href', '/q/1')
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('Person hides the initials when the name is shown, and names a bare avatar', () => {
    const { container } = render(
      <>
        <Person who="owner" initials="OE" name="Owner Example" sub="Owner" />
        <Person who="assistant" initials="AS" name="Assistant" />
        <Person who="ext" initials="EV" label="Example Valve Co" size="sm" />
      </>
    )
    expect(screen.getByText('OE')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('AS')).toHaveClass('bg-io-navy', 'rounded-io-7')
    expect(screen.getByRole('img', { name: 'Example Valve Co' })).toHaveClass('size-[22px]')
    tokensOk(container)
  })

  it('Contact is a <dl> with link values; Note takes a tone and a bold lead-in', () => {
    const { container } = render(
      <>
        <Contact
          eyebrow="Client contact"
          rows={[{ label: 'Email', value: 'buyer@example.com', href: 'mailto:buyer@example.com' }]}
        />
        <Note tone="warn" title="On send ·">
          the quotation goes from sales@.
        </Note>
      </>
    )
    expect(container.querySelector('dl dt')).toHaveTextContent('Email')
    expect(screen.getByRole('link', { name: 'buyer@example.com' })).toBeInTheDocument()
    const note = screen.getByRole('note')
    expect(note).toHaveClass('bg-io-note-warn')
    expect(note).toHaveTextContent('On send · the quotation goes from sales@.')
    tokensOk(container)
  })
})
