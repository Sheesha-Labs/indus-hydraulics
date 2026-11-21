/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen } from '../lib/test-dom'
import Check from './Check'

afterEach(cleanup)

describe('Check', () => {
  it('is an image named by its label; the glyph is hidden', () => {
    render(<Check mark="ok" label="Passed" />)
    const mark = screen.getByRole('img', { name: 'Passed' })
    expect(mark).toHaveTextContent('✓')
    expect(mark.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('run spins and todo is an empty ring', () => {
    render(
      <>
        <Check mark="run" label="Checking" />
        <Check mark="todo" label="Not started" size="lg" />
      </>
    )
    expect(screen.getByRole('img', { name: 'Checking' })).toHaveClass('io-spin')
    const todo = screen.getByRole('img', { name: 'Not started' })
    expect(todo).toBeEmptyDOMElement()
    expect(todo).toHaveClass('size-5')
  })

  it('every mark uses defined tokens', () => {
    const { container } = render(
      <>
        {(['ok', 'warn', 'bad', 'n', 'acc', 'run', 'todo'] as const).map((m) => (
          <Check key={m} mark={m} label={m} />
        ))}
      </>
    )
    for (const el of container.querySelectorAll('[data-part="check"]'))
      expect(problemsIn(el.className)).toEqual([])
  })
})
