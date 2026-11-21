import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import { choiceItem } from './styles'

export interface ChoiceOption<V extends string> {
  value: V
  label: string
  count?: number
}

export interface ChoicesProps<V extends string> {
  options: ChoiceOption<V>[]
  value: V
  size?: 'md' | 'sm'
  'aria-label': string
  /** Shared: a <nav> of links (URL state) — the normal case on index pages. */
  hrefFor?: (v: V) => string
  /** Client: buttons (in-card filters). */
  onValueChange?: (v: V) => void
  className?: string
}

/** "Awaiting decision · 14": the kit's label format. */
export function choiceText(o: ChoiceOption<string>): string {
  return o.count === undefined ? o.label : `${o.label} · ${o.count}`
}

/**
 * Controls kit Choices: index filter chips, exactly one active (navy). With `hrefFor` they are links in a
 * <nav> (aria-current="page"), rendered on the server from URL state. With `onValueChange` they are
 * buttons with aria-pressed, which needs a client caller (it passes a function).
 */
export default function Choices<V extends string>({
  options,
  value,
  size = 'md',
  hrefFor,
  onValueChange,
  className,
  'aria-label': ariaLabel,
}: ChoicesProps<V>) {
  const group = cn('flex flex-wrap gap-1.5', className)
  if (hrefFor) {
    return (
      <nav aria-label={ariaLabel} className={group}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <Link
              key={o.value}
              href={hrefFor(o.value) as Route}
              aria-current={on ? 'page' : undefined}
              data-state={on ? 'on' : 'off'}
              className={choiceItem({ size })}
            >
              {choiceText(o)}
            </Link>
          )
        })}
      </nav>
    )
  }
  return (
    <div role="group" aria-label={ariaLabel} className={group}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            data-state={on ? 'on' : 'off'}
            {...(onValueChange ? { onClick: () => onValueChange(o.value) } : {})}
            className={choiceItem({ size })}
          >
            {choiceText(o)}
          </button>
        )
      })}
    </div>
  )
}
