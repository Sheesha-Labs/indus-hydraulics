/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render } from '../lib/test-dom'
import Tag from './Tag'

afterEach(cleanup)

describe('Tag', () => {
  it('renders each kind with defined tokens; lock carries a hidden icon', () => {
    const { container } = render(
      <>
        {(['assistant', 'count', 'level', 'action', 'ref', 'lock'] as const).map((k) => (
          <Tag key={k} kind={k}>
            {k}
          </Tag>
        ))}
      </>
    )
    const tags = container.querySelectorAll('[data-part="tag"]')
    expect(tags).toHaveLength(6)
    for (const t of tags) expect(problemsIn(t.className)).toEqual([])
    const lock = container.querySelector('[data-kind="lock"]')!
    expect(lock.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(lock).toHaveTextContent('lock')
  })
})
