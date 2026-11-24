'use client'

import { NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { useEscapeLayer } from '@indus/ops-ui/lib/use-hotkeys'
import { Drawer } from '@indus/ops-ui/overlay'
import { worstAssistantStatus } from '@indus/ops-ui/shell/nav'
import { InlineState } from '@indus/ops-ui/states'
import { AssistantPill, Tag } from '@indus/ops-ui/status'
import { ActivityFeed, type ActivityItem } from '@indus/ops-ui/timeline'
import type { AssistantStatus } from '@indus/ops-ui/types'
import type { Route } from 'next'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { assistantPanelRead, instructAction } from '../../actions/assistant-panel'
import type { AssistantPanelFeed } from '../../data/assistant-panel'
import { useLiveKeys } from '../../lib/live-keys'
import { useShell } from './Providers'
import { useReturnFocus } from './use-return-focus'

export interface AssistantPanelProps {
  /** The open record's ref (ENQ-2026-0001), or null on a page without one. */
  recordRef: string | null
  assistant: readonly AssistantStatus[]
}

const POLL_MS = 30_000

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5" aria-label={title}>
      <h3 className="io-eyebrow m-0">{title}</h3>
      {children}
    </section>
  )
}

/** The panel's status pill reads the bare state ("Running"), as on board S03a. */
function StatusPill({ status }: { status: AssistantStatus }) {
  return <AssistantPill status={status} label={status[0]!.toUpperCase() + status.slice(1)} />
}

function Quiet({ children }: { children: ReactNode }) {
  return <p className="text-io-ink-3 m-0 text-[12.5px]">{children}</p>
}

/**
 * S03 · Assistant panel (board S03a, S06-T08): docked on the right edge (no scrim, no focus trap; it pushes
 * the page aside) with what waits on you here, what the Assistant is doing now and what it did earlier today,
 * and a box to ask or instruct. An instruction becomes a proposal, never a silent action: Submit (⌘↵) asks
 * for an `instruction`, the row "Drafting a proposal…" shows until its card appears under Waiting on you.
 * Paused, or over the month's AI budget, the box is off with the reason. Opening moves focus to the box;
 * Escape closes it and focus goes back to the control that opened it.
 */
