'use client'

import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { editApproveProposalAction, saveEditsProposalAction } from '../../actions/proposal/decide'
import type { CardEmail } from '../../data/proposal-mapper'
import type { ReviewCard } from '../../data/review'

/**
 * Board 103 "Editing · inline": To, Cc, subject and body of the drafted email. Save and approve keeps the
 * person's version (Save alone keeps it for whoever approves) beside the Assistant's (the diff is kept on save and teaches a preference); Cancel leaves
 * the card as it was. (decision) A plain-text body: the TipTap toolbar of the board waits for the composer
 * work of S12; line breaks are kept.
 */
const split = (s: string) =>
  s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)

export default function EmailEditor({
  card,
  email,
  cancelHref,
}: {
  card: ReviewCard
  email: CardEmail
  cancelHref: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const id = useId()
  const [to, setTo] = useState(email.to.join(', '))
  const [cc, setCc] = useState(email.cc.join(', '))
  const [subject, setSubject] = useState(email.subject)
  const [body, setBody] = useState(email.body)
  const [busy, setBusy] = useState(false)

  const edits = () => ({
    ...(to !== email.to.join(', ') ? { to: split(to) } : {}),
    ...(cc !== email.cc.join(', ') ? { cc: split(cc) } : {}),
    ...(subject !== email.subject ? { subject } : {}),
    ...(body !== email.body ? { body } : {}),
  })

  /** Save only: the draft keeps this version for whoever approves it (board 110 when someone else does). */
  async function saveOnly() {
    setBusy(true)
    try {
      const r = await saveEditsProposalAction({
        actionId: card.id,
        version: card.version,
        edits: edits(),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: 'Saved · not approved yet' })
      router.push(cancelHref as Route)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setBusy(true)
    try {
      const r = await editApproveProposalAction({
        actionId: card.id,
        version: card.version,
        edits: edits(),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: 'Saved and approved · your version is sent' })
      router.push(cancelHref as Route)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const field =
    'io-focus-field border-io-stroke rounded-io-ctl bg-io-card text-io-ink h-io-btn w-full border px-2.5 text-[13px]'
  return (
    <section
      aria-label={`Editing: ${card.headline}`}
      data-part="proposal-card"
      data-state="editing"
      className="bg-io-card border-io-line rounded-io-card shadow-io-e2 flex flex-col gap-3 border px-5 py-4"
    >
      <p className="text-io-ink-3 text-[12px]">
        <span className="bg-io-accent-tint text-io-accent rounded-io-tag mr-2 px-1.5 py-0.5 text-[11.5px]">
          {card.type}
        </span>
        {card.ref}
      </p>
      <h3 className="text-[16px] leading-[1.35] font-medium">{card.headline}</h3>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-[12.5px]">
        <label htmlFor={`${id}-to`} className="text-io-ink-3">
          To
        </label>
        <input
          id={`${id}-to`}
          className={field}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <label htmlFor={`${id}-cc`} className="text-io-ink-3">
          Cc
        </label>
        <input
          id={`${id}-cc`}
          className={field}
          value={cc}
          onChange={(e) => setCc(e.target.value)}
        />
        <label htmlFor={`${id}-subject`} className="text-io-ink-3">
          Subject
        </label>
        <input
          id={`${id}-subject`}
          className={field}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <label htmlFor={`${id}-body`} className="sr-only">
        Email body
      </label>
      <textarea
        id={`${id}-body`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="io-focus-field border-io-accent rounded-io-ctl bg-io-card text-io-ink field-sizing-content min-h-[84px] w-full border px-3 py-2.5 text-[13px] leading-[1.55]"
      />
      <div className="border-io-line flex flex-wrap items-center gap-2 border-t pt-3">
        <Button variant="primary" busy={busy} onClick={() => void save()}>
          Save and approve
        </Button>
        <Button variant="secondary" busy={busy} onClick={() => void saveOnly()}>
          Save
        </Button>
        <ButtonLink href={cancelHref} variant="secondary">
          Cancel
        </ButtonLink>
        <span className="text-io-ink-3 ml-auto text-[12px] whitespace-nowrap">
          Diff is kept on save
        </span>
      </div>
    </section>
  )
}
