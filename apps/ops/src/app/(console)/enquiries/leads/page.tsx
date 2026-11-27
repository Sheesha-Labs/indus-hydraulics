import { Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import { ImportCsvButton, NewLeadButton } from '../../../../components/leads/LeadActions'
import LeadTable from '../../../../components/leads/LeadTable'
import { activeOwners } from '../../../../data/enquiry-overview'
import { LEAD_FILTERS, listLeads, type LeadFilter } from '../../../../data/leads'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

const LABEL: Record<LeadFilter, string> = {
  open: 'All',
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed',
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/**
 * Board 03 · Leads (T1, S09-T05): open leads with the stage chips and their counts, the open value, a keyset
 * page of 50; "Import CSV" and the one primary "New lead".
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireOpsUser().catch(signInFor('/enquiries/leads'))
  const sp = await searchParams
  const raw = one(sp.stage)
  const filter: LeadFilter = (LEAD_FILTERS as readonly string[]).includes(raw ?? '')
    ? (raw as LeadFilter)
    : 'open'
  const cursor = one(sp.cursor)
  const [list, owners] = [await listLeads({ filter, cursor }), await activeOwners()]
  const href = (f: LeadFilter, c?: string) => {
    const p = new URLSearchParams()
    if (f !== 'open') p.set('stage', f)
    if (c) p.set('cursor', c)
    const q = p.toString()
    return q ? `/enquiries/leads?${q}` : '/enquiries/leads'
  }
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Enquiries"
          title="Leads"
          actions={
            <>
              <ImportCsvButton />
              <NewLeadButton owners={owners} />
            </>
          }
          filters={
            <Choices
              aria-label="Stage"
              value={filter}
              options={LEAD_FILTERS.filter((f) => f !== 'closed' || list.counts.closed > 0).map(
                (f) => ({
                  value: f,
                  label: LABEL[f],
                  count: list.counts[f],
                })
              )}
              hrefFor={(v) => href(v)}
            />
          }
          summary={
            <span>
              Est. value <b className="text-io-ink font-medium">{list.openValue}</b>
            </span>
          }
        />
      }
    >
      <div data-built="leads">
        <LeadTable
          list={list}
          nextHref={list.nextCursor ? href(filter, list.nextCursor) : null}
          firstHref={cursor ? href(filter) : null}
        />
      </div>
    </T1Index>
  )
}
