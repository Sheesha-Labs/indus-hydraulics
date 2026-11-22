'use client'

import { parseReferences, REFERENCE_KIND_LABEL } from '@indus/ops-core'
import { Kbd } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { LAYER, SCRIM, useToast } from '@indus/ops-ui/overlay'
import * as Dialog from '@radix-ui/react-dialog'
import { Search as SearchGlyph } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { searchCommand, type CommandSearch } from '../../actions/read/shell-panels'
import type { OpsRole } from '../../lib/access-core'
import {
  commandActions,
  looksLikeQuestion,
  referenceHref,
  type CommandEffect,
} from '../../lib/command-actions'
import type { ShellPanel } from '../../lib/shell-hotkeys'
import { useShell } from './Providers'
import { focusBack, useReturnFocus } from './use-return-focus'

export interface CommandBarProps {
  role: OpsRole
  /** Owner only: pause everything (S05 wires the action). Without it the row explains itself. */
  onPause?: () => void
}

/** How long typing settles before the search read runs (05 §7.6). */
export const SEARCH_DEBOUNCE_MS = 120

interface Row {
  id: string
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
  href?: string
  run?: () => void
  disabled?: boolean
}

interface Group {
  key: string
  label: string
  rows: Row[]
}

/**
 * S01 · Command bar (board 208, 05 §7.6): a Radix Dialog (scrim, focus trapped, Escape closes the top-most
 * layer, focus returns to whatever opened it) with an ARIA combobox. The input owns focus; one active row
 * moves across every group with ↑↓; ↵ opens it, ⌘↵ opens it in a new tab; typing resets to the first row.
 *
 * Sources, in order: Recognised reference (parseReference, instant) · Records, Emails, Attachments, Parts
 * (the searchCommand read, debounced, stale answers dropped by sequence id; empty until S31) · Actions (the
 * role-filtered registry) · Ask the Assistant (disabled until S31).
 */
