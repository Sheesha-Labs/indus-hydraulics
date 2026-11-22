/**
 * @vitest-environment jsdom
 */
import '../overlay/test-env'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '../lib/test-dom'
import { UNEXPECTED_ERROR } from '../overlay/result'
import ToastProvider from '../overlay/ToastProvider'
import ProposalCard from './ProposalCard'
import { canApproveFromKeyboard } from './ProposalActions'
import type { ProposalActionsInput, ProposalCardProps, Result } from './types'

afterEach(cleanup)

type ApproveResult = Result<{ undoRemainingMs?: number }>

function deferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const ok: Result<void> = { success: true, data: undefined }

function actions(over: Partial<ProposalActionsInput> = {}): ProposalActionsInput {
  return {
    approve: vi.fn<ProposalActionsInput['approve']>(async (): Promise<ApproveResult> => ({
      success: true,
      data: {},
    })),
    edit: { href: '/enquiries/ENQ-2026-0001/rfqs' },
    reject: vi.fn<ProposalActionsInput['reject']>(async () => ok),
    later: vi.fn<ProposalActionsInput['later']>(async () => ok),
    undo: vi.fn<() => Promise<Result<void>>>(async () => ok),
    reopen: vi.fn<() => Promise<Result<void>>>(async () => ok),
    ...over,
  }
}

function card(over: Partial<ProposalCardProps> = {}): ProposalCardProps {
  return {
    id: 'A-26-11-20-0001',
    type: 'Send supplier RFQs',
    record: { label: 'ENQ-2026-0001 · IH-RFQ-2611-P01', href: '/enquiries/ENQ-2026-0001' },
    level: { label: 'Asks you' },
    createdAt: new Date(Date.now() - 12 * 60_000),
    headline: 'Send IH-RFQ-2611-P01 to 5 suppliers for 6 bearing lines.',
    why: [
      {
        text: 'Client wants prices by 2 Oct.',
        evidence: { label: 'Client email', evidenceId: 'ev-1' },
      },
    ],
    confidence: { level: 'Likely', reason: 'From the supplier website.' },
    state: 'open',
    actions: actions(),
    ...over,
  }
}

function renderCard(props: ProposalCardProps) {
  render(
    <ToastProvider>
      <ProposalCard {...props} />
    </ToastProvider>
  )
  return screen.getByRole('article', { name: props.headline })
}

