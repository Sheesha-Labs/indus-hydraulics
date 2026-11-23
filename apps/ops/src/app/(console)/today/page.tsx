import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T8Today } from '@indus/ops-ui/templates'
import { redirect } from 'next/navigation'
import { signOutAction } from '../../(auth)/sign-in/actions'
import FinishSetupBanner from '../../../components/setup/FinishSetupBanner'
import Arrives from '../../../components/skeleton/Arrives'
import { getFirstRunState } from '../../../data/setup'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/**
 * Boards 178 / 180 · Today (T8, Owner or Helper variant from the session role). S07 builds it, with the
 * greeting header (TodayHeader); until then a page header and who is signed in.
 *
 * First run (S03-T05, P01): the Owner who has not seen the welcome is sent to /welcome (once: "Start
 * setup" records it); while setup is incomplete the Owner's Today carries "Finish setup · n of 6. Next:
 * <step>." with Continue.
 */
export default async function TodayPage() {
  const user = await requireOpsUser().catch(signInFor('/today'))
  const helper = user.role === 'helper'
  const firstRun = helper ? null : await getFirstRunState(user.id)
  if (firstRun && !firstRun.welcomeSeen && !firstRun.progress.complete) redirect('/welcome')
  const next = firstRun?.progress.next ?? null
  return (
    <T8Today
      variant={helper ? 'helper' : 'owner'}
      header={<PageHeader crumb="Workspace" title="Today" />}
      {...(firstRun && next
        ? {
            banner: (
              <div className="px-7 pt-4">
                <FinishSetupBanner
                  done={firstRun.progress.done}
                  total={firstRun.progress.total}
                  next={next}
                />
              </div>
            ),
          }
        : {})}
      needsYou={
        <Arrives
          sprint="S07"
          what="Boards 178 and 180: what needs you, what came in since yesterday and what is late."
        />
      }
      cameIn={<Card eyebrow="Came in since yesterday" text="New mail, quotes and orders." />}
      late={<Card eyebrow="Late" text="Replies and deliveries past their date." />}
      rail={
        <Card eyebrow="Signed in">
          <p className="text-io-body text-io-ink-3">
            Signed in as {user.name} · {helper ? 'Helper' : 'Owner'}
          </p>
          <form action={signOutAction}>
            <button type="submit" className="io-focus text-io-meta text-io-accent">
              Sign out
            </button>
          </form>
        </Card>
      }
    />
  )
}
