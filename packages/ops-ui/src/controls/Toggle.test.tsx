/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Toggle from './Toggle'

afterEach(cleanup)

describe('Toggle', () => {
  it('is a switch named by its label, described by its sub line', () => {
    render(<Toggle checked label="Chase suppliers" sub="Up to 3 chasers" />)
    const sw = screen.getByRole('switch', { name: 'Chase suppliers' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toHaveAccessibleDescription('Up to 3 chasers')
    expect(problemsIn(sw.className)).toEqual([])
  })

  it('Space toggles (controlled)', async () => {
    const onCheckedChange = vi.fn()
    render(<Toggle checked={false} onCheckedChange={onCheckedChange} label="Send quotation" />)
    screen.getByRole('switch').focus()
    await userEvent.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('without a handler it keeps its own state', async () => {
    render(<Toggle checked={false} label="Send quotation" />)
    const sw = screen.getByRole('switch')
    sw.focus()
    await userEvent.keyboard(' ')
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByText('Send quotation'))
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('locked is always on, aria-disabled, refuses Space and clicks, and reads its reason', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Toggle
        checked={false}
        onCheckedChange={onCheckedChange}
        locked={{ reason: 'Set by policy' }}
        label="Supplier payments · Never"
      />
    )
    const sw = screen.getByRole('switch', { name: 'Supplier payments · Never' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toHaveAttribute('aria-disabled', 'true')
    expect(sw).toHaveAccessibleDescription('Set by policy')
    sw.focus()
    await userEvent.keyboard(' ')
    await userEvent.click(sw)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('posts "on" as a hidden input while on', () => {
    const { container } = render(
      <form>
        <Toggle checked name="chase" label="Chase" />
        <Toggle checked={false} name="send" label="Send" />
      </form>
    )
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('chase')).toBe('on')
    expect(data.get('send')).toBeNull()
  })
})
