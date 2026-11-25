'use client'

import { Button } from '@indus/ops-ui/controls'
import type { Route } from 'next'
import Link from 'next/link'

/**
 * Board 93 · the acknowledgement's three states beside its draft (S08-T07): awaiting approval (Careful, the
 * default), sent by itself with the undo running (only if the Owner turns on Do and tell for #6), and skipped
 * because the client asked for none (learned per client, with a link to the preference).
 */
const CARD = 'rounded-io-card border-io-line bg-io-card flex flex-col gap-2.5 border px-4 py-4'

export function AckAwaiting({
  client,
  onApprove,
  onEdit,
}: {
  client: string
  onApprove?: () => void
  onEdit?: () => void
}) {
  return (
    <section aria-label="Awaiting approval" className={CARD}>
      <h2 className="io-eyebrow m-0">Awaiting approval</h2>
      <p className="m-0 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="rounded-io-tag border-io-line border px-1.5 py-0.5 text-[11.5px]">
          Asks you
        </span>
        In Review as “Acknowledge {client}”
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onApprove}>
          Approve
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </section>
  )
}

export function AckAutoSent({
  at,
  undoLeft,
  onUndo,
}: {
  at: string
  undoLeft: string
  onUndo?: () => void
}) {
  return (
    <section aria-label="Auto-sent" className={CARD}>
      <h2 className="io-eyebrow m-0">Auto-sent · Do and tell</h2>
      <div className="rounded-io-card border-io-ok bg-io-ok-tint flex items-center gap-3 border px-3.5 py-2.5">
        <span aria-hidden="true" className="text-io-ok text-[13px]">
          ✓
        </span>
        <p className="m-0 flex-1 text-[12.5px] leading-[1.5]">
          <b className="font-medium">Acknowledged at {at}</b>
          <span className="text-io-ink-2"> · in Today and the evening summary</span>
        </p>
        <Button variant="secondary" size="sm" onClick={onUndo}>
          Undo {undoLeft}
        </Button>
      </div>
      <p className="text-io-ink-2 m-0 text-[12px] leading-[1.5]">
        Acknowledgements are the only client message that may ever go without approval, and only if
        you turn it on.
      </p>
    </section>
  )
}

export function AckSkipped({ text, preferenceHref }: { text: string; preferenceHref: string }) {
  return (
    <section aria-label="Skipped" className={CARD}>
      <h2 className="io-eyebrow m-0">Skipped · learned per client</h2>
      <p className="m-0 flex items-start gap-2.5 text-[12.5px] leading-[1.5]">
        <span className="bg-io-ink text-io-card rounded-io-tag px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
          Assistant
        </span>
        <span>{text}</span>
      </p>
      <Link
        href={preferenceHref as Route}
        className="text-io-accent io-focus rounded-io-tag w-fit text-[12.5px]"
      >
        See preference ↗
      </Link>
    </section>
  )
}
