'use client'

import { useEffect, useId, useState } from 'react'
import { cn } from '../lib/cn'
import Banner, { type BannerProps } from './Banner'

/** System banners under the page header, most severe first (C23). */
export type SystemBannerKind =
  | 'mailbox-disconnected'
  | 'assistant-paused'
  | 'sync-delayed'
  | 'zoho-disconnected'
  | 'offline'
  | 'info'

export const SYSTEM_BANNER_ORDER: readonly SystemBannerKind[] = [
  'mailbox-disconnected',
  'assistant-paused',
  'sync-delayed',
  'zoho-disconnected',
  'offline',
  'info',
]

export interface SystemBanner {
  kind: SystemBannerKind
  props: BannerProps
}

export interface BannerSlotProps {
  banners: readonly SystemBanner[]
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
 * One banner, never a stack (C23): renders the most severe and a "+n more" button that discloses the rest.
 * TODO(S01-T07): swap the disclosure for the Overlay kit's Popover.
 */
export default function BannerSlot({ banners, className }: BannerSlotProps) {
  const [open, setOpen] = useState(false)
  const listId = useId()
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
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="io-focus rounded-io-tag cursor-pointer font-medium whitespace-nowrap underline underline-offset-2"
      >
        +{rest.length} more
      </button>
    ) : null

  return (
    <div data-part="banner-slot" className={cn('flex flex-col gap-2', className)}>
      <Banner
        {...top.props}
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
      {rest.length > 0 && open ? (
        <ul id={listId} aria-label="More system notices" className="flex flex-col gap-2">
          {rest.map((b, i) => (
            <li key={`${b.kind}-${i}`}>
              <Banner {...b.props} announce={false} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
