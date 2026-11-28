import { Note } from '@indus/ops-ui/card'
import { Button } from '@indus/ops-ui/controls'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { Chip } from '@indus/ops-ui/status'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { listOwnBankAccounts } from '../../../../server/company/bank'
import {
  letterheadAssets,
  listCompanyDocuments,
  type CompanyDocRow,
} from '../../../../server/company/documents'
import BankBlockSection from './BankBlockSection'
import CompanyDocsActions, { DocRowActions } from './CompanyDocsActions'
import LetterheadAssets from './LetterheadAssets'

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Settings › Company documents (board 213, S11-T07): Indus's own licences and certificates with their expiry
 * status (reminders at 60, 30 and 7 days, S10-T08), the letterhead images, and the bank block client documents
 * print, which the Owner confirms from his own Zoho estimate. Until it is confirmed no client document can be
 * approved. Everyone may read; only the Owner changes anything.
 */
export default async function SettingsDocumentsPage() {
  const user = await requireOpsUser().catch(signInFor(`/settings/documents`))
  const isOwner = user.role === 'owner'
  const [docs, accounts, assets] = await Promise.all([
    listCompanyDocuments(),
    listOwnBankAccounts(),
    letterheadAssets(),
  ])

  const columns: Column<CompanyDocRow>[] = [
    { key: 'doc', label: 'Document', type: 'text', value: (r) => r.title },
    { key: 'detail', label: 'Detail', type: 'text', value: (r) => r.detail },
    {
      key: 'expires',
      label: 'Expires',
      type: 'text',
      value: (r) => (r.expiresAt ? DATE.format(r.expiresAt) : '—'),
    },
    { key: 'used', label: 'Used in', type: 'text', value: (r) => r.usedIn.join(', ') || '—' },
    {
      key: 'status',
      label: 'Status',
      type: 'text',
      value: (r) => <Chip tone={r.status.tone} label={r.status.label} />,
    },
    {
      key: 'actions',
      label: '',
      srLabel: 'Actions',
      type: 'text',
      value: (r) => (
        <DocRowActions
          doc={{
            id: r.id,
            kind: r.kind,
            title: r.title,
            fileId: r.fileId,
            usedIn: r.usedIn,
            expiresAt: r.expiresAt ? r.expiresAt.toISOString().slice(0, 10) : null,
          }}
          isOwner={isOwner}
        />
      ),
    },
  ]

  return (
    <div data-built="company-documents" className="flex flex-col gap-5 pt-4 pb-8">
      {isOwner ? <CompanyDocsActions /> : null}
      {accounts.some((a) => a.confirmedAt) ? null : (
        <Note tone="warn" title="Bank block not confirmed.">
          Client documents cannot be approved until the bank block is confirmed. Read it from one of
          your own Zoho estimates below and confirm it.
        </Note>
      )}
      {docs.length ? (
        <DataTable
          caption="Company documents"
          gridClass="grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_110px_minmax(0,1.3fr)_96px_120px]"
          columns={columns}
          rows={docs}
          rowKey={(r) => r.id}
          rowTone={(r) =>
            r.status.tone === 'bad' ? 'bad' : r.status.tone === 'warn' ? 'flag' : undefined
          }
        />
      ) : (
        <p className="rounded-io-card border-io-line bg-io-card text-io-ink-3 m-0 border px-5 py-6 text-center text-[13px]">
          No company documents yet. Add the trade licence, VAT certificate and the others tenders
          and vendor registrations ask for.
        </p>
      )}
      <div className="grid grid-cols-2 gap-5">
        <section
          aria-labelledby="reminders-eyebrow"
          className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-[18px] py-4"
        >
          <h2 id="reminders-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
            Reminders
          </h2>
          <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">
            60, 30 and 7 days before expiry, to the Owner and the Helper on Today.
          </p>
        </section>
        <section
          aria-labelledby="attach-eyebrow"
          className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-[18px] py-4"
        >
          <h2 id="attach-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
            Attach
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button disabled title="Arrives with Tenders (S32)">
              Add to bid pack
            </Button>
            <Button disabled title="Arrives with Tenders (S32)">
              Add to vendor registration
            </Button>
          </div>
          <p className="text-io-ink-3 m-0 text-[12px]">
            Bid packs and vendor registrations arrive with Tenders.
          </p>
        </section>
      </div>
      <BankBlockSection
        accounts={accounts.map((a) => ({
          ...a,
          confirmedAt: a.confirmedAt?.toISOString() ?? null,
        }))}
        isOwner={isOwner}
      />
      <LetterheadAssets isOwner={isOwner} {...assets} />
    </div>
  )
}
