/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '@indus/ops-ui/overlay'
import { useEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { evidenceFixture, FIXTURE_EVIDENCE_ID } from '../../data/evidence'
import { fixtureBanners } from '../../data/shell'
import { ConfirmProvider, useConfirm, type Confirm } from './confirm'
import SystemBanners from './SystemBanners'
import WhyDrawer from './WhyDrawer'

const back = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push: vi.fn(), refresh: vi.fn() }),
}))

// Radix gaps in jsdom (as the Overlay kit's own tests fill them).
const g = globalThis as unknown as Record<string, unknown>
g.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
const proto = Element.prototype as unknown as Record<string, unknown>
proto.hasPointerCapture ??= () => false
proto.releasePointerCapture ??= () => undefined
proto.scrollIntoView ??= () => undefined

afterEach(() => {
  cleanup()
  back.mockReset()
})

let confirm: Confirm | null = null
function Grab() {
  const c = useConfirm()
  useEffect(() => {
    confirm = c
  }, [c])
  return null
}

const evidence = evidenceFixture(FIXTURE_EVIDENCE_ID, 'local')!

function renderWhyWithConfirm() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <Grab />
        <WhyDrawer evidence={evidence} />
      </ConfirmProvider>
    </ToastProvider>
  )
}

describe('layers: the Why? drawer with a ConfirmDialog on top', () => {
  it('Escape closes only the confirm first, then the drawer (router.back)', async () => {
    const user = userEvent.setup()
    renderWhyWithConfirm()
    const drawer = await screen.findByRole('dialog', { name: /Line 1/ })
    const keep = screen.getByRole('button', { name: 'Keep' })
    keep.focus()

    let answer: Promise<boolean> | undefined
    act(() => {
      answer = confirm!({
        title: 'Block Example Valve Co?',
        consequences: ['New RFQs stop'],
        confirmLabel: 'Block supplier',
        onConfirm: async () => ({ success: true, data: undefined }),
      })
    })
    const dialog = await screen.findByRole('alertdialog', { name: 'Block Example Valve Co?' })
    // Initial focus on Cancel, the safe default.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }))
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(dialog.isConnected).toBe(false))
    expect(drawer.isConnected).toBe(true)
    expect(back).not.toHaveBeenCalled()
    await expect(answer!).resolves.toBe(false)
    await waitFor(() => expect(document.activeElement).toBe(keep))

    await user.keyboard('{Escape}')
    await waitFor(() => expect(back).toHaveBeenCalledTimes(1))
  })

  it('a confirmed action resolves true and closes the dialog', async () => {
    const user = userEvent.setup()
    renderWhyWithConfirm()
    await screen.findByRole('dialog', { name: /Line 1/ })
    let answer: Promise<boolean> | undefined
    act(() => {
      answer = confirm!({
        title: 'Remove the sample?',
        consequences: ['It is removed'],
        confirmLabel: 'Remove',
        onConfirm: async () => ({ success: true, data: undefined }),
      })
    })
    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await expect(answer!).resolves.toBe(true)
    await waitFor(() => expect(screen.queryByRole('alertdialog')?.isConnected ?? false).toBe(false))
  })

  it('the not-found state has no tabs and no Keep', async () => {
    render(
      <ToastProvider>
        <WhyDrawer evidence={null} />
      </ToastProvider>
    )
    await screen.findByRole('dialog', { name: 'We can’t find that evidence' })
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Keep' })).toBeNull()
  })
})

describe('banner precedence (C23)', () => {
  it('one banner, the most severe, and "+n more" for the rest', () => {
    render(<SystemBanners banners={fixtureBanners()} />)
    const banners = document.querySelectorAll('[data-part="banner"]')
    expect(banners).toHaveLength(1)
    expect(banners[0]?.textContent).toContain('sales@ disconnected.')
    expect(screen.getByRole('button', { name: '+2 more' }).isConnected).toBe(true)
  })

  it('offline joins the rest in its place: below a disconnected mailbox, above info', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    try {
      const { unmount } = render(<SystemBanners banners={fixtureBanners()} />)
      expect(document.querySelector('[data-part="banner"]')?.textContent).toContain(
        'sales@ disconnected.'
      )
      expect(screen.getByRole('button', { name: '+3 more' }).isConnected).toBe(true)
      unmount()
      render(<SystemBanners banners={[fixtureBanners()[0]!]} />)
      expect(document.querySelector('[data-part="banner"]')?.textContent).toContain(
        'You’re offline.'
      )
      expect(screen.getByRole('button', { name: '+1 more' }).isConnected).toBe(true)
    } finally {
      // The own property shadows jsdom's getter on the prototype; removing it restores it.
      Reflect.deleteProperty(navigator, 'onLine')
    }
  })

  it('nothing to say renders nothing', () => {
    render(<SystemBanners banners={[]} />)
    expect(document.querySelector('[data-part="banner-slot"]')).toBeNull()
  })
})
