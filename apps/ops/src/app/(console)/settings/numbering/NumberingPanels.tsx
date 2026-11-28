'use client'

import { formatNumber, validatePattern } from '@indus/ops-core'
import { Button, RadioGroup } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import HeaderActions from '../../../../components/route/HeaderActions'
import type { SequenceRow } from '../../../../server/numbering/sequences'
import {
  checkNowAction,
  confirmNumberingStyleAction,
  seedSequenceAction,
  setPatternAction,
} from './actions/numbering'

const SOURCE: Record<string, string> = {
  gmail_sent: 'Gmail sent mail',
  legacy_admin: 'Website admin',
  zoho: 'Zoho',
  history_import: 'History import',
  manual: 'Entered by hand',
}
const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

type Run = (p: Promise<{ success: boolean; error?: string }>, ok: string) => Promise<boolean>
function useRun(): [Run, boolean] {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const run: Run = async (p, ok) => {
    setBusy(true)
    const r = await p
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error ?? 'Something went wrong' })
      return false
    }
    toast({ kind: 'success', title: ok })
    router.refresh()
    return true
  }
  return [run, busy]
}

/** The header's one primary while any series awaits it: confirm the Round 1 numbering style (C6). */
export default function NumberingActions({ awaiting }: { awaiting: boolean }) {
  const [run, busy] = useRun()
  if (!awaiting) return null
  return (
    <HeaderActions>
      <Button
        variant="primary"
        busy={busy}
        onClick={() => run(confirmNumberingStyleAction({}), 'Numbering style confirmed')}
      >
        Confirm numbering style
      </Button>
    </HeaderActions>
  )
}

/**
 * Board 214's out-of-step card: an outside number reached the next one. Set next above it (matches what the
 * outside allocator issued) or keep it (allocation would skip the used number; a push to Zoho fails).
 */
export function OutOfStepCard({ row, isOwner }: { row: SequenceRow; isOwner: boolean }) {
  const [run, busy] = useRun()
  const clash = row.detail?.perSource.find((s) => s.clashesWithNext)
  const above = (clash?.maxSeen ?? 0) + 1
  const setTo = (() => {
    try {
      return formatNumber(row.pattern, above, row.detail?.checkedScope ?? '', row.scopeKind)
    } catch {
      return String(above)
    }
  })()
  const [choice, setChoice] = useState<'set' | 'keep'>('set')
  return (
    <section
      aria-labelledby={`oos-${row.key}`}
      className="rounded-io-card border-io-warn bg-io-card flex flex-col gap-3 border px-[18px] py-4"
    >
      <h2 id={`oos-${row.key}`} className="io-eyebrow text-io-ink-3 m-0">
        {row.label} · out of step
      </h2>
      <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">
        {clash ? `${SOURCE[clash.source] ?? clash.source} shows ${clash.maxFormatted}` : 'A number was used outside'};
        Operations would issue {row.next ?? 'a number below it'}, which already exists there.
      </p>
      <RadioGroup<'set' | 'keep'>
        name={`oos-${row.key}`}
        legend={`What to do about ${row.label}`}
        hideLegend
        value={choice}
        onValueChange={setChoice}
        options={[
          { value: 'set', label: `Set next to ${setTo}`, sub: 'Matches' },
          { value: 'keep', label: `Keep ${row.next ?? ''}`, sub: 'Will fail on push' },
        ]}
      />
      {isOwner ? (
        <Button
          className="self-start"
          busy={busy}
          onClick={() =>
            choice === 'set'
              ? run(
                  seedSequenceAction({
                    key: row.key,
                    next: above,
                    evidence: {
                      reason: 'out of step',
                      source: clash?.source ?? null,
                      seen: clash?.maxFormatted ?? null,
                    },
                  }),
                  `${row.label} continues from ${setTo}`
                )
              : Promise.resolve(false)
          }
          disabled={choice === 'keep'}
        >
          Apply
        </Button>
      ) : null}
    </section>
  )
}

/**
 * A series' panel: the evidence per source (highest seen, when, the Gmail message), "Check now", the seed (a
 * proposed next number one above everything seen; INDUS/Q waits for the cutover batch) and the pattern.
 */
