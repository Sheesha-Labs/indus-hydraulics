import { ButtonLink } from '@indus/ops-ui/controls'
import { T9Wizard } from '@indus/ops-ui/templates'
import Link from 'next/link'
import Arrives, { type Sprint } from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { routeParam, SETUP_STEPS, setupStep, type SetupStep } from '../../../../lib/route-params'
import { to } from '../../../../lib/routes'

const STEP: Readonly<Record<SetupStep, { title: string; sprint: Sprint; what: string }>> = {
  company: {
    title: 'Company and documents',
    sprint: 'S03',
    what: 'Board 79: what prints on every quotation, order acknowledgement and invoice.',
  },
  mailboxes: {
    title: 'Connect mailboxes',
    sprint: 'S04',
    what: 'Board 80: connect sales@ and purchase@.',
  },
  history: {
    title: 'Bring in your history',
    sprint: 'S20',
    what: 'Board 81: choose how far back to import from Zoho Books and mail.',
  },
  money: {
    title: 'Money defaults',
    sprint: 'S03',
    what: 'Board 82: currencies, margins, VAT and payment terms.',
  },
  assistant: {
    title: 'How much should the Assistant do?',
    sprint: 'S03',
    what: 'Board 83: the Autopilot level for each kind of work.',
  },
  invite: {
    title: 'Invite the Helper',
    sprint: 'S03',
    what: 'Board 84b: invite the Helper and choose what they may see.',
  },
}

const stepHref = (s: SetupStep) => to(`/setup/${s}`)

/**
 * Boards 79–83, 84b · First-run setup (T9 rail): the six steps in the rail, one step's fields, and the foot
 * bar with the one primary, Next. Outside the console shell, so the page owns `<main>`.
 */
export default async function SetupStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params
  await requireOpsUser().catch(signInFor(`/setup/${step}`))
  const current = routeParam(setupStep, step)
  const i = SETUP_STEPS.indexOf(current)
  const next = SETUP_STEPS[i + 1]
  const prev = SETUP_STEPS[i - 1]
  const { title, sprint, what } = STEP[current]
  return (
    <main id="content">
      <T9Wizard
        layout="rail"
        eyebrow={`Setup ${i + 1} of ${SETUP_STEPS.length}`}
        title={title}
        steps={
          <ol className="flex flex-col gap-1">
            {SETUP_STEPS.map((s, n) => (
              <li key={s}>
                <Link
                  href={stepHref(s)}
                  aria-current={s === current ? 'step' : undefined}
                  className="io-focus rounded-io-ctl text-io-body hover:bg-io-fill aria-[current=step]:bg-io-fill flex gap-2 px-2.5 py-2"
                >
                  <span className="text-io-ink-3">{n + 1}</span>
                  <span>{STEP[s].title}</span>
                </Link>
              </li>
            ))}
          </ol>
        }
        railFoot={
          <p className="text-io-meta text-io-ink-3">
            Progress saves as you go. Leave any time; Today shows “Finish setup” until it is done.
          </p>
        }
        {...(prev ? { back: <ButtonLink href={stepHref(prev)}>Back</ButtonLink> } : {})}
        next={
          <ButtonLink variant="primary" href={next ? stepHref(next) : to('/today')}>
            {next ? `Next: ${STEP[next].title.toLowerCase()}` : 'Finish setup'}
          </ButtonLink>
        }
      >
        <Arrives sprint={sprint} what={what} />
      </T9Wizard>
    </main>
  )
}
