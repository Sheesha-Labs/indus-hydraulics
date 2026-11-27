import { Kpi } from '@indus/ops-ui/card'
import { Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import type { Route } from 'next'
import ClientTable from '../../../components/directory/ClientTable'
import { NewClientButton } from '../../../components/directory/DirectoryEditors'
import {
  CLIENT_FILTERS,
  clientsSearchSchema,
  listClients,
  type ClientFilter,
} from '../../../data/clients'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

const LABEL: Record<ClientFilter, string> = {
  all: 'All',
  active: 'Active',
  credit_hold: 'Credit hold',
}

/**
 * Board 11 · Clients (T1, S10-T02): the KPI row (Active clients · RFQs received YTD · Quoted YTD · Won YTD) and the
 * clients ranked by enquiry flow, from `client_stats_v`. Values in AED. The one primary is "New client".
 */
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireOpsUser().catch(signInFor('/clients'))
  const sp = clientsSearchSchema.parse(await searchParams)
  const list = await listClients(sp)
  const href = (f: ClientFilter, cursor?: string) => {
    const p = new URLSearchParams()
    if (f !== 'all') p.set('filter', f)
    if (sp.ccy) p.set('ccy', sp.ccy)
    if (cursor) p.set('cursor', cursor)
    const q = p.toString()
    return (q ? `/clients?${q}` : '/clients') as Route
  }
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Directory"
          title="Clients"
          actions={<NewClientButton />}
          filters={
            list.total > 0 ? (
              <Choices
                aria-label="Show"
                value={sp.filter}
                options={CLIENT_FILTERS.map((f) => ({ value: f, label: LABEL[f] }))}
                hrefFor={(v) => href(v)}
              />
            ) : undefined
          }
        />
      }
    >
      <div data-built="clients" className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4" aria-label="Year to date">
          <Kpi label="Active clients" value={String(list.kpis.active)} />
          <Kpi label="RFQs received YTD" value={String(list.kpis.rfqsYtd)} />
          <Kpi label="Quoted YTD" value={list.kpis.quotedYtd} />
          <Kpi label="Won YTD" value={list.kpis.wonYtd} />
        </div>
        <ClientTable
          list={list}
          nextHref={list.nextCursor ? href(sp.filter, list.nextCursor) : null}
          firstHref={sp.cursor ? href(sp.filter) : null}
        />
      </div>
    </T1Index>
  )
}
