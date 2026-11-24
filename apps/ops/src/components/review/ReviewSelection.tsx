'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { batchApproveProposalsAction } from '../../actions/proposal/decide'

/**
 * Batch selection (board 104 BatchBar): checkboxes on batchable compact rows (chasers, Sure captures) and the
 * sticky bar "5 supplier chasers selected · … · all Sure · Client price sends are never batched · Clear ·
 * Approve 5". Each item is still decided on its own on the server.
 */
interface Item {
  actionId: string
  version: number
  title: string
  family: string
}
interface Selection {
  selected: ReadonlyMap<string, Item>
  toggle: (item: Item, on: boolean) => void
  clear: () => void
}
const Ctx = createContext<Selection | null>(null)

export function useReviewSelection(): Selection | null {
  return useContext(Ctx)
}

export function ReviewSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<ReadonlyMap<string, Item>>(new Map())
  const value = useMemo<Selection>(
    () => ({
      selected,
      toggle: (item, on) =>
        setSelected((prev) => {
          const next = new Map(prev)
          if (on) next.set(item.actionId, item)
          else next.delete(item.actionId)
          return next
        }),
      clear: () => setSelected(new Map()),
    }),
    [selected]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function BatchCheckbox({ item }: { item: Item }) {
  const sel = useReviewSelection()
  if (!sel) return null
  return (
    <input
      type="checkbox"
      aria-label={`Select ${item.title}`}
      checked={sel.selected.has(item.actionId)}
      onChange={(e) => sel.toggle(item, e.target.checked)}
      className="io-focus accent-io-accent size-4 flex-none"
    />
  )
}

export function BatchBar() {
  const sel = useReviewSelection()
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  if (!sel || sel.selected.size === 0) return null
  const items = [...sel.selected.values()]
  const n = items.length
  async function approveAll() {
    setBusy(true)
    try {
      const r = await batchApproveProposalsAction({
        items: items.map((i) => ({ actionId: i.actionId, version: i.version })),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      const failed = r.data.results.filter((x) => !x.ok).length
      toast({
        kind: failed ? 'error' : 'success',
        title: failed
          ? `${r.data.approved} approved · ${failed} not`
          : `${r.data.approved} approved`,
      })
      sel?.clear()
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div
      role="region"
      aria-label="Batch approve"
      className="bg-io-navy rounded-io-card shadow-io-e3 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3 text-[13px] text-white"
    >
      <span className="font-medium">
        {n} {n === 1 ? 'card' : 'cards'} selected
      </span>
      <span className="truncate opacity-80">{items.map((i) => i.title).join(' · ')}</span>
      <span className="opacity-80">Client price sends are never batched</span>
      <span className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => sel.clear()}>
          Clear
        </Button>
        <Button variant="primary" size="sm" busy={busy} onClick={() => void approveAll()}>
          Approve {n}
        </Button>
      </span>
    </div>
  )
}

/** Board 110 "40+ waiting": "Approve 12" for a family whose cards are all batchable and Sure. */
export function ApproveFamily({ items, primary }: { items: readonly Item[]; primary: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  async function approveAll() {
    setBusy(true)
    try {
      const r = await batchApproveProposalsAction({
        items: items.map((i) => ({ actionId: i.actionId, version: i.version })),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      const failed = r.data.results.filter((x) => !x.ok).length
      toast({
        kind: failed ? 'error' : 'success',
        title: failed
          ? `${r.data.approved} approved · ${failed} not`
          : `${r.data.approved} approved`,
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button
      variant={primary ? 'primary' : 'secondary'}
      size="sm"
      busy={busy}
      onClick={() => void approveAll()}
    >
      Approve {items.length}
    </Button>
  )
}
