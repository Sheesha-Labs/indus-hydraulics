/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Select from './Select'

afterEach(cleanup)

const CCY = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'AED', label: 'AED' },
] as const

describe('Select', () => {
  it('a native combobox named by its inline label', () => {
    render(<Select inlineLabel="Currency" options={[...CCY]} />)
    const select = screen.getByRole('combobox', { name: 'Currency' })
    expect(select.tagName).toBe('SELECT')
    expect(problemsIn(select.parentElement!.className)).toEqual([])
    expect(problemsIn(select.className)).toEqual([])
  })

  it('posts its value in FormData', async () => {
    const { container } = render(
      <form>
        <Select name="ccy" aria-label="Currency" defaultValue="USD" options={[...CCY]} />
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('ccy')).toBe('USD')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'EUR')
    expect(new FormData(form).get('ccy')).toBe('EUR')
  })

  it('size md is the 36px field', () => {
    render(<Select size="md" aria-label="Terms" options={[{ value: 'dap', label: 'DAP' }]} />)
    expect(screen.getByRole('combobox').parentElement).toHaveClass('h-io-field')
  })

  it('disabled disables the native control', () => {
    render(<Select disabled aria-label="Terms" options={[{ value: 'dap', label: 'DAP' }]} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
