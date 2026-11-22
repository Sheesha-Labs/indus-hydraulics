'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Person from '../card/Person'
import { cn } from '../lib/cn'
import { LAYER, menuPanel } from '../overlay/styles'
import { DEVICES_HREF, PROFILE_HREF } from './nav'

export interface ProfileMenuUser {
  name: string
  initials: string
  /** "Owner" | "Helper · sourcing". */
  roleLabel: string
}

export interface ProfileMenuProps {
  user: ProfileMenuUser
  collapsed: boolean
  /** Helper only (ADR-05): "Website admin ↗", opened in a new tab. Leave undefined for the Owner. */
  websiteAdminHref?: string | undefined
  /** The sign-out server action: Sign out is a form that posts to it. */
  signOutAction: (formData: FormData) => void | Promise<void>
  className?: string
}

/**
 * The avatar row's menu (S05, board 74): Profile, Devices, Website admin ↗ (Helper only), Sign out (danger).
 * Radix DropdownMenu: arrows move and wrap, Escape closes and returns focus to the avatar button. Expanded it
 * opens upwards over the foot, as wide as the row; collapsed it opens to the right of the avatar.
 */
export default function ProfileMenu({
  user,
  collapsed,
  websiteAdminHref,
  signOutAction,
  className,
}: ProfileMenuProps) {
  const name = `${user.name}, ${user.roleLabel}: account menu`
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {collapsed ? (
          <button
            type="button"
            aria-label={name}
            data-part="profile-trigger"
            className={cn(
              'io-focus rounded-io-pill mt-1.5 grid cursor-pointer place-items-center',
              className
            )}
          >
            <Person initials={user.initials} label={user.name} who="owner" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={name}
            data-part="profile-trigger"
            className={cn(
              'io-focus border-io-line mt-1.5 flex cursor-pointer items-center justify-between gap-2.5 self-stretch border-t px-2 pt-2.5 text-left',
              className
            )}
          >
            <Person
              initials={user.initials}
              name={user.name}
              sub={user.roleLabel}
              who="owner"
              className="min-w-0 flex-1"
            />
            <span aria-hidden="true" className="text-io-ink-3 text-[11px]">
              ▾
            </span>
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'start'}
          sideOffset={collapsed ? 10 : 2}
          loop
          className={cn(PROFILE_PANEL, 'w-[211px]', LAYER.float)}
        >
          <DropdownMenu.Item asChild className={PROFILE_ITEM}>
            <Link href={PROFILE_HREF as Route}>Profile</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={PROFILE_ITEM}>
            <Link href={DEVICES_HREF as Route}>Devices</Link>
          </DropdownMenu.Item>
          {websiteAdminHref ? (
            <>
              <DropdownMenu.Separator className={PROFILE_SEPARATOR} />
              <DropdownMenu.Item asChild className={PROFILE_ITEM}>
                <a href={websiteAdminHref} target="_blank" rel="noopener noreferrer">
                  <WebsiteAdminLabel />
                </a>
              </DropdownMenu.Item>
            </>
          ) : null}
          <DropdownMenu.Separator className={PROFILE_SEPARATOR} />
          <form action={signOutAction} className="contents">
            <DropdownMenu.Item asChild className={cn(PROFILE_ITEM, 'text-io-bad')}>
              <button type="submit" className="w-full text-left">
                Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/** OpsSidebar's menu: the Overlay kit panel (radius 10, e3, padding 6) with 9×10 rows and line rules. */
const PROFILE_PANEL = cn(menuPanel(), 'w-auto')
const PROFILE_ITEM =
  'rounded-io-ctl flex cursor-pointer items-center justify-between gap-2.5 px-2.5 py-[9px] outline-none select-none data-[highlighted]:bg-io-fill'
const PROFILE_SEPARATOR = 'bg-io-line mt-0.5 h-px'

function WebsiteAdminLabel() {
  return (
    <>
      <span>
        Website admin<span className="sr-only"> (opens in a new tab)</span>
      </span>
      <span aria-hidden="true" className="text-io-ink-3">
        ↗
      </span>
    </>
  )
}

/**
 * The menu drawn open, still, where the live one opens (specimens and board 74 only: a Radix menu renders
 * in a portal after hydration, so it cannot be screenshotted in place).
 */
export function ProfileMenuFrame({ websiteAdmin }: { websiteAdmin: boolean }) {
  const rows: ReactNode[] = [
    <span key="p" className={PROFILE_ITEM}>
      Profile
    </span>,
    <span key="d" className={PROFILE_ITEM}>
      Devices
    </span>,
  ]
  if (websiteAdmin)
    rows.push(
      <span key="ws" className={PROFILE_SEPARATOR} />,
      <span key="w" className={PROFILE_ITEM}>
        <WebsiteAdminLabel />
      </span>
    )
  rows.push(
    <span key="ss" className={PROFILE_SEPARATOR} />,
    <span key="s" className={cn(PROFILE_ITEM, 'text-io-bad')}>
      Sign out
    </span>
  )
  return (
    <div
      data-frame="profile-menu"
      aria-hidden="true"
      className={cn(PROFILE_PANEL, 'absolute inset-x-3 bottom-[58px] cursor-default')}
    >
      {rows}
    </div>
  )
}
