'use client'

import { NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { useEscapeLayer } from '@indus/ops-ui/lib/use-hotkeys'
import { Drawer } from '@indus/ops-ui/overlay'
import { worstAssistantStatus } from '@indus/ops-ui/shell/nav'
import { InlineState } from '@indus/ops-ui/states'
import { AssistantPill } from '@indus/ops-ui/status'
import { ActivityFeed, type ActivityItem } from '@indus/ops-ui/timeline'
import type { AssistantStatus } from '@indus/ops-ui/types'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { getAssistantPanel, type AssistantPanelFeed } from '../../actions/read/shell-panels'
import { useShell } from './Providers'
import { useReturnFocus } from './use-return-focus'

export interface AssistantPanelProps {
  /** The open record's ref (ENQ-2026-0001), or null on a page without one. */
  recordRef: string | null
  assistant: readonly AssistantStatus[]
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
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
 * S03 · Assistant panel (board S03a): docked on the right edge (no scrim, no focus trap; it pushes the page
 * aside), with what waits on you here, what the Assistant is doing now and what it did earlier today, and a
 * box to ask or instruct. An instruction becomes a proposal, never a silent action. Opening moves focus to
 * the box; Escape closes it and focus goes back to the control that opened it.
 *
 * Read through getAssistantPanel(); empty, and the box read-only, until S06-T08 adds the instruction action.
 */
export default function AssistantPanel({ recordRef, assistant }: AssistantPanelProps) {
  const shell = useShell()
  const open = shell.panels.assistant
  const panel = useRef<HTMLDivElement>(null)
  useReturnFocus(open, { restore: true, within: panel })
  useEscapeLayer(open, () => shell.close('assistant'))
  const askId = useId()
  const [feed, setFeed] = useState<AssistantPanelFeed | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    document.getElementById(askId)?.focus()
    let live = true
    void getAssistantPanel(recordRef).then((r) => {
      if (!live) return
      if (r.success) setFeed(r.data)
      else setFailed(r.error)
    })
    return () => {
      live = false
    }
  }, [open, recordRef, askId])

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
    text: d.text,
  }))

  return (
    <div ref={panel} className="contents">
      <Drawer
        open={open}
        onOpenChange={(next) => (next ? shell.open('assistant') : shell.close('assistant'))}
        modal={false}
        // 400, as the S03/S06 boards draw the docked panels (README: 400–460); the kit's ladder starts at 420.
        className="w-[400px]"
        eyebrow="Assistant"
        title={recordRef ? `On ${recordRef}` : 'Everywhere'}
        actions={<StatusPill status={worstAssistantStatus(assistant)} />}
        footer={
          <Field
            id={askId}
            type="textarea"
            name="instruction"
            label="Ask or instruct the Assistant"
            placeholder="Ask or instruct, e.g. “hold line 4 until the client confirms the trim”"
            hint="Instructions come back as a proposal for you to approve"
            {...(feed?.canInstruct ? {} : { state: 'readonly' as const })}
            className="[&>label]:sr-only"
          />
        }
      >
        {failed ? (
          <InlineState kind="error" text={failed} />
        ) : !feed ? (
          <InlineState kind="loading" />
        ) : (
          <>
            <Section title="Waiting on you">
              {feed.waiting.length === 0 ? (
                <Quiet>Nothing here waits on you.</Quiet>
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
