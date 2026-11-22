import { notFound, redirect } from 'next/navigation'
import { WhyPage } from '../../../../components/shell/WhyDrawer'
import { evidenceIdSchema, getEvidence } from '../../../../data/evidence'
import { AccessError, requireOpsUser } from '../../../../lib/access'
import { safeNextPath } from '../../../../lib/safe-next-path'

/**
 * S04 · Why? as a full page (05 §6.3): a reload, a new tab or a shared evidence link. In-app clicks are
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
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      redirect(`/sign-in?next=${encodeURIComponent(`/why/${evidenceId}`)}`)
    throw error
  }
  const valid = evidenceIdSchema.safeParse(evidenceId)
  if (!valid.success) notFound()
  const evidence = await getEvidence(valid.data)
  if (!evidence) notFound()
  const { returnTo } = await searchParams
  const back = safeNextPath(typeof returnTo === 'string' ? returnTo : null) ?? '/today'
  return <WhyPage evidence={evidence} returnTo={back} />
}
