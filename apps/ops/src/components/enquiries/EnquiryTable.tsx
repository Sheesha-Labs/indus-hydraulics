import { ENQUIRY_STAGE_WORD } from '@indus/ops-core'
import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import { DataTable, type Column } from '@indus/ops-ui/table'
import type { EnquiriesSearch } from '../../app/(console)/enquiries/search-params'
import { enquiriesHref } from '../../app/(console)/enquiries/search-params'
import type { EnquiryTablePage, EnquiryTableRow } from '../../data/enquiries'

/**
 * Board 04 · Table view (S09-T02): one keyset page of 50, sortable headers and paging as links (the URL is the
 * table state). Columns Ref · Title · Client · Stage · Lines · Coverage · Deadline · Value · Owner; Value is
 * dropped for a Helper without canSeeMargins.
 */
export default function EnquiryTable({
  page,
  search,
  showValue,
}: {
  page: EnquiryTablePage
  search: EnquiriesSearch
  showValue: boolean
}) {
  const columns: Column<EnquiryTableRow>[] = [
    {
      key: 'ref',
      label: 'Ref',
      type: 'ref',
      value: (r) => r.ref,
      href: (r) => `/enquiries/${r.ref}`,
    },
    { key: 'title', label: 'Title', type: 'text', value: (r) => r.title },
    { key: 'client', label: 'Client', type: 'muted', value: (r) => r.clientName ?? '—' },
    {
      key: 'stage',
      label: 'Stage',
      type: 'chip',
      value: (r) => ENQUIRY_STAGE_WORD[r.stage],
      chip: { family: 'enquiry', word: (r) => ENQUIRY_STAGE_WORD[r.stage] },
    },
    { key: 'lines', label: 'Lines', type: 'num', value: (r) => String(r.linesTotal) },
    { key: 'coverage', label: 'Coverage', type: 'muted', value: (r) => r.covLabel },
    {
      key: 'deadline',
      label: 'Deadline',
      type: 'muted',
      value: (r) => r.due ?? '—',
      sort: { key: 'deadline' },
    },
    {
      key: 'received',
      label: 'Received',
      type: 'muted',
      value: (r) => r.received,
      sort: { key: 'received' },
    },
    {
      key: 'value',
      label: 'Value',
      type: 'money',
      value: (r) => r.value ?? '—',
      sort: { key: 'value' },
    },
    { key: 'owner', label: 'Owner', type: 'muted', value: (r) => r.ownerInitials ?? '—' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-io-card border-io-line rounded-io-card overflow-hidden border">
        <DataTable
          caption="Enquiries"
          columns={columns}
          rows={page.rows}
          rowKey={(r) => r.id}
          {...(showValue
            ? {
                gridClass:
                  'grid-cols-[130px_minmax(0,1.6fr)_minmax(0,1fr)_110px_56px_130px_80px_80px_90px_56px]',
              }
            : {
                hide: ['value'],
                gridClass:
                  'grid-cols-[130px_minmax(0,1.6fr)_minmax(0,1fr)_110px_56px_130px_80px_80px_56px]',
              })}
          sort={{ key: search.sort, dir: search.dir }}
          sortHref={(key, dir) => enquiriesHref(search, { sort: key, dir, cursor: undefined })}
          empty={
            <EmptyState
              title="No enquiries match"
              text="Clear the filter or search to see every enquiry."
              align="left"
            />
          }
        />
      </div>
      <div className="flex items-center gap-2 text-[12.5px]">
        {search.cursor ? (
          <ButtonLink href={enquiriesHref(search, { cursor: undefined })} size="sm">
            First page
          </ButtonLink>
        ) : null}
        {page.nextCursor ? (
          <ButtonLink href={enquiriesHref(search, { cursor: page.nextCursor })} size="sm">
            Next 50
          </ButtonLink>
        ) : null}
      </div>
    </div>
  )
}
