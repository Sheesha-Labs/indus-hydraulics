/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render } from '../lib/test-dom'
import SignoffTag from './SignoffTag'

afterEach(cleanup)

describe('SignoffTag', () => {
  it('is a level tag reading "Default · awaiting sign-off" with the reason for screen readers', () => {
    const { container } = render(<SignoffTag />)
    const tag = container.querySelector('[data-part="tag"]')!
    expect(tag).toHaveAttribute('data-kind', 'level')
    expect(problemsIn(tag.className)).toEqual([])
    const sr = tag.querySelector('.sr-only')!
    expect(sr).toHaveTextContent('This value has not been confirmed by the Owner yet.')
    expect(tag.textContent?.replace(sr.textContent ?? '', '')).toBe('Default · awaiting sign-off')
  })
})
