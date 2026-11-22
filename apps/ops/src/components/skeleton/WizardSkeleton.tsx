import { Button } from '@indus/ops-ui/controls'
import { T9Wizard } from '@indus/ops-ui/templates'
import { WizardSteps } from '@indus/ops-ui/timeline'
import Arrives, { type Sprint } from './Arrives'

export interface WizardSkeletonProps {
  title: string
  steps: readonly string[]
  /** 1-based. */
  current?: number
  sprint: Sprint
  what: string
}

/**
 * T9 Wizard (centred) skeleton: new enquiry, intake batch, new supplier, history import. The one primary,
 * Next, is disabled until the sprint gives the step something to save.
 */
export default function WizardSkeleton({
  title,
  steps,
  current = 1,
  sprint,
  what,
}: WizardSkeletonProps) {
  return (
    <T9Wizard
      title={title}
      steps={<WizardSteps aria-label={`${title} steps`} steps={steps} current={current} />}
      progress={
        <span className="text-io-ink-3 text-[12px]">
          Step {current} of {steps.length}
        </span>
      }
      next={
        <Button variant="primary" disabled>
          Next
        </Button>
      }
    >
      <Arrives sprint={sprint} what={what} />
    </T9Wizard>
  )
}
