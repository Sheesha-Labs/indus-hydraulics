import { TodayHeader } from '@indus/ops-ui/shell'
import { T8Today } from '@indus/ops-ui/templates'
import { redirect } from 'next/navigation'
import FinishSetupBanner from '../../../components/setup/FinishSetupBanner'
import NeedsYou from '../../../components/today/NeedsYou'
import {
  CalmState,
  CameIn,
  DoneForYou,
  LateOrAtRisk,
  TodayRail,
} from '../../../components/today/TodaySections'
import { getFirstRunState } from '../../../data/setup'
import { getTodayModel } from '../../../data/today'
import { requireOpsUser } from '../../../lib/access'
import { resolveLanding } from '../../../lib/landing'
import { signInFor } from '../../../lib/page-access'
import { requestTime } from '../../../lib/request-time'

/**
 * Board 178 · Today (S07-T06, T8; Owner or Helper variant from the session role) and its board 182 states:
 * calm, on fire, setup unfinished (above Needs you until setup is complete). The paused and disconnected
 * banners come from the shell strip (board 220), as on every page.
 *
 * First run (S03-T05, P01): the Owner who has not seen the welcome is sent to /welcome.
 */
export default async function TodayPage() {
  const user = await requireOpsUser().catch(signInFor('/today'))
  const helper = user.role === 'helper'
  const firstRun = helper ? null : await getFirstRunState(user.id)
  if (
    firstRun &&
    resolveLanding({
      role: 'owner',
      welcomeSeen: firstRun.welcomeSeen,
      setupDone: firstRun.progress.complete,
    }) === '/welcome'
  ) {
    redirect('/welcome')
  }
  const model = await getTodayModel(user, requestTime())
  const next = firstRun?.progress.next ?? null
  return (
    <T8Today
      variant={helper ? 'helper' : 'owner'}
      header={
        <TodayHeader
          greeting={model.greeting}
          assistant={model.paused ? 'paused' : 'running'}
          notificationCount={model.notifications}
        />
      }
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
        <div data-built="today" className="flex flex-col gap-3.5">
          {model.state === 'calm' ? <CalmState model={model} /> : <NeedsYou needs={model.needs} />}
        </div>
      }
      cameIn={
        <>
          <CameIn rows={model.cameIn} />
          <LateOrAtRisk rows={model.late} />
        </>
      }
      late={<DoneForYou rows={model.done} total={model.doneTotal} />}
      rail={<TodayRail model={model} />}
    />
  )
}
