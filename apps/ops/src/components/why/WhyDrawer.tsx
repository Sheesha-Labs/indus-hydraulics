'use client'

import { Button, ButtonLink, PaneTabs } from '@indus/ops-ui/controls'
import { Drawer } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { parseEvidenceId } from '@indus/ops-core'
import type { WhyTab, WhyView } from '../../data/why'
import CorrectValueForm from './CorrectValueForm'
import WhyTabBody, { whyTabs } from './WhyTabs'

/**
 * Why? (S06-T05, board 112 / shell S04A). The intercepting route `@drawer/(.)why/[evidenceId]` renders the
 * drawer over the current page; `why/[evidenceId]` renders WhyPage for a reload or a new tab. Both share the
 * state below: the tab, the active span (a reason's source link switches to Sources at its span without a
 * navigation), and "This is wrong…" (the correction form in place of the tabs, Save in the foot).
 */
function useWhyState(view: WhyView | null) {
  const [tab, setTab] = useState<WhyTab>(view?.initialTab ?? 'reasons')
  const [activeSpan, setActiveSpan] = useState<string | null>(view?.activeSpan ?? null)
  const [correcting, setCorrecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const onEvidence = (evidenceId: string) => {
    const e = parseEvidenceId(evidenceId)
    if (!view || !e || e.kind !== 'reason') return
    const span = view.spans.find((s) => s.reasonIndex === e.index)
    setActiveSpan(span?.key ?? null)
    setTab('sources')
  }
  return { tab, setTab, activeSpan, onEvidence, correcting, setCorrecting, busy, setBusy }
}

function NotFoundBody() {
  return (
    <p className="text-io-ink-2 m-0">
      This evidence link is old, or what it pointed to was removed. The record’s Activity tab keeps
      what the Assistant did.
    </p>
  )
}

function Body({
  view,
  s,
}: {
  view: WhyView
  s: ReturnType<typeof useWhyState> & { formId: string }
}) {
  if (s.correcting && view.correction) {
    return (
      <CorrectValueForm
        correction={view.correction}
        formId={s.formId}
        onBusy={s.setBusy}
        onSaved={() => {
          s.setCorrecting(false)
          // The action revalidates the page; the drawer re-renders with the new History. (No
          // router.refresh(): refreshing an intercepted route can drop the interception.)
          s.setTab('history')
        }}
      />
    )
  }
  return <WhyTabBody view={view} tab={s.tab} activeSpan={s.activeSpan} onEvidence={s.onEvidence} />
}

function Foot({
  view,
  s,
  keep,
}: {
  view: WhyView
  s: ReturnType<typeof useWhyState> & { formId: string }
  keep: ReactNode
}) {
  if (s.correcting) {
    return (
      <>
        <Button type="submit" form={s.formId} variant="primary" busy={s.busy}>
          Save
        </Button>
        <Button onClick={() => s.setCorrecting(false)} disabled={s.busy}>
          Cancel
        </Button>
      </>
    )
  }
  return (
    <>
      {view.correction ? (
        <Button onClick={() => s.setCorrecting(true)}>This is wrong…</Button>
      ) : null}
      <span className="flex-1" />
      {keep}
    </>
  )
}

export interface WhyDrawerProps {
  /** Null: an unknown or malformed evidence id (the not-found state). */
  view: WhyView | null
}

/**
 * The drawer: modal (460, scrim, focus trapped), opened by a navigation, so closing goes back
 * (router.back()) and focus returns to the link that opened it. "Keep" closes and records nothing.
 */
export default function WhyDrawer({ view }: WhyDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const formId = useId()
  const s = { ...useWhyState(view), formId }
  // The evidence link that was followed; captured before the drawer moves focus inside itself.
  const opener = useRef<HTMLElement | null>(null)
  // The history depth when the drawer opened. A correction's server action revalidates the intercepted route,
  // and Next records that as one more history entry for the same URL; closing must go back past it to the
  // page underneath, not to a copy of the drawer's URL.
  const depth = useRef(0)
  useLayoutEffect(() => {
    const el = document.activeElement
    opener.current = el instanceof HTMLElement && el !== document.body ? el : null
    depth.current = window.history.length
  }, [])

  const close = () => {
    setOpen(false)
    const extra = window.history.length - depth.current
    if (extra > 0) window.history.go(-(extra + 1))
    else router.back()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      variant="shell"
      eyebrow={view?.eyebrow ?? 'Why?'}
      title={view?.title ?? 'We can’t find that evidence'}
      width={460}
      returnFocusRef={opener}
      {...(view
        ? {
            ...(s.correcting
              ? {}
              : {
                  tabs: {
                    items: whyTabs(view),
                    value: s.tab,
                    onValueChange: (k: string) => s.setTab(k as WhyTab),
                  },
                }),
            footer: (
              <Foot
                view={view}
                s={s}
                keep={
                  <Button variant="primary" onClick={close}>
                    Keep
                  </Button>
                }
              />
            ),
          }
        : {})}
    >
      {view ? <Body view={view} s={s} /> : <NotFoundBody />}
    </Drawer>
  )
}

export interface WhyPageProps {
  view: WhyView
  /** Where "Back" and "Keep" go: the page the link was on, or Today. */
  returnTo: string
}

/** The same content as a full page (`why/[evidenceId]`): a reload, a new tab or a shared link. */
export function WhyPage({ view, returnTo }: WhyPageProps) {
  const formId = useId()
  const s = { ...useWhyState(view), formId }
  return (
    <div className="px-io-page-x flex flex-col gap-4 py-6">
      <Link
        href={returnTo as Route}
        className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover self-start text-[12.5px]"
      >
        ← Back
      </Link>
      <div className="rounded-io-card border-io-line bg-io-card flex max-w-[640px] flex-col border">
        <div className="border-io-line flex flex-col gap-[3px] border-b px-5 pt-[18px] pb-3">
          <span className="io-eyebrow">{view.eyebrow}</span>
          <h1 className="text-io-ink m-0 text-[18px] leading-[1.3] font-medium">{view.title}</h1>
        </div>
        {s.correcting ? (
          <div className="text-io-ink-2 flex flex-col gap-3.5 px-5 py-4 text-[13px] leading-[1.55]">
            <Body view={view} s={s} />
          </div>
        ) : (
          <PaneTabs
            items={whyTabs(view)}
            value={s.tab}
            onValueChange={(k) => s.setTab(k as WhyTab)}
            aria-label="Why? sections"
            className="[&_[role=tab]]:px-2.5 [&_[role=tablist]]:px-3"
          >
            <div className="text-io-ink-2 flex flex-col gap-3.5 px-5 py-4 text-[13px] leading-[1.55]">
              <Body view={view} s={s} />
            </div>
          </PaneTabs>
        )}
        <div className="border-io-line flex gap-2 border-t px-5 py-3">
          <Foot
            view={view}
            s={s}
            keep={
              <ButtonLink href={returnTo} variant="primary">
                Keep
              </ButtonLink>
            }
          />
        </div>
      </div>
    </div>
  )
}
