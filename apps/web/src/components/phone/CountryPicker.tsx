'use client'

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { DialCountry } from '@indus/domain'
import { filterCountries, flagSrc } from '../../lib/phone'

type Props = {
  /** Ordered list: default first, then the GCC, then A–Z (`orderCountries`). */
  countries: DialCountry[]
  /** How many leading rows are the "suggested" block — a rule follows them. */
  topCount: number
  value: string
  onChange: (iso: string) => void
  disabled?: boolean
}

/** Set on the picker while its list is open. Dialogs check it before closing on Escape. */
export const PICKER_OPEN_ATTR = 'data-country-picker-open'

/**
 * True while a country list is open. Radix dialogs listen for Escape on the
 * document in the capture phase — before the picker sees the key — so their
 * `onEscapeKeyDown` asks this first and leaves the Escape to the picker.
 */
export function countryPickerOpen(): boolean {
  return typeof document !== 'undefined' && !!document.querySelector(`[${PICKER_OPEN_ATTR}]`)
}

const PANEL_MAX = 320
const PANEL_MIN = 180

/**
 * Dial-code picker shared by every phone field (call-back prompt and enquiry
 * forms): a button showing the flag and
 * dial code, opening a searchable listbox of flag · country · code.
 *
 * Hand-rolled (CLAUDE.md §10.5) because a native <select> cannot show images.
 * The list is positioned against the phone group's outer wrapper, which sits
 * outside the group's `overflow-hidden`, so the rounded field still clips its
 * own children but not the list. It opens upward when there is more room
 * above — the corner card sits on the viewport floor.
 */
