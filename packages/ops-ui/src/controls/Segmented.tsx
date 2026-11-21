import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import { LabelWithCount, type CountTone } from './Count'
import SegmentedRadios from './SegmentedRadios'
import { segmentedGroup, segmentedItem } from './styles'

export interface SegmentOption<V extends string> {
  value: V
  label: string
  count?: number
  countTone?: CountTone
}

export interface SegmentedProps<V extends string> {
  options: SegmentOption<V>[]
  value: V
  size?: 'md' | 'sm'
  'aria-label': string
  /** Client state… */
  onValueChange?: (v: V) => void
  /** …or URL state (renders links with aria-current). */
  hrefFor?: (v: V) => string
  className?: string
}

/**
 * Controls kit Segmented: views (Table | Board | Calendar) and mode switches.
 *
 * With `hrefFor` it is navigation: a <nav> of links, the current one aria-current="page". This half is
 * shared, so an index page can render it from the server with URL state. Otherwise it is a radiogroup
 * with roving tabindex and ←/→/Home/End (the client half, SegmentedRadios).
 */
export default function Segmented<V extends string>(props: SegmentedProps<V>) {
  const { options, value, size = 'md', hrefFor, className } = props
  if (!hrefFor) return <SegmentedRadios {...props} />
  return (
    <nav aria-label={props['aria-label']} className={cn(segmentedGroup({ size }), className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value) as Route}
            aria-current={on ? 'page' : undefined}
            data-state={on ? 'on' : 'off'}
            className={segmentedItem({ size })}
          >
            <LabelWithCount label={o.label} count={o.count} tone={o.countTone} onNavy={on} />
          </Link>
        )
      })}
    </nav>
  )
}
