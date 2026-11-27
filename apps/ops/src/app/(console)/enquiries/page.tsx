import { ButtonLink, Choices, Segmented } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import EnquiryTable from '../../../components/enquiries/EnquiryTable'
import PipelineBoard from '../../../components/enquiries/PipelineBoard'
import { listEnquiries, listPipeline } from '../../../data/enquiries'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'
import { enquiriesHref, parseEnquiriesSearch, type EnquiryGroupParam } from './search-params'

const CHIPS: ReadonlyArray<{ value: EnquiryGroupParam | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'sourcing', label: 'Sourcing' },
  { value: 'quotes_in', label: 'Quotes in' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'ended', label: 'Closed' },
]

/**
 * Board 04 · Enquiries (T1, S09-T02): every live enquiry by stage as a board (C7 columns, drag validated by the
 * stage machine) or a table (keyset pages of 50, sort and filter in the URL). One primary: New enquiry.
 */
export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/enquiries'))
  const search = parseEnquiriesSearch(await searchParams)
  const showValue = user.role === 'owner' || user.canSeeMargins
  const table = search.view === 'table' ? await listEnquiries(search, user) : null
  const board = search.view === 'board' ? await listPipeline(search, user) : null
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Work"
          title="Enquiries"
          segmented={
            <Segmented
              aria-label="View"
              value={search.view}
              options={[
                { value: 'board', label: 'Board' },
                { value: 'table', label: 'Table' },
              ]}
              hrefFor={(v) => enquiriesHref({ ...search, view: v }, { cursor: undefined })}
            />
          }
          actions={
            <>
              <ButtonLink href="/enquiries/leads">Leads</ButtonLink>
              <ButtonLink href="/enquiries/new" variant="primary">
                New enquiry
              </ButtonLink>
            </>
          }
          {...(table
            ? {
                filters: (
                  <Choices
                    aria-label="Stage"
                    value={search.stage ?? 'all'}
                    options={CHIPS.map((c) => ({ ...c, count: table.counts[c.value] }))}
                    hrefFor={(v) => enquiriesHref(search, { stage: v === 'all' ? undefined : v })}
                  />
                ),
              }
            : {})}
        />
      }
    >
      {board ? <PipelineBoard columns={board} /> : null}
      {table ? <EnquiryTable page={table} search={search} showValue={showValue} /> : null}
    </T1Index>
  )
}
