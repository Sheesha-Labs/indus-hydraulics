import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { EMPTY_LISTS, EmptyState, InlineState, TableSkeleton } from '@indus/ops-ui/states'
import type { ReactNode } from 'react'
import { ErrorDemo, OfflineDemo } from './StatesDemos'

/** Set to 'built' when S01-T06 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/states; inside the L1 mirror (k11) they are
 * hidden so the card keeps the sheet's height.
 */
function Row({
  name,
  code,
  note,
  full = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k11]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/** A fixed-width cell of a spec row (the sheet's `width:340px; flex column; gap 10`). */
function Cell({ w, children }: { w: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-2.5', w)}>{children}</div>
}

const SHOWN_IN_MIRROR = ['enquiries', 'review', 'suppliers'] as const
const OTHER_LISTS = EMPTY_LISTS.filter((l) => !(SHOWN_IN_MIRROR as readonly string[]).includes(l))

/** The kit's link-style inline action ("Retry now"), allowed to wrap like the sheet's span. */
function RetryNow() {
  return (
    <Button variant="link" size="sm" className="text-left whitespace-normal">
      Retry now
    </Button>
  )
}

/**
 * States kit specimen: the L1 k11 mirror (three empty presets; loading, error, offline and inline states),
 * then the seven other presets, centre and bare layouts and the empty inline state (/_kit/states only).
 */
export default function StatesSpecimen() {
  return (
    <>
      {/* ---- L1 k11 mirror ---- */}
      <Row
        name="Empty"
        code={'part="Empty" list'}
        note="enquiries · quotations · orders · suppliers · clients · parts · review · mail · reports · log"
      >
        {SHOWN_IN_MIRROR.map((list) => (
          <Cell key={list} w="w-[340px]">
            <EmptyState list={list} headingLevel={3} />
          </Cell>
        ))}
      </Row>

      <Row name="Loading · Error · Offline" code={'part="Loading|Error|Offline|Inline"'} note="">
        <Cell w="w-[520px]">
          <TableSkeleton rows={4} label="Reading 3 attachments…" />
        </Cell>
        <Cell w="w-[300px]">
          <ErrorDemo />
        </Cell>
        <Cell w="w-[300px]">
          <OfflineDemo />
        </Cell>
        <Cell w="w-[260px]">
          <InlineState kind="loading" text="Loading lines…" />
          <InlineState
            kind="error"
            text="Couldn’t save. Retrying in 2 minutes."
            action={<RetryNow />}
          />
          <InlineState kind="saved" text="Saved 10:41" />
        </Cell>
      </Row>

      {/* ---- /_kit/states only ---- */}
      <Row
        name="Empty · other lists"
        code="list"
        note="quotations · orders · clients · parts · mail · reports · log"
        full
      >
        {OTHER_LISTS.map((list) => (
          <Cell key={list} w="w-[340px]">
            <EmptyState list={list} headingLevel={3} />
          </Cell>
        ))}
      </Row>

      <Row
        name="Layouts"
        code="align · bare"
        note="centre in an empty page; bare inside a card"
        full
      >
        <Cell w="w-[420px]">
          <EmptyState list="mail" align="center" headingLevel={3} />
        </Cell>
        <Cell w="w-[340px]">
          <OfflineDemo align="center" />
        </Cell>
        <Cell w="w-[340px]">
          <ErrorDemo bare />
        </Cell>
      </Row>

      <Row name="Inline · empty" code={'kind="empty"'} note="Loading skeleton without a label" full>
        <Cell w="w-[260px]">
          <InlineState kind="empty" text="No supplier quotes on this line yet." />
        </Cell>
        <Cell w="w-[520px]">
          <TableSkeleton rows={3} cols={4} />
        </Cell>
      </Row>
    </>
  )
}
