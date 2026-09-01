import { db } from '@indus/db'
import { renderRfqDraft, type RfqDraftLine } from '@indus/domain'
import { Callout, EmptyState, Panel } from '@indus/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import RfqDraftCard from './_components/rfq-draft-card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Supplier RFQs — Indus Admin' }

type Props = { params: Promise<{ code: string }> }

type RankedCandidate = {
  candidate: { supplierId: string | null; name: string; country: string | null }
  score: number
}

export default async function EnquiryRfqPage({ params }: Props) {
  const { code } = await params
  const enquiryCode = decodeURIComponent(code)

  const enquiry = await db.enquiry.findUnique({
    where: { code: enquiryCode },
    include: { lines: { orderBy: { position: 'asc' } } },
  })
  if (!enquiry) notFound()

  const [latestRun, settings] = await Promise.all([
    db.researchRun.findFirst({
      where: { enquiryId: enquiry.id },
      orderBy: { createdAt: 'desc' },
      include: { results: true },
    }),
    db.storeSettings.findFirst(),
  ])

  // Collect every supplier that appeared in the ranked results, best score first.
  const bySupplier = new Map<string, { name: string; country: string | null; score: number; supplierId: string | null }>()
  for (const result of latestRun?.results ?? []) {
    for (const entry of (result.candidates as unknown as RankedCandidate[]) ?? []) {
      const key = entry.candidate.supplierId ?? entry.candidate.name.toLowerCase()
      const existing = bySupplier.get(key)
      if (!existing || entry.score > existing.score) {
        bySupplier.set(key, {
          name: entry.candidate.name,
          country: entry.candidate.country,
          score: entry.score,
          supplierId: entry.candidate.supplierId,
        })
      }
    }
  }
  const ranked = [...bySupplier.values()].sort((a, b) => b.score - a.score).slice(0, 10)

  const supplierIds = ranked.map((r) => r.supplierId).filter((id): id is string => !!id)
  const contactRows = supplierIds.length
    ? await db.supplierContact.findMany({
        where: { supplierId: { in: supplierIds }, email: { not: null } },
        orderBy: [{ isPrimary: 'desc' }, { confidence: 'asc' }],
        select: { supplierId: true, email: true, confidence: true, evidenceUrl: true },
      })
    : []
  const contactBySupplier = new Map<string, (typeof contactRows)[number]>()
  for (const row of contactRows) {
    if (!contactBySupplier.has(row.supplierId)) contactBySupplier.set(row.supplierId, row)
  }

  const lines: RfqDraftLine[] = enquiry.lines
    .filter((l) => l.reviewStatus !== 'rejected')
    .map((l) => ({
      position: l.position,
      description: l.description,
      qty: l.qty ? Number(l.qty) : null,
      unit: l.unit,
      partNumber: l.partNumber,
      certification: l.certification,
    }))

  const reachable = ranked.filter((r) => r.supplierId && contactBySupplier.has(r.supplierId)).length

  return (
    <AdminPageShell
      title="Supplier RFQs"
      breadcrumbs={
        <span className="font-mono text-[12px] text-ih-muted">
          {enquiry.code} · {ranked.length} suppliers · {reachable} reachable
        </span>
      }
    >
      {/* PF-9: card-stack editor, no rail — one 860px cap on the single
          body wrapper so every card ends on the same right edge. */}
      <div className="flex max-w-[860px] flex-col gap-6">
        <Callout>
          These are drafts, not sent mail. Copy one into your own mailbox, or use the mail link.
          Nothing here goes out through the website&rsquo;s transactional sender — a cold supplier
          list sent that way would push your customer quotes into spam.
        </Callout>

        {ranked.length === 0 ? (
          <Panel>
            <EmptyState
              condition="NO SUPPLIERS YET"
              message="Run supplier research on this enquiry first, then come back to draft the RFQs."
            />
          </Panel>
        ) : (
          ranked.map((supplier) => {
            const contact = supplier.supplierId
              ? contactBySupplier.get(supplier.supplierId)
              : undefined
            const draft = renderRfqDraft({
              supplierName: supplier.name,
              enquiryCode: enquiry.code,
              lines,
              closingAt: enquiry.closingAt ? enquiry.closingAt.toISOString() : null,
              senderName: settings?.signatureName ?? 'Indus Hydraulics',
              senderTitle: settings?.signatureTitle ?? null,
              companyName: settings?.legalName ?? 'Indus Hydraulic Power Trading LLC',
              senderEmail: settings?.signatureEmail ?? 'sales@indushydraulics.me',
              senderPhone: settings?.signaturePhone ?? null,
              destination: 'the UAE',
            })

            return (
              <RfqDraftCard
                key={supplier.supplierId ?? supplier.name}
                supplierName={supplier.name}
                country={supplier.country}
                score={supplier.score}
                email={contact?.email ?? null}
                evidenceUrl={contact?.evidenceUrl ?? null}
                subject={draft.subject}
                body={draft.body}
                mailtoUrl={contact?.email ? draft.mailtoUrl(contact.email) : null}
              />
            )
          })
        )}

        {ranked.length > 0 && reachable < ranked.length ? (
          <p className="text-[13px] text-ih-muted">
            {ranked.length - reachable} of these have no contact address we could verify. Nothing
            was guessed — add an address by hand if you have one.
          </p>
        ) : null}
      </div>
    </AdminPageShell>
  )
}
