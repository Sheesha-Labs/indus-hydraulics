'use client'

import { Lock } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import Choices from '../controls/Choices'
import Toggle from '../controls/Toggle'
import { cn } from '../lib/cn'
import Tag from '../status/Tag'
import { formatAge } from './age'
import CheckList from './CheckList'
import ConfidenceLine from './ConfidenceLine'
import OptionGroup from './OptionGroup'
import ProposalActions, { canApproveFromKeyboard, useProposalActions } from './ProposalActions'
import ProposalPreview from './ProposalPreview'
import type { ProposalCardProps } from './types'
import WhyList from './WhyList'

/** Wall-clock now, re-read every minute so the header age stays current. */
function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Keys typed into a field never reach the card's shortcuts. */
function inField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !==
      null
  )
}

/**
 * Assistant kit `ProposalCard` (ADR-09): the one card every Assistant proposal renders through. An
 * <article> named by its headline, focusable so its shortcuts work: ⌘/Ctrl+↵ approves (never on a locked
 * level), E edits, R opens Reject, L opens Later. Header: action tag, record link, level tag and
 * "ASSISTANT · 12 min". Body (gap 12): headline 16/1.35 (compact 14), why, preview, signals, checks,
 * toggle, reason chips, aside, options, confidence, the on-approve consequence. Collapsed shows the
 * header, headline and actions only; decided cards dim to .72 and show who decided. The card never sends
 * anything itself: the verbs are the server actions in `actions`. Needs a ToastProvider above it.
 */
