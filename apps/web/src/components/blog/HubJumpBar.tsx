'use client'

import { useEffect, useState } from 'react'

export type JumpTarget = { id: string; label: string; count?: number }

/*
  A section counts as "reached" once its top passes under the 107px sticky
  site header and this 72px bar, plus a little room.
*/
const REACHED = 190

/**
 * The topic hub's in-page jump bar — Articles, Topic guide, Parts — sticky
 * under the site header. Every pill is a real `<a href="#id">`, server-rendered;
 * this leaf only adds the active state: the last section whose top has scrolled
 * under the bar, recomputed in an animation frame on scroll.
 */
export default function HubJumpBar({ targets }: { targets: JumpTarget[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    let frame = 0
    function measure() {
      frame = 0
      let next = 0
      targets.forEach((target, i) => {
        const el = document.getElementById(target.id)
        if (el && el.getBoundingClientRect().top <= REACHED) next = i
      })
      setActive(next)
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
  }, [targets])

  if (targets.length === 0) return null

  return (
    <nav aria-label="On this page" className="sticky top-[107px] z-30 bg-ih-bg">
      <div className="no-scrollbar mx-auto flex max-w-[var(--spacing-max-w)] gap-1 overflow-x-auto px-5 py-3 min-[761px]:overflow-visible min-[761px]:px-8 min-[761px]:py-4 min-[1181px]:px-12">
        {targets.map((target, i) => {
          const on = i === active
          return (
            <a
              key={target.id}
              href={`#${target.id}`}
              aria-current={on ? 'location' : undefined}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 text-[13.5px] font-medium transition-colors duration-150 motion-reduce:transition-none ${
                on
                  ? 'border-ih-navy bg-ih-navy text-white'
                  : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent'
              }`}
            >
              {target.label}
              {target.count !== undefined && (
                <span className={`font-mono text-[11px] ${on ? 'text-ih-steel' : 'text-ih-muted'}`}>{target.count}</span>
              )}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
