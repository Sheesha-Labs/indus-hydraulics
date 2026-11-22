import { notFound, redirect } from 'next/navigation'
import { templateSpecimen } from '../../../../../kit/sections/Templates'
import { AccessError, requireOpsUser } from '../../../../../lib/access'

/** /_kit/templates/<t>: one template filled like its board (T1a … T6a), inside AppShell. */
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
  if (!entry) notFound()
  const { Specimen } = entry
  return <Specimen />
}
