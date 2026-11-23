import { cn } from '@indus/ops-ui/lib/cn'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { SETUP_STEPS, type SetupStep } from '../../lib/route-params'
import { to } from '../../lib/routes'
import { SETUP_STEP_META, stepTitle } from '../../lib/setup-steps'
import type { StepStatus } from '../../server/setup/progress-core'
import CompanyLogo from './CompanyLogo'

export interface SetupRailProps {
  current: SetupStep
  statuses: Readonly<Record<SetupStep, StepStatus>>
  helperFirstName?: string | null
}

/** The rail's brand row (board 79): the logo, 28 high, and "Operations · setup". */
export function SetupBrand({ logoFileId }: { logoFileId: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      <CompanyLogo fileId={logoFileId} className="h-7" />
      <span className="text-io-navy text-[15px] font-semibold">Operations · setup</span>
    </div>
  )
}

/**
 * The six steps in the T9 rail (board 79): a 22 px number disc (navy for the current step, a tick for a
 * finished one), the title and its minutes. Every step is a link: the Owner may jump to any step and come
 * back; nothing is lost because every step saves as it goes.
 */
export default function SetupRail({ current, statuses, helperFirstName }: SetupRailProps) {
  return (
    <ol className="flex flex-col gap-1">
      {SETUP_STEPS.map((step, i) => {
        const here = step === current
        const done = statuses[step] === 'done'
        const skipped = statuses[step] === 'skipped'
        const title = stepTitle(step, helperFirstName)
        return (
          <li key={step}>
            <Link
              href={to(`/setup/${step}`)}
              aria-current={here ? 'step' : undefined}
              data-step={step}
              data-status={statuses[step]}
              className="io-focus rounded-io-ctl hover:bg-io-fill aria-[current=step]:bg-io-fill grid grid-cols-[24px_minmax(0,1fr)] items-center gap-2.5 px-2 py-[9px]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'rounded-io-pill grid size-[22px] place-items-center text-[11px] font-semibold',
                  here
                    ? 'bg-io-navy text-white'
                    : done
                      ? 'bg-io-ok-tint text-io-ok-mark'
                      : 'border-io-stroke text-io-ink-3 border'
                )}
              >
                {done && !here ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className={cn('text-[13px]', here && 'font-medium')}>{title}</span>
                {/* ink-2 on the current row: ink-3 on the fill ground fails AA at 11.5px. */}
                <span className={cn('text-[11.5px]', here ? 'text-io-ink-2' : 'text-io-ink-3')}>
                  {SETUP_STEP_META[step].minutes}
                  {done ? ' · done' : skipped ? ' · skipped for now' : ''}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
