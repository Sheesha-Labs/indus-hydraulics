'use client'

import { Button, Callout, Checkbox, Panel, Select } from '@indus/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import {
  cancelSendAction,
  scheduleAction,
  sendNowAction,
  unscheduleAction,
} from '../../../app/admin/(shell)/newsletter/campaign-actions'
import type { CampaignStatus } from '../../../lib/newsletter/campaign'
import type { DeliveryCounts } from '../../../lib/newsletter/send'

const PACE: { value: number; label: string }[] = [
  { value: 300, label: '300 an hour — first sends, warming up' },
  { value: 600, label: '600 an hour' },
  { value: 1200, label: '1,200 an hour' },
  { value: 3000, label: '3,000 an hour' },
  { value: 6000, label: '6,000 an hour' },
]

type Props = {
  id: string
  status: CampaignStatus
  canSend: boolean
  /** Nothing in the send gate and nothing unsaved. */
  ready: boolean
  audienceSize: number
  maxPerHour?: number
  dryRun?: boolean
  scheduledAt?: string | null
  startedAt?: string | null
  sentAt?: string | null
  counts?: DeliveryCounts | null
}

/**
 * Send now, schedule, rehearse; while sending, progress and cancel; after,
 * the report. Sending needs NEWSLETTER_SEND — others see the state only.
 */
export default function CampaignSendPanel(props: Props) {
  const router = useRouter()
  const [pace, setPace] = useState(props.maxPerHour ?? 600)
  const [dryRun, setDryRun] = useState(props.dryRun ?? false)
  const [at, setAt] = useState('')
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()

  // Keep the report moving while it sends.
  useEffect(() => {
    if (props.status !== 'sending') return
    const t = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(t)
  }, [props.status, router])

  function run(task: () => Promise<{ success: boolean; message?: string; data?: { message: string } }>, refresh = true) {
    setNote(null)
    start(async () => {
      const r = await task()
      setNote(r.success ? { ok: true, text: r.data?.message ?? 'Done.' } : { ok: false, text: r.message ?? 'Something went wrong.' })
      if (r.success && refresh) router.refresh()
    })
  }

  const c = props.counts
  const editable = props.status === 'draft' || props.status === 'scheduled'

  return (
    <Panel>
      <h2 className="mb-2 text-[15px] font-medium text-ih-ink">Send</h2>

      {editable && !props.canSend ? (
        <p className="text-[13.5px] text-ih-ink-2">A manager sends newsletters. Send yourself a test, then ask one to send it.</p>
      ) : null}

      {editable && props.canSend ? (
        <div className="flex flex-col gap-3">
          {props.status === 'scheduled' && props.scheduledAt ? (
            <Callout tone="info" action={<Button type="button" kind="outline" size="dense-sm" disabled={pending} onClick={() => run(() => unscheduleAction(props.id))}>Unschedule</Button>}>
              Scheduled for {new Date(props.scheduledAt).toLocaleString()}.
            </Callout>
          ) : null}
          {!props.ready ? <p className="text-[13.5px] text-ih-ink-2">Fix what is listed above first.</p> : null}
          {props.audienceSize > 100 && !dryRun ? (
            <Callout tone="warning">
              Resend&apos;s free plan sends at most 100 emails a day, and quote emails share that allowance. Move the account to
              Pro before sending to {props.audienceSize.toLocaleString('en-US')} people.
            </Callout>
          ) : null}
          <label className="flex flex-col gap-1 text-[12.5px] text-ih-muted">
            Pace
            <Select value={String(pace)} onChange={(e) => setPace(Number(e.target.value))} disabled={pending}>
              {PACE.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </label>
          <Checkbox
            label="Rehearsal — run the whole send but email nobody"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            disabled={pending}
          />
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="button"
              kind="primary"
              size="dense"
              disabled={pending || !props.ready}
              onClick={() => {
                const who = `${props.audienceSize.toLocaleString('en-US')} ${props.audienceSize === 1 ? 'person' : 'people'}`
                const q = dryRun ? `Rehearse the send to ${who}? Nobody is emailed.` : `Send this newsletter to ${who} now? This cannot be undone.`
                if (window.confirm(q)) run(() => sendNowAction(props.id, { maxPerHour: pace, dryRun }))
              }}
            >
              {dryRun ? 'Rehearse now' : 'Send now'}
            </Button>
            <label className="flex flex-col gap-1 text-[12.5px] text-ih-muted">
              Or at (your local time)
              <input
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
                className="h-8 rounded-lg border border-ih-border bg-ih-surface px-2 text-[13.5px] text-ih-ink"
              />
            </label>
            <Button
              type="button"
              kind="outline"
              size="dense"
              disabled={pending || !props.ready || !at}
              onClick={() => run(() => scheduleAction(props.id, { at: new Date(at).toISOString(), maxPerHour: pace, dryRun }))}
            >
              Schedule
            </Button>
          </div>
        </div>
      ) : null}

      {!editable && c ? (
        <div className="flex flex-col gap-3">
          {props.dryRun ? <Callout tone="info">This was a rehearsal: nothing was emailed.</Callout> : null}
          <Progress counts={c} />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-4">
            {(
              [
                ['Recipients', c.total],
                ['Sent', c.sent],
                ['Delivered', c.delivered],
                ['Bounced', c.bounced],
                ['Complaints', c.complained],
                ['Failed', c.failed],
                ['Skipped', c.skipped],
                ['Waiting', c.queued + c.sending],
              ] as const
            ).map(([label, n]) => (
              <div key={label}>
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">{label}</dt>
                <dd className="font-mono text-ih-ink">{n.toLocaleString('en-US')}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[12.5px] text-ih-muted">
            {props.startedAt ? `Started ${new Date(props.startedAt).toLocaleString()}. ` : ''}
            {props.sentAt ? `Finished ${new Date(props.sentAt).toLocaleString()}. ` : ''}
            Skipped = unsubscribed, bounced or cancelled after the send began. Delivered, bounced and complaints arrive from
            Resend over the following minutes.
          </p>
          {props.status === 'sending' && props.canSend ? (
            <div>
              <Button
                type="button"
                kind="danger"
                size="dense"
                disabled={pending}
                onClick={() => {
                  if (window.confirm('Stop sending? Emails already sent cannot be recalled.')) run(() => cancelSendAction(props.id))
                }}
              >
                Cancel sending
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {note ? (
        <p role={note.ok ? 'status' : 'alert'} className={`mt-2 text-[13px] ${note.ok ? 'text-ih-success-ink' : 'text-ih-danger-ink'}`}>
          {note.text}
        </p>
      ) : null}
    </Panel>
  )
}

function Progress({ counts }: { counts: DeliveryCounts }) {
  const done = counts.sent + counts.failed + counts.skipped
  const pct = counts.total ? Math.round((done / counts.total) * 100) : 0
  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Sending progress"
        className="h-2 overflow-hidden rounded-full bg-ih-surface-2"
      >
        <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="block h-full w-full" aria-hidden>
          <rect width={pct} height="1" className="fill-ih-accent" />
        </svg>
      </div>
      <p className="mt-1 font-mono text-[12px] text-ih-muted">{pct}% done</p>
    </div>
  )
}
