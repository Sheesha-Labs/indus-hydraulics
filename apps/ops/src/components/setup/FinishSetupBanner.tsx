import { ButtonLink } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import type { SetupStep } from '../../lib/route-params'
import { to } from '../../lib/routes'
import { stepTitle } from '../../lib/setup-steps'

export interface FinishSetupBannerProps {
  done: number
  total: number
  next: SetupStep
  helperFirstName?: string | null
  className?: string
}

/**
 * Today's first-run banner for the Owner while setup is incomplete (P01, board 78 "Until it is done ·
 * on Today"): "Finish setup · n of 6. Next: <step>." with a secondary Continue to that step.
 */
export default function FinishSetupBanner({
  done,
  total,
  next,
  helperFirstName,
  className,
}: FinishSetupBannerProps) {
  return (
    <Banner
      tone="info"
      title={`Finish setup · ${done} of ${total}.`}
      {...(className ? { className } : {})}
      actions={
        // The banner underlines its text actions; this one is a button, so the wrapper opts out.
        <span data-finish-setup="" className="no-underline!">
          <ButtonLink href={to(`/setup/${next}`)} size="sm">
            Continue
          </ButtonLink>
        </span>
      }
    >
      Next: {stepTitle(next, helperFirstName)}.
    </Banner>
  )
}
