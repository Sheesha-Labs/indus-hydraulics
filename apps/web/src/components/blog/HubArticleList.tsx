'use client'

import { useState } from 'react'
import Link from 'next/link'
import { byQuickest, groupByMonth, type HubListItem } from './topic-hub'

type Sort = 'newest' | 'quickest'

const SORTS: Array<{ key: Sort; label: string }> = [
  { key: 'newest', label: 'Newest' },
  { key: 'quickest', label: 'Quickest read' },
]

/**
 * Every article in the topic except Start here, as a compact dated list.
 *
 * Rendered on the server in "Newest" order, grouped by month — so every
 * article is a real `<a href>` in the HTML a crawler reads. The sort control
 * only re-orders on the client ("Quickest read" is one ungrouped list by
 * reading time); it never hides or lazy-loads a row.
 *
 * Dates arrive pre-formatted from the server, so hydration cannot disagree
 * with them across time zones.
 */
export default function HubArticleList({
  items,
  total,
  showHead,
}: {
  items: HubListItem[]
  /** Every article in the topic, Start here included — for the heading. */
  total: number
  /** False with only one article in the topic: Start here alone, no list head. */
  showHead: boolean
}) {
  const [sort, setSort] = useState<Sort>('newest')

  return (
    <div className="max-w-[1000px] min-w-0">
      {showHead && (
        <div className="border-ih-ink flex flex-col items-start gap-3 border-b pb-3.5 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between min-[761px]:gap-4">
          <h2
            id="hub-articles-heading"
            className="text-ih-ink font-serif text-[28px] leading-[1.08] font-normal tracking-[-0.01em] min-[761px]:text-[34px]"
          >
            All {total} articles
          </h2>
          <div
            role="group"
            aria-label="Sort articles"
            className="border-ih-border-strong bg-ih-surface inline-flex h-10 items-center rounded-md border p-[3px]"
          >
            {SORTS.map((option) => {
              const on = sort === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSort(option.key)}
                  className={`h-[32px] rounded-sm px-3 text-[13px] font-medium transition-colors duration-150 motion-reduce:transition-none ${
                    on ? 'bg-ih-navy text-white' : 'text-ih-ink-2 hover:text-ih-ink'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sort === 'newest' ? (
        groupByMonth(items).map((group) => (
          <div key={group.key}>
            <h3 className="border-ih-border text-ih-ink-2 flex justify-between border-b pt-[22px] pb-2 font-mono text-[11px] font-medium tracking-[0.1em] uppercase">
              {group.label}
              <span className="text-ih-muted">{group.items.length}</span>
            </h3>
            <Rows items={group.items} />
          </div>
        ))
      ) : (
        <Rows items={byQuickest(items)} />
      )}
    </div>
  )
}

function Rows({ items }: { items: HubListItem[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map((item) => (
        <li
          key={item.slug}
          className="border-ih-border grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b py-3.5 min-[761px]:grid-cols-[110px_minmax(0,1fr)_56px] min-[761px]:items-baseline min-[761px]:gap-5"
        >
          <Link
            href={`/blog/${item.slug}`}
            className="text-ih-ink hover:text-ih-accent col-span-2 text-[15px] leading-[1.4] font-medium tracking-[-0.01em] text-pretty transition-colors duration-150 motion-reduce:transition-none min-[761px]:col-span-1 min-[761px]:col-start-2 min-[761px]:row-start-1 min-[761px]:text-[16px]"
          >
            {item.title}
          </Link>
          <span className="text-ih-muted font-mono text-[11.5px] min-[761px]:col-start-1 min-[761px]:row-start-1">
            {item.dateTime && item.dateLabel ? (
              <time dateTime={item.dateTime}>{item.dateLabel}</time>
            ) : null}
          </span>
          <span className="text-ih-muted text-right font-mono text-[11.5px] min-[761px]:col-start-3 min-[761px]:row-start-1">
            {item.minutes ? `${item.minutes} min` : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
