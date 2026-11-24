'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { resolveUnsureAction, undoResolutionAction } from '../../app/(console)/mail/actions/mail'
import type { UnsureCardView } from '../../data/mail'

/**
 * Board 94 · one unsure email: who sent it, the subject and first lines, then the Assistant's best guess as the
 * primary button and the alternatives beside it. Choosing files it as the person's decision; the toast offers
 * Undo for the internal undo window and says what the Assistant learned.
 */
export default function UnsureCard({ item }: { item: UnsureCardView }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()

  async function choose(option: string, label: string) {
    setBusy(option)
    try {
      const res = await resolveUnsureAction({
        messageId: item.messageId,
        actionId: item.actionId,
        option,
        companyId: null,
      })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      const title =
        option === 'new_enquiry'
          ? 'Will become an enquiry when intake goes live'
          : `✓ Filed as ${res.data.filedAs}${res.data.learned ? `. ${res.data.learned}` : ''}`
      toast({
        kind: 'success',
        title,
        undo: {
          remainingMs: 5 * 60_000,
          onUndo: async () => {
            const u = await undoResolutionAction({ actionId: item.actionId })
            start(() => router.refresh())
            return u
          },
        },
      })
      void label
      start(() => router.refresh())
    } finally {
      setBusy(null)
    }
  }

  const [best, ...rest] = item.options
  return (
    <article
      aria-label={`${item.from}: ${item.subject}`}
      className="border-io-line bg-io-card rounded-io-card flex flex-col gap-2 border px-4 py-3.5"
    >
      <div className="flex items-baseline gap-2 text-[12.5px]">
        <b className="font-medium">{item.from}</b>
        <span className="text-io-ink-3 truncate">{item.address}</span>
        <Link
          href={`/mail/unsure/${item.threadId}` as Route}
          className="text-io-accent io-focus rounded-io-tag ml-auto flex-none hover:underline"
        >
          Open
        </Link>
      </div>
      <p className="text-[13px] font-medium">{item.subject}</p>
      {item.preview ? <p className="text-io-ink-2 truncate text-[12.5px]">{item.preview}</p> : null}
      {item.question ? <p className="text-io-ink-3 text-[12px]">{item.question}</p> : null}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="bg-io-ink text-io-card rounded-io-tag px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
          Assistant
        </span>
        <span className="text-io-ink-3 text-[11.5px]">best guess</span>
        {best ? (
          <Button
            variant="primary"
            size="sm"
            busy={busy === best.key}
            disabled={!!busy}
            onClick={() => void choose(best.key, best.label)}
          >
            {best.label}
          </Button>
        ) : null}
        {[...rest, ...item.extras].map((o) => (
          <Button
            key={o.key}
            variant="secondary"
            size="sm"
            busy={busy === o.key}
            disabled={!!busy}
            onClick={() => void choose(o.key, o.label)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </article>
  )
}
