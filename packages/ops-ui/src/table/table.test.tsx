/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { act, cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import DataTable from './DataTable'
import DataTableClient from './DataTableClient'
import TableSkeleton from './TableSkeleton'
import type { Column, RowKind, RowTone } from './types'

afterEach(cleanup)

interface Line {
  id: string
  part: string
  desc: string
  qty: string
  total: string
  state?: 'Quoted' | 'To source'
  kind?: RowKind
  tone?: RowTone
}

const LINES: Line[] = [
  { id: 'l1', part: 'VLV-1001', desc: 'Gate valve', qty: '4', total: '1,200.00', state: 'Quoted' },
  {
    id: 'l2',
    part: 'BRG-2002',
    desc: 'Bearing',
    qty: '24',
    total: '(80.00)',
    state: 'To source',
    tone: 'flag',
  },
  { id: 'l3', part: 'GSK-3003', desc: 'Gasket', qty: '40', total: '—', tone: 'strike' },
  { id: 'sum', part: '', desc: 'Subtotal', qty: '', total: 'USD 1,120.00', kind: 'grand' },
]

const COLUMNS: Column<Line>[] = [
  {
    key: 'part',
    label: 'Part',
    type: 'ref',
    value: (r) => r.part,
    href: (r) => (r.part ? `/parts/${r.part}` : undefined),
    brand: (r) => (r.id === 'l1' ? 'Example' : undefined),
  },
  { key: 'desc', label: 'Description', type: 'text', value: (r) => r.desc, sort: { key: 'desc' } },
  { key: 'qty', label: 'Qty', type: 'num', value: (r) => r.qty, sort: { key: 'qty' } },
  { key: 'total', label: 'Line total', type: 'money', value: (r) => r.total },
  {
    key: 'state',
    label: 'State',
    type: 'chip',
    value: () => '',
    chip: { family: 'line', word: (r) => r.state },
  },
]

const GRID = 'grid-cols-[150px_minmax(0,1fr)_50px_110px_130px]'

function lines(extra: Partial<Parameters<typeof DataTable<Line>>[0]> = {}) {
  return (
    <DataTable
      caption="Enquiry lines"
      gridClass={GRID}
      columns={COLUMNS}
      rows={LINES}
      rowKey={(r) => r.id}
      rowKind={(r) => r.kind ?? 'item'}
      rowTone={(r) => r.tone}
      sort={{ key: 'qty', dir: 'asc' }}
      sortHref={(key, dir) => `/lines?sort=${key}&dir=${dir}`}
      {...extra}
    />
  )
}

describe('DataTable', () => {
  it('is an ARIA table named by its caption, with header and body rowgroups', () => {
    const { container } = render(lines())
    const table = screen.getByRole('table', { name: 'Enquiry lines' })
    const groups = within(table).getAllByRole('rowgroup')
    expect(groups).toHaveLength(2)
    expect(
      within(groups[0]!)
        .getAllByRole('columnheader')
        .map((h) => h.textContent?.replace(/[↑↓]/, ''))
    ).toEqual(['Part', 'Description', 'Qty', 'Line total', 'State'])
    expect(within(groups[1]!).getAllByRole('row')).toHaveLength(4)
    expect(within(groups[1]!).getAllByRole('row')[0]!.querySelectorAll('[role=cell]')).toHaveLength(
      5
    )
    // The grid template is the caller's static class on the header and every row.
    for (const row of within(table).getAllByRole('row')) expect(row).toHaveClass(GRID)
    expect(container.querySelector('[style]')).toBeNull()
  })

  it('sortable headers are links; only the sorted one carries aria-sort', () => {
    render(lines())
    const qty = screen.getByRole('columnheader', { name: /Qty/ })
    expect(qty).toHaveAttribute('aria-sort', 'ascending')
    expect(within(qty).getByRole('link')).toHaveAttribute('href', '/lines?sort=qty&dir=desc')
    const desc = screen.getByRole('columnheader', { name: 'Description' })
    expect(desc).not.toHaveAttribute('aria-sort')
    expect(within(desc).getByRole('link')).toHaveAttribute('href', '/lines?sort=desc&dir=asc')
    expect(screen.getByRole('columnheader', { name: 'Part' }).querySelector('a')).toBeNull()
  })

  it('sets aria-rowcount and aria-rowindex only when paginated', () => {
    const { rerender } = render(lines())
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount')
    rerender(lines({ rowCount: 214, firstRowIndex: 51 }))
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '215')
    const rows = screen.getAllByRole('row')
    expect(rows[0]).toHaveAttribute('aria-rowindex', '1')
    expect(rows[1]).toHaveAttribute('aria-rowindex', '52')
    expect(rows[4]).toHaveAttribute('aria-rowindex', '55')
  })

  it('the ref link is stretched over its row: one tab stop per row', () => {
    render(lines())
    const body = screen.getAllByRole('rowgroup')[1]!
    const items = within(body).getAllByRole('row').slice(0, 3)
    for (const row of items) {
      const stops = row.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')
      expect(stops).toHaveLength(1)
      expect(stops[0]!.className).toContain('after:absolute')
      expect(row).toHaveClass('relative')
    }
    expect(within(items[0]!).getByRole('link', { name: 'VLV-1001' })).toHaveAttribute(
      'href',
      '/parts/VLV-1001'
    )
  })

  it('cells take their look from type and value; chips from the column family', () => {
    render(lines())
    const [l1, l2, l3, grand] = within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')
    const cells = (row: HTMLElement) => [...row.querySelectorAll<HTMLElement>('[role=cell]')]
    expect(cells(l1!)[0]).toHaveClass('text-io-accent')
    expect(cells(l1!)[0]!.textContent).toBe('VLV-1001Example')
    expect(cells(l1!)[2]).toHaveClass('justify-self-end')
    expect(cells(l1!)[4]!.querySelector('[data-part=chip]')).toHaveAttribute('data-tone', 'ok')
    expect(cells(l2!)[3]).toHaveClass('text-io-bad')
    expect(cells(l2!)[4]!.querySelector('[data-part=chip]')).toHaveAttribute('data-tone', 'warn')
    expect(l2).toHaveAttribute('data-tone', 'flag')
    expect(cells(l3!)[1]).toHaveClass('line-through')
    expect(cells(l3!)[3]).toHaveClass('text-io-ink-3', 'line-through')
    expect(cells(l3!)[4]!.querySelector('[data-part=chip]')).toBeNull()
    expect(grand).toHaveAttribute('data-kind', 'grand')
    expect(cells(grand!)[0]).not.toHaveClass('text-io-accent')
    for (const el of document.querySelectorAll<HTMLElement>('[class]'))
      expect(problemsIn(el.className)).toEqual([])
  })

  it('selectedKey forces the sel tone and marks the row current', () => {
    render(lines({ selectedKey: 'l2' }))
    const row = screen.getByRole('link', { name: 'BRG-2002' }).closest('[role=row]')!
    expect(row).toHaveAttribute('data-tone', 'sel')
    expect(row).toHaveAttribute('aria-current', 'true')
  })

  it('a price column prints a word muted, and hide drops a column', () => {
    render(
      <DataTable
        caption="Compare"
        gridClass="grid-cols-[minmax(0,1fr)_110px]"
        columns={COLUMNS}
        hide={['part', 'qty', 'state']}
        rows={[{ id: 'a', part: '', desc: 'Gate valve', qty: '', total: 'No reply' }]}
        rowKey={(r) => r.id}
      />
    )
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getByText('No reply')).toHaveClass('text-io-ink-3')
  })

  it('a group row is one cell spanning every column; empty shows when there are no rows', () => {
    const { rerender } = render(
      <DataTable
        caption="Compare"
        gridClass={GRID}
        columns={COLUMNS}
        rows={[
          { id: 'g', part: '', desc: 'Landed cost per unit', qty: '', total: '', kind: 'group' },
        ]}
        rowKey={(r) => r.id}
        rowKind={(r) => r.kind ?? 'item'}
        groupLabel={(r) => r.desc}
      />
    )
    const cell = screen.getByRole('cell', { name: 'Landed cost per unit' })
    expect(cell).toHaveAttribute('aria-colspan', '5')
    rerender(
      <DataTable
        caption="Lines"
        gridClass={GRID}
        columns={COLUMNS}
        rows={[]}
        rowKey={(r) => r.id}
        empty={<p>No lines yet</p>}
      />
    )
    expect(screen.getByText('No lines yet')).toBeInTheDocument()
    expect(screen.getAllByRole('rowgroup')).toHaveLength(1)
  })
})

