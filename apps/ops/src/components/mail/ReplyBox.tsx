'use client'

import { Button } from '@indus/ops-ui/controls'
import { Composer, type Mailbox } from '@indus/ops-ui/mail'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { undoOutboundAction } from '../../actions/outbound'
import { replyAction } from '../../app/(console)/mail/actions/mail'

/**
 * The composer at the foot of the conversation (board 91): the envelope line ("From purchase@ · Cc sales@ ·
 * <signature>") and "Draft reply", which opens the kit Composer locked to the thread's mailbox. Sending queues
 * through the send queue: the toast counts down the server's undo window. A Helper's reply on the client
 * mailbox goes to the Owner instead ("Ask Krishan to send").
 */
export interface ReplyBoxProps {
  threadId: string
  mailbox: Mailbox
  mailboxes: Record<Mailbox, string>
  to: string[]
  cc: string[]
  subject: string
  envelope: string
  replyTo: string
  permission: 'send' | 'propose' | 'none'
}

export default function ReplyBox(p: ReplyBoxProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  if (p.permission === 'none') {
    return (
      <p className="text-io-ink-3 text-[12px]">
        Replies from {p.mailboxes[p.mailbox]} are sent by the Owner.
      </p>
    )
  }
  if (!open) {
    return (
      <div className="border-io-line bg-io-card rounded-io-card flex flex-col gap-2 border p-3">
        <div className="flex items-start gap-3">
          <p className="text-io-ink-2 min-w-0 flex-1 text-[12px] leading-[1.5]">{p.envelope}</p>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Draft reply
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="io-focus-field border-io-stroke rounded-io-ctl bg-io-card text-io-ink-3 min-h-[48px] w-full border px-3 py-2 text-left text-[13px]"
        >
          Reply to {p.replyTo}…
        </button>
      </div>
    )
  }
  return (
    <Composer
      mailbox={p.mailbox}
      mailboxes={p.mailboxes}
      mailboxLocked
      to={p.to.map((address) => ({ address }))}
      cc={p.cc.map((address) => ({ address }))}
      subject={p.subject}
      initialHtml=""
      footNote={`Sends from ${p.mailboxes[p.mailbox]} in this thread`}
      primaryLabel={p.permission === 'propose' ? 'Ask Krishan to send' : 'Send'}
      onSend={async (draft) => {
        const res = await replyAction({
          threadId: p.threadId,
          to: draft.to.map((r) => r.address),
          cc: draft.cc.map((r) => r.address),
          html: draft.html,
        })
        if (!res.success) return res
        setOpen(false)
        router.refresh()
        if (res.data.kind === 'proposed') {
          toast({ kind: 'success', title: `Sent to Krishan to approve · ${res.data.actionRef}` })
          return { success: true, data: { sendId: res.data.actionRef, undoRemainingMs: 0 } }
        }
        const outboundId = res.data.outboundId
        toast({
          kind: 'success',
          title: 'Reply queued',
          undo: {
            remainingMs: res.data.undoRemainingMs,
            onUndo: async () => undoOutboundAction({ outboundId }),
          },
        })
        return {
          success: true,
          data: { sendId: outboundId, undoRemainingMs: res.data.undoRemainingMs },
        }
      }}
      onSaveDraft={async () => ({
        success: false,
        error: 'Drafts are kept in the console from S06',
      })}
      onDiscard={() => setOpen(false)}
    />
  )
}
