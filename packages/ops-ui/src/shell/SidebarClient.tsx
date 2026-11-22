'use client'

import { PanelLeftClose, PanelLeftOpen, Search as SearchGlyph } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useId, useState, type ReactNode } from 'react'
import { SearchTrigger } from '../controls/Search'
import OpsIcon from '../icons/OpsIcon'
import { cn } from '../lib/cn'
import Tooltip from '../overlay/Tooltip'
import { tooltipBubble } from '../overlay/styles'
import type { AssistantStatus } from '../types'
import AssistantPillMenu from './AssistantPillMenu'
import { useShellLive } from './live'
import {
  NAV_GROUPS,
  SETTINGS_ITEM,
  SIDEBAR_COOKIE,
  SIDEBAR_COOKIE_COLLAPSED,
  SIDEBAR_COOKIE_EXPANDED,
  type NavItem,
  type NavKey,
} from './nav'
import ProfileMenu, { ProfileMenuFrame } from './ProfileMenu'

export interface SidebarUser {
  name: string
  initials: string
  role: 'owner' | 'helper'
  /** "Owner" | "Helper · sourcing". */
  roleLabel: string
  /** The signed-in user's mailbox; null prints "—" (no primary mailbox yet). */
  mailbox: 'sales@' | 'purchase@' | null
}

/** Specimen-only stills (L1 k00, board 74). The product never sets these. */
export interface SidebarPreview {
  /** Draw the avatar menu open (the board's `menu`). */
  menuOpen?: boolean
  /** Draw this collapsed item's tooltip (the board's `tip`). */
  tip?: NavKey
}

export interface SidebarClientProps {
  user: SidebarUser
  active: NavKey | null
  badges: Partial<Record<NavKey, number>>
  status: AssistantStatus
  collapsed: boolean
  websiteAdminHref: string | undefined
  signOutAction: (formData: FormData) => void | Promise<void>
  onPause: (() => void | Promise<void>) | undefined
  onOpenCommand: (() => void) | undefined
  logo: ReactNode
  persist: boolean
  preview: SidebarPreview | undefined
  className: string | undefined
}

/** "Review, 14 waiting": the count is part of the link's name, never only a coloured badge. */
export function navItemName(label: string, count: number | undefined): string {
  return count ? `${label}, ${count} waiting` : label
}

/**
 * The link's name as text: the visible label and badge are hidden from assistive tech and the full name is
 * read from a visually hidden span (no aria-label, so the name always contains the visible label).
 */
function ItemName({
  label,
  count,
  visible,
}: {
  label: string
  count: number | undefined
  visible: boolean
}) {
  if (visible && !count) return <>{label}</>
  return (
    <>
      {visible ? <span aria-hidden="true">{label}</span> : null}
      <span className="sr-only">{navItemName(label, count)}</span>
    </>
  )
}

async function writeCookie(collapsed: boolean): Promise<void> {
  const value = collapsed ? SIDEBAR_COOKIE_COLLAPSED : SIDEBAR_COOKIE_EXPANDED
  const store = (globalThis as { cookieStore?: { set: (o: object) => Promise<void> } }).cookieStore
  const maxAge = 60 * 60 * 24 * 365
  if (store) {
    await store.set({ name: SIDEBAR_COOKIE, value, path: '/', expires: Date.now() + maxAge * 1000 })
    return
  }
  // Older Safari has no Cookie Store API. The value is a UI preference, not a credential.
  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = `${SIDEBAR_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`
}

/**
 * The sidebar's client part (05 §3.13): collapse state (cookie-backed, so SSR already rendered the right
 * width), live badges, the command-bar trigger, tooltips and the two menus. Markup mirrors OpsSidebar: one
 * flat flex column (the nav and its groups are `display: contents`), so a short frame compresses the rows
 * exactly as the boards do. Line height and tracking are inherited from the body (1.45, -0.005em), as the
 * boards' page inherits them; the L1 sheet sets neither, so its mirror row resets both.
 */
