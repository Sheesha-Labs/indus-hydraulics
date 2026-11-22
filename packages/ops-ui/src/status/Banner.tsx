import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '../lib/cn'
import Check from './Check'
import Tag from './Tag'

export type BannerTone = 'warn' | 'bad' | 'info' | 'ok' | 'assistant'
export type BannerIcon = 'ok' | 'warn' | 'bad' | 'n'

export interface BannerProps {
  tone: BannerTone
  /** Bold lead-in, e.g. "sales@ disconnected." */
  title?: string
  /** The sentence. */
  children: ReactNode
  icon?: BannerIcon
  /** One slot: BannerAction links. Underlined; on the assistant tone accent without underline. */
  actions?: ReactNode
  /** 40px full-width strip under a header: radius 0, padding 0 28, bottom rule. */
  strip?: boolean
  /**
   * A bad banner is an alert the first time it appears and a status after that (BannerSlot passes false
   * once a kind has been shown). Defaults to true; ignored for the other tones.
   */
  announce?: boolean
  className?: string
}

const TONE: Record<BannerTone, string> = {
  warn: 'bg-io-warn-tint text-io-banner-warn-ink',
  bad: 'bg-io-bad-tint text-io-banner-bad-ink',
  info: 'bg-io-info-tint text-io-info',
  ok: 'bg-io-ok-tint text-io-banner-ok-ink',
  assistant: 'bg-io-accent-wash text-io-ink-2',
}

const ICON_LABEL: Record<BannerIcon, string> = {
  ok: 'Done',
  warn: 'Warning',
  bad: 'Problem',
  n: 'Note',
}

/**
 * Status kit `ks-ban`: 12×16, r 10, 13px; the assistant tone leads with the ASSISTANT tag. Role status;
 * a bad banner is role alert on its first appearance only.
 */
export default function Banner({
  tone,
  title,
  children,
  icon,
  actions,
  strip = false,
  announce = true,
  className,
}: BannerProps) {
  return (
    <div
      role={tone === 'bad' && announce ? 'alert' : 'status'}
      data-part="banner"
      data-tone={tone}
      className={cn(
        'flex w-full items-center gap-3 text-[13px] leading-[1.45]',
        strip
          ? 'h-io-strip border-io-line rounded-none border-b px-7 text-[12.5px]'
          : 'rounded-io-card px-4 py-3',
        TONE[tone],
        className
      )}
    >
      {tone === 'assistant' ? <Tag kind="assistant">Assistant</Tag> : null}
      {icon ? <Check mark={icon} label={ICON_LABEL[icon]} className="bg-io-card" /> : null}
      <span className="min-w-0 flex-1">
        {title ? (
          <>
            <b className="font-medium">{title}</b>{' '}
          </>
        ) : null}
        {children}
      </span>
      {actions ? (
        <span
          className={cn(
            'flex flex-none items-center gap-4 font-medium whitespace-nowrap',
            tone === 'assistant'
              ? 'text-io-accent *:no-underline'
              : '*:underline *:underline-offset-2'
          )}
        >
          {actions}
        </span>
      ) : null}
    </div>
  )
}

export interface BannerActionProps {
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

/** A text action inside a Banner: a link when given an href, otherwise a button. */
export function BannerAction({ children, href, onClick }: BannerActionProps) {
  const cls = 'io-focus rounded-io-tag cursor-pointer'
  return href ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
