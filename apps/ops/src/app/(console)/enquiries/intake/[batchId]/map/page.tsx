import { PageHeader } from '@indus/ops-ui/shell'
import { notFound } from 'next/navigation'
import MapWorkspace from '../../../../../../components/intake/map/MapWorkspace'
import { getSheetMap } from '../../../../../../data/intake-map'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../../lib/route-params'

/**
 * Board 35 · Map spreadsheet columns (S08-T05), step 2 of Source · Map · Review · Match. The sheet as received
 * beside what was detected and how each column maps; "Continue to review" goes to board 15.
 */
export default async function EnquiriesIntakeBatchIdMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { batchId } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/intake/${batchId}/map`))
  routeParam(recordId, batchId)
  const file = (await searchParams).file
  const fileId = typeof file === 'string' && /^[0-9a-f-]{36}$/i.test(file) ? file : null
  const model = await getSheetMap(batchId, fileId)
  if (!model) notFound()
  return (
    <div className="flex h-screen min-h-0 min-w-0 flex-col overflow-hidden">
      <PageHeader
        crumb={`Intake / ${model.file.name}`}
        title="Map spreadsheet columns"
        steps={[
          { label: '1 Source', state: 'done' },
          { label: '2 Map', state: 'current' },
          { label: '3 Review', state: 'todo' },
          { label: '4 Match', state: 'todo' },
        ]}
      />
      <MapWorkspace model={model} />
    </div>
  )
}