function Selectable({ onActivate }: { onActivate: (l: Line) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [key, setKey] = useState<string | undefined>(undefined)
  return (
    <DataTableClient
      caption="Lines"
      gridClass={`grid-cols-[16px_150px_minmax(0,1fr)_50px_110px_130px]`}
      columns={COLUMNS}
      rows={LINES}
      rowKey={(r) => r.id}
      rowKind={(r) => r.kind ?? 'item'}
      {...(key === undefined ? {} : { selectedKey: key })}
      keyboard
      onSelectedKeyChange={setKey}
      onActivate={onActivate}
      selectable={{ selected, onChange: setSelected, label: (r) => `Select ${r.part}` }}
    />
  )
}

describe('DataTableClient', () => {
  it('has a real checkbox per item row and a select-all that shows mixed', async () => {
    render(<Selectable onActivate={() => {}} />)
    const all = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows' })
    const boxes = screen.getAllByRole('checkbox', { name: /^Select [A-Z]/ })
    expect(boxes).toHaveLength(3)
    await userEvent.click(boxes[0]!)
    expect(boxes[0]).toBeChecked()
    expect(all).toHaveAttribute('aria-checked', 'mixed')
    expect(all.indeterminate).toBe(true)
    await userEvent.click(all)
    for (const b of boxes) expect(b).toBeChecked()
    expect(all).toBeChecked()
    await userEvent.click(all)
    for (const b of boxes) expect(b).not.toBeChecked()
  })

  it('J/K and arrows move the selected row and focus its link; X toggles; Enter activates', async () => {
    const onActivate = vi.fn<(l: Line) => void>()
    render(<Selectable onActivate={onActivate} />)
    const link1 = screen.getByRole('link', { name: 'VLV-1001' })
    act(() => link1.focus())
    await userEvent.keyboard('j')
    const row1 = link1.closest('[role=row]')!
    expect(row1).toHaveAttribute('data-tone', 'sel')
    expect(link1).toHaveFocus()
    await userEvent.keyboard('j')
    const link2 = screen.getByRole('link', { name: 'BRG-2002' })
    expect(link2).toHaveFocus()
    expect(link2.closest('[role=row]')).toHaveAttribute('aria-current', 'true')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    // The grand total row is not an item: movement stops on the last item.
    expect(screen.getByRole('link', { name: 'GSK-3003' })).toHaveFocus()
    await userEvent.keyboard('k')
    expect(link2).toHaveFocus()
    await userEvent.keyboard('x')
    expect(screen.getByRole('checkbox', { name: 'Select BRG-2002' })).toBeChecked()
    act(() => screen.getByRole('checkbox', { name: 'Select BRG-2002' }).focus())
    await userEvent.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledWith(LINES[1])
  })
})

describe('TableSkeleton', () => {
  it('is a busy region read as "Loading", with decorative bars and no inline style', () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} label="Loading lines…" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region).toHaveTextContent('Loading lines…')
    expect(container.querySelectorAll('i.io-shimmer')).toHaveLength(16)
    expect(container.querySelector('[style]')).toBeNull()
    for (const el of container.querySelectorAll<HTMLElement>('[class]'))
      expect(problemsIn(el.className)).toEqual([])
  })

  it('reads "Loading" without a label', () => {
    render(<TableSkeleton />)
    expect(screen.getByRole('status')).toHaveTextContent(/^Loading$/)
  })
})
