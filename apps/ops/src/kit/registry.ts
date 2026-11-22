import type { ComponentType } from 'react'
import AssistantSpecimen, { status as assistantStatus } from './sections/Assistant'
import CardSpecimen, { status as cardStatus } from './sections/Card'
import ChartSpecimen, { status as chartStatus } from './sections/Chart'
import ControlsSpecimen, { status as controlsStatus } from './sections/Controls'
import DocumentSpecimen, { status as documentStatus } from './sections/Document'
import FormSpecimen, { status as formStatus } from './sections/Form'
import ShellSpecimen, { status as shellStatus } from './sections/Shell'
import MailSpecimen, { status as mailStatus } from './sections/Mail'
import OverlaySpecimen, { status as overlayStatus } from './sections/Overlay'
import StatesSpecimen, { status as statesStatus } from './sections/States'
import StatusSpecimen, { status as statusStatus } from './sections/Status'
import TableSpecimen, { status as tableStatus } from './sections/Table'
import TimelineSpecimen, { status as timelineStatus } from './sections/Timeline'

export interface KitEntry {
  /** L1 Component Sheet section id. */
  id: string
  /** URL segment: /_kit/<slug>. */
  slug: string
  crumb: string
  title: string
  text: string
  task: string
  status: 'built' | 'pending'
  Specimen: ComponentType
}

/** The 13 kits in L1 sheet order: k00 Shell (S02) then the 12 built in S01. Heads are the L1 sheet's own. */
export const KITS: readonly KitEntry[] = [
  {
    id: 'k00',
    slug: 'shell',
    crumb: 'K-00 · Shell Kit',
    title: 'Shell',
    text: 'Sidebar, page headers, record header, Assistant strip and the board frame.',
    task: 'S02-T01',
    status: shellStatus,
    Specimen: ShellSpecimen,
  },
  {
    id: 'k01',
    slug: 'controls',
    crumb: 'K-01 · Controls Kit',
    title: 'Controls',
    text: 'Buttons, segmented controls, tabs, toggles, checkboxes, radios, selects, filter chips, keys and search. Controls are 6px radius; filter chips and status are pills.',
    task: 'S01-T03',
    status: controlsStatus,
    Specimen: ControlsSpecimen,
  },
  {
    id: 'k02',
    slug: 'status',
    crumb: 'K-02 · Status Kit',
    title: 'Status',
    text: 'One vocabulary for every state word. Pass status= and the chip picks its tone, so the same word is the same colour on every board.',
    task: 'S01-T04',
    status: statusStatus,
    Specimen: StatusSpecimen,
  },
  {
    id: 'k03',
    slug: 'table',
    crumb: 'K-03 · Table Kit',
    title: 'Tables',
    text: 'One grammar for every list: 10.5px uppercase heads, 12.5px cells, tabular numerals right-aligned, refs in accent, status as chips.',
    task: 'S01-T05',
    status: tableStatus,
    Specimen: TableSpecimen,
  },
  {
    id: 'k04',
    slug: 'card',
    crumb: 'K-04 · Card Kit',
    title: 'Cards and records',
    text: 'Cards hold everything outside a table: an eyebrow, an optional link, rows with a check mark, key–value pairs and stat boxes.',
    task: 'S01-T05',
    status: cardStatus,
    Specimen: CardSpecimen,
  },
  {
    id: 'k05',
    slug: 'assistant',
    crumb: 'K-05 · Assistant Kit',
    title: 'Assistant',
    text: 'Every Assistant suggestion uses one card: type, record, autonomy level, headline, why with evidence links, preview, checks, confidence, consequence, actions. Human-only verbs stay on the buttons.',
    task: 'S01-T09b',
    status: assistantStatus,
    Specimen: AssistantSpecimen,
  },
  {
    id: 'k06',
    slug: 'mail',
    crumb: 'K-06 · Mail Kit',
    title: 'Mail',
    text: 'Gmail stays the truth. Threads show sender role, type and linked record, plus one line from the Assistant. Outbound mail goes from sales@ to clients and purchase@ to suppliers.',
    task: 'S01-T09a',
    status: mailStatus,
    Specimen: MailSpecimen,
  },
  {
    id: 'k07',
    slug: 'document',
    crumb: 'K-07 · Document Kit',
    title: 'Documents',
    text: 'The A4 letterhead for everything Indus issues: quotation, RFQ, PO, proforma, tax invoice, delivery note. Scale m (476 wide) or w (440) on boards, thumb in lists.',
    task: 'S01-T09c',
    status: documentStatus,
    Specimen: DocumentSpecimen,
  },
  {
    id: 'k08',
    slug: 'timeline',
    crumb: 'K-08 · Timeline Kit',
    title: 'Timeline, plan and change',
    text: 'History, activity, the supplier Gantt, before/after diffs and wizard steps.',
    task: 'S01-T08',
    status: timelineStatus,
    Specimen: TimelineSpecimen,
  },
  {
    id: 'k09',
    slug: 'form',
    crumb: 'K-09 · Form Kit',
    title: 'Forms',
    text: 'Fields are 36px with a 12px label above and an 11.5px hint below. Values the Assistant filled carry its tag until you touch them.',
    task: 'S01-T06',
    status: formStatus,
    Specimen: FormSpecimen,
  },
  {
    id: 'k10',
    slug: 'overlay',
    crumb: 'K-10 · Overlay Kit',
    title: 'Overlays',
    text: 'Modals 14px radius on a scrim; drawers from the right at 420–480; toasts navy, bottom-left; menus and popovers 10px radius.',
    task: 'S01-T07',
    status: overlayStatus,
    Specimen: OverlaySpecimen,
  },
  {
    id: 'k11',
    slug: 'states',
    crumb: 'K-11 · States Kit',
    title: 'Empty, loading and error',
    text: 'Every list has an empty state that says what fills it and how; loading is a skeleton of the real layout; errors say what was kept.',
    task: 'S01-T06',
    status: statesStatus,
    Specimen: StatesSpecimen,
  },
  {
    id: 'k12',
    slug: 'chart',
    crumb: 'K-12 · Chart Kit',
    title: 'Charts and money',
    text: 'Bars, stacked outcome, trend and heatmap in the accent family; money always carries its currency code, and non-AED amounts can show the AED equivalent at the rate used.',
    task: 'S01-T08',
    status: chartStatus,
    Specimen: ChartSpecimen,
  },
]

export function kitBySlug(slug: string): KitEntry | undefined {
  return KITS.find((k) => k.slug === slug)
}
