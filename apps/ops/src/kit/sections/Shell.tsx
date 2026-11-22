import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { AssistantPillMenu, PageHeader, Sidebar, type SidebarProps } from '@indus/ops-ui/shell'
import type { AssistantStatus } from '@indus/ops-ui/types'
import type { ReactNode } from 'react'
import { kitPause, kitSignOut } from '../actions'
import { HEADERS, SHELL } from '../fixtures'
import {
  BannerStrip,
  Board75,
  PageHeaderVariants,
  RecordKinds,
  SheetAssistantStrip,
  SheetPageHeaders,
  SheetRecordHeaders,
  SheetTodayHeader,
  TemplateHeaders,
} from './ShellHeaders'

/** The sidebar (S02-T01) and the headers, the Assistant strip and the banner strip (S02-T02). */
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
  column = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  /** The sheet's `.cv-cl`: a column of specimens at their own width (headers) instead of a wrapping row. */
  column?: boolean
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
          column ? 'flex flex-col items-start gap-3' : 'flex flex-wrap items-center gap-3',
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

/**
 * The L1 sheet mounts RecordHeader.dc outside its `.k` wrapper: its text sets at line height and tracking
 * `normal` (board 75 sets them at the console's 1.45 and -0.005em), and three of its boxes are content-box
 * there: the bordered "Log activity" button (38 high, where the boards draw 36), the stage track's hollow
 * dots (9, where the Status kit draws 7) and the strip under it (40 + its rule). The product follows board
 * 75; this class recreates the sheet's page around the k00 mirror only, as the sidebar row's `sheet` mode
 * does.
 */
const SHEET_RECORD =
  '[&_[data-part=record-header]]:leading-[normal] [&_[data-part=record-header]]:tracking-normal [&_[data-part=record-header]_[data-variant=secondary]]:box-content [&_[data-part=stage-track]_[aria-hidden]]:box-content [&_[data-part=assistant-strip]]:box-content [&_[data-part=assistant-strip]]:w-auto [&_[data-part=assistant-strip]]:leading-[normal] [&_[data-part=assistant-strip]]:tracking-normal'

/** Shell kit `Region`: a dashed, hatched placeholder inside a board frame (canvas furniture). */
function Region({ name, note, className }: { name: string; note: string; className?: string }) {
  return (
    <div
      className={cn(
        'border-io-accent-line rounded-io-card text-io-accent grid min-w-0 flex-1 place-items-center border-[1.5px] border-dashed bg-[repeating-linear-gradient(135deg,var(--io-accent-faint)_0_8px,var(--io-card)_8px_16px)] p-3 text-center text-[12.5px] leading-[1.5]',
        className
      )}
    >
      <span>
        <b className="block text-[13px] font-medium">{name}</b> {note}
      </span>
    </div>
  )
}

/**
 * The sheet's board frame (Shell kit `Frame`, canvas furniture; AppShell is the product's frame): the
 * sidebar, a PageHeader and two regions, 1100 × 560.
 */
function BoardFrame() {
  return (
    <div className="rounded-io-8 border-io-sheet-line bg-io-paper shadow-io-e1 flex h-[560px] w-[1100px] overflow-hidden border">
      <Specimen {...owner({ active: 'enquiries' })} className="h-full" />
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader
          crumb="Work"
          title="Enquiries"
          actions={
            <ButtonLink variant="primary" href="/_kit/shell?new=enquiry">
              New enquiry
            </ButtonLink>
          }
          filters={
            <Choices
              aria-label="Enquiry filter"
              options={[...HEADERS.enquiryFilters]}
              value="open"
              hrefFor={(v) => `/_kit/shell?frame=${v}`}
            />
          }
        />
        <div className="flex min-h-0 flex-1 gap-4 px-7 py-4">
          <Region name="Table" note="rows of enquiries" />
          <Region name="Preview" note="selected enquiry" className="w-io-preview flex-none" />
        </div>
      </div>
    </div>
  )
}

/** Shell kit specimen: the L1 k00 rows in the sheet's order, then rows that exist only on /_kit/shell. */
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
              // 778 inside the border, as the board frames it. The parity crop gets 33px more (31 before the
              // 28px group labels of S02-T09): Money's row, compressed, plus the 2px gap, is cut out before
              // comparing, and the extra height keeps every other row compressed as much as on the board.
              id === 'owner' ? 'h-[811px]' : 'h-[780px]'
            )}
          >
            <Specimen {...v} className="h-full" />
          </div>
        ))}
      </Row>
      <Row
        column
        name="Page header"
        code='part="PageHeader"'
        note="Index pages. crumb · title · actions (prefix * for primary) · filters · summary · search"
      >
        <SheetPageHeaders />
      </Row>
      <Row
        full
        column
        name="Page header slots"
        code="steps · meta · tag · chip · segmented · tabs"
        note="Steps pills done accent / current navy / todo line. At most one primary action."
      >
        <PageHeaderVariants />
      </Row>
      <Row
        column
        name="Today header"
        code='part="TodayHeader"'
        note="Serif greeting, Assistant pill, bell count"
      >
        <SheetTodayHeader />
      </Row>
      <Row
        column
        name="Record header"
        code='part="RecordHeader"'
        note="Wraps RecordHeader. kind enquiry | order"
      >
        <div className={cn('flex flex-col items-start gap-3', SHEET_RECORD)}>
          <SheetRecordHeaders />
        </div>
      </Row>
      <Row
        full
        column
        name="Record kinds"
        code="kind enquiry | order | tender"
        note="Enquiry 11 tabs (C8) · order 9 tabs · tender sections first, then the enquiry tabs (C9)"
      >
        <RecordKinds />
      </Row>
      <Row
        full
        column
        name="Board 75"
        code="card 1046 wide"
        note="Enquiry on Overview, order on Freight, each with its Assistant strip"
      >
        <Board75 />
      </Row>
      <Row
        full
        column
        name="T2A · T2B header"
        code="main column 1202"
        note="The record cockpit header as the T2 templates frame it"
      >
        <TemplateHeaders />
      </Row>
      <Row
        column
        name="Assistant strip"
        code='part="AssistantStrip"'
        note="One line under any header: what it did, what needs you"
      >
        <SheetAssistantStrip />
      </Row>
      <Row
        full
        column
        name="Banner strip"
        code='BannerSlot placement="strip"'
        note="Under the header: one banner, most severe first, the rest behind +n more (C23)"
      >
        <BannerStrip className="w-[1100px]" />
      </Row>
      <Row
        name="Board frame"
        code='part="Frame"'
        note="1440 × 940 board. header page | record | today | none, regions name@width · note"
      >
        <BoardFrame />
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
