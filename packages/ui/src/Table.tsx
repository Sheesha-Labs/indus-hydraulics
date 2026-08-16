'use client'

import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-table`.
 *
 * Header: mono 10.5px-500, 0.08em, uppercase, muted, 11×16px padding, bottom
 * hairline. Cells: 14×16px, bottom hairline, middle-aligned, 13px. The last
 * row drops its border so the table ends on the container edge, not a rule.
 *
 * Row hover fills surface-2 with NO transition — 03-interactions-and-states.md
 * §1 is explicit that instant response reads as more responsive in dense
 * tables, and this is the one place the 150ms hover rule does not apply.
 *
 * `numeric` on a cell switches it to mono with tabular figures. Use it for
 * every quantity, price, date and duration so columns align.
 */

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-[13px]', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  // The last row drops its bottom rule so the table ends on the container
  // edge rather than a floating hairline.
  return <tbody className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />
}

export function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn('border-t border-ih-border', className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:[&>td]:bg-ih-surface-2', className)} {...props} />
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean
}

/**
 * Always pass a `scope` — the default is `col`, which is right for a normal
 * header row; row headers must say so explicitly.
 */
export function TableHead({ className, numeric, scope = 'col', ...props }: TableHeadProps) {
  return (
    <th
      scope={scope}
      className={cn(
        'whitespace-nowrap border-b border-ih-border px-4 py-[11px] text-left align-bottom',
        'font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted',
        numeric && 'text-right',
        className
      )}
      {...props}
    />
  )
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean
}

export function TableCell({ className, numeric, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        'border-b border-ih-border px-4 py-3.5 align-middle',
        numeric && 'text-right font-mono tabular-nums',
        className
      )}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('pb-3 text-left text-[13px] text-ih-muted', className)} {...props} />
}
