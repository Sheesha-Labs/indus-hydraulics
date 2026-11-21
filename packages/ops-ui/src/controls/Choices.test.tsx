/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Choices, { choiceText } from './Choices'
import { choiceItem } from './styles'

afterEach(cleanup)

const FILTERS = [
  { value: 'awaiting', label: 'Awaiting decision', count: 14 },
  { value: 'drafts', label: 'Drafts', count: 3 },
  { value: 'superseded', label: 'Superseded' },
] as const

describe('Choices', () => {
  it.each(['md', 'sm'] as const)('%s uses only defined io- classes', (size) => {
    expect(problemsIn(choiceItem({ size }))).toEqual([])
  })

  it('prints "Label · count"', () => {
    expect(choiceText({ value: 'a', label: 'Awaiting decision', count: 14 })).toBe(
      'Awaiting decision · 14'
    )
    expect(choiceText({ value: 'b', label: 'Superseded' })).toBe('Superseded')
  })

  it('with hrefFor: a nav of links, exactly one aria-current', () => {
    render(
      <Choices
        aria-label="Status"
        value="drafts"
        options={[...FILTERS]}
        hrefFor={(v) => `?status=${v}`}
      />
    )
    expect(screen.getByRole('navigation', { name: 'Status' })).toBeInTheDocument()
    const current = screen.getAllByRole('link').filter((a) => a.hasAttribute('aria-current'))
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName('Drafts · 3')
    expect(current[0]).toHaveAttribute('aria-current', 'page')
  })

  it('with onValueChange: pressed buttons that report the choice', async () => {
    const onValueChange = vi.fn()
    render(
      <Choices
        aria-label="Family"
        value="awaiting"
        options={[...FILTERS]}
        onValueChange={onValueChange}
      />
    )
    expect(screen.getByRole('group', { name: 'Family' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Awaiting decision · 14' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Superseded' }))
    expect(onValueChange).toHaveBeenCalledWith('superseded')
  })
})
