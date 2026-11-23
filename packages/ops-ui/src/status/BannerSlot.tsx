'use client'

import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import Popover from '../overlay/Popover'
import Banner, { type BannerProps } from './Banner'

/**
 * System banners under the page header, most severe first (C23). S04-T08 adds the board 89 mailbox states:
 * a mailbox paused by the Owner, a send that failed, the daily sending limit and the slow past-mail read.
 */
export type SystemBannerKind =
  | 'mailbox-disconnected'
  | 'assistant-paused'
  | 'mailbox-paused'
  | 'sync-delayed'
  | 'send-failed'
  | 'limit-reached'
  | 'zoho-disconnected'
  | 'offline'
  | 'backfill-paused'
  | 'info'

export const SYSTEM_BANNER_ORDER: readonly SystemBannerKind[] = [
  'mailbox-disconnected',
  'assistant-paused',
  'mailbox-paused',
  'sync-delayed',
  'send-failed',
  'limit-reached',
  'zoho-disconnected',
  'offline',
  'backfill-paused',
  'info',
]

export interface SystemBanner {
  kind: SystemBannerKind
  props: BannerProps
}

export interface BannerSlotProps {
  banners: readonly SystemBanner[]
  /**
   * `page` (default): a rounded banner inside the page body. `strip`: the 40px full-width strip directly
   * under a PageHeader or RecordHeader (S08: radius 0, padding 0 28, bottom rule), as the console shell
   * mounts it. The "+n more" popover lists the rest as ordinary banners either way.
   */
  placement?: 'page' | 'strip'
  className?: string
}

/** Most severe first; a stable sort keeps the caller's order within a kind. */
export function orderBanners(banners: readonly SystemBanner[]): SystemBanner[] {
  return [...banners].sort(
    (a, b) => SYSTEM_BANNER_ORDER.indexOf(a.kind) - SYSTEM_BANNER_ORDER.indexOf(b.kind)
  )
}

/** Kinds already shown in this tab: a bad banner announces itself (role alert) on first appearance only. */
const announced = new Set<SystemBannerKind>()

/**
 * One banner, never a stack (C23): renders the most severe and a "+n more" button that opens the rest in
 * the Overlay kit's Popover (controlled, so the slot owns its open state). Radix moves focus in, closes on
 * Escape or an outside click and returns focus to the button.
 */
export default function BannerSlot({ banners, placement = 'page', className }: BannerSlotProps) {
  const [open, setOpen] = useState(false)
  const [top, ...rest] = orderBanners(banners)
  // Kinds shown before this slot mounted (another page's header): those no longer alert.
  const [seenBefore] = useState(() => new Set(announced))
  const topKind = top?.kind

  useEffect(() => {
    if (topKind) announced.add(topKind)
  }, [topKind])

  if (!top) return null
  const announce = !seenBefore.has(top.kind)
  const more =
    rest.length > 0 ? (
      <Popover
        open={open}
        onOpenChange={setOpen}
        title={`${rest.length} more ${rest.length === 1 ? 'notice' : 'notices'}`}
        width={360}
        align="end"
        trigger={
          <button
            type="button"
            className="io-focus rounded-io-tag cursor-pointer font-medium whitespace-nowrap underline underline-offset-2"
          >
            +{rest.length} more
          </button>
        }
      >
        <ul aria-label="More system notices" className="flex flex-col gap-2">
          {rest.map((b, i) => (
            <li key={`${b.kind}-${i}`}>
              <Banner {...b.props} announce={false} />
            </li>
          ))}
        </ul>
      </Popover>
    ) : null

  return (
    <div
      data-part="banner-slot"
      data-placement={placement}
      className={cn('flex flex-col gap-2', className)}
    >
      <Banner
        {...top.props}
        strip={placement === 'strip' || top.props.strip === true}
        announce={announce}
        actions={
          top.props.actions || more ? (
            <>
              {top.props.actions}
              {more}
            </>
          ) : undefined
        }
      />
    </div>
  )
}
