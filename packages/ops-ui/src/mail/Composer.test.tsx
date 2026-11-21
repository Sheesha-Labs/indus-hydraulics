/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import Composer from './Composer'
import type { ComposerProps } from './types'

afterEach(cleanup)

const BASE: ComposerProps = {
  mailbox: 'sales',
  mailboxes: { sales: 'sales@ops-sample.example', purchase: 'purchase@ops-sample.example' },
  to: [{ name: 'Sam Sample', address: 'buyer@sample-client.example' }],
  subject: 'RE: Sample spares',
  initialHtml: '<p>Dear Sam,</p>',
  footNote: 'Sends from sales@ in the client thread',
  onSend: async () => ({ success: true, data: { sendId: 's1', undoRemainingMs: 300_000 } }),
  onSaveDraft: async () => ({ success: true, data: { draftId: 'd1' } }),
  onDiscard: () => {},
}

describe('Composer', () => {
  it('Send is the one primary button; Save draft and Discard are not', () => {
    render(<Composer {...BASE} />)
    const send = screen.getByRole('button', { name: 'Send' })
    expect(send).toHaveClass('bg-io-accent')
    expect(screen.getByRole('button', { name: 'Save draft' })).not.toHaveClass('bg-io-accent')
    expect(screen.getByRole('button', { name: 'Discard' })).not.toHaveClass('bg-io-accent')
  })

  it('primaryLabel renames Send', () => {
    render(<Composer {...BASE} primaryLabel="Send to supplier" />)
    expect(screen.getByRole('button', { name: 'Send to supplier' })).toBeInTheDocument()
  })

  it('From is a select of the two mailboxes, locked when the thread decides it', () => {
    const { rerender } = render(<Composer {...BASE} />)
    const from = screen.getByRole('combobox', { name: 'From' })
    expect(from).toBeEnabled()
    expect(from).toHaveDisplayValue('sales@ops-sample.example')
    rerender(<Composer {...BASE} mailbox="purchase" mailboxLocked />)
    expect(screen.getByRole('combobox', { name: 'From' })).toBeDisabled()
    expect(screen.getByText('Locked to this thread')).toBeInTheDocument()
  })

  it('sends the draft payload and shows the server undo window', async () => {
    const onSend = vi.fn(BASE.onSend)
    render(<Composer {...BASE} onSend={onSend} />)
    const subject = screen.getByRole('textbox', { name: 'Subject' })
    await userEvent.clear(subject)
    await userEvent.type(subject, 'New subject')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSend).toHaveBeenCalledTimes(1)
    const draft = onSend.mock.calls[0]![0]
    expect(draft).toMatchObject({
      mailbox: 'sales',
      subject: 'New subject',
      to: BASE.to,
      cc: [],
      bcc: [],
    })
    expect(draft.html).toContain('Dear Sam')
    expect(await screen.findByText('Queued. Undo for 5 min')).toBeInTheDocument()
  })

  it('a failed send shows the safe error as an alert', async () => {
    render(
      <Composer {...BASE} onSend={async () => ({ success: false, error: 'Mailbox paused' })} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Mailbox paused')
  })

  it('Cc · Bcc reveals the copy rows; Attach shows only with a handler', async () => {
    const { rerender } = render(<Composer {...BASE} />)
    expect(screen.queryByRole('button', { name: 'Attach a file' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Cc · Bcc' }))
    expect(screen.getByText('Cc')).toBeInTheDocument()
    expect(screen.getByText('Bcc')).toBeInTheDocument()
    rerender(<Composer {...BASE} onAttach={() => {}} />)
    expect(screen.getByRole('button', { name: 'Attach a file' })).toBeInTheDocument()
  })

  it('the toolbar is a named toolbar with Bold, Italic, Bullet list and Link', () => {
    render(<Composer {...BASE} toolbarNote="Assistant draft · edited" />)
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    for (const name of ['Bold', 'Italic', 'Bullet list', 'Link'])
      expect(toolbar).toContainElement(screen.getByRole('button', { name }))
    expect(toolbar).toHaveTextContent('Assistant draft · edited')
  })
})
