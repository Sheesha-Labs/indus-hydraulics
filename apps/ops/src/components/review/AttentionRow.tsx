'use client'

import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { copyTextAction, markSentAction, retrySendAction } from '../../actions/proposal/attention'
import { undoApprovalAction } from '../../actions/proposal/undo'
import type { AttentionItem } from '../../data/review'

/**
 * Board 110's send states above the cards: Send failed (Retry · Fix mailbox · Copy text · Mark as sent),
 * Unknown outcome, Approved and queued while paused (Cancel), Waiting for a mailbox. "The card returns to the
 * top of Review until it is sent or cancelled. Nothing is retried on its own."
 */
export default function AttentionRow({ item, isOwner }: { item: AttentionItem; isOwner: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState<string | null>(null)

  async function run(
    verb: string,
    fn: () => Promise<{ success: boolean; error?: string }>,
    ok: string
  ) {
    setBusy(verb)
    try {
      const r = await fn()
      if (!r.success) {
        toast({ kind: 'error', title: r.error ?? 'That did not work' })
        return
      }
      toast({ kind: 'success', title: ok })
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  async function copy() {
    setBusy('copy')
    try {
      const r = await copyTextAction({ actionId: item.actionId })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      const text = `To: ${r.data.to.join(', ')}\nSubject: ${r.data.subject}\n\n${r.data.body}`
      await navigator.clipboard.writeText(text)
      toast({ kind: 'success', title: 'Copied: send it from Gmail yourself, then Mark as sent' })
    } catch {
      toast({ kind: 'error', title: 'Could not copy; open it in Gmail instead' })
    } finally {
      setBusy(null)
    }
  }

  const cancel = () =>
    void run(
      'cancel',
      () =>
        undoApprovalAction({ actionId: item.actionId }).then((r) =>
          r.success && !r.data.undone
            ? { success: false, error: `${r.data.left.ref} already left.` }
            : r
        ),
      'Cancelled · nothing was sent · back in Review'
    )

  // Board 110 "Assistant paused": an approved send waiting in the queue is one quiet row with Cancel.
  if (item.kind === 'paused' || item.kind === 'held' || item.kind === 'waiting_mailbox') {
    const lead = item.kind === 'paused' ? 'Approved · queued' : 'Approved · waiting'
    const tail =
      item.kind === 'paused' ? 'sends on resume' : item.reason.replace(/^Approved · queued · /, '')
    return (
      <section
        aria-label={`${lead}: ${item.headline}`}
        data-part="attention"
        data-kind={item.kind}
        className="bg-io-warn-tint/50 border-io-warn-tint rounded-io-card flex items-center gap-3 border px-4 py-3 text-[13px]"
      >
        <span aria-hidden className="text-io-warn font-semibold">
          {item.kind === 'paused' ? '⏸' : '…'}
        </span>
        <p className="m-0 min-w-0 flex-1">
          <span className="font-medium">{lead}</span>
          <span className="text-io-ink-2">
            {' '}
            · {item.headline} · {tail}
          </span>
        </p>
        {item.verbs.includes('fix_mailbox') ? (
          <ButtonLink href="/settings/mailboxes" size="sm" variant="secondary">
            Fix mailbox in Settings
          </ButtonLink>
        ) : null}
        {item.verbs.includes('cancel') ? (
          <Button variant="secondary" size="sm" busy={busy === 'cancel'} onClick={cancel}>
            Cancel
          </Button>
        ) : null}
      </section>
    )
  }

  const tone = item.kind === 'failed' ? 'bad' : item.kind === 'unknown' ? 'warn' : 'info'
  const title =
    item.kind === 'failed'
      ? `Send failed · ${item.headline}`
      : item.kind === 'unknown'
        ? `Not sure it was sent · ${item.headline}`
        : item.kind === 'paused'
          ? `⏸ ${item.headline}`
          : item.headline
  return (
    <section
      aria-label={title}
      data-part="attention"
      data-kind={item.kind}
      className="flex flex-col gap-2"
    >
      <Banner
        tone={tone}
        icon={tone === 'bad' ? 'bad' : tone === 'warn' ? 'warn' : 'n'}
        title={title}
        announce={false}
      >
        {item.reason}
      </Banner>
      <div className="flex flex-wrap gap-2">
        {item.verbs.includes('retry') ? (
          <Button
            variant="secondary"
            size="sm"
            busy={busy === 'retry'}
            onClick={() =>
              void run(
                'retry',
                () => retrySendAction({ actionId: item.actionId }),
                'Queued again · Undo in the toast for 5 minutes'
              )
            }
          >
            {item.kind === 'unknown' ? 'Resend' : 'Retry'}
          </Button>
        ) : null}
        {item.verbs.includes('fix_mailbox') ? (
          <ButtonLink href="/settings/mailboxes" size="sm" variant="secondary">
            Fix mailbox in Settings
          </ButtonLink>
        ) : null}
        {item.verbs.includes('copy') ? (
          <Button variant="ghost" size="sm" busy={busy === 'copy'} onClick={() => void copy()}>
            Copy text and send myself
          </Button>
        ) : null}
        {item.verbs.includes('mark_sent') && isOwner ? (
          <Button
            variant="ghost"
            size="sm"
            busy={busy === 'mark'}
            onClick={() =>
              void run('mark', () => markSentAction({ actionId: item.actionId }), 'Marked as sent')
            }
          >
            Mark as sent
          </Button>
        ) : null}
        {item.verbs.includes('cancel') ? (
          <Button variant="ghost" size="sm" busy={busy === 'cancel'} onClick={cancel}>
            Cancel
          </Button>
        ) : null}
      </div>
      {item.kind === 'failed' || item.kind === 'unknown' ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          The card returns to the top of Review until it is sent or cancelled. Nothing is retried on
          its own.
        </p>
      ) : null}
    </section>
  )
}
