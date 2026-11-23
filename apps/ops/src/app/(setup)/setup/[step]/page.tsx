import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { T9Wizard } from '@indus/ops-ui/templates'
import { redirect } from 'next/navigation'
import { skipAndContinue } from '../../../../actions/setup'
import { SaveStatusProvider, SavedLabel } from '../../../../components/setup/SaveStatus'
import SetupRail, { SetupBrand } from '../../../../components/setup/SetupRail'
import { STEP_VIEWS } from '../../../../components/setup/step-registry'
import { setupProgress } from '../../../../data/setup'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { routeParam, setupStep } from '../../../../lib/route-params'
import { to } from '../../../../lib/routes'
import {
  nextStep,
  previousStep,
  SETUP_STEP_META,
  SETUP_TOTAL,
  stepIndex,
  stepTitle,
} from '../../../../lib/setup-steps'
import { getSetting } from '../../../../server/settings/get'

/**
 * Boards 79–83, 84b · First-run setup (T9 rail): the six steps in the rail, one step's body (from the
 * step registry), and the foot: "Step n of 6 · saved …", Save and finish later, Back, and the one
 * primary, Next. Outside the console shell, so the template owns `<main>`. Owner only: a Helper is sent
 * to Today (the steps change owner-only settings).
 *
 * (decision) The plan puts the frame in `setup/layout.tsx`; it lives here, because the foot's "saved"
 * label and a step's client provider must wrap the body, the aside and the foot together, and a layout
 * cannot receive the step's data.
 */
export default async function SetupStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ step }, query] = await Promise.all([params, searchParams])
  const user = await requireOpsUser().catch(signInFor(`/setup/${step}`))
  const current = routeParam(setupStep, step)
  if (user.role !== 'owner') redirect('/today')

  const [progress, assets, view] = await Promise.all([
    setupProgress(),
    getSetting('company.assets'),
    STEP_VIEWS[current]({ user, step: current, query }),
  ])
  const statuses = Object.fromEntries(progress.steps.map((s) => [s.key, s.status])) as Record<
    typeof current,
    (typeof progress.steps)[number]['status']
  >
  const i = stepIndex(current)
  const next = nextStep(current)
  const prev = previousStep(current)
  const nextLabel =
    view.nextLabel ?? (next ? `Next: ${SETUP_STEP_META[next].nextLabel}` : 'Finish setup')
  const later = SETUP_STEP_META[current].build === 'later'

  const frame = (
    <main id="content">
      <T9Wizard
        layout="rail"
        brand={<SetupBrand logoFileId={assets.logoFileId} />}
        eyebrow={`Setup ${i + 1} of ${SETUP_TOTAL}`}
        title={stepTitle(current)}
        {...(view.description
          ? {
              description: (
                <p className="text-io-ink-2 max-w-[720px] text-[13.5px] leading-[1.5]">
                  {view.description}
                </p>
              ),
            }
          : {})}
        {...(view.aside ? { aside: view.aside } : {})}
        {...(view.asideLabel ? { asideLabel: view.asideLabel } : {})}
        steps={<SetupRail current={current} statuses={statuses} />}
        railFoot={
          <p className="text-io-ink-3 text-[12px] leading-[1.45]">
            Progress saves as you go. Leave any time; Today shows “Finish setup” until it is done.
          </p>
        }
        saved={<SavedLabel step={i + 1} total={SETUP_TOTAL} />}
        skip={
          <ButtonLink href={to('/today')} size="lg">
            Save and finish later
          </ButtonLink>
        }
        back={
          <ButtonLink href={prev ? to(`/setup/${prev}`) : to('/welcome')} size="lg">
            Back
          </ButtonLink>
        }
        next={
          later || view.nextAction ? (
            <form action={view.nextAction ?? skipAndContinue.bind(null, current)}>
              <Button type="submit" variant="primary" size="lg">
                {nextLabel}
              </Button>
            </form>
          ) : (
            <ButtonLink
              variant="primary"
              size="lg"
              href={next ? to(`/setup/${next}`) : to('/today')}
            >
              {nextLabel}
            </ButtonLink>
          )
        }
      >
        {view.body}
      </T9Wizard>
    </main>
  )

  return (
    <SaveStatusProvider savedAt={view.savedAt ?? null}>
      {view.wrap ? view.wrap(frame) : frame}
    </SaveStatusProvider>
  )
}
