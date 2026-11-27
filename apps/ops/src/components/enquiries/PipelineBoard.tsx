'use client'

import type { PipelineGroupKey } from '@indus/ops-core'
import { EmptyState } from '@indus/ops-ui/states'
import { Menu, useToast, type MenuEntry } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import {
  startTransition,
  useOptimistic,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
} from 'react'
import { moveEnquiryStageAction } from '../../app/(console)/enquiries/actions/move-stage'
import type { PipelineCardData, PipelineColumn } from '../../data/enquiries'
import { bumpLiveKeys } from '../../lib/live-keys'
import PipelineCard from './PipelineCard'

/**
 * Board 04 · the pipeline (S09-T02). Columns are C7 display groups; a drop is a request to the stage machine.
 * The card moves at once (useOptimistic) and snaps back with the machine's reason when it refuses. Won is never
 * a move: the board sends you to the quotation for the PO check. Keyboard and screen-reader users have the
 * same moves on each card's "Move to…" menu, which lists only the columns the machine allows.
 */
type Move = { cardId: string; to: PipelineGroupKey }

function applyMove(cols: PipelineColumn[], m: Move): PipelineColumn[] {
  const card = cols.flatMap((c) => c.cards).find((c) => c.id === m.cardId)
  if (!card) return cols
  return cols.map((c) =>
    c.key === m.to
      ? { ...c, count: c.count + 1, cards: [card, ...c.cards.filter((x) => x.id !== m.cardId)] }
      : c.cards.some((x) => x.id === m.cardId)
        ? { ...c, count: c.count - 1, cards: c.cards.filter((x) => x.id !== m.cardId) }
        : c
  )
}

const noop = () => () => undefined

const LABEL: Record<PipelineGroupKey, string> = {
  enquiry: 'Enquiry',
  sourcing: 'Sourcing',
  quotes_in: 'Quotes in',
  quoted: 'Quoted',
  negotiation: 'Negotiation',
  won: 'Won',
}

export default function PipelineBoard({ columns }: { columns: PipelineColumn[] }) {
  const [cols, move] = useOptimistic(columns, applyMove)
  // The card in flight: a ref, because dragover fires before a state update would have rendered.
  const draggingRef = useRef<PipelineCardData | null>(null)
  const [dragging, setDraggingState] = useState<PipelineCardData | null>(null)
  const setDragging = (c: PipelineCardData | null) => {
    draggingRef.current = c
    setDraggingState(c)
  }
  const [over, setOver] = useState<PipelineGroupKey | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  // Drag handlers exist only once hydrated; tests (and nothing else) wait for this.
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

  const accepts = (card: PipelineCardData | null, to: PipelineGroupKey) =>
    !!card && (card.moves.includes(to) || (to === 'won' && card.canWin))

  function request(card: PipelineCardData, to: PipelineGroupKey) {
    startTransition(async () => {
      if (to !== 'won') move({ cardId: card.id, to })
      const r = await moveEnquiryStageAction({
        enquiryId: card.id,
        toGroup: to,
        version: card.version,
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      if (r.data.kind === 'won') {
        toast({ kind: 'info', title: r.data.message })
        router.push(r.data.href as Route)
        return
      }
      bumpLiveKeys()
      router.refresh()
    })
  }

  function onDrop(e: DragEvent, to: PipelineGroupKey) {
    e.preventDefault()
    setOver(null)
    const card = draggingRef.current
    setDragging(null)
    if (!card) return
    const here = cols.find((c) => c.cards.some((x) => x.id === card.id))?.key
    if (here === to) return
    // A refused column still answers: the request comes back with the machine's reason and the card stays.
    request(card, to)
  }

  function menuFor(card: PipelineCardData): MenuEntry[] {
    const items: MenuEntry[] = card.moves.map((k) => ({
      type: 'item' as const,
      label: `Move to ${LABEL[k]}`,
      onSelect: () => request(card, k),
    }))
    if (card.canWin) {
      items.push({ type: 'separator' })
      items.push({
        type: 'item',
        label: 'Won · record the client PO',
        onSelect: () => request(card, 'won'),
      })
      items.push({
        type: 'item',
        label: 'Lost…',
        onSelect: () =>
          toast({ kind: 'info', title: 'Closing as lost arrives with the close flow' }),
      })
    }
    if (items.length === 0)
      items.push({ type: 'item', label: 'No move from here: open the enquiry', disabled: true })
    return items
  }

  if (cols.every((c) => c.count === 0))
    return (
      <EmptyState
        title="No enquiries yet"
        text="Enquiries created from mail, uploads or typed lines appear here by stage."
      />
    )

  return (
    <div
      data-built="pipeline-board"
      data-ready={ready ? 'true' : undefined}
      className="flex items-start gap-3"
    >
      {cols.map((c) => (
        <section
          key={c.key}
          aria-labelledby={`col-${c.key}`}
          data-column={c.key}
          data-over={over === c.key ? (accepts(dragging, c.key) ? 'ok' : 'no') : undefined}
          onDragOver={(e) => {
            const d = draggingRef.current
            if (!d) return
            // Every column takes the drop: a refused one answers with the machine's reason.
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setOver(c.key)
          }}
          onDragLeave={() => setOver((o) => (o === c.key ? null : o))}
          onDrop={(e) => onDrop(e, c.key)}
          className="rounded-io-8 data-[over=no]:bg-io-bad-tint data-[over=ok]:bg-io-accent-wash flex min-w-0 flex-1 flex-col gap-2.5"
        >
          <div className="border-io-ink flex items-baseline justify-between border-b-[1.5px] px-0.5 pb-1.5">
            <h2 id={`col-${c.key}`} className="m-0 text-[13px] font-medium">
              {c.label} <span className="text-io-ink-3 font-normal">{c.count}</span>
            </h2>
            <span className="text-io-ink-3 text-[11px]">{c.total}</span>
          </div>
          {c.cards.length === 0 ? (
            <p className="text-io-ink-3 m-0 px-0.5 text-[12px]">Nothing here</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {c.cards.map((card) => (
                <li
                  key={card.id}
                  draggable
                  data-part="pipeline-card"
                  data-ref={card.ref}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', card.ref)
                    e.dataTransfer.effectAllowed = 'move'
                    setDragging(card)
                  }}
                  onDragEnd={() => {
                    setDragging(null)
                    setOver(null)
                  }}
                  className="group bg-io-card border-io-line rounded-io-8 hover:border-io-stroke-hover relative border p-3.5"
                >
                  <PipelineCard
                    card={card}
                    menu={
                      <div className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
                        <Menu
                          align="end"
                          trigger={
                            <button
                              type="button"
                              aria-label={`Move ${card.ref} to…`}
                              className="io-focus rounded-io-tag bg-io-card border-io-line text-io-ink-3 h-6 border px-1.5 text-[12px] leading-none"
                            >
                              Move
                            </button>
                          }
                          items={menuFor(card)}
                        />
                      </div>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
