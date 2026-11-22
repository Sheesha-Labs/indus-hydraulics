/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { act, cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import TableSkeletonFromTable from '../table/TableSkeleton'
import { EMPTY_COPY, EMPTY_LISTS } from './empty-copy'
import EmptyState from './EmptyState'
import ErrorState, { errorDetails } from './ErrorState'
import { TableSkeleton } from './index'
import InlineState from './InlineState'
import OfflineState from './OfflineState'

afterEach(cleanup)

function tokensOk(container: HTMLElement) {
  expect(container.querySelector('[style]')).toBeNull()
  for (const el of container.querySelectorAll<HTMLElement>('[class]'))
    expect(problemsIn(el.getAttribute('class') ?? '')).toEqual([])
}

describe('EmptyState', () => {
  it.each(EMPTY_LISTS.map((l) => [l]))(
    'the %s preset renders its mark, copy and buttons',
    (list) => {
      const copy = EMPTY_COPY[list]
      const { container } = render(<EmptyState list={list} />)
      expect(screen.getByRole('heading', { level: 2, name: copy.title })).toBeInTheDocument()
      expect(screen.getByText(copy.text)).toBeInTheDocument()
      expect(screen.getByText(copy.mark)).toHaveAttribute('aria-hidden', 'true')
      const links = screen.queryAllByRole('link')
      expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual(
        copy.actions.map((a) => [a.label, a.href])
      )
      expect(copy.actions.filter((a) => a.primary).length).toBeLessThanOrEqual(1)
      tokensOk(container)
    }
  )

  it('the ten lists are all covered, each with a two-letter mark', () => {
    expect(Object.keys(EMPTY_COPY).sort()).toEqual([...EMPTY_LISTS].sort())
    for (const l of EMPTY_LISTS) expect(EMPTY_COPY[l].mark).toMatch(/^[A-Z][a-z]$/)
  })

  it('a caller overrides the preset, aligns centre and goes bare', () => {
    const { container } = render(
      <EmptyState
        list="parts"
        title="No parts match"
        actions={<button type="button">Clear filters</button>}
        align="center"
        bare
        headingLevel={3}
      />
    )
    expect(screen.getByRole('heading', { level: 3, name: 'No parts match' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('items-center', 'text-center')
  })
})

describe('ErrorState', () => {
  const SECRET = 'PrismaClientKnownRequestError P2002 on ops.client_secret'
  let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>

  beforeEach(() => {
    writeText = vi.fn<(text: string) => Promise<void>>(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  })

  it('never renders or copies the error message or stack', async () => {
    const error = Object.assign(new Error(SECRET), { digest: '2611-0419' })
    const { container } = render(<ErrorState error={error} onRetry={() => {}} />)
    expect(container.textContent).not.toContain(SECRET)
    expect(container.textContent).not.toContain('PrismaClient')
    expect(screen.getByText('Error ID e-2611-0419')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Copy error details' }))
    expect(writeText).toHaveBeenCalledTimes(1)
    const copied = String(writeText.mock.calls[0]?.[0])
    expect(copied).not.toContain(SECRET)
    expect(copied).not.toContain(error.stack?.split('\n')[1] ?? '\u0000')
    expect(copied.split('\n').map((l) => l.split(':')[0])).toEqual(['Error ID', 'Route', 'Time'])
    expect(copied).toContain('Error ID: e-2611-0419')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    tokensOk(container)
  })

  it('errorDetails holds the id, the route and the time only', () => {
    expect(errorDetails('abc', '/enquiries', new Date('2026-09-30T06:41:00Z'))).toBe(
      'Error ID: e-abc\nRoute: /enquiries\nTime: 2026-09-30T06:41:00.000Z'
    )
    expect(errorDetails(undefined, '/', new Date(0))).toContain('Error ID: none')
  })

  it('Try again calls onRetry; without onRetry there is no Try again', async () => {
    const onRetry = vi.fn<() => void>()
    const { unmount } = render(<ErrorState errorId="x1" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    unmount()
    render(<ErrorState />)
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.queryByText(/Error ID/)).toBeNull()
  })

  it('says when the copy failed', async () => {
    writeText.mockImplementation(async () => {
      throw new Error('denied')
    })
    render(<ErrorState errorId="x2" />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy error details' }))
    expect(screen.getByRole('button', { name: 'Couldn’t copy' })).toBeInTheDocument()
  })
})

describe('OfflineState', () => {
  it('shows when data last arrived and retries on the button and on reconnect', async () => {
    const onRetry = vi.fn<() => void>()
    render(<OfflineState lastSynced={new Date('2026-09-30T06:41:00Z')} onRetry={onRetry} />)
    expect(screen.getByRole('heading', { name: 'You’re offline' })).toBeInTheDocument()
    expect(screen.getByText('Last synced 10:41')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry now' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(onRetry).toHaveBeenCalledTimes(2)
  })
})

describe('InlineState', () => {
  it.each([
    ['loading', 'Loading…'],
    ['error', 'Couldn’t save.'],
    ['empty', 'Nothing here yet.'],
    ['saved', 'Saved'],
  ] as const)('%s is a status line with its default text', (kind, text) => {
    const { container } = render(<InlineState kind={kind} />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(text)
    expect(status).toHaveAttribute('data-kind', kind)
    expect(status.querySelector('[data-part=spinner]') !== null).toBe(kind === 'loading')
    expect(status).toHaveClass(kind === 'error' ? 'text-io-bad' : 'text-io-ink-3')
    tokensOk(container)
  })

  it('takes its own text and an action', () => {
    render(
      <InlineState
        kind="error"
        text="Couldn’t save. Retrying in 2 minutes."
        action={<button type="button">Retry now</button>}
      />
    )
    const status = screen.getByRole('status')
    expect(within(status).getByRole('button', { name: 'Retry now' })).toBeInTheDocument()
  })
})

describe('TableSkeleton', () => {
  it('is the Table kit’s part, re-exported rather than duplicated', () => {
    expect(TableSkeleton).toBe(TableSkeletonFromTable)
    render(<TableSkeleton rows={4} label="Reading 3 attachments…" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })
})
