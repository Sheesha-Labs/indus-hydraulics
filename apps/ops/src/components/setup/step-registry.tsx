import { Card } from '@indus/ops-ui/card'
import type { ReactNode } from 'react'
import { ToastProvider } from '@indus/ops-ui/overlay'
import { completeAndContinue } from '../../actions/setup'
import { getAssistantStep, getCompanyStep, getMoneyStep } from '../../data/setup'
import { formatDate } from '@indus/ops-ui/format'
import { getInviteStep } from '../../data/team'
import InviteForm from '../settings/team/InviteForm'
import type { OpsUser } from '../../lib/access'
import type { SetupStep } from '../../lib/route-params'
import AssistantModes from './AssistantModes'
import { CompanyDraftProvider, CompanyFields, CompanyPreview } from './CompanyForm'
import MoneyForm from './MoneyForm'

/**
 * What each setup step draws inside the shared T9 rail frame (`(setup)/setup/[step]/page.tsx`): the
 * body, an optional aside, an optional wrapper around the whole frame (a client provider that the body,
 * the aside and the foot's "saved" label share), and the time of the step's last save.
 *
 * To add a step (S03-T03 invite, S04 mailboxes, S20 history): write its
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
  /** Replaces "Next: <next step>" (step 5: "Next: invite <Helper>"). */
  nextLabel?: string
  /** A server action Next submits instead of linking (it records the step, then redirects). */
  nextAction?: () => Promise<void>
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

/** Setup 4 · Money defaults (board 82, S03-T06). */
async function MoneyStep(): Promise<StepView> {
  const data = await getMoneyStep()
  return {
    description: 'How prices, VAT and numbers work. You can change any of these later in Settings.',
    savedAt: data.savedAt,
    body: <MoneyForm data={data} />,
    nextAction: completeAndContinue.bind(null, 'money'),
  }
}

/** Setup 5 · How much should the Assistant do? (board 83, S03-T06). */
async function AssistantStep(): Promise<StepView> {
  const data = await getAssistantStep()
  return {
    description:
      'Start careful. As you approve its work, Autopilot suggests where it could do more.',
    savedAt: data.savedAt,
    // Setup is drawn outside AppShell, so the mode toast brings its own region (right of the rail,
    // above the foot).
    wrap: (frame) => <ToastProvider className="bottom-[84px] left-[304px]">{frame}</ToastProvider>,
    body: <AssistantModes mode={data.mode} version={data.version} undoMs={data.undoMs} />,
    nextLabel: `Next: invite ${data.helperFirstName ?? 'your helper'}`,
    nextAction: completeAndContinue.bind(null, 'assistant'),
  }
}

/**
 * Step 6 · Invite your helper (S03-T03): board 84's invite form inside the wizard. Sending it marks the
 * step done (invites.ts). Once a Helper is active or an invitation is open, the step says so; Resend,
 * Revoke and Permissions live in Settings › Team.
 */
async function InviteStep(): Promise<StepView> {
  const data = await getInviteStep()
  const status = data.helper
    ? `${data.helper.name} (${data.helper.email}) is your Helper.`
    : data.invite && !data.invite.expired
      ? `Invite sent to ${data.invite.email}. It works until ${formatDate(data.invite.expiresAt)}.`
      : null
  return {
    description:
      'Your helper finds suppliers and chases them. They see costs; margins and sending only if you allow it.',
    body: status ? (
      <Card
        title={status}
        titleAs="h2"
        text="Resend, revoke and permissions are in Settings › Team. Next finishes setup."
      />
    ) : (
      <Card as="div">
        <InviteForm domain={data.workspaceDomain} primary={false} />
      </Card>
    ),
  }
}

export const STEP_VIEWS: Readonly<Record<SetupStep, StepRender>> = {
  company: CompanyStep,
  mailboxes: LaterStep,
  history: LaterStep,
  money: MoneyStep,
  assistant: AssistantStep,
  invite: InviteStep,
}