export default function AssistantPanel({ recordRef, assistant }: AssistantPanelProps) {
  const shell = useShell()
  const open = shell.panels.assistant
  const panel = useRef<HTMLDivElement>(null)
  useReturnFocus(open, { restore: true, within: panel })
  useEscapeLayer(open, () => shell.close('assistant'))
  const askId = useId()
  const hintId = useId()
  const [feed, setFeed] = useState<AssistantPanelFeed | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Waiting ids when an instruction was sent: "Drafting a proposal…" until a new one appears. */
  const [drafting, setDrafting] = useState<ReadonlySet<string> | null>(null)

  const apply = useCallback((r: Awaited<ReturnType<typeof assistantPanelRead>>) => {
    if (r.success) {
      setFeed(r.data)
      setFailed(null)
      setDrafting((d) => (d && r.data.waiting.some((w) => !d.has(w.id)) ? null : d))
    } else setFailed(r.error)
  }, [])
  const load = useCallback(() => assistantPanelRead(recordRef).then(apply), [recordRef, apply])

  useEffect(() => {
    if (!open) return
    document.getElementById(askId)?.focus()
    // The read is async: its result lands after this effect, never as a synchronous setState in it.
    let live = true
    const read = () =>
      void assistantPanelRead(recordRef).then((r) => {
        if (live) apply(r)
      })
    read()
    const t = setInterval(read, POLL_MS)
    return () => {
      live = false
      clearInterval(t)
    }
  }, [open, askId, recordRef, apply])

  // A new card anywhere bumps the Review count: read the panel again while it is open.
  useLiveKeys(open ? ['review'] : [], { onChange: () => void load() })

  async function submit() {
    if (!feed?.record || !text.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const r = await instructAction({ recordRef: feed.record.ref, text })
      if (!r.success) {
        setError(r.error)
        return
      }
      setText('')
      setDrafting(new Set(feed.waiting.map((w) => w.id)))
      await load()
    } finally {
      setBusy(false)
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void submit()
    }
  }

  const doing: ActivityItem[] = (feed?.doing ?? []).map((d) => ({
    key: d.id,
    time: d.time,
    mark: d.scheduled ? 'open' : 'assistant',
    text: d.text,
  }))
  const earlier: ActivityItem[] = (feed?.earlier ?? []).map((d) => ({
    key: d.id,
    time: d.time,
    mark: d.actor,
    text: (
      <>
        {d.text}
        {d.whyId ? (
          <>
            {' '}
            <Link
              href={`/why/${encodeURIComponent(d.whyId)}` as Route}
              className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
            >
              Why?
            </Link>
          </>
        ) : null}
      </>
    ),
  }))
  // Off only once the read says so: while it loads the box keeps focus and waits for Submit.
  const off = feed ? !feed.canInstruct : false
  const reason = feed?.blocked?.text ?? null

  return (
    <div ref={panel} className="contents">
      <Drawer
        open={open}
        onOpenChange={(next) => (next ? shell.open('assistant') : shell.close('assistant'))}
        modal={false}
        // 400, as the S03/S06 boards draw the docked panels (README: 400–460); the kit's ladder starts at 420.
        className="w-[400px]"
        variant="shell"
        // S03a: the navy Assistant tag leads the head line, then where the panel is docked.
        lead={<Tag kind="assistant">Assistant</Tag>}
        title={recordRef ? `On ${recordRef}` : 'Everywhere'}
        actions={<StatusPill status={worstAssistantStatus(assistant)} />}
        footer={
          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor={askId} className="sr-only">
              Ask or instruct the Assistant
            </label>
            {/* The Form kit's textarea frame (Field), kept controlled here for ⌘↵ and clearing after Submit. */}
            <div
              data-part="field-control"
              data-type="textarea"
              {...(off ? { 'data-state': 'readonly' } : {})}
              className={
                off
                  ? 'io-focus-field border-io-line bg-io-paper text-io-ink-2 rounded-io-ctl flex h-auto min-h-[84px] min-w-0 items-stretch gap-2 border px-3 py-[9px] text-[13px] leading-[1.5]'
                  : 'io-focus-field border-io-stroke bg-io-card text-io-ink rounded-io-ctl flex h-auto min-h-[84px] min-w-0 items-stretch gap-2 border px-3 py-[9px] text-[13px] leading-[1.5]'
              }
            >
              <textarea
                id={askId}
                name="instruction"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                disabled={off || busy}
                maxLength={1000}
                aria-describedby={hintId}
                placeholder="Ask or instruct, e.g. “hold line 4 until the client confirms the trim”"
                className="placeholder:text-io-ink-4 h-full min-h-[64px] min-w-0 flex-1 resize-none bg-transparent text-current outline-none"
              />
            </div>
            <p id={hintId} className="text-io-ink-3 m-0 text-[11.5px] leading-[1.45]">
              {reason ?? 'Instructions come back as a proposal for you to approve'}
              {!off ? (
                <span className="sr-only">. Press Command or Control and Enter to send.</span>
              ) : null}
            </p>
            {busy ? (
              <p className="text-io-ink-3 m-0 text-[11.5px]" role="status">
                Sending…
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="text-io-bad-solid m-0 text-[12px]">
                {error}
              </p>
            ) : null}
          </div>
        }
      >
        {failed ? (
          <InlineState kind="error" text={failed} />
        ) : !feed ? (
          <InlineState kind="loading" />
        ) : (
          <>
            <Section title="Waiting on you">
              {drafting ? (
                <p className="text-io-ink-2 m-0 text-[12.5px]" role="status" data-part="drafting">
                  Drafting a proposal…
                </p>
              ) : null}
              {feed.waiting.length === 0 && !drafting ? (
                <Quiet>Nothing waits on you here.</Quiet>
              ) : (
                feed.waiting.map((w) => (
                  <NeedsRow
                    key={w.id}
                    action={w.action}
                    title={w.title}
                    {...(w.sub ? { sub: w.sub } : {})}
                    actions={
                      <ButtonLink href={w.href} variant="primary" size="sm">
                        Decide
                      </ButtonLink>
                    }
                  />
                ))
              )}
            </Section>
            <Section title="Doing now">
              {doing.length === 0 ? (
                <Quiet>Nothing running or scheduled.</Quiet>
              ) : (
                <ActivityFeed items={doing} />
              )}
            </Section>
            <Section title="Earlier today">
              {earlier.length === 0 ? (
                <Quiet>Nothing yet today.</Quiet>
              ) : (
                <ActivityFeed items={earlier} />
              )}
            </Section>
          </>
        )}
      </Drawer>
    </div>
  )
}
