import Button from '../controls/Button'
import { cn } from '../lib/cn'
import type { UnsureRowProps } from './types'

/**
 * Assistant kit `ka-un`: a question the Assistant will not guess (an Unsure value is never written into a
 * record). note-warn ground, radius 10, 10×14; "Unsure ·" in 500, then the question and the reason; 32px
 * buttons on the right, by default Decide (primary) and Not now. Shared: the default buttons take their
 * handlers from a client caller.
 */
export default function UnsureRow({
  question,
  reason,
  actions,
  onDecide,
  onNotNow,
  className,
}: UnsureRowProps) {
  return (
    <div
      data-part="unsure"
      className={cn(
        'rounded-io-card bg-io-note-warn grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2.5 text-[12.5px] leading-[1.45]',
        className
      )}
    >
      <p className="m-0">
        <b className="font-medium">Unsure · </b>
        {question}
        {reason ? ` ${reason}` : null}
      </p>
      <div className="flex gap-1.5">
        {actions ?? (
          <>
            <Button variant="primary" size="sm" {...(onDecide ? { onClick: onDecide } : {})}>
              Decide
            </Button>
            <Button variant="secondary" size="sm" {...(onNotNow ? { onClick: onNotNow } : {})}>
              Not now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
