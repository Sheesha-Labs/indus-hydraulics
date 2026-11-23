import type { ReactNode } from 'react'
import type { AssistantStatus } from '../types'
import { worstAssistantStatus, type NavKey } from './nav'
import SidebarClient, { type SidebarPreview, type SidebarUser } from './SidebarClient'

export interface SidebarProps {
  user: SidebarUser
  /** From `activeKeyFromSegment`; null highlights nothing (tasks, call-backs, search). */
  active: NavKey | null
  /**
   * Counts rendered on the server (Owner: Today/Review/Mail; Helper: Today/Mail). Live values from
   * `ShellLiveProvider` (apps/ops `useLiveKeys`, ADR-19) replace them after hydration.
   */
  badges?: Partial<Record<NavKey, number>>
  /** One status, or every current one (mailboxes and the Assistant): the pill shows the worst (C23). */
  assistant: AssistantStatus | readonly AssistantStatus[]
  /** S04-T09: words naming the mailbox behind the worst state ("purchase@ behind"); the status word otherwise. */
  assistantLabel?: string
  /** From the `ops_sidebar` cookie (`isSidebarCollapsed`), so SSR renders the right width. */
  collapsed: boolean
  /** Helper only (ADR-05): "Website admin ↗" in the avatar menu. Ignored for the Owner. */
  websiteAdminHref?: string
  /** The sign-out server action; Sign out posts a form to it. */
  signOutAction: (formData: FormData) => void | Promise<void>
  /** Owner only: "Pause everything" in the pill menu (wired in S05). A server action or a client callback. */
  onPause?: () => void | Promise<void>
  /** Opens the command bar; otherwise the `ShellLiveProvider`'s `openCommand` is used. Client parents only. */
  onOpenCommand?: () => void
  /**
   * The Indus logo, 30 high (the company logo from Storage). Nothing from the handoff is copied, so the
   * default is a neutral wordmark placeholder of the same footprint.
   */
  logo?: ReactNode
  /** Write the collapsed state to the cookie on toggle. Default true; specimens pass false. */
  persist?: boolean
  /** Specimen stills only (L1 k00, board 74). */
  preview?: SidebarPreview
  /** Sizing from the frame, e.g. `h-auto` in a specimen row. */
  className?: string
}

/**
 * Shell kit `Sidebar` (board 74, 05 §3.13): identity, search, the five groups (Money in Work, C10), the
 * Assistant pill, Settings and the avatar menu; 236 wide or 64 collapsed. Shared: it resolves the pill's
 * worst state and the Helper-only link, then hands one serialisable prop set to the client part.
 */
export default function Sidebar({
  user,
  active,
  badges = {},
  assistant,
  assistantLabel,
  collapsed,
  websiteAdminHref,
  signOutAction,
  onPause,
  onOpenCommand,
  logo,
  persist = true,
  preview,
  className,
}: SidebarProps) {
  return (
    <SidebarClient
      user={user}
      active={active}
      badges={badges}
      status={worstAssistantStatus(assistant)}
      statusLabel={assistantLabel}
      collapsed={collapsed}
      websiteAdminHref={user.role === 'helper' ? websiteAdminHref : undefined}
      signOutAction={signOutAction}
      onPause={user.role === 'owner' ? onPause : undefined}
      onOpenCommand={onOpenCommand}
      logo={logo ?? <LogoPlaceholder />}
      persist={persist}
      preview={preview}
      className={className}
    />
  )
}

/** A neutral stand-in for the company logo: the name set in the accent, in the logo's 72 × 30 footprint. */
export function LogoPlaceholder() {
  return (
    <span
      role="img"
      aria-label="Indus Hydraulics"
      className="text-io-accent flex h-[30px] w-[72px] items-center text-[22px] font-semibold tracking-[-0.04em]"
    >
      indus
    </span>
  )
}
