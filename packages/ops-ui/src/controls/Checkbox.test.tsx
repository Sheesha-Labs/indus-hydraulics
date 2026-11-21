/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Checkbox from './Checkbox'
import RadioGroup, { Radio } from './Radio'

afterEach(cleanup)

describe('Checkbox', () => {
  it('is a native checkbox named by its label and described by its sub line', () => {
    render(<Checkbox checked label="Include drawings" sub="PDF only" onChange={() => {}} />)
    const box = screen.getByRole('checkbox', { name: 'Include drawings' })
    expect(box).toBeChecked()
    expect(box).toHaveAccessibleDescription('PDF only')
    expect(problemsIn(box.className)).toEqual([])
  })

  it("'mixed' sets aria-checked=mixed and the DOM indeterminate flag", () => {
    render(<Checkbox checked="mixed" label="3 of 12 lines" onChange={() => {}} />)
    const box = screen.getByRole<HTMLInputElement>('checkbox', { name: '3 of 12 lines' })
    expect(box).toHaveAttribute('aria-checked', 'mixed')
    expect(box.indeterminate).toBe(true)
    expect(box).toHaveAttribute('data-state', 'mixed')
  })

  it('uncontrolled: a click clears mixed and checks it', async () => {
    render(<Checkbox checked="mixed" label="Lines" />)
    const box = screen.getByRole<HTMLInputElement>('checkbox')
    await userEvent.click(box)
    expect(box.indeterminate).toBe(false)
    expect(box).not.toHaveAttribute('aria-checked')
    expect(box).toBeChecked()
  })

  it('locked stays checked, is aria-disabled and refuses clicks', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox locked={{ reason: 'Set by policy' }} label="Identifier check" onChange={onChange} />
    )
    const box = screen.getByRole('checkbox', { name: 'Identifier check' })
    expect(box).toBeChecked()
    expect(box).toHaveAttribute('aria-disabled', 'true')
    expect(box).toHaveAccessibleDescription('Set by policy')
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Radio', () => {
  it('RadioGroup is a fieldset named by its legend; arrows move the checked radio', async () => {
    render(
      <RadioGroup
        name="vat"
        legend="VAT treatment"
        defaultValue="export"
        options={[
          { value: 'export', label: 'Export · zero-rated', sub: 'VAT 0%' },
          { value: 'local', label: 'Local · 5%' },
        ]}
      />
    )
    expect(screen.getByRole('group', { name: 'VAT treatment' })).toBeInTheDocument()
    const exportRadio = screen.getByRole('radio', { name: 'Export · zero-rated' })
    expect(exportRadio).toBeChecked()
    expect(exportRadio).toHaveAccessibleDescription('VAT 0%')
    await userEvent.click(screen.getByRole('radio', { name: 'Local · 5%' }))
    expect(screen.getByRole('radio', { name: 'Local · 5%' })).toBeChecked()
    expect(problemsIn(exportRadio.className)).toEqual([])
  })

  it('controlled RadioGroup reports the chosen value', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        name="vat"
        legend="VAT"
        value="export"
        onValueChange={onValueChange}
        options={[
          { value: 'export', label: 'Export' },
          { value: 'local', label: 'Local' },
        ]}
      />
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Local' }))
    expect(onValueChange).toHaveBeenCalledWith('local')
  })

  it('Radio alone is a native radio with its label', () => {
    render(<Radio name="r" value="a" label="Local · 5%" />)
    expect(screen.getByRole('radio', { name: 'Local · 5%' })).not.toBeChecked()
  })
})