export default function CommandBar({ role, onPause }: CommandBarProps) {
  const shell = useShell()
  const open = shell.panels.command
  const opener = useReturnFocus(open)
  const after = useRef<(() => void) | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const close = () => shell.close('command')
  const effect = (fx: CommandEffect, newTab: boolean) => {
    if (fx.type === 'go') {
      if (newTab) window.open(fx.href, '_blank', 'noopener')
      else router.push(fx.href as Route)
    } else if (fx.type === 'panel') {
      shell.open(fx.panel satisfies ShellPanel)
    } else if (onPause) {
      onPause()
    } else {
      toast({ kind: 'info', title: 'Pausing is switched on with Autopilot.' })
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? shell.open('command') : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn('fixed inset-0', SCRIM, LAYER.float)} />
        <Dialog.Content
          aria-modal="true"
          data-part="command-bar"
          className={cn(
            'bg-io-card border-io-line rounded-io-dialog shadow-io-e4 text-io-ink fixed top-[70px] flex w-[680px] max-w-[calc(100vw_-_32px)] -translate-x-1/2 flex-col overflow-hidden border outline-none',
            // Centred over the page column, not the viewport: the sidebar keeps its width on the left.
            'left-[calc(50%_+_var(--io-sidebar)/2)] in-[body:has([data-part=sidebar][data-collapsed])]:left-[calc(50%_+_var(--io-sidebar-collapsed)/2)]',
            'data-[state=open]:animate-[io-fade_120ms_ease-out]',
            LAYER.float
          )}
          onCloseAutoFocus={(e) => {
            // Without a Radix trigger, focus would go nowhere: send it back to the opener first, then run
            // what was chosen (a panel it opens remembers that opener as its own).
            e.preventDefault()
            focusBack(opener.current)
            const run = after.current
            after.current = null
            run?.()
          }}
        >
          <Dialog.Title className="sr-only">Command bar</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search records, mail and attachments by any reference, or run an action.
          </Dialog.Description>
          <CommandBody
            role={role}
            onChoose={(fx, newTab) => {
              after.current = () => effect(fx, newTab)
              close()
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Mounted per opening (Radix unmounts closed content), so the query and active row start clean. */
function CommandBody({
  role,
  onChoose,
}: {
  role: OpsRole
  onChoose: (fx: CommandEffect, newTab: boolean) => void
}) {
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [search, setSearch] = useState<CommandSearch['groups']>([])
  const seq = useRef(0)

  // The search read: debounced, and an answer for an older query is dropped.
  useEffect(() => {
    const q = query.trim()
    const mine = ++seq.current
    if (!q) {
      setSearch([])
      return
    }
    const timer = setTimeout(() => {
      void searchCommand(q, mine).then((r) => {
        if (r.success && r.data.seq === seq.current) setSearch(r.data.groups)
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const groups = useMemo<Group[]>(() => {
    const q = query.trim()
    const out: Group[] = []
    const go = (href: string): CommandEffect => ({ type: 'go', href })
    const question = q !== '' && looksLikeQuestion(q)
    const ask: Group = {
      key: 'ask',
      label: 'Ask the Assistant',
      rows: [
        {
          id: 'ask',
          title: (
            <>
              Ask the Assistant: <b className="font-medium">“{q}”</b>
            </>
          ),
          sub: 'Arrives with search',
          disabled: true,
        },
      ],
    }
    if (question) out.push(ask)

    const refs = question ? [] : parseReferences(q)
    if (refs.length > 0)
      out.push({
        key: 'reference',
        label: 'Recognised reference',
        rows: refs.map((r, i) => ({
          id: `ref-${i}`,
          title: <b className="font-medium">{r.canonical}</b>,
          sub:
            r.match === 'ambiguous'
              ? `${REFERENCE_KIND_LABEL[r.kind]} · could also be a part number`
              : r.match === 'search'
                ? `${REFERENCE_KIND_LABEL[r.kind]} · found by search`
                : REFERENCE_KIND_LABEL[r.kind],
          href: referenceHref(r),
          run: () => undefined,
        })),
      })

    for (const g of search)
      if (g.hits.length > 0)
        out.push({
          key: g.key,
          label: g.label,
          rows: g.hits.map((h) => ({
            id: `${g.key}-${h.id}`,
            title: h.title,
            ...(h.sub ? { sub: h.sub } : {}),
            href: h.href,
          })),
        })

    const actions = commandActions(role, q)
    if (actions.length > 0)
      out.push({
        key: 'actions',
        label: 'Actions',
        rows: actions.map((a) => ({
          id: `action-${a.id}`,
          title: a.label,
          right: a.keys ? <Kbd keys={a.keys} /> : null,
          ...(a.effect.type === 'go' ? { href: a.effect.href } : {}),
          run: () => onChoose(a.effect, false),
        })),
      })

    if (q !== '' && !question) out.push(ask)
    // Rows with an href open through `go`, so ⌘↵ can take them to a new tab.
    for (const g of out)
      for (const r of g.rows)
        if (r.href && !r.disabled) {
          const href = r.href
          r.run = () => onChoose(go(href), false)
        }
    return out
  }, [query, search, role, onChoose])

  const rows = groups.flatMap((g) => g.rows)
  const enabled = rows.map((r, i) => (r.disabled ? -1 : i)).filter((i) => i >= 0)
  const activeIndex = enabled.includes(active) ? active : (enabled[0] ?? -1)
  const activeRow = activeIndex >= 0 ? rows[activeIndex] : undefined
  const optionId = (rowId: string) => `${id}-${rowId}`

  useLayoutEffect(() => {
    if (!activeRow) return
    document.getElementById(optionId(activeRow.id))?.scrollIntoView({ block: 'nearest' })
  })

  const runRow = (row: Row | undefined, newTab: boolean) => {
    if (!row || row.disabled) return
    if (newTab && row.href) onChoose({ type: 'go', href: row.href }, true)
    else row.run?.()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (enabled.length === 0) return
      const at = enabled.indexOf(activeIndex)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(enabled[(at + step + enabled.length) % enabled.length]!)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runRow(activeRow, e.metaKey || e.ctrlKey)
    }
  }

  const question = looksLikeQuestion(query)
  const empty = query.trim() !== '' && enabled.length === 0

  return (
    <>
      <div className="border-io-line flex h-14 items-center gap-2.5 border-b px-[18px] text-[16px]">
        <SearchGlyph aria-hidden="true" strokeWidth={1.75} className="text-io-ink-3 size-4 flex-none" />
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search or run a command"
          {...(activeRow ? { 'aria-activedescendant': optionId(activeRow.id) } : {})}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search by any reference, or type a command"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="placeholder:text-io-ink-3 min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <Kbd keys="esc" />
      </div>
      <div
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[min(600px,calc(100vh_-_220px))] overflow-y-auto pb-1.5 [scrollbar-width:thin]"
      >
        {groups.map((g) => (
          <div key={g.key} role="group" aria-labelledby={`${id}-g-${g.key}`}>
            <div id={`${id}-g-${g.key}`} className="io-eyebrow px-[18px] pt-2.5 pb-1">
              {g.label}
            </div>
            {g.rows.map((r) => {
              const i = rows.indexOf(r)
              const on = i === activeIndex
              return (
                // The combobox owns focus and keys; a row reacts to the pointer only.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  key={r.id}
                  id={optionId(r.id)}
                  role="option"
                  aria-selected={on}
                  {...(r.disabled ? { 'aria-disabled': true } : {})}
                  data-active={on || undefined}
                  onMouseMove={() => {
                    if (!r.disabled && !on) setActive(i)
                  }}
                  onClick={(e) => runRow(r, e.metaKey || e.ctrlKey)}
                  className={cn(
                    'group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 px-[18px] py-2 text-[13.5px] leading-[1.45]',
                    'data-[active]:bg-io-accent-wash data-[active]:shadow-[inset_2px_0_0_var(--io-accent)]',
                    'aria-disabled:text-io-ink-3 aria-disabled:cursor-default'
                  )}
                >
                  <span className="min-w-0">
                    {r.title}
                    {r.sub ? (
                      // ink-3-sel on the active row: plain ink-3 on the accent wash falls short of AA.
                      <small className="text-io-ink-3 group-data-[active]:text-io-ink-3-sel block text-[12px] leading-[1.45]">
                        {r.sub}
                      </small>
                    ) : null}
                  </span>
                  {r.right ?? <span />}
                </div>
              )
            })}
          </div>
        ))}
        {empty ? (
          <p role="status" className="text-io-ink-3 m-0 px-[18px] pt-3 pb-2 text-[12.5px]">
            No reference matches “{query.trim()}”. Records, mail and attachments are searched once search
            arrives.
          </p>
        ) : null}
      </div>
      <div className="border-io-line bg-io-row-hover text-io-ink-3 flex gap-3.5 border-t px-[18px] py-2.5 text-[11.5px]">
        {question ? (
          <>
            <span>Answers show their query</span>
            <span className="ml-auto">Ask about prices, suppliers, orders, money</span>
          </>
        ) : (
          <>
            <span>↑↓ to move</span>
            <span>↵ to open</span>
            <span>⌘↵ new tab</span>
            <span className="ml-auto">Searches records, mail and attachments</span>
          </>
        )}
      </div>
    </>
  )
}
