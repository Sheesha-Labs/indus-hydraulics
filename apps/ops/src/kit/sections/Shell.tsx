import { cn } from '@indus/ops-ui/lib/cn'
import { AssistantPillMenu, Sidebar, type SidebarProps } from '@indus/ops-ui/shell'
import type { AssistantStatus } from '@indus/ops-ui/types'
import type { ReactNode } from 'react'
import { kitPause, kitSignOut } from '../actions'
import { SHELL } from '../fixtures'

/** Sidebar parts landed in S02-T01; the headers and the Assistant strip follow in S02-T02. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/shell; inside the L1 mirror (section k00)
 * they are hidden so the card matches the sheet.
 */
function Row({
  name,
  code,
  note,
  full = false,
  sheet = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  /**
   * Recreate the L1 sheet's page around its mirror row. The sheet sets no line height, tracking or box
   * sizing, where the boards and the console inherit 1.45, -0.005em and border-box: inside the sheet the
   * sidebar's search is 38 high and its badges 32 wide, on the boards 36 and 20. The product follows the
   * boards; this row resets all three so its sidebars lay out as the sheet's do.
   */
  sheet?: boolean
  children: ReactNode
}) {
  return (
    <div
      data-kit-row={name}
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k00]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          sheet && 'leading-[normal] tracking-normal [&_[data-part=sidebar]_*]:box-content'
        )}
      >
        {children}
      </div>
    </div>
  )
}

type Variant = Omit<SidebarProps, 'signOutAction' | 'persist'>

const owner = (v: Partial<Variant> = {}): Variant => ({
  user: SHELL.owner,
  active: 'today',
  badges: SHELL.ownerBadges,
  assistant: 'running',
  collapsed: false,
  ...v,
})

const helper = (v: Partial<Variant> = {}): Variant => ({
  user: SHELL.helper,
  active: 'today',
  badges: SHELL.helperBadges,
  assistant: 'running',
  collapsed: false,
  websiteAdminHref: SHELL.websiteAdminHref,
  ...v,
})

/** A specimen sidebar: neutral people, no cookie writes, natural height unless the frame sets one. */
function Specimen({ className = 'h-auto', ...v }: Variant) {
  return (
    <Sidebar
      {...v}
      className={className}
      signOutAction={kitSignOut}
      onPause={kitPause}
      persist={false}
    />
  )
}

/** The L1 k00 sidebar row: the sheet's four variants in its order. */
const SHEET: Variant[] = [
  owner({ active: 'review' }),
  helper({ active: 'mail', assistant: 'paused' }),
  owner({ active: 'orders', collapsed: true, preview: { tip: 'orders' } }),
  owner({ active: 'today', assistant: 'disconnected', preview: { menuOpen: true } }),
]

/**
 * Board 74's four sidebars, each in the board's 778px frame (a short frame compresses the rows as the board
 * does). The Owner one is the design-parity crop (tests/visual-design/board-74.spec.ts).
 */
const BOARD_74: { id: string; v: Variant }[] = [
  { id: 'owner', v: owner() },
  {
    id: 'owner-menu',
    v: owner({ active: 'review', assistant: 'disconnected', preview: { menuOpen: true } }),
  },
  {
    id: 'helper-menu',
    v: helper({ active: 'enquiries', assistant: 'paused', preview: { menuOpen: true } }),
  },
  {
    id: 'collapsed',
    v: owner({ active: 'today', collapsed: true, preview: { tip: 'review' } }),
  },
]

const STATUSES: AssistantStatus[] = ['running', 'paused', 'disconnected', 'unsure', 'off']

/** Shell kit specimen, part 1 (S02-T01): the sidebar. Headers and the strip join in S02-T02. */
export default function ShellSpecimen() {
  return (
    <>
      <Row
        sheet
        name="Sidebar"
        code='part="Sidebar"'
        note="Shared + client part. active · user · assistant · collapsed · menu · tip"
      >
        {SHEET.map((v) => (
          <Specimen key={`${v.user.initials}-${v.active}`} {...v} />
        ))}
      </Row>
      <Row
        full
        name="Board 74"
        code="frame 236 × 778"
        note="Owner · Owner with the avatar menu · Helper with Website admin ↗ · collapsed"
      >
        {BOARD_74.map(({ id, v }) => (
          <div
            key={id}
            data-board-74={id}
            className={cn(
              'border-io-line flex border',
              // 778 inside the border, as the board frames it. The parity crop gets 31px more: Money's row
              // (29 once compressed, + the 2px gap) is cut out before comparing, and the extra height keeps
              // every other row compressed exactly as much as on the board.
              id === 'owner' ? 'h-[810px]' : 'h-[780px]'
            )}
          >
            <Specimen {...v} className="h-full" />
          </div>
        ))}
      </Row>
      <Row
        full
        name="Assistant pill"
        code="assistant= (worst state wins)"
        note="disconnected > paused > unsure > off > running. Opens Pause everything (Owner) and Autopilot →"
      >
        {STATUSES.map((s) => (
          <div key={s} className="flex w-[211px] flex-col">
            <AssistantPillMenu status={s} who="owner" collapsed={false} onPause={kitPause} />
          </div>
        ))}
      </Row>
    </>
  )
}
