import { notFound, redirect } from 'next/navigation'
import { templateSpecimen } from '../../../../../kit/sections/Templates'
import { AccessError, requireOpsUser } from '../../../../../lib/access'

/**
 * /_kit/templates/<t>: one template filled like its board, inside AppShell. The out-of-shell specimens (T9a,
 * T11a, T12a) have their own static routes in (kit), (auth) and (client); here they are not found.
 */
export default async function TemplateSpecimenPage({ params }: { params: Promise<{ t: string }> }) {
  const { t } = await params
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      redirect(`/sign-in?next=${encodeURIComponent(`/_kit/templates/${t}`)}`)
    throw error
  }
  const entry = templateSpecimen(t)
  if (!entry || entry.frame !== 'shell') notFound()
  const { Specimen } = entry
  return <Specimen />
}
