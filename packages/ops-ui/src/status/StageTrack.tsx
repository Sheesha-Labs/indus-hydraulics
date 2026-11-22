import { cn } from '../lib/cn'

/** The six display stages of an enquiry (C7). Won, Lost and Regretted are one final stage. */
export const ENQUIRY_STAGES = [
  'Enquiry',
  'Sourcing',
  'Quotes in',
  'Quoted',
  'Negotiation',
  'Won / Lost / Regretted',
] as const
export type EnquiryStage = (typeof ENQUIRY_STAGES)[number]

/** The nine stages of an order after the win. */
export const ORDER_STAGES = [
  'Confirmed',
  'Advance',
  'Production',
  'Inspection',
  'Freight',
  'Shipped',
  'Delivered',
  'Invoiced',
  'Paid',
] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export type StageTrackProps = (
  | { flow: 'enquiry'; current: EnquiryStage | 'Won' | 'Lost' | 'Regretted' }
  | { flow: 'order'; current: OrderStage }
  | { flow: 'custom'; stages: readonly string[]; current: string }
) & { label?: string; className?: string }

const FINAL = 'Won / Lost / Regretted'

function resolve(props: StageTrackProps): { stages: readonly string[]; index: number } {
  if (props.flow === 'enquiry') {
    const cur = ['Won', 'Lost', 'Regretted'].includes(props.current) ? FINAL : props.current
    return { stages: ENQUIRY_STAGES, index: (ENQUIRY_STAGES as readonly string[]).indexOf(cur) }
  }
  if (props.flow === 'order')
    return { stages: ORDER_STAGES, index: ORDER_STAGES.indexOf(props.current) }
  return { stages: props.stages, index: props.stages.indexOf(props.current) }
}

/**
 * Status kit `ks-stg`: done stages are an accent dot + label with a 14px connector, the current stage a navy
 * pill with a white dot, upcoming stages a hollow dot. An <ol> with aria-current="step" on the current
 * stage and visually hidden "completed" / "upcoming" on the others. Upcoming labels are ink-3, not the kit's
 * ink-4, which is 2.8:1 on white (below WCAG AA).
 */
export default function StageTrack(props: StageTrackProps) {
  const { stages, index } = resolve(props)
  const current = Math.max(0, index)
  const label =
    props.label ??
    (props.flow === 'order' ? 'Order stage' : props.flow === 'enquiry' ? 'Enquiry stage' : 'Stage')
  return (
    <ol
      aria-label={label}
      data-part="stage-track"
      className={cn('flex flex-wrap items-center gap-y-0.5', props.className)}
    >
      {stages.map((name, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li
            key={name}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'flex h-6 items-center gap-1.5 pr-2.5 text-[11.5px] whitespace-nowrap',
              state === 'done' && 'text-io-accent',
              state === 'current' &&
                'bg-io-navy rounded-io-pill mr-2.5 px-2.5 font-medium text-white',
              state === 'todo' && 'text-io-ink-3'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'rounded-io-pill size-[7px] flex-none',
                state === 'done' && 'bg-io-accent',
                state === 'current' && 'bg-white',
                state === 'todo' && 'border-io-stroke border'
              )}
            />
            {name}
            {state === 'current' ? null : (
              <span className="sr-only">{state === 'done' ? ', completed' : ', upcoming'}</span>
            )}
            {state === 'done' ? (
              <span aria-hidden="true" className="bg-io-accent-line ml-1 h-px w-3.5 flex-none" />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
