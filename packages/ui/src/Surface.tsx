'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Design language v2 — the container and content primitives that carry most of
 * the system: Card, Chip, Avatar, Note, Eyebrow, SectionHead, SpecList,
 * StatTile, Breadcrumb and the hairline grid.
 *
 * The through-line: 1px rules do the separating work. Shadows are rare —
 * shadow-1 for a genuinely raised card, shadow-2 only for a true overlay.
 * Everything else separates with a border.
 */

/* ─── Card ─────────────────────────────────────────────────────────────── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** radius 6 instead of 10 — for inset panels inside another card. */
  flat?: boolean
  /** The only elevation a card may take. Overlays use shadow-2 directly. */
  raised?: boolean
}

export function Card({ className, flat, raised, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-ih-border bg-ih-surface',
        flat ? 'rounded-md' : 'rounded-lg',
        raised && 'shadow-[0_1px_2px_rgba(20,28,45,.04),0_8px_24px_rgba(20,28,45,.04)]',
        className
      )}
      {...props}
    />
  )
}

/* ─── Chip ─────────────────────────────────────────────────────────────── */

const chipVariants = cva(
  cn(
    'inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12.5px]',
    'transition-[background-color,border-color,color] duration-150 ease-[ease]'
  ),
  {
    variants: {
      on: {
        true: 'border-ih-accent bg-ih-accent text-white',
        false: 'border-ih-border text-ih-ink-2 hover:border-ih-border-strong',
      },
      ghost: { true: 'bg-transparent', false: 'bg-ih-surface' },
    },
    defaultVariants: { on: false, ghost: false },
  }
)

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof chipVariants> {}

export function Chip({ className, on, ghost, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ on, ghost }), on && 'bg-ih-accent', className)} {...props} />
}

/* ─── Avatar ───────────────────────────────────────────────────────────── */

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string
  /** px — drives the font size at 0.36× so it scales with the circle. */
  size?: number
  accent?: boolean
}

export function Avatar({ initials, size = 32, accent, className, style, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-medium',
        accent ? 'bg-ih-accent text-white' : 'bg-ih-surface-3 text-ih-ink-2',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), ...style }}
      aria-hidden="true"
      {...props}
    >
      {initials}
    </div>
  )
}

/* ─── Note ─────────────────────────────────────────────────────────────── */

export interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'accent' | 'danger'
}

/**
 * The one editorial aside per page. `danger` is the inline error treatment
 * from 03-interactions-and-states.md §5 — used within a failed region, never
 * as a full-page takeover for a partial failure.
 */
export function Note({ className, tone = 'accent', ...props }: NoteProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-[14px] py-3 text-[12.5px] leading-relaxed',
        tone === 'accent'
          ? 'border-[oklch(0.88_0.04_248)] bg-ih-accent-soft text-[oklch(0.38_0.09_248)]'
          : 'border-[oklch(0.88_0.05_28)] bg-ih-danger-soft text-[oklch(0.44_0.14_28)]',
        className
      )}
      {...props}
    />
  )
}

/* ─── Eyebrow ──────────────────────────────────────────────────────────── */

/**
 * Mono, 10.5px, 0.13em, uppercase. Note this is NOT a heading — an eyebrow
 * above an H1 must not be marked up as one, or the document outline lies.
 */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted', className)}
      {...props}
    />
  )
}

/* ─── SectionHead ──────────────────────────────────────────────────────── */

export interface SectionHeadProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  /** Sets the title in Instrument Serif at 34px — the editorial treatment. */
  serif?: boolean
  /** The `/01` numeral. Renders in accent mono and is decorative. */
  number?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHead({ eyebrow, title, serif, number, action, className }: SectionHeadProps) {
  return (
    <div className={cn('mb-7 flex items-end justify-between gap-8', className)}>
      <div>
        {number ? (
          <span aria-hidden="true" className="mb-2 block font-mono text-[11px] tracking-[0.06em] text-ih-accent">
            {number}
          </span>
        ) : null}
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            'max-w-[620px] text-pretty',
            serif ? 'font-serif text-[34px] font-normal tracking-[-0.01em]' : 'text-[30px] font-medium tracking-[-0.02em]'
          )}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

/* ─── SpecList ─────────────────────────────────────────────────────────── */

export interface SpecListProps extends React.HTMLAttributes<HTMLDListElement> {
  rows: ReadonlyArray<readonly [React.ReactNode, React.ReactNode]>
}

