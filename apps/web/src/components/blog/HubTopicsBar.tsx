'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { BlogTopic } from './BlogIndexView'

/**
 * Sibling-topic bar on a topic hub: "All topics" back to /blog, then every
 * topic with its count. All links are server-rendered; the only client work is
 * scrolling the current topic into view when the row overflows — via
 * `scrollLeft` on the list, because `scrollIntoView` would also scroll the page.
 */
export default function HubTopicsBar({ topics, current }: { topics: BlogTopic[]; current: string }) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const item = list?.querySelector<HTMLElement>('[aria-current="page"]')?.parentElement
    if (!list || !item) return
    const left = item.offsetLeft - list.offsetLeft
    // Centred rather than flush left, so a sliver of the previous topic never
    // reads as a stray count at the start of the row.
    if (left + item.offsetWidth > list.clientWidth) {
      list.scrollLeft = Math.max(0, left - (list.clientWidth - item.offsetWidth) / 2)
    }
  }, [current])

  return (
    <nav aria-label="Other topics" className="mt-7 border-y border-ih-border bg-ih-surface min-[761px]:mt-10">
      <div className="mx-auto flex min-h-14 max-w-[var(--spacing-max-w)] items-center gap-4 pl-5 min-[761px]:px-8 min-[1181px]:px-12">
        <Link
          href="/blog"
          className="inline-flex min-h-10 shrink-0 items-center font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ih-muted hover:text-ih-accent"
        >
          All topics
        </Link>
        <ul ref={listRef} className="no-scrollbar m-0 flex min-w-0 flex-1 list-none gap-1 overflow-x-auto p-0">
          {topics.map((topic) => {
            const on = topic.slug === current
            return (
              <li key={topic.slug} className="shrink-0">
                <Link
                  href={`/blog/c/${topic.slug}`}
                  aria-current={on ? 'page' : undefined}
                  className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-3 text-[13.5px] transition-colors duration-150 focus-visible:-outline-offset-2! motion-reduce:transition-none ${
                    on ? 'bg-ih-accent-soft font-medium text-ih-accent' : 'text-ih-ink-2 hover:bg-ih-surface-2'
                  }`}
                >
                  {topic.name}
                  <span className={`font-mono text-[11px] ${on ? 'text-ih-accent' : 'text-ih-muted'}`}>{topic.count}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
