/**
 * @vitest-environment jsdom
 */
import './test-env'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '../lib/test-dom'
import type { ActionResult } from './result'
import type { ToastInput } from './Toast'
import ToastProvider, { useToast, type ToastApi } from './ToastProvider'

const captured: { api: ToastApi | null } = { api: null }
function Capture() {
  const api = useToast()
  useEffect(() => {
    captured.api = api
  }, [api])
  return (
    <button type="button" data-testid="page">
      Page control
    </button>
  )
}

function mount() {
  render(
    <ToastProvider>
      <Capture />
    </ToastProvider>
  )
  return {
    polite: () => document.querySelector<HTMLElement>('[data-part="toast-polite"]')!,
    errors: () => document.querySelector<HTMLElement>('[data-part="toast-errors"]')!,
    region: () => screen.getByRole('region', { name: 'Notifications' }),
  }
}

const show = (input: ToastInput) => {
  let id = 0
  act(() => {
    id = captured.api!.toast(input)
  })
  return id
}
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ToastProvider regions', () => {
  it('one polite region, one assertive region for errors; a toast never takes focus', () => {
    const r = mount()
    const page = screen.getByTestId('page')
    page.focus()
    show({ kind: 'success', title: 'Quotation sent' })
    show({ kind: 'error', title: 'Couldn’t reach Zoho Books' })
    expect(r.polite()).toHaveAttribute('aria-live', 'polite')
    expect(r.errors()).toHaveAttribute('aria-live', 'assertive')
    expect(within(r.polite()).getByText('Quotation sent')).toBeInTheDocument()
    expect(within(r.errors()).getByText('Couldn’t reach Zoho Books')).toBeInTheDocument()
    expect(within(r.polite()).queryByText('Couldn’t reach Zoho Books')).toBeNull()
    expect(document.activeElement).toBe(page)
  })

  it('reads the kind before the title, so colour is never the only signal', () => {
    const r = mount()
    show({ kind: 'error', title: 'Couldn’t reach Zoho Books' })
    expect(within(r.errors()).getByRole('listitem')).toHaveTextContent(
      'Error: Couldn’t reach Zoho Books'
    )
  })

  it('auto-dismisses after 6000 ms by default; running toasts stay', () => {
    const r = mount()
    show({ kind: 'success', title: 'Saved' })
    show({ kind: 'running', title: 'Sending 5 RFQs…' })
    advance(5999)
    expect(within(r.polite()).getByText('Saved')).toBeInTheDocument()
    advance(1)
    expect(within(r.polite()).queryByText('Saved')).toBeNull()
    advance(60_000)
    expect(within(r.polite()).getByText('Sending 5 RFQs…')).toBeInTheDocument()
  })

  it('timers pause while the pointer is over the region and resume with the time left', () => {
    const r = mount()
    show({ kind: 'info', title: 'Import paused', durationMs: 4000 })
    advance(3000)
    fireEvent.mouseEnter(r.region())
    advance(10_000)
    expect(within(r.polite()).getByText('Import paused')).toBeInTheDocument()
    fireEvent.mouseLeave(r.region())
    advance(999)
    expect(within(r.polite()).getByText('Import paused')).toBeInTheDocument()
    advance(1)
    expect(within(r.polite()).queryByText('Import paused')).toBeNull()
  })

  it('timers pause while focus is in the region', () => {
    const r = mount()
    show({ kind: 'info', title: 'Import paused', durationMs: 2000 })
    act(() => screen.getByRole('button', { name: 'Dismiss' }).focus())
    advance(10_000)
    expect(within(r.polite()).getByText('Import paused')).toBeInTheDocument()
    act(() => screen.getByTestId('page').focus())
    advance(2000)
    expect(within(r.polite()).queryByText('Import paused')).toBeNull()
  })

  it('F6 moves focus to the newest toast; ✕ dismisses', () => {
    mount()
    show({ kind: 'info', title: 'First' })
    show({ kind: 'warning', title: 'Second', action: { label: 'Open', onAction: () => {} } })
    act(() => {
      fireEvent.keyDown(document, { key: 'F6' })
    })
    expect(document.activeElement).toHaveTextContent('Open')
    fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0]!)
    expect(screen.queryByText('First')).toBeNull()
  })

  it('an action runs and dismisses its toast', () => {
    mount()
    const onAction = vi.fn<() => void>()
    show({
      kind: 'error',
      title: 'Couldn’t reach Zoho Books',
      action: { label: 'Retry', onAction },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(screen.queryByText('Couldn’t reach Zoho Books')).toBeNull()
  })
})

describe('undo toast', () => {
  it('counts down from the server-provided 299000 ms: "Undo 4:59", then "Undo 4:58", gone at 0', () => {
    const r = mount()
    show({
      kind: 'success',
      title: '5 RFQs go from purchase@ at 10:47',
      undo: { remainingMs: 299_000, onUndo: async () => ({ success: true, data: null }) },
    })
    const undo = () => within(r.polite()).queryByRole('button', { name: /^Undo/ })
    expect(undo()).toHaveTextContent('Undo 4:59')
    advance(1000)
    expect(undo()).toHaveTextContent('Undo 4:58')
    // Undo toasts ignore the 6000 ms default: still there a minute in.
    advance(60_000)
    expect(undo()).toHaveTextContent('Undo 3:58')
    advance(237_999)
    expect(undo()).toHaveTextContent('Undo 0:01')
    advance(1)
    expect(undo()).toBeNull()
    expect(screen.queryByText('5 RFQs go from purchase@ at 10:47')).toBeNull()
  })

  it('hover does not stop the server window', () => {
    const r = mount()
    show({
      kind: 'success',
      title: 'Sent',
      undo: { remainingMs: 3000, onUndo: async () => ({ success: true, data: null }) },
    })
    fireEvent.mouseEnter(r.region())
    advance(3000)
    expect(screen.queryByText('Sent')).toBeNull()
  })

  it('Undo is busy while pending and the toast goes on success', async () => {
    mount()
    let finish: (r: ActionResult) => void = () => {}
    show({
      kind: 'success',
      title: 'Sent',
      undo: { remainingMs: 300_000, onUndo: () => new Promise((res) => (finish = res)) },
    })
    const btn = screen.getByRole('button', { name: /^Undo/ })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    await act(async () => finish({ success: true, data: null }))
    expect(screen.queryByText('Sent')).toBeNull()
  })

  it('a failed undo raises an error toast in the assertive region', async () => {
    const r = mount()
    show({
      kind: 'success',
      title: 'Sent',
      undo: {
        remainingMs: 300_000,
        onUndo: async () => ({ success: false, error: 'Too late: the email has left.' }),
      },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Undo/ }))
    })
    expect(within(r.errors()).getByText('Too late: the email has left.')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Capture />)).toThrow('ToastProvider')
    spy.mockRestore()
  })
})
