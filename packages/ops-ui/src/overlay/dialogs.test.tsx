/**
 * @vitest-environment jsdom
 */
import './test-env'
import { useRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { act, cleanup, fireEvent, render, screen, userEvent, within } from '../lib/test-dom'
import ConfirmDialog from './ConfirmDialog'
import Drawer from './Drawer'
import type { ActionResult } from './result'
import Modal from './Modal'
import * as styles from './styles'

afterEach(cleanup)

// Every recipe in styles.ts resolves to real io- tokens (an unknown token renders nothing, silently).
describe('overlay recipes', () => {
  it('use only defined io- classes', () => {
    const strings: string[] = []
    for (const v of Object.values(styles)) {
      if (typeof v === 'string') strings.push(v)
      else if (typeof v === 'function') strings.push(String((v as (p: object) => string)({})))
      else if (v && typeof v === 'object') strings.push(...Object.values(v).map(String))
    }
    strings.push(
      styles.modalPanel({ width: 480 }),
      styles.modalTitle({ tone: 'danger' }),
      styles.drawerPanel({ width: 420 }),
      ...(['success', 'info', 'warning', 'error', 'running'] as const).map((kind) =>
        styles.toastGlyph({ kind })
      ),
      styles.menuItem({ danger: true }),
      styles.popoverPanel({ width: 360 })
    )
    expect(problemsIn(strings.join(' '))).toEqual([])
  })
})

function ModalHarness({
  withTrigger = true,
  onOpenChange,
}: {
  withTrigger?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  // Bumping `gen` replaces the trigger's DOM node while the modal is open.
  const [gen, setGen] = useState(0)
  const back = useRef<HTMLButtonElement>(null)
  const change = (o: boolean) => {
    setOpen(o)
    onOpenChange?.(o)
  }
  return (
    <main>
      <button type="button">Before</button>
      {withTrigger ? null : (
        <button type="button" ref={back} onClick={() => change(true)}>
          Opener
        </button>
      )}
      <Modal
        open={open}
        onOpenChange={change}
        title="Link to an enquiry"
        {...(withTrigger
          ? {
              trigger: (
                <button key={gen} type="button" data-gen={gen}>
                  Open
                </button>
              ),
            }
          : { returnFocusRef: back })}
        consequences={['The thread moves to the enquiry']}
        note="Nothing is sent"
        actions={
          <>
            <button type="button" onClick={() => setGen((g) => g + 1)}>
              Re-render trigger
            </button>
            <button type="button" onClick={() => change(false)}>
              Done
            </button>
          </>
        }
      >
        <p>Pick the enquiry.</p>
      </Modal>
    </main>
  )
}

const active = () => document.activeElement as HTMLElement | null

describe('Modal', () => {
  it('is a dialog named by its title and described by its body; the rest of the page is hidden', async () => {
    render(<ModalHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog', { name: 'Link to an enquiry' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription(/Pick the enquiry\..*The thread moves/)
    expect(within(dialog).getByRole('list')).toHaveTextContent('The thread moves to the enquiry')
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(
      screen.getByRole('main', { hidden: true }).closest('[aria-hidden="true"]')
    ).not.toBeNull()
  })

  it('traps focus: Tab and Shift+Tab never leave the dialog', async () => {
    render(<ModalHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(active())).toBe(true)
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(active())).toBe(true)
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true })
      expect(dialog.contains(active())).toBe(true)
    }
  })

  it('Escape closes it and focus returns to the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>()
    render(<ModalHarness onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(active()).toBe(trigger)
  })

  it('focus returns to the trigger even when the trigger re-rendered into a new node', async () => {
    render(<ModalHarness />)
    const first = screen.getByRole('button', { name: 'Open' })
    await userEvent.click(first)
    await userEvent.click(screen.getByRole('button', { name: 'Re-render trigger' }))
    expect(first.isConnected).toBe(false)
    await userEvent.keyboard('{Escape}')
    const now = screen.getByRole('button', { name: 'Open' })
    expect(now).not.toBe(first)
    expect(now).toHaveAttribute('data-gen', '1')
    expect(active()).toBe(now)
  })

  it('without a trigger, focus returns to returnFocusRef', async () => {
    render(<ModalHarness withTrigger={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Opener' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(active()).toBe(screen.getByRole('button', { name: 'Opener' }))
  })

  it('danger tone colours the title', () => {
    render(
      <Modal open onOpenChange={() => {}} title="Remove line?" tone="danger" actions={null}>
        <p>Body</p>
      </Modal>
    )
    const title = screen.getByRole('heading', { name: 'Remove line?' })
    expect(title.className).toContain('text-io-bad')
  })
})

function ConfirmHarness({
  onConfirm,
  onOpenChange,
}: {
  onConfirm: () => Promise<ActionResult>
  onOpenChange?: (o: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button">Outside</button>
      <ConfirmDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          onOpenChange?.(o)
        }}
        trigger={<button type="button">Block…</button>}
        title="Block Example Valve Co?"
        text={<p>New RFQs and POs stop.</p>}
        consequences={['2 open RFQs are withdrawn', 'You can unblock later']}
        confirmLabel="Block supplier"
        busyLabel="Blocking…"
        onConfirm={onConfirm}
      />
    </>
  )
}

