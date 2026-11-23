import { Card } from '@indus/ops-ui/card'
import type { ReactNode } from 'react'
import { getCompanyStep } from '../../data/setup'
import type { OpsUser } from '../../lib/access'
import type { SetupStep } from '../../lib/route-params'
import { CompanyDraftProvider, CompanyFields, CompanyPreview } from './CompanyForm'

/**
 * What each setup step draws inside the shared T9 rail frame (`(setup)/setup/[step]/page.tsx`): the
 * body, an optional aside, an optional wrapper around the whole frame (a client provider that the body,
 * the aside and the foot's "saved" label share), and the time of the step's last save.
 *
 * To add a step (S03-T06 money and assistant, S03-T03 invite, S04 mailboxes, S20 history): write its
 * `render` and replace the step's entry below; flip its `build` in lib/setup-steps.ts to 'built'. The
 * frame, the rail, the foot and Next/Back need no change.
 */
export type StepContext = { user: OpsUser; step: SetupStep }

export type StepView = {
  description?: string
  body: ReactNode
  aside?: ReactNode
  asideLabel?: string
  /** Wraps the whole T9 frame, inside the save-status provider. */
  wrap?: (frame: ReactNode) => ReactNode
  /** ISO time of the step's last save, for "Step n of 6 · saved 2 s ago". */
  savedAt?: string | null
}

export type StepRender = (ctx: StepContext) => Promise<StepView> | StepView

/** Steps 2 and 3: built by S04 (mailboxes) and S20 (history); Next skips them for now. */
function LaterStep(): StepView {
  return {
    body: (
      <Card
        title="Available in a later update — skip for now"
        titleAs="h2"
        text="You can finish setup without this step. Next skips it; it opens here once it is ready."
      />
    ),
  }
}

/** Steps another S03 task is building: a neutral placeholder until it lands here. */
function PendingStep(): StepView {
  return {
    body: (
      <Card
        title="This step is on its way"
        titleAs="h2"
        text="It is being finished now. Use Next to carry on; come back to it from the list at the left."
      />
    ),
  }
}

async function CompanyStep(): Promise<StepView> {
  const data = await getCompanyStep()
  return {
    description: 'What prints on every quotation, order acknowledgement and invoice.',
    asideLabel: 'Live preview',
    savedAt: data.profileVersion + data.assetsVersion > 0 ? data.savedAt : null,
    wrap: (frame) => (
      <CompanyDraftProvider
        profile={data.profile}
        profileVersion={data.profileVersion}
        assets={data.assets}
        assetsVersion={data.assetsVersion}
        fileNames={data.fileNames}
        people={data.people}
        maxUploadMb={data.maxUploadMb}
      >
        {frame}
      </CompanyDraftProvider>
    ),
    body: <CompanyFields />,
    aside: <CompanyPreview />,
  }
}

export const STEP_VIEWS: Readonly<Record<SetupStep, StepRender>> = {
  company: CompanyStep,
  mailboxes: LaterStep,
  history: LaterStep,
  money: PendingStep,
  assistant: PendingStep,
  invite: PendingStep,
}
