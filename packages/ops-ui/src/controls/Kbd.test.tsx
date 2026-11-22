/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen } from '../lib/test-dom'
import Kbd from './Kbd'
import Spinner from './Spinner'

afterEach(cleanup)

function setPlatform(value: string) {
  Object.defineProperty(navigator, 'platform', { value, configurable: true })
}

describe('Kbd', () => {
  it('renders the keys in a <kbd> with defined io- classes', () => {
    const { container } = render(<Kbd keys="G R" />)
    const kbd = container.querySelector('kbd')!
    expect(kbd).toHaveTextContent('G R')
    expect(problemsIn(kbd.className)).toEqual([])
  })

  it('⌘ stays ⌘ on macOS', () => {
    setPlatform('MacIntel')
    render(<Kbd keys="⌘K" />)
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('⌘ renders Ctrl+ elsewhere', () => {
    setPlatform('Win32')
    render(<Kbd keys="⌘↵" />)
    expect(screen.getByText('Ctrl+↵')).toBeInTheDocument()
  })
})

describe('Spinner', () => {
  it('is decorative and uses defined io- classes', () => {
    const { container } = render(<Spinner />)
    const s = container.firstElementChild!
    expect(s).toHaveAttribute('aria-hidden', 'true')
    expect(s).toHaveClass('io-spin')
    expect(problemsIn(s.className)).toEqual([])
  })
})