export default function ProposalCard(card: ProposalCardProps) {
  const {
    id,
    type,
    record,
    level,
    createdAt,
    headline,
    why,
    preview,
    signals,
    checks,
    toggle,
    reasonChips,
    aside,
    options,
    confidence,
    onApproveText,
    compact = false,
    raised = false,
    batchable,
    readOnly = false,
    className,
  } = card
  const headlineId = useId()
  const article = useRef<HTMLElement>(null)
  const now = useNow()
  const c = useProposalActions(card)
  const [rejectOpen, setRejectOpen] = useState(false)
  const actionable = (c.state === 'open' || c.state === 'collapsed') && !readOnly
  const decided = c.state === 'approved' || c.state === 'rejected'
  const full = c.state !== 'collapsed'

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // React bubbles events out of portals: keys typed in the Reject popover or the Later menu (typeahead)
    // reach this handler too, and must not act as card shortcuts.
    if (e.defaultPrevented || inField(e.target)) return
    if (!(e.target instanceof Node) || !article.current?.contains(e.target)) return
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key === 'Enter') {
      // A locked level (client prices, supplier POs, payments) is approved only by a click.
      if (!canApproveFromKeyboard(card, c.state)) return
      e.preventDefault()
      c.approve()
      return
    }
    if (e.metaKey || e.ctrlKey || e.altKey || !actionable) return
    const verb = e.key.toLowerCase()
    const el = (name: string) =>
      article.current?.querySelector<HTMLElement>(`[data-part="actions"] [data-verb="${name}"]`)
    if (verb === 'e') {
      const edit = el('edit')
      if (!edit) return
      e.preventDefault()
      edit.click()
    } else if (verb === 'r' && el('reject')) {
      e.preventDefault()
      setRejectOpen(true)
    } else if (verb === 'l') {
      const later = el('later')
      if (!later) return
      e.preventDefault()
      // Radix opens a menu trigger from the keyboard (ArrowDown) with focus on its first item.
      later.focus()
      later.dispatchEvent(
        new globalThis.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
    }
  }

  return (
    // The card is a focus target by design (05 §3.11): its shortcuts work while it has focus, and J/K in
    // Review move focus card to card.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      ref={article}
      id={`proposal-${id}`}
      aria-labelledby={headlineId}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-part="proposal"
      data-state={c.state}
      data-locked={level?.locked ? '' : undefined}
      data-batchable={batchable === undefined ? undefined : String(batchable)}
      data-readonly={readOnly ? '' : undefined}
      className={cn(
        'bg-io-card border-io-line rounded-io-card text-io-body text-io-ink relative flex w-full min-w-0 flex-col border',
        'outline-none focus-visible:shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]',
        raised ? 'shadow-io-e-raised' : 'shadow-io-e1',
        // Decided cards read as a record. (decision) The kit dims them with opacity .72, which takes ink-3
        // meta text and accent links below AA (axe color-contrast); instead every text steps one shade
        // lighter on white (ink → ink-2; why and preview ink-2 → ink-3) and the border lightens, which
        // keeps AA everywhere (the on-approve box stays ink-2 on its tint).
        decided &&
          'border-io-line-2 text-io-ink-2 [&_[data-part=preview]_.text-io-ink-2]:text-io-ink-3 [&_[data-part=why]>li]:text-io-ink-3',
        className
      )}
    >
      <header className="text-io-ink-3 flex flex-wrap items-center gap-2 px-[18px] pt-3.5 text-[12px]">
        <Tag kind="action">{type}</Tag>
        {record ? (
          <Link
            href={record.href as Route}
            className="io-focus rounded-io-tag hover:text-io-ink hover:underline"
            {...(record.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {record.label}
          </Link>
        ) : null}
        {level?.label ? <Tag kind="level">{level.label}</Tag> : null}
        {batchable === false ? (
          <span className="inline-flex" title="Never batched">
            <Lock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
            <span className="sr-only">Never batched</span>
          </span>
        ) : null}
        <span className="ml-auto inline-flex flex-none items-center gap-[9px] whitespace-nowrap">
          <Tag kind="assistant">Assistant</Tag>
          <span>
            ·{' '}
            <time dateTime={createdAt.toISOString()} suppressHydrationWarning>
              {formatAge(createdAt, new Date(now))}
            </time>
          </span>
        </span>
      </header>
      <div className="flex flex-col gap-3 px-[18px] pt-2.5 pb-4">
        <p
          id={headlineId}
          className={cn(
            'm-0 text-pretty',
            compact
              ? 'text-[14px] leading-[1.35] font-medium tracking-[-0.01em]'
              : 'text-io-headline'
          )}
        >
          {headline}
        </p>
        {full ? (
          <>
            {why?.length ? <WhyList reasons={why} /> : null}
            {preview ? <ProposalPreview title={preview.title} lines={preview.lines} /> : null}
            {signals?.length ? (
              <CheckList items={signals} variant="signals" label="Signals" />
            ) : null}
            {checks?.length ? <CheckList items={checks} label="Checks" /> : null}
            {toggle ? (
              <Toggle
                checked={c.toggleOn}
                onCheckedChange={c.setToggleOn}
                name={toggle.name}
                label={toggle.label}
                disabled={!actionable}
                className="gap-2 text-[12.5px]"
              />
            ) : null}
            {reasonChips ? (
              <div className="flex flex-col gap-2">
                <span className="io-eyebrow" aria-hidden="true">
                  {reasonChips.label}
                </span>
                <Choices
                  aria-label={reasonChips.label}
                  options={reasonChips.options}
                  value={c.chip ?? ''}
                  {...(actionable ? { onValueChange: c.setChip } : {})}
                />
              </div>
            ) : null}
            {aside ? <div className="text-io-ink-3 text-[12px] leading-[1.45]">{aside}</div> : null}
            {options ? (
              <OptionGroup
                name={`proposal-${id}-option`}
                items={options.items}
                {...(options.legend ? { legend: options.legend } : {})}
                {...(c.optionValue === undefined ? {} : { value: c.optionValue })}
                onValueChange={c.setOptionValue}
              />
            ) : null}
            {confidence ? (
              <ConfidenceLine
                level={confidence.level}
                {...(confidence.reason ? { reason: confidence.reason } : {})}
              />
            ) : null}
            {onApproveText ? (
              <p className="rounded-io-ctl bg-io-accent-wash text-io-ink-2 m-0 px-3 py-2.5 text-[12.5px] leading-[1.45]">
                <b className="text-io-ink font-medium">{onApproveText.label ?? 'On approve'} · </b>
                {onApproveText.text}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
      <ProposalActions
        card={card}
        controller={c}
        rejectOpen={rejectOpen}
        onRejectOpenChange={setRejectOpen}
      />
    </article>
  )
}
