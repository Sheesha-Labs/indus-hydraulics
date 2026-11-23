import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { T11Auth } from '@indus/ops-ui/templates'
import { Check } from 'lucide-react'
import { redirect } from 'next/navigation'
import { startSetup } from '../../../actions/setup'
import CompanyLogo from '../../../components/setup/CompanyLogo'
import FinishSetupBanner from '../../../components/setup/FinishSetupBanner'
import { setupProgress } from '../../../data/setup'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'
import { firstName, SETUP_STEP_META, stepTitle } from '../../../lib/setup-steps'
import { getSetting } from '../../../server/settings/get'

const PROMISES = [
  'Your mailboxes read for you',
  'Supplier RFQs drafted for you',
  'Quotations ready for your approval',
] as const

/**
 * Board 78 · First-run welcome (T11 split; the Owner, once). The navy panel: logo, "Welcome, <first
 * name>", the title, the three promises and the fixed rule. The right column: the six steps with their
 * minutes, the one primary "Start setup" (remembers the welcome was seen, opens step 1), and what Today
 * shows until setup is done.
 *
 * Today sends the Owner here until the welcome is seen (tip_state 'welcome.seen'); the page itself
 * always opens for the Owner. A Helper never sees it: Today.
 */
export default async function WelcomePage() {
  const user = await requireOpsUser().catch(signInFor('/welcome'))
  if (user.role !== 'owner') redirect('/today')
  const [progress, assets] = await Promise.all([setupProgress(), getSetting('company.assets')])

  return (
    <T11Auth
      layout="split"
      hero={
        <div className="bg-io-navy flex flex-1 flex-col gap-7 p-16 text-white">
          <CompanyLogo fileId={assets.logoFileId} tone="white" className="h-9" />
          <p className="text-[13px] opacity-75">Welcome, {firstName(user.name)}</p>
          <h1 className="io-display text-[56px] leading-none">Indus Operations</h1>
          <ul className="mt-3 flex flex-col gap-[18px] text-[20px] leading-[1.35]">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="bg-io-welcome-dot rounded-io-pill size-2 flex-none"
                />
                {p}
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="flex-1" />
          <p className="text-[13px] leading-[1.5] opacity-75">
            The Assistant never sends prices to clients or moves money without you.
          </p>
        </div>
      }
    >
      <h2 className="io-eyebrow">Set up in about 15 minutes</h2>
      <ol className="flex flex-col gap-4">
        {progress.steps.map(({ key, status }, i) => {
          const done = status === 'done'
          return (
            <li
              key={key}
              data-step={key}
              data-status={status}
              className="bg-io-card border-io-line rounded-io-card grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3.5 border px-[18px] py-4"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'rounded-io-pill grid size-7 place-items-center text-[12px] font-semibold',
                  done ? 'bg-io-ok-tint text-io-ok-mark' : 'border-io-stroke text-io-ink-3 border'
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="text-[15px]">
                {stepTitle(key)}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
              <span className="text-io-ink-3 text-[12.5px]">{SETUP_STEP_META[key].minutes}</span>
            </li>
          )
        })}
      </ol>
      <div className="mt-2 flex items-center gap-2.5">
        <form action={startSetup}>
          <Button type="submit" variant="primary" size="lg" className="px-5">
            Start setup
          </Button>
        </form>
        <span className="text-io-ink-3 text-[12.5px]">
          You can stop after any step and pick up later.
        </span>
      </div>
      {progress.next ? (
        <div className="mt-auto flex flex-col gap-1.5">
          <span className="io-eyebrow">Until it is done · on Today</span>
          <FinishSetupBanner done={progress.done} total={progress.total} next={progress.next} />
        </div>
      ) : null}
    </T11Auth>
  )
}
