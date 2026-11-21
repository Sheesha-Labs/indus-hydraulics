/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import { SearchInput, SearchTrigger } from './Search'

afterEach(cleanup)

describe('SearchTrigger', () => {
  it('is a button (not an input) that opens the command bar', async () => {
    const onOpen = vi.fn()
    render(<SearchTrigger placeholder="Search…" kbd="⌘K" onOpen={onOpen} />)
    const b = screen.getByRole('button', { name: /Search…/ })
    expect(b).toHaveAttribute('aria-haspopup', 'dialog')
    expect(b).toHaveAttribute('aria-keyshortcuts', 'Meta+K')
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(problemsIn(b.className)).toEqual([])
    await userEvent.click(b)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})

describe('SearchInput', () => {
  it('is a named searchbox; the matched spellings describe it', () => {
    render(
      <SearchInput
        size="lg"
        aria-label="Search parts"
        defaultValue="6316 C3"
        matchedSpellings={['6316C3', '6316-C3']}
      />
    )
    const input = screen.getByRole('searchbox', { name: 'Search parts' })
    expect(input).toHaveValue('6316 C3')
    expect(input).toHaveAccessibleDescription('also matches 6316C3, 6316-C3')
    expect(problemsIn(input.closest('label')!.className)).toEqual([])
  })

  it('falls back to a name when it has neither aria-label nor placeholder', () => {
    render(<SearchInput />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
  })

  it('a click on the frame focuses the input', async () => {
    render(<SearchInput aria-label="Search enquiries" kbd="⌘K" />)
    await userEvent.click(screen.getByRole('searchbox').closest('label')!)
    expect(screen.getByRole('searchbox')).toHaveFocus()
  })
})
