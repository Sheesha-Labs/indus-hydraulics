import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { formatDate, formatMoney, listDecimals, quotationSlug } from '@indus/ops-ui/format'
import { PageHeader } from '@indus/ops-ui/shell'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { T1Index } from '@indus/ops-ui/templates'
import { HEADERS, KIT_NOW, SAMPLE_QUOTATIONS, type SampleQuotation } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't1a'
const href = (q: string) => specimenHref(SLUG, q)

const DECIMALS = listDecimals(SAMPLE_QUOTATIONS.map((q) => q.value))
const COLUMNS: Column<SampleQuotation>[] = [
  {
    key: 'no',
    label: 'Number',
    type: 'ref',
    value: (r) => r.no,
    href: (r) => `/quotations/${quotationSlug(r.no)}`,
  },
  { key: 'client', label: 'Client', type: 'text', value: (r) => r.client },
  { key: 'enquiry', label: 'Enquiry', type: 'muted', value: (r) => r.enquiry },
  {
    key: 'value',
    label: 'Value',
    type: 'money',
    value: (r) => formatMoney(r.ccy, r.value, { decimals: DECIMALS }).amount,
  },
  { key: 'ccy', label: 'Ccy', type: 'muted', value: (r) => r.ccy },
  { key: 'sent', label: 'Sent', type: 'muted', value: (r) => formatDate(r.sent, { now: KIT_NOW }) },
  {
    key: 'status',
    label: 'Client status',
    type: 'chip',
    value: () => 'Superseded',
    chip: { family: 'client', word: (r) => r.status },
  },
  { key: 'next', label: 'Next touch', type: 'muted', value: (r) => r.next || '—' },
  { key: 'prob', label: 'Prob.', type: 'num', value: (r) => r.prob || '—' },
]

/** T1a · Index list: Quotations, default (no preview). */
export default function T1ASpecimen() {
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Selling"
          title="Quotations"
          actions={
            <>
              <ButtonLink href={href('export=1')}>Export</ButtonLink>
              <ButtonLink variant="primary" href={href('new=quotation')}>
                New quotation
              </ButtonLink>
            </>
          }
          filters={
            <Choices
              aria-label="Quotation filter"
              options={[...HEADERS.quotationFilters]}
              value="awaiting"
              hrefFor={(v) => href(`filter=${v}`)}
            />
          }
          summary={HEADERS.quotationSummary}
        />
      }
    >
      <DataTable
        caption="Quotations"
        gridClass="grid-cols-[140px_minmax(0,1.3fr)_120px_100px_50px_70px_140px_minmax(0,1fr)_50px]"
        columns={COLUMNS}
        rows={SAMPLE_QUOTATIONS}
        rowKey={(r) => r.no}
        rowTone={(r) => (r.superseded ? 'strike' : undefined)}
        selectedKey={SAMPLE_QUOTATIONS[0]!.no}
        foot="4 of 14 shown"
        footRight="Sorted by next touch"
      />
    </T1Index>
  )
}