describe('ConfirmDialog', () => {
  it('is an alertdialog with initial focus on Cancel and the consequences before the buttons', async () => {
    render(<ConfirmHarness onConfirm={async () => ({ success: true, data: null })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Block Example Valve Co?' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    expect(active()).toBe(cancel)
    const list = within(dialog).getByRole('list', { name: 'What happens' })
    const confirm = within(dialog).getByRole('button', { name: 'Block supplier' })
    expect(list.compareDocumentPosition(cancel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(list.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(confirm).toHaveAttribute('data-variant', 'destructive')
    expect(cancel).toHaveAttribute('data-variant', 'ghost')
    expect(dialog).toHaveAccessibleDescription(/New RFQs and POs stop\..*2 open RFQs/)
  })

  it('Escape cancels and returns focus to the trigger; an outside click does nothing', async () => {
    const onConfirm = vi.fn<() => Promise<ActionResult>>(async () => ({
      success: true,
      data: null,
    }))
    const onOpenChange = vi.fn<(open: boolean) => void>()
    render(<ConfirmHarness onConfirm={onConfirm} onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Block…' })
    await userEvent.click(trigger)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside', hidden: true }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(active()).toBe(trigger)
  })

  it('is busy while the action runs, then a failure stays open with the error inline', async () => {
    let finish: (r: ActionResult) => void = () => {}
    const onConfirm = () => new Promise<ActionResult>((r) => (finish = r))
    render(<ConfirmHarness onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    await userEvent.click(screen.getByRole('button', { name: 'Block supplier' }))
    const busy = screen.getByRole('button', { name: 'Blocking…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    // Escape while busy does not close it.
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await act(async () => finish({ success: false, error: 'The supplier changed. Try again.' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('The supplier changed. Try again.')
    expect(screen.getByRole('button', { name: 'Block supplier' })).not.toHaveAttribute('aria-busy')
  })

  it('a thrown action is a failure with a safe message', async () => {
    render(
      <ConfirmHarness
        onConfirm={async () => {
          throw new Error('P2002 unique constraint')
        }}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    await userEvent.click(screen.getByRole('button', { name: 'Block supplier' }))
    expect(screen.getByRole('alert').textContent).not.toContain('P2002')
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('success closes it', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>()
    render(
      <ConfirmHarness
        onConfirm={async () => ({ success: true, data: null })}
        onOpenChange={onOpenChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    await userEvent.click(screen.getByRole('button', { name: 'Block supplier' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('a reopened dialog starts without the last error', async () => {
    render(<ConfirmHarness onConfirm={async () => ({ success: false, error: 'No.' })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    await userEvent.click(screen.getByRole('button', { name: 'Block supplier' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Block…' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

function DrawerHarness({ modal = true }: { modal?: boolean }) {
  const [open, setOpen] = useState(!modal)
  const [inner, setInner] = useState(false)
  const [tab, setTab] = useState('reasons')
  return (
    <main>
      <button type="button">Page control</button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={modal}
        eyebrow="Why?"
        title="Why this supplier"
        trigger={<button type="button">Why?</button>}
        tabs={{
          items: [
            { key: 'reasons', label: 'Reasons' },
            { key: 'history', label: 'History' },
          ],
          value: tab,
          onValueChange: setTab,
        }}
        footer={
          <Modal
            open={inner}
            onOpenChange={setInner}
            trigger={<button type="button">Change supplier…</button>}
            title="Change supplier"
            actions={null}
          >
            <p>Pick another quote.</p>
          </Modal>
        }
      >
        <p>Panel {tab}</p>
      </Drawer>
    </main>
  )
}

describe('Drawer', () => {
  it('modal: a named dialog that traps focus, closes on Escape and returns focus', async () => {
    render(<DrawerHarness />)
    const trigger = screen.getByRole('button', { name: 'Why?' })
    await userEvent.click(trigger)
    const drawer = screen.getByRole('dialog', { name: 'Why this supplier' })
    expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(drawer.className).toContain('io-anim-slide')
    expect(within(drawer).getByRole('tablist', { name: 'Why this supplier sections' })).toBeTruthy()
    expect(within(drawer).getByRole('tabpanel')).toHaveTextContent('Panel reasons')
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(drawer.contains(active())).toBe(true)
    }
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(active()).toBe(trigger)
  })

  it('only the top-most layer closes on Escape: a Modal opened from a Drawer', async () => {
    render(<DrawerHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Why?' }))
    const changeBtn = screen.getByRole('button', { name: 'Change supplier…' })
    await userEvent.click(changeBtn)
    expect(screen.getByRole('dialog', { name: 'Change supplier' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Change supplier' })).toBeNull()
    expect(screen.getByRole('dialog', { name: 'Why this supplier' })).toBeInTheDocument()
    expect(active()).toBe(changeBtn)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(active()).toBe(screen.getByRole('button', { name: 'Why?' }))
  })

  it('docked (modal={false}): inline landmark, no scrim, no trap, the page stays reachable', async () => {
    const { container } = render(<DrawerHarness modal={false} />)
    const panel = screen.getByRole('complementary', { name: 'Why this supplier' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(container.contains(panel)).toBe(true)
    expect(panel.className).not.toContain('fixed')
    expect(screen.getByRole('main').closest('[aria-hidden="true"]')).toBeNull()
    // Opening did not pull focus in, and an outside click does not close it.
    expect(panel.contains(active())).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Page control' }))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    // Tab walks out of the panel: no trap, no loop.
    within(panel).getByRole('button', { name: 'Close' }).focus()
    let left = false
    for (let i = 0; i < 8 && !left; i++) {
      await userEvent.tab()
      left = !panel.contains(active())
    }
    expect(left).toBe(true)
  })

  it('docked: Escape inside closes it; Escape that a Modal inside handled does not', async () => {
    render(<DrawerHarness modal={false} />)
    const changeBtn = screen.getByRole('button', { name: 'Change supplier…' })
    await userEvent.click(changeBtn)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    expect(active()).toBe(changeBtn)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('complementary')).toBeNull()
  })
})
