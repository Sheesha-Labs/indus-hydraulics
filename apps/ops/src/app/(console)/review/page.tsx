import ReviewScreen from '../../../components/review/ReviewScreen'
import { getDoneToday, getWaitingOnOthers, listReviewQueue } from '../../../data/review'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'
import { requestTime } from '../../../lib/request-time'
import { assistantPauseState } from '../../../server/assistant/pause'
import { parseReviewSearch } from '../../../lib/review-params'

/** Board 104 · Review: every Assistant proposal decided in one queue (S06-T02). */
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/review'))
  const search = parseReviewSearch(await searchParams)
  const now = requestTime()
  const [queue, done, waiting, pause] = await Promise.all([
    listReviewQueue(user, search, now),
    getDoneToday(now),
    getWaitingOnOthers(now),
    assistantPauseState(),
  ])
  return (
    <div data-built="review" className="contents">
      <ReviewScreen
        queue={queue}
        search={search}
        done={done}
        waiting={waiting}
        now={now}
        isOwner={user.role === 'owner'}
        paused={pause ? { at: clockOf(pause.pausedAt), byYou: pause.pausedById === user.id } : null}
      />
    </div>
  )
}

function clockOf(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}
