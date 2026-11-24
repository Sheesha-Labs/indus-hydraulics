import { notFound, redirect } from 'next/navigation'
import { WhyPage } from '../../../../components/why/WhyDrawer'
import { getWhy } from '../../../../data/why'
import { AccessError, requireOpsUser } from '../../../../lib/access'
import { safeNextPath } from '../../../../lib/safe-next-path'

/**
 * Why? as a full page (05 §6.3, S06-T05): a reload, a new tab or a shared evidence link. In-app clicks are
 * intercepted into the `@drawer` slot instead. `?returnTo=` (a same-origin path) is where Back and Keep go.
 */
export default async function WhyFullPage({
  params,
  searchParams,
}: {
  params: Promise<{ evidenceId: string }>
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const { evidenceId } = await params
  let user
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      redirect(`/sign-in?next=${encodeURIComponent(`/why/${evidenceId}`)}`)
    throw error
  }
  const view = await getWhy(evidenceId, user)
  if (!view) notFound()
  const { returnTo } = await searchParams
  const back = safeNextPath(typeof returnTo === 'string' ? returnTo : null) ?? '/today'
  return <WhyPage view={view} returnTo={back} />
}
