import HistoryTab from '../../../../components/history/HistoryTab'
import { ButtonLink } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import { notFound } from 'next/navigation'
import {
  BuysCard,
  EnquiriesCard,
  LeadsCard,
  LostReasonsCard,
  QuotationsCard,
} from '../../../../components/directory/ClientProfileParts'
import {
  ClientProfileForm,
  ContactsEditor,
} from '../../../../components/directory/DirectoryEditors'
import ProfileHeader from '../../../../components/directory/ProfileHeader'
import { getClientPage } from '../../../../data/clients'
import { requireOpsUser } from '../../../../lib/access'
import { parseHistorySearch } from '../../../../lib/history-params'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'

/**
 * Board 12 · Client profile (S10-T02): header with the meta line and five figures (RFQs YTD · Quoted YTD · Won YTD
 * · Win rate · Avg margin won, masked for a Helper without canSeeMargins), Enquiries, Quotations sent and Leads, and
 * the rail (contacts, what they buy, lost reasons), then the per-client defaults. Primary "New enquiry", secondary
 * "New lead". S06's History view stays at `?view=history`.
 */
export default async function ClientsIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const user = await requireOpsUser().catch(signInFor(`/clients/${id}`))
  const clientId = routeParam(recordId, id)
  const raw = await searchParams
  if (raw.view === 'history') {
    return (
      <div className="px-io-page-x py-6">
        <HistoryTab
          scope={{ subjectType: 'company', subjectId: clientId }}
          noun="client"
          path={`/clients/${clientId}`}
          search={parseHistorySearch(raw)}
          user={user}
          exportPath={`/api/records/client/${clientId}/history/export`}
          keep={{ view: 'history' }}
        />
      </div>
    )
  }
  const page = await getClientPage(clientId, user)
  if (!page) notFound()
  return (
    <div data-built="client-profile">
      <ProfileHeader
        crumb={{ label: 'Clients', href: '/clients' }}
        title={page.name}
        meta={page.meta || 'Add the industry, place and terms below.'}
        chips={page.profile.creditHold ? <Chip tone="warn" label="Credit hold" /> : null}
        actions={
          <>
            <ButtonLink variant="ghost" href={`/clients/${page.id}?view=history` as Route}>
              History
            </ButtonLink>
            <ButtonLink href={`/enquiries/leads?new=1&client=${page.id}` as Route}>
              New lead
            </ButtonLink>
            <ButtonLink variant="primary" href={`/enquiries/new?client=${page.id}` as Route}>
              New enquiry
            </ButtonLink>
          </>
        }
        kpis={[
          { label: 'RFQs YTD', value: String(page.kpis.rfqs) },
          { label: 'Quoted YTD', value: page.kpis.quoted },
          { label: 'Won YTD', value: page.kpis.won },
          { label: 'Win rate', value: page.kpis.winRate ?? '—' },
          ...(page.kpis.avgMargin === null && user.role !== 'owner' && !user.canSeeMargins
            ? []
            : [{ label: 'Avg margin won', value: page.kpis.avgMargin ?? '—' }]),
        ]}
      />
      <div className="px-io-page-x grid grid-cols-[minmax(0,1fr)_280px] gap-4 py-6">
        <div className="flex min-w-0 flex-col gap-4">
          <EnquiriesCard page={page} />
          <QuotationsCard page={page} />
          <LeadsCard page={page} />
          <ClientProfileForm
            companyId={page.id}
            profile={page.profile}
            options={page.options}
            isOwner={user.role === 'owner'}
          />
        </div>
        <aside aria-label="Client facts" className="flex flex-col gap-4">
          <ContactsEditor companyId={page.id} contacts={page.contacts} />
          <BuysCard page={page} />
          <LostReasonsCard page={page} />
          {page.aliases.length ? (
            <p className="text-io-ink-3 m-0 text-[12px]">Also known as {page.aliases.join(', ')}</p>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
