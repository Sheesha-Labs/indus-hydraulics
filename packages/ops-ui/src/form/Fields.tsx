import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface FieldsProps {
  /** Equal columns, default 2. */
  cols?: 1 | 2 | 3 | 4
  /** <Field/>s. */
  children: ReactNode
  className?: string
}

// Static class literals: Tailwind cannot see a class built at runtime.
const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

/** Form kit Fields (`kf-fs`): a grid of fields, N equal columns, gap 14 × 16. Shared. */
export default function Fields({ cols = 2, children, className }: FieldsProps) {
  return (
    <div data-part="fields" className={cn('grid w-full gap-x-4 gap-y-3.5', COLS[cols], className)}>
      {children}
    </div>
  )
}
