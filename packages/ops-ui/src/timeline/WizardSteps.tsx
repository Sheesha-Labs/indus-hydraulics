import { cn } from '../lib/cn'

export interface WizardStepsProps {
  steps: readonly string[]
  /** 1-based index of the current step. */
  current: number
  'aria-label'?: string
  className?: string
}

/** Setup progress (kit K-08 Steps): 22px circles, done ✓ on accent-tint, current navy, connectors. */
export default function WizardSteps({ steps, current, className, ...rest }: WizardStepsProps) {
  return (
    <ol
      aria-label={rest['aria-label'] ?? 'Steps'}
      className={cn('flex w-full items-center', className)}
    >
      {steps.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <li
            key={label}
            data-state={state}
            {...(state === 'current' ? { 'aria-current': 'step' as const } : {})}
            className={cn(
              'text-io-ink-3 after:bg-io-line flex flex-1 items-center gap-2 text-[12.5px] whitespace-nowrap after:mx-3 after:h-px after:min-w-6 after:flex-1 last:flex-none last:after:hidden',
              state === 'done' && 'text-io-ink-2',
              state === 'current' && 'text-io-ink font-medium'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'rounded-io-pill border-io-stroke bg-io-card grid size-[22px] flex-none place-items-center border text-[11px] font-medium',
                state === 'done' && 'border-io-accent-tint bg-io-accent-tint text-io-accent',
                state === 'current' && 'border-io-navy bg-io-navy text-white'
              )}
            >
              {state === 'done' ? '✓' : n}
            </span>
            {label}
            {state === 'done' ? <span className="sr-only"> (done)</span> : null}
          </li>
        )
      })}
    </ol>
  )
}
