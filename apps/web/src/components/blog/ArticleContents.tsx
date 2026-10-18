'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useReadingProgress } from '../services/ReadingProgress'
import { CloseIcon, ListIcon } from '../designed/icons'

export type ContentsEntry = { anchor: string; number: string; title: string }

type Props = {
  entries: ContentsEntry[]
  /** id of the article body — drives the percentage and the progress line. */
  bodyId: string
  /** id of the hero figure — the phone pill appears once it has scrolled past. */
  heroId: string
}

/*
  Where a section counts as "reached": the 107px sticky site header (utility bar + nav) plus the 60px
  contents bar on desktop, the header alone on a phone, plus a little room.
*/
const REACHED_DESKTOP = 180
const REACHED_PHONE = 130

function entryTitle(title: string): string {
  return title.replace(/\.$/, '')
}

/**
 * The article's wayfinding — the one client leaf on the page besides the
 * share button.
 *
 * Above 760px: a sticky contents bar under the site header, with the active
 * section highlighted, a percentage read, and a 2px progress line.
 * At 760px and below: a floating "Contents 01 / 05" pill that opens a bottom
 * sheet of the same anchors.
 *
 * Every entry is a real `<a href="#anchor">`, server-rendered, so the contents
 * work with no script; this component only adds the active state and the pill.
 *
 * Active section is the last section head whose top has passed under the
 * sticky chrome, recomputed on scroll in an animation frame — the same answer
 * an IntersectionObserver would give, without its edge cases around sections
 * shorter than the observed band.
 */
export default function ArticleContents({ entries, bodyId, heroId }: Props) {
  const [active, setActive] = useState(-1)
  const [pillVisible, setPillVisible] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const progress = useReadingProgress(`#${bodyId}`)

  const listRef = useRef<HTMLOListElement>(null)
  const pillRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetTitleId = useId()

  useEffect(() => {
    let frame = 0
    function measure() {
      frame = 0
      const desktop = window.matchMedia('(min-width: 761px)').matches
      const reached = desktop ? REACHED_DESKTOP : REACHED_PHONE
      let next = -1
      entries.forEach((entry, i) => {
        const el = document.getElementById(entry.anchor)
        if (el && el.getBoundingClientRect().top <= reached) next = i
      })
      setActive(next)

      // The pill shows while the reader is in the body: once the hero is above
      // the viewport, and until the body's end is in the top half of it — so it
      // never sits over the enquiry buttons at the foot.
      const hero = document.getElementById(heroId)
      const body = document.getElementById(bodyId)
      const pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : (body?.getBoundingClientRect().top ?? 1) < 0
      const inBody = body ? body.getBoundingClientRect().bottom > window.innerHeight * 0.5 : false
      setPillVisible(pastHero && inBody)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [entries, bodyId, heroId])

  // Keep the active entry in view when the bar overflows. scrollLeft on the
  // list only — scrollIntoView would also scroll the page vertically.
  useEffect(() => {
    const list = listRef.current
    const item = active >= 0 ? (list?.children[active] as HTMLElement | undefined) : undefined
    if (!list || !item) return
    const left = item.offsetLeft - list.offsetLeft
    const right = left + item.offsetWidth
    if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      list.scrollTo({ left: Math.max(0, left - 16), behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [active])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    // Focus goes back to the control that opened the sheet.
    pillRef.current?.focus({ preventScroll: true })
  }, [])

  // The sheet is modal: focus moves in, Tab cycles inside it, Escape closes.
  useEffect(() => {
    if (!sheetOpen) return
    const sheet = sheetRef.current
    if (!sheet) return
    const focusables = () =>
      [...sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null)
    ;(sheet.querySelector<HTMLElement>('[aria-current="location"]') ?? focusables()[0])?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSheet()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheetOpen, closeSheet])

  if (entries.length === 0) return null

  const total = String(entries.length).padStart(2, '0')
  const current = String(Math.max(active, 0) + 1).padStart(2, '0')

  return (
    <>
      <nav
        aria-label="Article contents"
        className="sticky top-[107px] z-40 mt-9 hidden border-y border-ih-border bg-ih-surface min-[761px]:block"
      >
        <div className="mx-auto flex min-h-14 max-w-[var(--spacing-max-w)] items-center gap-5 px-8 min-[1181px]:px-12">
          <span className="shrink-0 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ih-muted">
            Contents
          </span>
          <ol ref={listRef} className="no-scrollbar m-0 flex min-w-0 flex-1 list-none gap-1 overflow-x-auto p-0">
            {entries.map((entry, i) => (
              <li key={entry.anchor} className="shrink-0">
                <a
                  href={`#${entry.anchor}`}
                  aria-current={i === active ? 'location' : undefined}
                  className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-3 text-[13.5px] transition-colors duration-150 focus-visible:-outline-offset-2! motion-reduce:transition-none ${
                    i === active
                      ? 'bg-ih-accent-soft font-medium text-ih-accent'
                      : 'text-ih-ink-2 hover:bg-ih-surface-2'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${i === active ? 'text-ih-accent' : 'text-ih-muted'}`}>
                    {entry.number}
                  </span>
                  {entryTitle(entry.title)}
                </a>
              </li>
            ))}
          </ol>
          <span className="shrink-0 font-mono text-[11px] text-ih-muted">
            {Math.round(progress)}%<span className="sr-only"> read</span>
          </span>
        </div>
        {/* A native <progress>, styled through its pseudo-elements — no inline width. */}
        <progress
          aria-hidden="true"
          value={progress}
          max={100}
          className="block h-0.5 w-full appearance-none border-0 bg-transparent [&::-moz-progress-bar]:bg-ih-accent [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-ih-accent"
        />
      </nav>

      {/* Stays mounted while the sheet is open, so focus has somewhere to return to. */}
      {(pillVisible || sheetOpen) && (
        <button
          ref={pillRef}
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Contents, section ${Math.max(active, 0) + 1} of ${entries.length}`}
          className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-ih-navy px-[18px] text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(10,20,40,0.5)] focus-visible:outline-ih-steel! min-[761px]:hidden"
        >
          <ListIcon />
          <span>Contents</span>
          <span className="font-mono text-[11.5px] font-normal text-ih-steel">
            {current} / {total}
          </span>
        </button>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] min-[761px]:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-ih-ink/40" onClick={closeSheet} />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={sheetTitleId}
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-ih-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3"
          >
            <div className="flex items-center justify-between border-b border-ih-border pb-2">
              <h2
                id={sheetTitleId}
                className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ih-muted"
              >
                Contents
              </h2>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close contents"
                className="grid size-11 place-items-center rounded-md text-ih-ink hover:bg-ih-surface-2"
              >
                <CloseIcon />
              </button>
            </div>
            <ol className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
              {entries.map((entry, i) => (
                <li key={entry.anchor}>
                  <a
                    href={`#${entry.anchor}`}
                    onClick={closeSheet}
                    aria-current={i === active ? 'location' : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-[15px] ${
                      i === active ? 'bg-ih-accent-soft font-medium text-ih-accent' : 'text-ih-ink-2 hover:bg-ih-surface-2'
                    }`}
                  >
                    <span className={`font-mono text-[11px] ${i === active ? 'text-ih-accent' : 'text-ih-muted'}`}>
                      {entry.number}
                    </span>
                    {entryTitle(entry.title)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