export default function CountryPicker({ countries, topCount, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [up, setUp] = useState(false)
  const [coarse, setCoarse] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const listId = `${baseId}-list`
  const optionId = (iso: string) => `${baseId}-opt-${iso}`

  const selected = countries.find((c) => c[0] === value) ?? countries[0]
  const results = useMemo(() => filterCountries(countries, query), [countries, query])
  const showRule = !query.trim() && topCount > 0 && topCount < results.length

  function openList() {
    if (disabled) return
    setQuery('')
    setActive(Math.max(0, countries.findIndex((c) => c[0] === value)))
    setCoarse(window.matchMedia('(pointer: coarse)').matches)
    setOpen(true)
  }

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  function choose(iso: string) {
    onChange(iso)
    close(true)
  }

  // Measure the room above and below against the nearest clipping ancestor
  // (the modal's content box, the sheet's scroller) or the viewport.
  useLayoutEffect(() => {
    if (!open) return
    const root = rootRef.current
    const anchor = root?.offsetParent as HTMLElement | null
    if (!root || !anchor) return
    const r = anchor.getBoundingClientRect()
    let top = 0
    let bottom = window.innerHeight
    for (let el = anchor.parentElement; el && el !== document.body; el = el.parentElement) {
      const o = getComputedStyle(el)
      if (/(hidden|auto|scroll|clip)/.test(o.overflowY)) {
        const c = el.getBoundingClientRect()
        top = Math.max(top, c.top)
        // A scroller grows to fit the list, so only a hard clip limits the bottom.
        if (/(hidden|clip)/.test(o.overflowY)) bottom = Math.min(bottom, c.bottom)
        break
      }
    }
    const below = bottom - r.bottom - 12
    const above = r.top - top - 12
    const goUp = below < Math.min(PANEL_MAX, 260) && above > below
    setUp(goUp)
    panelRef.current?.style.setProperty('--ih-cp-max', `${Math.max(PANEL_MIN, Math.min(PANEL_MAX, goUp ? above : below))}px`)
  }, [open])

  // Focus: the search box with a mouse or keyboard; on touch, the list
  // itself, so the on-screen keyboard does not cover it uninvited.
  useEffect(() => {
    if (!open) return
    const el = coarse ? listRef.current : searchRef.current
    el?.focus({ preventScroll: true })
  }, [open, coarse])

  // Close on a press anywhere outside.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [open])

  // Keep the active row in view.
  useEffect(() => {
    if (!open) return
    const iso = results[active]?.[0]
    if (iso) document.getElementById(optionId(iso))?.scrollIntoView({ block: 'nearest' })
    // optionId is stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, results])

  function onListKey(e: KeyboardEvent) {
    const last = results.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((a) => Math.min(last, a + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((a) => Math.max(0, a - 1))
        break
      case 'PageDown':
        e.preventDefault()
        setActive((a) => Math.min(last, a + 8))
        break
      case 'PageUp':
        e.preventDefault()
        setActive((a) => Math.max(0, a - 8))
        break
      case 'Enter': {
        e.preventDefault()
        const c = results[active]
        if (c) choose(c[0])
        break
      }
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        close(true)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        // Typing on the list (touch focus, or a hardware keyboard) goes to search.
        if (e.target === listRef.current && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          searchRef.current?.focus()
        }
    }
  }

  const activeIso = results[active]?.[0]

  return (
    <div ref={rootRef} className="flex shrink-0" {...(open ? { [PICKER_OPEN_ATTR]: '' } : {})}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Country dialling code: ${selected?.[2] ?? ''} ${selected?.[1] ?? ''}`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            openList()
          }
        }}
        className="flex h-full items-center gap-2 border-0 border-r border-ih-border bg-ih-surface-2 pl-3 pr-2.5 text-[13px] tabular-nums text-ih-ink outline-none transition-colors hover:bg-ih-border/40 focus-visible:bg-ih-accent-soft disabled:cursor-default max-[767px]:text-[16px]"
      >
        {selected ? <Flag iso={selected[0]} /> : null}
        <span>{selected?.[1]}</span>
        <svg className={`text-ih-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path fill="currentColor" d="M0 0h10L5 6z" />
        </svg>
      </button>

      {open ? (
        <div
          ref={panelRef}
          className={`absolute left-0 z-20 flex max-h-[var(--ih-cp-max,320px)] w-full min-w-[260px] flex-col overflow-hidden rounded-[10px] border border-ih-border bg-ih-surface shadow-[0_12px_32px_rgba(10,16,30,.18)] animate-[ih-fade-in_120ms_ease-out] ${
            up ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
          }`}
        >
          <div className="relative shrink-0 border-b border-ih-border p-2">
            <svg className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-ih-muted" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label="Search countries"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeIso ? optionId(activeIso) : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search country or code"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onListKey}
              className="h-9 w-full rounded-md border border-ih-border-strong bg-ih-surface pl-8 pr-3 text-[13.5px] text-ih-ink outline-none placeholder:text-ih-muted focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft max-[767px]:text-[16px]"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label="Countries"
            aria-activedescendant={activeIso ? optionId(activeIso) : undefined}
            onKeyDown={onListKey}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 outline-none"
          >
            {results.length === 0 ? (
              <li role="presentation" className="px-3 py-3 text-[13px] text-ih-muted">
                No country matches &ldquo;{query.trim()}&rdquo;
              </li>
            ) : (
              results.map(([iso, dial, name], i) => {
                const isSel = iso === value
                const isActive = i === active
                return (
                  <li
                    key={iso}
                    id={optionId(iso)}
                    role="option"
                    aria-selected={isSel}
                    onPointerMove={() => setActive(i)}
                    onClick={() => choose(iso)}
                    className={`flex min-h-10 cursor-pointer items-center gap-2.5 px-3 text-[13.5px] ${
                      isActive ? 'bg-ih-surface-2' : ''
                    } ${showRule && i === topCount - 1 ? 'mb-1 border-b border-ih-border pb-1' : ''}`}
                  >
                    <Flag iso={iso} eager={i < 12} />
                    <span className={`min-w-0 flex-1 truncate ${isSel ? 'font-medium text-ih-ink' : 'text-ih-ink-2'}`}>{name}</span>
                    <span className="shrink-0 tabular-nums text-ih-muted">{dial}</span>
                    <svg className={`shrink-0 text-ih-accent ${isSel ? '' : 'invisible'}`} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="m3 8.5 3.25 3L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/**
 * 3:2 rectangular flag, 21 × 14, with a hairline so white flags keep an edge.
 * The first screenful loads at once; the rest as the list scrolls.
 */
function Flag({ iso, eager = true }: { iso: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG; next/image adds nothing here
    <img
      src={flagSrc(iso)}
      alt=""
      width={21}
      height={14}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className="h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(10,16,30,.12)]"
    />
  )
}