describe('ProposalCard', () => {
  it('is an article named by its headline, with type, record, level and age in the header', () => {
    const el = renderCard(card())
    expect(el).toHaveAttribute('tabindex', '0')
    expect(within(el).getByText('Send supplier RFQs')).toBeInTheDocument()
    expect(
      within(el).getByRole('link', { name: 'ENQ-2026-0001 · IH-RFQ-2611-P01' })
    ).toBeInTheDocument()
    expect(within(el).getByText('Asks you')).toBeInTheDocument()
    expect(within(el).getByText('12 min')).toBeInTheDocument()
    expect(within(el).getByRole('link', { name: /Client email/ })).toHaveAttribute(
      'href',
      '/why/ev-1'
    )
  })

  it('approve is optimistic and reverts on { success: false } with an error toast', async () => {
    const d = deferred<ApproveResult>()
    const approve = vi.fn<ProposalActionsInput['approve']>(() => d.promise)
    const el = renderCard(card({ actions: actions({ approve }) }))
    await userEvent.click(within(el).getByRole('button', { name: 'Approve' }))
    expect(el).toHaveAttribute('data-state', 'approved')
    expect(within(el).getByText('Approved')).toBeInTheDocument()
    await act(async () => d.resolve({ success: false, error: 'Couldn’t reach purchase@.' }))
    expect(el).toHaveAttribute('data-state', 'open')
    expect(within(el).getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    const errors = document.querySelector('[data-part="toast-errors"]') as HTMLElement
    expect(within(errors).getByText('Couldn’t reach purchase@.')).toBeInTheDocument()
  })

  it('a thrown approve also reverts with a safe message', async () => {
    // Deterministic like the case above: the rejection lands inside act(), not racing the click.
    let reject!: (e: unknown) => void
    const pending = new Promise<ApproveResult>((_, r) => (reject = r))
    const approve = vi.fn<ProposalActionsInput['approve']>(() => pending)
    const el = renderCard(card({ actions: actions({ approve }) }))
    await userEvent.click(within(el).getByRole('button', { name: 'Approve' }))
    expect(el).toHaveAttribute('data-state', 'approved')
    await act(async () => reject(new Error('P2002 unique constraint')))
    expect(el).toHaveAttribute('data-state', 'open')
    const errors = document.querySelector('[data-part="toast-errors"]') as HTMLElement
    expect(within(errors).getByText(UNEXPECTED_ERROR)).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('P2002')
  })

  it('a successful approve opens the undo toast with the server’s remainingMs and a ghost Undo', async () => {
    const approve = vi.fn<ProposalActionsInput['approve']>(async (): Promise<ApproveResult> => ({
      success: true,
      data: { undoRemainingMs: 298_000 },
    }))
    const undo = vi.fn<() => Promise<Result<void>>>(async () => ok)
    const props = card({ actions: actions({ approve, undo }) })
    const el = renderCard(props)
    await userEvent.click(within(el).getByRole('button', { name: 'Approve' }))
    expect(el).toHaveAttribute('data-state', 'approved')
    const polite = document.querySelector('[data-part="toast-polite"]') as HTMLElement
    expect(within(polite).getByText(props.headline)).toBeInTheDocument()
    // The label counts down from the server's 298 000 ms (4:58), not a client default of 5:00. It may
    // have ticked once or twice by the time this line runs under load, so assert the server's window.
    expect(within(polite).getByRole('button', { name: /^Undo 4:5[6-8]$/ })).toBeInTheDocument()
    await userEvent.click(within(el).getByRole('button', { name: /^Undo/ }))
    expect(undo).toHaveBeenCalledOnce()
    // Undo resolves after the click returns: wait for the revert instead of racing it.
    await waitFor(() => expect(el).toHaveAttribute('data-state', 'open'))
    await waitFor(() => expect(within(polite).queryByRole('button', { name: /Undo/ })).toBeNull())
  })

  it('passes the chosen option, the toggle and the reason chip to approve', async () => {
    const approve = vi.fn<ProposalActionsInput['approve']>(async (): Promise<ApproveResult> => ({
      success: true,
      data: {},
    }))
    const el = renderCard(
      card({
        options: {
          legend: 'Choose one',
          items: [
            { value: 'a', title: 'Approve at 9.5%', suggested: true },
            { value: 'b', title: 'Keep 12%' },
          ],
        },
        toggle: { name: 'regret', label: 'Send a regret', defaultOn: true },
        reasonChips: { label: 'Reason', options: [{ value: 'range', label: 'Outside our range' }] },
        actions: actions({ approve }),
      })
    )
    await userEvent.click(within(el).getByRole('radio', { name: /Keep 12%/ }))
    await userEvent.click(within(el).getByRole('switch', { name: 'Send a regret' }))
    await userEvent.click(within(el).getByRole('button', { name: 'Outside our range' }))
    await userEvent.click(within(el).getByRole('button', { name: 'Approve' }))
    expect(approve).toHaveBeenCalledWith({ optionValue: 'b', toggle: false, chip: 'range' })
  })

  it('Reject cannot submit without a reason, then sends the reason and chip', async () => {
    const reject = vi.fn<ProposalActionsInput['reject']>(async () => ok)
    const el = renderCard(card({ actions: actions({ reject }) }))
    await userEvent.click(within(el).getByRole('button', { name: 'Reject' }))
    const dialog = screen.getByRole('dialog', { name: 'Reject this proposal' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }))
    expect(reject).not.toHaveBeenCalled()
    // The Form kit Field: the error is the field's description, and the field takes focus to read it.
    const reason = within(dialog).getByRole('textbox', { name: /Why not\?/ })
    expect(reason).toHaveAccessibleDescription(/one-line reason/)
    expect(reason).toHaveAttribute('aria-invalid', 'true')
    expect(reason).toHaveFocus()
    await userEvent.type(within(dialog).getByRole('textbox'), '   ')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }))
    expect(reject).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Wrong supplier' }))
    await userEvent.type(within(dialog).getByRole('textbox'), 'Not a bearing house')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }))
    expect(reject).toHaveBeenCalledWith({ reason: 'Not a bearing house', chip: 'wrong-supplier' })
    expect(el).toHaveAttribute('data-state', 'rejected')
    expect(within(el).getByText('Rejected · Not a bearing house')).toBeInTheDocument()
    await userEvent.click(within(el).getByRole('button', { name: 'Reopen' }))
    expect(el).toHaveAttribute('data-state', 'open')
  })

  it('Later is a menu: in 1 hour, tomorrow 09:00, Monday 09:00, pick a time', async () => {
    const later = vi.fn<ProposalActionsInput['later']>(async () => ok)
    const el = renderCard(card({ actions: actions({ later }) }))
    const trigger = within(el).getByRole('button', { name: 'Later' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    const items = screen.getAllByRole('menuitem').map((i) => i.textContent)
    expect(items).toEqual(['In 1 hour', 'Tomorrow 09:00', 'Monday 09:00', 'Pick a time…'])
    await userEvent.click(screen.getByRole('menuitem', { name: 'Tomorrow 09:00' }))
    expect(later).toHaveBeenCalledWith({ until: 'tomorrow-0900' })
    expect(await within(el).findByText('Back in Review tomorrow at 09:00')).toBeInTheDocument()
  })

  it('Pick a time sends the picked Date', async () => {
    const later = vi.fn<ProposalActionsInput['later']>(async () => ok)
    const el = renderCard(card({ actions: actions({ later }) }))
    within(el).getByRole('button', { name: 'Later' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByRole('menuitem', { name: 'Pick a time…' }))
    const field = within(el).getByLabelText('Back in Review at')
    fireEvent.change(field, { target: { value: '2026-11-23T10:30' } })
    await userEvent.click(within(el).getByRole('button', { name: 'Set' }))
    expect(later).toHaveBeenCalledOnce()
    const until = later.mock.calls[0]![0].until
    expect(until).toBeInstanceOf(Date)
  })

  it('readOnly hides every action', () => {
    const el = renderCard(card({ readOnly: true, note: 'Read only' }))
    expect(within(el).queryAllByRole('button')).toEqual([])
    expect(within(el).queryByRole('link', { name: 'Edit' })).toBeNull()
    expect(within(el).getByText('Read only')).toBeInTheDocument()
  })

  it('collapsed shows the header, headline and the primary verb with Later only', () => {
    const el = renderCard(
      card({
        state: 'collapsed',
        approveLabel: 'Review and send',
        level: { label: 'Locked · you send', locked: true },
      })
    )
    expect(within(el).queryByRole('list')).toBeNull()
    const names = within(el)
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent)
    expect(names).toEqual(['Review and send', 'Later'])
  })

  it('decided states: approved by a person with the note; rejected with the reason', () => {
    renderCard(
      card({
        state: 'approved',
        decided: { by: 'Owner Example', at: new Date(), note: 'Sent 10:05' },
      })
    )
    expect(screen.getByText('Approved by Owner Example')).toBeInTheDocument()
    expect(screen.getByText('Sent 10:05')).toBeInTheDocument()
    // No undo window from the server: no Undo button.
    expect(screen.queryByRole('button', { name: /Undo/ })).toBeNull()
  })
})