export default function SidebarClient(props: SidebarClientProps) {
  const [collapsed, setCollapsed] = useState(props.collapsed)
  const live = useShellLive()
  const badges = { ...props.badges, ...live.badges }
  const openCommand = props.onOpenCommand ?? live.openCommand ?? (() => undefined)
  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    if (props.persist) void writeCookie(next)
  }
  const toggleButton = (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      data-part="sidebar-toggle"
      className="io-focus rounded-io-pill border-io-line bg-io-card text-io-ink-3 shadow-io-e2 hover:text-io-ink absolute top-[22px] -right-3 grid size-6 cursor-pointer place-items-center border opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100"
    >
      {collapsed ? (
        <PanelLeftOpen aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
      ) : (
        <PanelLeftClose aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
      )}
    </button>
  )
  const root = cn(
    'group/sidebar bg-io-card border-io-line text-io-ink relative flex h-full min-h-full flex-col border-r',
    collapsed
      ? 'w-io-sidebar-collapsed items-center gap-1 pt-4 pb-3.5'
      : 'w-io-sidebar gap-0.5 px-3 pt-[18px] pb-3.5',
    props.className
  )
  const common = { ...props, badges, collapsed }
  return (
    <div data-part="sidebar" data-collapsed={collapsed || undefined} className={root}>
      {collapsed ? (
        <Collapsed {...common} openCommand={openCommand} />
      ) : (
        <Expanded {...common} openCommand={openCommand} />
      )}
      {toggleButton}
    </div>
  )
}

type PartProps = SidebarClientProps & { openCommand: () => void }

function Expanded(p: PartProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5 px-2 pb-3">
        <div className="flex items-center gap-2.5">
          <span data-shell-logo="" className="flex h-[30px] flex-none items-center">
            {p.logo}
          </span>
          <span className="text-io-navy text-[15px] font-semibold tracking-[-0.01em]">
            Operations
          </span>
        </div>
        <span className="text-io-ink-3 text-[11.5px] leading-[1.35]">
          Signed in as {p.user.name} · {p.user.mailbox ?? '—'}
        </span>
      </div>
      <SearchTrigger
        kbd="⌘K"
        onOpen={p.openCommand}
        className="border-io-line bg-io-paper mb-1 h-9 w-auto min-w-0 gap-2 px-2.5 text-[12.5px] [&_kbd]:h-auto [&_kbd]:min-w-0 [&_kbd]:px-[5px] [&_kbd]:py-px"
      />
      <Groups {...p} />
      <div aria-hidden="true" className="flex-1" />
      <AssistantPillMenu
        status={p.status}
        who={p.user.role}
        collapsed={false}
        onPause={p.onPause}
      />
      <ExpandedItem item={SETTINGS_ITEM} active={p.active === 'settings'} count={undefined} />
      <ProfileMenu
        user={p.user}
        collapsed={false}
        websiteAdminHref={p.websiteAdminHref}
        signOutAction={p.signOutAction}
      />
      {p.preview?.menuOpen ? <ProfileMenuFrame websiteAdmin={Boolean(p.websiteAdminHref)} /> : null}
    </>
  )
}

function Groups(p: PartProps) {
  const id = useId()
  return (
    <nav aria-label="Main" className="contents">
      {NAV_GROUPS.map((g, gi) => (
        <div
          key={g.label}
          role="group"
          aria-labelledby={p.collapsed ? undefined : `${id}-${gi}`}
          aria-label={p.collapsed ? g.label : undefined}
          className="contents"
        >
          {p.collapsed ? (
            gi > 0 ? (
              <div aria-hidden="true" className="bg-io-line my-1 h-px w-7" />
            ) : null
          ) : (
            <div id={`${id}-${gi}`} className="io-eyebrow px-2 pt-2.5 pb-1">
              {g.label}
            </div>
          )}
          {g.items.map((it) =>
            p.collapsed ? (
              <CollapsedItem
                key={it.key}
                item={it}
                active={p.active === it.key}
                count={p.badges[it.key]}
                tip={p.preview?.tip === it.key}
              />
            ) : (
              <ExpandedItem
                key={it.key}
                item={it}
                active={p.active === it.key}
                count={p.badges[it.key]}
              />
            )
          )}
        </div>
      ))}
    </nav>
  )
}

