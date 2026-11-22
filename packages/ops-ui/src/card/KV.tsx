import { cn } from '../lib/cn'
import CardLink from './CardLink'
import type { KVLabelWidth, KVPair } from './types'

export interface KVProps {
  pairs: KVPair[]
  /** rows: a label column beside the values. stack: N columns, label over value. Default rows. */
  layout?: 'rows' | 'stack'
  /** rows only; default 130. */
  labelWidth?: KVLabelWidth
  /** stack only; default 4. */
  cols?: 2 | 3 | 4 | 5
  className?: string
}

const LABEL_COL: Record<KVLabelWidth, string> = {
  110: 'grid-cols-[110px_minmax(0,1fr)]',
  130: 'grid-cols-[130px_minmax(0,1fr)]',
  160: 'grid-cols-[160px_minmax(0,1fr)]',
}
const STACK_COLS: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

/**
 * Card kit key–value (`kr-kv`), a <dl> of <dt>/<dd> pairs on a grid. rows: label 130 (110/160) / 1fr, gap
 * 8×14, values 12.5, labels 13. stack: label 11.5 over value 13/500, gap 4×18.
 */
export default function KeyValue({
  pairs,
  layout = 'rows',
  labelWidth = 130,
  cols = 4,
  className,
}: KVProps) {
  const stack = layout === 'stack'
  return (
    <dl
      data-part="kv"
      data-layout={layout}
      className={cn(
        'm-0 grid items-baseline text-[12.5px] leading-[1.45]',
        stack
          ? cn(STACK_COLS[cols], 'gap-x-[18px] gap-y-1')
          : cn(LABEL_COL[labelWidth], 'gap-x-3.5 gap-y-2'),
        className
      )}
    >
      {pairs.map((p) => (
        <KVRow key={p.label} pair={p} stack={stack} />
      ))}
    </dl>
  )
}

function KVRow({ pair, stack }: { pair: KVPair; stack: boolean }) {
  const value =
    pair.href !== undefined ? <CardLink href={pair.href}>{pair.value}</CardLink> : pair.value
  return (
    <>
      {/* Labels in rows are 13px: the kit's label carries the root .k class, which sets 13/1.45 over the
          container's 12.5 (that is how the sheet renders it). */}
      <dt className={cn('text-io-ink-3', stack ? 'row-start-1 text-[11.5px]' : 'text-[13px]')}>
        {pair.label}
      </dt>
      <dd
        className={cn(
          'm-0 min-w-0',
          stack && 'row-start-2 text-[13px] font-medium',
          pair.emphasis === 'link' && 'text-io-accent',
          pair.emphasis === 'bad' && 'text-io-bad'
        )}
      >
        {value}
        {pair.sub ? <small className="text-io-ink-3 ml-1.5 text-[11.5px]">{pair.sub}</small> : null}
      </dd>
    </>
  )
}