export function SequencePanel({
  row,
  proposal,
  isOwner,
}: {
  row: SequenceRow
  proposal: { next: number; formatted: string; perSource: { source: string; max: number }[] } | null
  isOwner: boolean
}) {
  const [run, busy] = useRun()
  const [pattern, setPattern] = useState(row.pattern)
  const [next, setNext] = useState(String(proposal?.next ?? ''))
  const patternErrors = validatePattern(pattern, row.scopeKind)
  const nextValue = Number(next)
  const dupe = proposal && Number.isInteger(nextValue) && nextValue > 0 && nextValue < proposal.next
  const preview = (() => {
    try {
      return patternErrors.length
        ? null
        : formatNumber(pattern, Number.isInteger(nextValue) && nextValue > 0 ? nextValue : 1, row.detail?.checkedScope ?? '', row.scopeKind)
    } catch {
      return null
    }
  })()
  return (
    <section
      aria-labelledby="panel-eyebrow"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-4 border px-[18px] py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="panel-eyebrow" className="m-0 text-[15px] font-medium">
          {row.label}
        </h2>
        <Button
          size="sm"
          busy={busy}
          disabled={!row.seeded}
          onClick={() => run(checkNowAction({ key: row.key }), 'Checking · the result shows here shortly')}
        >
          Check now
        </Button>
      </div>
      <dl className="m-0 grid grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px]">
        {(row.detail?.perSource ?? []).map((s) => (
          <div key={s.source} className="contents">
            <dt className="text-io-ink-2">{SOURCE[s.source] ?? s.source}</dt>
            <dd className="m-0 flex flex-wrap items-center gap-2 tabular-nums">
              {s.note ??
                (s.maxFormatted
                  ? `${s.maxFormatted}${s.lastSeenAt ? ` · last seen ${DATE.format(new Date(s.lastSeenAt))}` : ''}`
                  : 'nothing seen')}
              {s.source === 'gmail_sent' && s.lastRef ? (
                <a
                  href={`https://mail.google.com/mail/u/0/#all/${s.lastRef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-io-accent io-focus rounded-io-tag text-[12.5px]"
                >
                  Open in Gmail
                </a>
              ) : null}
              {s.clashesWithNext ? <Chip tone="warn" label="Reaches the next number" /> : null}
            </dd>
          </div>
        ))}
        {row.detail ? null : (
          <>
            <dt className="text-io-ink-2">Evidence</dt>
            <dd className="m-0">{row.seeded ? 'Not checked yet' : 'Seed the series first'}</dd>
          </>
        )}
      </dl>
      {row.key === 'quotation' ? (
        <p className="text-io-ink-2 m-0 text-[12.5px]">
          INDUS/Q is seeded in the cutover batch from the highest number in Zoho, sent mail and the
          website admin, so the series continues without a gap or a clash.
        </p>
      ) : proposal && isOwner ? (
        <form
          aria-label={`Seed ${row.label}`}
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void run(
              seedSequenceAction({
                key: row.key,
                next: nextValue,
                evidence: Object.fromEntries([
                  ['proposed', proposal.next],
                  ...proposal.perSource.map((p) => [p.source, p.max]),
                ]),
              }),
              `${row.label} starts at ${preview ?? next}`
            )
          }}
        >
          <div className="grid grid-cols-[200px_minmax(0,1fr)] items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-io-ink-2 text-[12px] font-medium">Next number</span>
              <input
                type="number"
                min={1}
                value={next}
                onChange={(e) => setNext(e.currentTarget.value)}
                aria-invalid={dupe || undefined}
                className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card border px-3 text-[13px] tabular-nums"
              />
            </label>
            <span className={dupe ? 'text-io-bad text-[12.5px]' : 'text-io-ink-3 text-[12.5px]'}>
              {dupe
                ? `Below ${proposal.formatted}: that would duplicate a number already used.`
                : `Prints ${preview ?? '—'} · proposed ${proposal.formatted}, one above everything seen.`}
            </span>
          </div>
          <Button type="submit" className="self-start" busy={busy} disabled={!!dupe || !(nextValue > 0)}>
            {row.seeded ? 'Set next number' : 'Seed this series'}
          </Button>
        </form>
      ) : null}
      {isOwner && row.key !== 'quotation' ? (
        <form
          aria-label={`Pattern of ${row.label}`}
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void run(setPatternAction({ key: row.key, pattern }), 'Pattern saved · new numbers only')
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-io-ink-2 text-[12px] font-medium">Pattern</span>
            <input
              name="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.currentTarget.value)}
              aria-invalid={patternErrors.length > 0 || undefined}
              aria-describedby="pattern-hint"
              className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card max-w-[360px] border px-3 text-[13px]"
            />
            <span
              id="pattern-hint"
              className={patternErrors.length ? 'text-io-bad text-[11.5px]' : 'text-io-ink-3 text-[11.5px]'}
            >
              {patternErrors[0] ??
                `Prints ${preview ?? '—'}. Tokens: {n} {nn} {nnnn} {yyyy} {yy} {mm} {yymm} {enq4}. Affects only new numbers.`}
            </span>
          </label>
          <Button
            type="submit"
            className="self-start"
            busy={busy}
            disabled={patternErrors.length > 0 || pattern === row.pattern}
          >
            Save pattern
          </Button>
        </form>
      ) : null}
    </section>
  )
}