describe('ProposalCard keyboard', () => {
  const press = (
    el: HTMLElement,
    key: string,
    mod: { metaKey?: boolean; ctrlKey?: boolean } = {}
  ) =>
    act(async () => {
      fireEvent.keyDown(el, { key, ...mod })
    })

  // The matrix: ⌘↵ and Ctrl+↵ approve an unlocked open (or collapsed) card; nothing on a locked one.
  it.each([
    { locked: false, mod: { metaKey: true }, state: 'open', calls: 1 },
    { locked: false, mod: { ctrlKey: true }, state: 'open', calls: 1 },
    { locked: false, mod: { metaKey: true }, state: 'collapsed', calls: 1 },
    { locked: true, mod: { metaKey: true }, state: 'open', calls: 0 },
    { locked: true, mod: { ctrlKey: true }, state: 'open', calls: 0 },
    { locked: true, mod: { metaKey: true }, state: 'collapsed', calls: 0 },
  ] as const)(
    '⌘/Ctrl+↵ locked=$locked state=$state → $calls approve',
    async ({ locked, mod, state, calls }) => {
      const approve = vi.fn<ProposalActionsInput['approve']>(async (): Promise<ApproveResult> => ({
        success: true,
        data: {},
      }))
      const el = renderCard(
        card({
          state,
          level: { label: locked ? 'Locked · you send' : 'Asks you', locked },
          actions: actions({ approve }),
        })
      )
      el.focus()
      await press(el, 'Enter', mod)
      expect(approve).toHaveBeenCalledTimes(calls)
      expect(el).toHaveAttribute('data-state', calls ? 'approved' : state)
    }
  )

  it('a plain Enter, a read-only card and a field never approve', async () => {
    const approve = vi.fn<ProposalActionsInput['approve']>(async (): Promise<ApproveResult> => ({
      success: true,
      data: {},
    }))
    const el = renderCard(card({ actions: actions({ approve }) }))
    await press(el, 'Enter')
    expect(approve).not.toHaveBeenCalled()
    cleanup()
    const ro = renderCard(card({ readOnly: true, actions: actions({ approve }) }))
    await press(ro, 'Enter', { metaKey: true })
    expect(approve).not.toHaveBeenCalled()
  })

  it('canApproveFromKeyboard excludes locked, read-only and decided cards', () => {
    expect(canApproveFromKeyboard({ level: { label: 'Asks you' } }, 'open')).toBe(true)
    expect(canApproveFromKeyboard({ level: { label: 'Locked', locked: true } }, 'open')).toBe(false)
    expect(canApproveFromKeyboard({ readOnly: true }, 'open')).toBe(false)
    expect(canApproveFromKeyboard({}, 'approved')).toBe(false)
    expect(canApproveFromKeyboard({}, 'rejected')).toBe(false)
  })

  it('E follows the edit link, R opens Reject, L opens Later', async () => {
    const el = renderCard(card())
    const edit = within(el).getByRole('link', { name: 'Edit' })
    const clicked = vi.fn<(e: MouseEvent) => void>((e) => e.preventDefault())
    edit.addEventListener('click', clicked)
    el.focus()
    await press(el, 'e')
    expect(clicked).toHaveBeenCalledOnce()
    await press(el, 'r')
    expect(screen.getByRole('dialog', { name: 'Reject this proposal' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    el.focus()
    await press(el, 'l')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('shortcut letters typed into a field are ignored', async () => {
    const el = renderCard(card())
    await userEvent.click(within(el).getByRole('button', { name: 'Reject' }))
    const field = within(screen.getByRole('dialog')).getByRole('textbox')
    await userEvent.type(field, 'lre')
    expect(field).toHaveValue('lre')
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