/**
 * The standard pattern for technical attributes in rails and cards. Key is
 * sans and muted; value is mono and right-aligned. Marked up as a description
 * list because that is what it is.
 */
export function SpecList({ rows, className, ...props }: SpecListProps) {
  return (
    <dl className={cn('flex flex-col', className)} {...props}>
      {rows.map(([k, v], i) => (
        <div
          key={i}
          className="flex justify-between gap-5 border-b border-ih-border py-2.5 text-[13px] last:border-b-0"
        >
          <dt className="text-ih-muted">{k}</dt>
          <dd className="text-right font-mono text-[12.5px] text-ih-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ─── StatTile / StatRow ───────────────────────────────────────────────── */

export interface StatProps {
  label: React.ReactNode
  value: React.ReactNode
  /** Optional movement line, e.g. "+6 vs last week". */
  delta?: React.ReactNode
  down?: boolean
  className?: string
}

/** The bordered card form — used in the console. */
export function StatTile({ label, value, delta, down, className }: StatProps) {
  return (
    <div className={cn('rounded-lg border border-ih-border bg-ih-surface px-5 py-[18px]', className)}>
      <div className="text-xs text-ih-muted">{label}</div>
      <div className="mt-[5px] text-[28px] font-medium tracking-[-0.025em] tabular-nums">{value}</div>
      {delta ? (
        <div className={cn('mt-2 font-mono text-[11.5px]', down ? 'text-ih-danger' : 'text-ih-success')}>{delta}</div>
      ) : null}
    </div>
  )
}

/**
 * The rule-topped form — the most-repeated device in the system. Sits in a
 * grid; each item takes a 2px accent top border, or steel when on navy.
 */
export function Stat({ label, value, onNavy, className }: Omit<StatProps, 'delta' | 'down'> & { onNavy?: boolean }) {
  return (
    <div className={cn('border-t-2 pt-3.5', onNavy ? 'border-ih-steel' : 'border-ih-accent', className)}>
      <div className={cn('font-mono text-[30px] leading-none tracking-[-0.03em] tabular-nums', onNavy && 'text-white')}>
        {value}
      </div>
      <div
        className={cn(
          'mt-2.5 font-mono text-[10.5px] uppercase leading-normal tracking-[0.1em]',
          onNavy ? 'text-ih-steel' : 'text-ih-muted'
        )}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── Breadcrumb ───────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  label: React.ReactNode
  href?: string
}

/**
 * A real `<nav aria-label="Breadcrumb">` wrapping an ordered list — the trail
 * is a sequence and the markup should say so. The last item is the current
 * page and carries aria-current.
 */
export function Breadcrumb({ items, className }: { items: readonly BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-ih-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden="true" className="opacity-50">
                  /
                </span>
              ) : null}
              {item.href && !last ? (
                <a href={item.href} className="hover:text-ih-accent">
                  {item.label}
                </a>
              ) : (
                <span className={cn(last && 'text-ih-ink-2')} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ─── HairlineGrid ─────────────────────────────────────────────────────── */

/**
 * The four-up hairline grid: `gap: 1px` over a border-coloured background
 * inside a bordered, radius-10 container. Produces a hairline-separated set
 * with no double borders — which is why it exists rather than per-cell
 * borders. Used for application areas, method steps, range-by-category.
 *
 * `columns` is OPTIONAL, and omitting it is the responsive form: the count then
 * comes from `grid-cols-*` utilities in `className`, which can carry
 * breakpoints. Passing the number sets `grid-template-columns` inline, and an
 * inline value beats every utility — a fixed `columns={4}` with
 * `sm:grid-cols-2` in the class list silently stays at four on a phone.
 *
 * `tone="navy"` inverts the rules for the dark band. The cell fill has to match
 * the band exactly or the 1px gaps read as seams, which is why the tone lives
 * on both halves of the pair rather than being a class the caller remembers.
 */
export function HairlineGrid({
  columns,
  tone = 'light',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { columns?: number; tone?: 'light' | 'navy' }) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-lg border',
        tone === 'navy' ? 'border-white/15 bg-white/15' : 'border-ih-border bg-ih-border',
        className
      )}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export function HairlineCell({
  tone = 'light',
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: 'light' | 'navy' }) {
  return (
    <div
      className={cn(
        'px-5 py-[18px]',
        tone === 'navy' ? 'bg-ih-navy' : 'bg-ih-surface',
        className
      )}
      {...props}
    />
  )
}