interface ItemProps {
  item: NavItem
  active: boolean
  count: number | undefined
}

function ExpandedItem({ item, active, count }: ItemProps) {
  return (
    <Link
      href={item.href as Route}
      aria-current={active ? 'page' : undefined}
      data-nav={item.key}
      className={cn(
        'io-focus rounded-io-ctl flex h-8 items-center justify-between px-[9px] text-[13px]',
        active ? 'bg-io-navy text-white' : 'text-io-ink-2 hover:bg-io-fill hover:text-io-ink'
      )}
    >
      <span className="flex items-center gap-2.5">
        <OpsIcon name={item.icon} className={active ? '' : 'text-io-ink-3'} />
        <ItemName label={item.label} count={count} visible />
      </span>
      {count ? (
        <span
          aria-hidden="true"
          className={cn(
            'rounded-io-pill grid h-[18px] min-w-5 place-items-center px-1.5 text-[11px] font-medium',
            active ? 'bg-white/18' : 'bg-io-accent-tint text-io-accent'
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  )
}

function CollapsedItem({ item, active, count, tip }: ItemProps & { tip: boolean }) {
  return (
    <Tooltip content={item.label} side="right">
      <Link
        href={item.href as Route}
        aria-current={active ? 'page' : undefined}
        data-nav={item.key}
        className={cn(
          'io-focus rounded-io-ctl relative grid h-9 w-10 place-items-center',
          active ? 'bg-io-navy text-white' : 'text-io-ink-2 hover:bg-io-fill hover:text-io-ink'
        )}
      >
        <OpsIcon name={item.icon} size={18} />
        <ItemName label={item.label} count={count} visible={false} />
        {count ? (
          <span
            aria-hidden="true"
            className="rounded-io-pill bg-io-accent absolute top-0.5 right-px grid h-[15px] min-w-[15px] place-items-center px-[3px] text-[9.5px] text-white"
          >
            {count}
          </span>
        ) : null}
        {tip ? (
          <span
            aria-hidden="true"
            data-frame="tooltip"
            className={cn(
              tooltipBubble,
              'z-io-tooltip absolute top-1/2 left-[50px] -translate-y-1/2 leading-[normal] font-normal'
            )}
          >
            {item.label}
          </span>
        ) : null}
      </Link>
    </Tooltip>
  )
}

function Collapsed(p: PartProps) {
  return (
    <>
      <span
        role="img"
        aria-label="Indus Operations"
        className="rounded-io-8 bg-io-navy mb-2 grid size-9 place-items-center text-[12px] font-semibold text-white"
      >
        IH
      </span>
      <Tooltip content="Search" side="right">
        <button
          type="button"
          onClick={p.openCommand}
          aria-label="Search"
          aria-haspopup="dialog"
          aria-keyshortcuts="Meta+K"
          className="io-focus rounded-io-ctl border-io-line text-io-ink-3 hover:bg-io-fill mb-1.5 grid h-9 w-10 cursor-pointer place-items-center border"
        >
          <SearchGlyph aria-hidden="true" strokeWidth={1.75} className="size-4" />
        </button>
      </Tooltip>
      <Groups {...p} />
      <div aria-hidden="true" className="flex-1" />
      <AssistantPillMenu status={p.status} who={p.user.role} collapsed onPause={p.onPause} />
      <CollapsedItem
        item={SETTINGS_ITEM}
        active={p.active === 'settings'}
        count={undefined}
        tip={p.preview?.tip === 'settings'}
      />
      <ProfileMenu
        user={p.user}
        collapsed
        websiteAdminHref={p.websiteAdminHref}
        signOutAction={p.signOutAction}
      />
    </>
  )
}
