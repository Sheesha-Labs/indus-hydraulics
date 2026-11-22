/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Segmented from './Segmented'
import { segmentedGroup, segmentedItem } from './styles'

afterEach(cleanup)

const VIEWS = [
  { value: 'table', label: 'Table' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
] as const

describe('Segmented recipes', () => {
  it.each(['md', 'sm'] as const)('%s uses only defined io- classes', (size) => {
    expect(problemsIn(`${segmentedGroup({ size })} ${segmentedItem({ size })}`)).toEqual([])
  })
})

describe('Segmented (radiogroup)', () => {
  it('is a named radiogroup with one tab stop on the checked option', () => {
    render(<Segmented aria-label="View" value="board" options={[...VIEWS]} />)
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    expect(radios.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
    expect(screen.getByRole('radio', { name: 'Board' })).toHaveAttribute('aria-checked', 'true')
  })

  it('arrows move and select, wrapping; Home and End jump', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Segmented
        aria-label="View"
        value="table"
        options={[...VIEWS]}
        onValueChange={onValueChange}
      />
    )
    screen.getByRole('radio', { name: 'Table' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('board')
    expect(screen.getByRole('radio', { name: 'Board' })).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(onValueChange).toHaveBeenLastCalledWith('calendar')

    await userEvent.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('calendar')
    await userEvent.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('table')

    rerender(
      <Segmented
        aria-label="View"
        value="calendar"
        options={[...VIEWS]}
        onValueChange={onValueChange}
      />
    )
    expect(screen.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'true')
  })

  it('without a handler it keeps its own selection', async () => {
    render(<Segmented aria-label="View" value="table" options={[...VIEWS]} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }))
    expect(screen.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute('aria-checked', 'false')
  })

  it('a bad count still prints its number', () => {
    render(
      <Segmented
        aria-label="Queue"
        value="all"
        options={[
          { value: 'all', label: 'All', count: 23 },
          { value: 'needs', label: 'Needs you', count: 3, countTone: 'bad' },
        ]}
      />
    )
    const needs = screen.getByRole('radio', { name: 'Needs you 3' })
    expect(needs.querySelector('[data-part="count"]')).toHaveAttribute('data-tone', 'bad')
  })
})

describe('Segmented (links)', () => {
  it('renders a nav of links with aria-current on the current view', () => {
    render(
      <Segmented
        aria-label="View"
        value="board"
        options={[...VIEWS]}
        hrefFor={(v) => `?view=${v}`}
      />
    )
    expect(screen.getByRole('navigation', { name: 'View' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByRole('link', { name: 'Board' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Table' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Table' })).toHaveAttribute('href', '?view=table')
  })
})
