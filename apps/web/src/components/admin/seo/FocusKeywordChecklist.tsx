'use client'

import { useMemo } from 'react'

interface Props {
  focusKeyword: string
  title: string
  description: string
  slug: string
}

/**
 * Pure-client checklist that ticks the obvious focus-keyword placement
 * checks in real time. It mirrors the logic in `scoreEntity` so admins
 * editing the drawer see exactly the same signals the Inspector grades on.
 *
 * Keep this dependency-free — the bulk of the SEO drawer relies on the
 * shared `@indus/domain` evaluator already.
 */
export default function FocusKeywordChecklist({ focusKeyword, title, description, slug }: Props) {
  const items = useMemo(() => {
    const k = focusKeyword.trim().toLowerCase()
    if (!k) {
      return [
        {
          id: 'set',
          pass: false,
          label: 'Set a focus keyword to enable placement checks',
        },
      ] as const
    }
    return [
      {
        id: 'title',
        pass: title.toLowerCase().includes(k),
        label: 'Focus keyword in title',
      },
      {
        id: 'slug',
        pass:
          slug.toLowerCase().includes(k.replace(/\s+/g, '-')) || slug.toLowerCase().includes(k),
        label: 'Focus keyword in URL slug',
      },
      {
        id: 'description',
        pass: description.toLowerCase().includes(k),
        label: 'Focus keyword in meta description',
      },
    ] as const
  }, [focusKeyword, title, description, slug])

  return (
    <ul className="flex flex-col gap-1.5 mt-2 text-[12px]">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex items-center gap-2 ${
            item.pass ? 'text-ih-success-ink' : 'text-ih-muted'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block w-3.5 h-3.5 grid place-items-center text-[11px] ${
              item.pass
                ? 'bg-[oklch(0.4_0.14_145)] text-white'
                : 'border border-ih-border text-transparent'
            }`}
          >
            ✓
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
