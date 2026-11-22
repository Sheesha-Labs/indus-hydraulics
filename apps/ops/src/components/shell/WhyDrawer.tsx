'use client'

import {
  CheckList,
  ConfidenceLine,
  SourceQuote,
  WhyList,
  type CheckItem,
} from '@indus/ops-ui/assistant'
import { List } from '@indus/ops-ui/card'
import { Button, ButtonLink, PaneTabs } from '@indus/ops-ui/controls'
import { Drawer, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
import type { EvidenceView } from '../../data/evidence'

type WhyTab = 'reasons' | 'sources' | 'history'

function tabs(evidence: EvidenceView) {
  return [
    { key: 'reasons', label: 'Reasons' },
    { key: 'sources', label: 'Sources', count: evidence.sources.length },
    { key: 'history', label: 'History' },
  ]
}

/** One tab's content: the same in the drawer and on the full page. */
function WhyTabBody({ evidence, tab }: { evidence: EvidenceView; tab: WhyTab }) {
  if (tab === 'sources')
    return evidence.sources.length === 0 ? (
      <p className="text-io-ink-3 m-0 text-[12.5px]">No sources recorded.</p>
    ) : (
      <List
        items={evidence.sources.map((s) => ({
          key: s.key,
          mark: null,
          title: s.label,
          sub: s.meta,
        }))}
      />
    )
  if (tab === 'history')
    return evidence.history.length === 0 ? (
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        This value has not changed since it was captured.
      </p>
    ) : (
      <List
        items={evidence.history.map((h) => ({
          key: h.key,
          mark: null,
          title: h.text,
          right: h.time,
        }))}
      />
    )
  const checks: CheckItem[] = evidence.checks.map((c) => ({
    key: c.key,
    mark: c.mark,
    text: c.text,
    right: c.right,
  }))
  return (
    <>
      <WhyList reasons={evidence.reasons} />
      {evidence.source ? (
        <SourceQuote
          fileType={evidence.source.kind}
          doc={evidence.source.name}
          meta={evidence.source.meta}
          text={evidence.source.text}
          match={evidence.source.mark}
          location={evidence.source.foot}
          openHref={evidence.source.href}
        />
      ) : null}
      {checks.length > 0 ? <CheckList items={checks} /> : null}
      <ConfidenceLine
        level={evidence.confidence.level}
        {...(evidence.confidence.reason ? { reason: evidence.confidence.reason } : {})}
      />
    </>
  )
}

function NotFoundBody() {
  return (
    <p className="text-io-ink-2 m-0">
      This evidence link is old, or what it pointed to was removed. The record’s Activity tab keeps
      what the Assistant did.
    </p>
  )
}

/** "This is wrong…": the correction flow (pick the right value, give a reason) arrives with S06. */
function useWrong() {
  const { toast } = useToast()
  return () =>
    toast({
      kind: 'info',
      title: 'Corrections are made from the Assistant log once it is switched on.',
    })
}

export interface WhyDrawerProps {
  /** Null: an unknown or malformed evidence id (the not-found state). */
  evidence: EvidenceView | null
}

/**
 * S04 · Why? drawer (board S04a), rendered by the intercepting route `@drawer/(.)why/[evidenceId]` when an
 * evidence link is followed inside the console: a modal Drawer (460, scrim, focus trapped) over the page,
 * with Reasons · Sources n · History, and "This is wrong…" and "Keep". It was opened by a navigation, so
 * closing goes back (router.back()); focus returns to the link that opened it.
 */
export default function WhyDrawer({ evidence }: WhyDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<WhyTab>('reasons')
  const wrong = useWrong()
  // The evidence link that was followed; captured before the drawer moves focus inside itself.
  const opener = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const el = document.activeElement
    opener.current = el instanceof HTMLElement && el !== document.body ? el : null
  }, [])

  const close = () => {
    setOpen(false)
    router.back()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      variant="shell"
      eyebrow="Why?"
      title={evidence?.title ?? 'We can’t find that evidence'}
      width={460}
      returnFocusRef={opener}
      {...(evidence
        ? {
            tabs: {
              items: tabs(evidence),
              value: tab,
              onValueChange: (k: string) => setTab(k as WhyTab),
            },
            footer: (
              <>
                <Button onClick={wrong}>This is wrong…</Button>
                <span className="flex-1" />
                <Button variant="primary" onClick={close}>
                  Keep
                </Button>
              </>
            ),
          }
        : {})}
    >
      {evidence ? <WhyTabBody evidence={evidence} tab={tab} /> : <NotFoundBody />}
    </Drawer>
  )
}

export interface WhyPageProps {
  evidence: EvidenceView
  /** Where "Back" goes: the page the link was on, or Today. */
  returnTo: string
}

/**
 * The same Why? content as a full page (`why/[evidenceId]`): a reload, a new tab or a shared link. Back is a
 * link to `returnTo`, since there may be no history to go back to.
 */
export function WhyPage({ evidence, returnTo }: WhyPageProps) {
  const [tab, setTab] = useState<WhyTab>('reasons')
  const wrong = useWrong()
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
          <span className="io-eyebrow">Why?</span>
          <h1 className="text-io-ink m-0 text-[18px] leading-[1.3] font-medium">
            {evidence.title}
          </h1>
        </div>
        <PaneTabs
          items={tabs(evidence)}
          value={tab}
          onValueChange={(k) => setTab(k as WhyTab)}
          aria-label="Why? sections"
          className="[&_[role=tab]]:px-2.5 [&_[role=tablist]]:px-3"
        >
          <div className="text-io-ink-2 flex flex-col gap-3.5 px-5 py-4 text-[13px] leading-[1.55]">
            <WhyTabBody evidence={evidence} tab={tab} />
          </div>
        </PaneTabs>
        <div className="border-io-line flex gap-2 border-t px-5 py-3">
          <Button onClick={wrong}>This is wrong…</Button>
          <span className="flex-1" />
          <ButtonLink href={returnTo} variant="primary">
            Keep
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
