'use client'

import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-table`.
 *
 * Cells are 14px on a 12×12px pad, and the header is 13px MEDIUM SANS —
 * not the 10px mono uppercase this used to be. At 10px the header read as
 * noise rather than structure, and the body text was smaller than the row was
 * tall: more air wrapped around less weight, which is precisely what "the
 * admin is not well proportioned" meant. Mono survives inside cells, for the
 * machine values it exists for — SKUs, slugs, codes, quantities — via
 * `numeric` and the caller's own classes.
 *
 * This AMENDS CLAUDE.md §2.6, which mandates mono for table headers. See
 * docs/admin-design-language.md.
 *
 * The last row drops its border so the table ends on the container edge, not
 * a rule.
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
    /*
      The wrapper IS the card — border, radius, surface — not a bare scroll
      box. A table drawn edge-to-edge with square corners on a page where every
      button, chip and input is rounded stops reading as a card and starts
      reading as a data dump; that was the single most-cited finding in the
      admin audit.
    */
    <div className="w-full overflow-x-auto rounded-lg border border-ih-border bg-ih-surface">
      <table className={cn('w-full border-collapse text-[14px]', className)} {...props} />
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
        'whitespace-nowrap border-b border-ih-border px-3 py-3 text-left align-middle first:pl-4',
        'text-[13px] font-medium text-ih-muted-2',
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
        'border-b border-ih-border px-3 py-3 align-middle first:pl-4',
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
