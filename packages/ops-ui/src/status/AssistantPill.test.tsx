/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import AssistantPill from './AssistantPill'

afterEach(cleanup)

describe('AssistantPill', () => {
  it('prints the default label per status, or the given one', () => {
    render(
      <>
        <AssistantPill status="running" />
        <AssistantPill status="unsure" label="Assistant · 2 unsure" />
      </>
    )
    const running = screen.getByText('Assistant · running')
    expect(running).toHaveAttribute('data-status', 'running')
    expect(problemsIn(running.className)).toEqual([])
    expect(screen.getByText('Assistant · 2 unsure')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('is a button with onClick and a link with href', async () => {
    let clicks = 0
    render(
      <>
        <AssistantPill status="paused" onClick={() => clicks++} />
        <AssistantPill status="off" href="/autopilot" />
      </>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Paused by you' }))
    expect(clicks).toBe(1)
    expect(screen.getByRole('link', { name: 'Assistant off' })).toHaveAttribute(
      'href',
      '/autopilot'
    )
  })
})
